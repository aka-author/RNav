// * * ** *** ***** ******** ************* *********************
// Product:     Kit for Web-based Interactive Stand-alone Help
// Part:        Front-End JS library
// Module:      domutils.js                           (\(\
// Func:        Working with DOM objects and events   (^.^)  
// * * ** *** ***** ******** ************* *********************


/**
 * Provides utility functions for working with DOM elements.
 * This class offers various static methods to manipulate DOM elements,
 * manage their attributes, dimensions, styles, event handling, and more.
 * It serves as a helper for commonly needed operations when interacting 
 * with the document object model (DOM).
 * 
 * The class includes functions for:
 * - Managing element visibility (showing, hiding, toggling).
 * - Handling element positions and dimensions.
 * - Adding, removing, and toggling CSS classes.
 * - Manipulating element attributes, IDs, and styles.
 * - Detecting and modifying text direction (LTR/RTL).
 * - Handling margins, borders, and event listeners.
 * - Parsing HTML snippets and extracting metadata.
 * - Providing information about event interactions.
 * 
 * All methods in this class are static, and it should not be instantiated.
 *
 * @class
 */
class kwish_DOMUtils {

    // Screen calculations

    static recalcWidth = {};
    static recalcHeight = {};

    /**
     * Initializes recalculation tables for unit conversions.
     * 
     * This function creates a temporary DOM element to measure different CSS units
     * and stores the conversion factors for width and height in global objects.
     * It is used to accurately convert sizes from various measurement units to pixels.
     * 
     * The recalculation tables include conversions for the following units:
     * - `cm` (centimeters)
     * - `em` (relative to font size)
     * - `in` (inches)
     * - `mm` (millimeters)
     * - `pt` (points)
     * - `px` (pixels)
     * - `vh` (viewport height)
     * - `vw` (viewport width)
     * 
     * The function updates:
     * - `kwish_DOMUtils.recalcWidth` – An object storing width conversion factors.
     * - `kwish_DOMUtils.recalcHeight` – An object storing height conversion factors.
     */
    static mountRecalculationTable() {

        const dummyElement = document.createElement("div");
        dummyElement.style.position = "absolute";
        dummyElement.style.visibility = "hidden";
        dummyElement.style.width = "1in";
        dummyElement.style.height = "1in";
        document.body.appendChild(dummyElement);

        kwish_DOMUtils.recalcWidth = {};
        kwish_DOMUtils.recalcHeight = {};

        const units = ["cm", "em", "in", "mm", "pt", "px", "vh", "vw"];

        for (const unit of units) {
            dummyElement.style.width = `1${unit}`;
            kwish_DOMUtils.recalcWidth[unit] = dummyElement.offsetWidth;

            dummyElement.style.height = `1${unit}`;
            kwish_DOMUtils.recalcHeight[unit] = dummyElement.offsetHeight;
        }

        document.body.removeChild(dummyElement);
    }

    /**
     * Updates screen information.
     * 
     * This function ensures that recalculation tables are initialized before performing
     * unit conversions. It should be called when the screen parameters change or when
     * conversion accuracy needs to be updated.
     */
    static updateScreenInfo() {
        kwish_DOMUtils.mountRecalculationTable();
    }

    /**
     * Converts a given size from various measurement units to pixels.
     * 
     * The function supports conversion from the following units:
     * - `cm` (centimeters)
     * - `em` (relative to font size)
     * - `in` (inches)
     * - `mm` (millimeters)
     * - `pt` (points)
     * - `px` (pixels)
     * - `vh` (viewport height)
     * - `vw` (viewport width)
     * 
     * The recalculated pixel value is determined using precomputed conversion factors.
     * If the conversion table is uninitialized, it is automatically mounted before proceeding.
     * 
     * @param {number|string} size - The value to be converted to pixels.
     * @param {string} unit - The source measurement unit.
     * @param {string} dimension - The dimension type (`"width"` or `"height"`).
     * @returns {number} - The equivalent pixel value, or NaN if the unit is invalid.
     */
    static toPixels(size, unit, dimension) {

        if (!SizeUtils.recalcWidth[unit] || !SizeUtils.recalcHeight[unit])
            kwish_DOMUtils.mountRecalculationTable();

        const recalcTable = dimension === "width" ? kwish_DOMUtils.recalcWidth : kwish_DOMUtils.recalcHeight;

        const sizeValue = parseFloat(size);
        const sizeUnit = unit.toLowerCase();

        if (recalcTable[sizeUnit])
            return sizeValue * recalcTable[sizeUnit];

        return NaN;
    }

    // Detecting and setting text direction

    /**
     * Determines the text direction (`ltr` or `rtl`) of a given element.
     * 
     * - If an element is provided, the function retrieves its computed CSS direction.
     * - If the element has no explicit direction, it recursively checks its parent.
     * - If no direction is found, it defaults to `"ltr"`.
     * 
     * @param {HTMLElement} [element=document.documentElement] - The element to check the text direction for.
     * @returns {string} - `"ltr"` if the text direction is left-to-right, `"rtl"` if right-to-left.
     */
    static getTextDirection(element = undefined) {

        const htmlElement = element ? element : document.documentElement;

        const computedStyle = window.getComputedStyle(htmlElement);
        const direction = computedStyle.getPropertyValue("direction");

        if (direction === "ltr" || direction === "rtl")
            return direction;

        const parentElement = htmlElement.parentElement;

        if (parentElement)
            return kwish_DOMUtils.getTextDirection(parentElement);

        return "ltr";
    }

    /**
     * Checks if the given element (or document) has a left-to-right (LTR) text direction.
     * 
     * @param {HTMLElement} [element=document.documentElement] - The element to check.
     * @returns {boolean} - `true` if the text direction is `"ltr"`, otherwise `false`.
     */
    static isLTR(element = undefined) {
        return kwish_DOMUtils.getTextDirection(!!element ? documentElement : element) == "ltr";
    }

    /**
     * Sets the text direction of the specified element (or document) to `"ltr"` or `"rtl"`.
     * 
     * @param {string} direction - The desired text direction (`"ltr"` or `"rtl"`).
     * @param {HTMLElement} [element=document.documentElement] - The target element.
     */
    static setTextDirection(direction, element = undefined) {
        const targetElement = !!element ? element : document.documentElement;
        targetElement.style.direction = direction;
    }

    /**
     * Toggles the text direction between `"ltr"` and `"rtl"` for the specified element.
     * 
     * @param {HTMLElement} [element=document.documentElement] - The target element.
     */
    static toggleTextDirection(element = undefined) {

        const targetElement = !!element ? element : document.documentElement;
        const currentDirection = kwish_DOMUtils.getTextDirection(targetElement);

        const newDirection = currentDirection === "ltr" ? "rtl" : "ltr";
        kwish_DOMUtils.setTextDirection(newDirection, targetElement);
    }

    // CSS classes

    static setCSSProp(propName, propValue) {
        document.documentElement.style.setProperty(
            propName, propValue
        );
    }

    static getCSSProp(propName) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(propName)
            .trim();
    }

    static measureCSSProp(propName) {
        
        const dummy = document.createElement('div');
        
        dummy.setAttribute(
            'style', 
            `position: absolute; visibility: hidden; width: var(${propName})`
        );
        
        const body = document.body;
        body.appendChild(dummy);
        const propVal = kwish_DOMUtils.getWidth(dummy);

        dummy.remove();
        
        return propVal;
    }

    /**
     * Checks whether a given DOM element contains a specific CSS class.
     *
     * @param {HTMLElement} domElement - The element to check.
     * @param {string} cssClassName - The CSS class name to look for.
     * @returns {boolean} - `true` if the element has the class, otherwise `false`.
     */
    static hasCSSClass(domElement, cssClassName) {
        return domElement.classList.contains(cssClassName);
    }

    /**
     * Appends a CSS class to the class list of a given DOM element.
     *
     * @param {HTMLElement} domElement - The element to add the class to.
     * @param {string} cssClassName - The CSS class name to add.
     * @returns {HTMLElement} - The updated DOM element.
     */
    static addCSSClass(domElement, cssClassName) {
        domElement.classList.add(cssClassName);
        return domElement;
    }

    /**
     * Removes a CSS class from the class list of a given DOM element.
     *
     * @param {HTMLElement} domElement - The element to remove the class from.
     * @param {string} cssClassName - The CSS class name to remove.
     * @returns {HTMLElement} - The updated DOM element.
     */
    static removeCSSClass(domElement, cssClassName) {
        domElement.classList.remove(cssClassName);
        return domElement;
    }

    /**
     * Toggles a CSS class in the class list of a given DOM element.
     * If the class is present, it will be removed; otherwise, it will be added.
     *
     * @param {HTMLElement} domElement - The element whose class list will be toggled.
     * @param {string} cssClassName - The CSS class to toggle.
     * @returns {HTMLElement} - The updated DOM element.
     */
    static toggleCSSClass(domElement, cssClassName) {
        domElement.classList.toggle(cssClassName);
        return domElement;
    }

    /**
     * Applies or removes the `highlighted` CSS class to/from a given DOM element.
     *
     * @param {HTMLElement} domElement - The element to highlight.
     * @returns {HTMLElement} - The updated DOM element.
     */
    static applyCSSHighlight(domElement) {
        kwish_DOMUtils.toggleCSSClass(domElement, 'highlighted')
        return domElement;
    }

    /**
     * Replaces a specified CSS class with another in the class list of a given DOM element.
     *
     * @param {HTMLElement} domElement - The element where the class should be replaced.
     * @param {string} oldCSSClassName - The CSS class to be removed.
     * @param {string} newCSSClassName - The CSS class to be added.
     * @returns {HTMLElement} - The updated DOM element.
     */
    static replaceCSSClass(domElement, oldCSSClassName, newCSSClassName) {
        requestAnimationFrame(() => {
            kwish_DOMUtils.addCSSClass(domElement, newCSSClassName);
            kwish_DOMUtils.removeCSSClass(domElement, oldCSSClassName);
        });

        return domElement;
    }

    /**
     * Assembles a BEM-style class name from block, part, and state components.
     *
     * @param {string} block - The BEM block name.
     * @param {string} [part] - The BEM part name (optional).
     * @param {string} [state] - The BEM state name (optional).
     * @returns {string} - The assembled BEM-style class name.
     */
    static assembleBEMName(block, part = undefined, state = undefined) {
        const bemBlock = kwish_Utils.camelToSnake(block || '');
        const bemPart = part ? `__${kwish_Utils.camelToSnake(part)}` : '';
        const bemState = state ? `--${kwish_Utils.camelToSnake(state)}` : '';
        return `${bemBlock}${bemPart}${bemState}`;
    }

    // Displaying and hiding elements

    /**
     * Checks whether a given DOM element is visible.
     *
     * @param {HTMLElement} domElement - The element to check.
     * @returns {boolean} - `true` if the element is visible, otherwise `false`.
     */
    static isShown(domElement) {
        return (domElement.style.display || 'unset') !== 'none';
    }

    /**
     * Checks whether a given DOM element is hidden.
     *
     * @param {HTMLElement} domElement - The element to check.
     * @returns {boolean} - `true` if the element is hidden, otherwise `false`.
     */
    static isHidden(domElement) {
        return (domElement.style.display || 'unset') === 'none';
    }

    /**
     * Makes a given DOM element visible by resetting its `display` style.
     *
     * @param {HTMLElement} domElement - The element to show.
     * @returns {HTMLElement} - The updated DOM element.
     */
    static show(domElement) {

        if (!domElement.hasAttribute('style')) {
            domElement.setAttribute('style', '');
        }

        domElement.style.display = '';
        return domElement;
    }

    /**
     * Hides a given DOM element by setting its `display` style to `none`.
     *
     * @param {HTMLElement} domElement - The element to hide.
     * @returns {HTMLElement} - The updated DOM element.
     */
    static hide(domElement) {

        if (!domElement.hasAttribute('style')) {
            domElement.setAttribute('style', '');
        }

        domElement.style.display = 'none';
        return domElement
    }

    // Common getters ans setters

    /**
     * Checks whether the given object is a DOM node.
     *
     * @param {Object} obj - The object to check.
     * @returns {boolean} - `true` if the object is a DOM node, otherwise `false`.
     */
    static isDOMNode(obj) {
        return obj instanceof Node;
    }

    /**
     * Checks whether the given object is a DOM element or a document.
     *
     * @param {Object} obj - The object to check.
     * @returns {boolean} - `true` if the object is a DOM element or document, otherwise `false`.
     */
    static isDOMElement(obj) {
        return obj instanceof Element || obj instanceof Document;
    }

    /**
     * Checks whether a given DOM element has a specific tag name.
     *
     * @param {HTMLElement} domElement - The element to check.
     * @param {string} elmName - The tag name to compare against.
     * @returns {boolean} - `true` if the element's tag name matches the provided name, otherwise `false`.
     */
    static hasTagName(domElement, elmName) {
        return domElement.tagName.toUpperCase() === elmName.toUpperCase();
    }

    /**
     * Sets the `id` attribute of a given DOM element.
     *
     * @param {HTMLElement} domElement - The element to update.
     * @param {string} id - The `id` value to set.
     */
    static setId(domElement, id) {
        domElement.setAttribute('id', id);
    }

    /**
     * Retrieves the `id` attribute of a given DOM element.
     *
     * @param {HTMLElement} domElement - The element to retrieve the `id` from.
     * @returns {string|null} - The `id` value of the element, or `null` if not set.
     */
    static getId(domElement) {
        return domElement.getAttribute('id');
    }

    /**
     * Retrieves the root element of the page (the `<html>` element).
     *
     * @returns {HTMLElement} - The `<html>` element of the document.
     */
    static getPageRootElement() {
        return document.getElementsByTagName('html')[0];
    }

    // Merging and moving elements 

    /**
     * Checks whether a DOM element has child nodes.
     *
     * @param {HTMLElement} domElement - The DOM element to check.
     * @returns {boolean} - `true` if the element has child nodes, otherwise `false`.
     */
    static hasChildNodes(domElement) {
        return !!domElement ? domElement.childNodes.length > 0 : false;
    }

    /**
     * Removes all child nodes from a given DOM element.
     *
     * @param {HTMLElement} domElement - The DOM element to clear.
     * @returns {HTMLElement} - The updated DOM element with no child nodes.
     */
    static removeAllChildNodes(domElement) {

        while (domElement.firstChild)
            domElement.firstChild.remove();

        return domElement;
    }

    /**
     * Moves all child nodes from one DOM element to another.
     *
     * @param {HTMLElement} domFrom - The element from which child nodes will be moved.
     * @param {HTMLElement} domTo - The element to which child nodes will be appended.
     */
    static moveAllChildNodes(domFrom, domTo) {
        while (domFrom.firstChild)
            domTo.appendChild(domFrom.firstChild);
    }

    /**
     * Merges attributes from one DOM element into another.
     * Only attributes that are not already set on the destination element will be copied.
     *
     * @param {HTMLElement} dstDOMElm - The element receiving new attributes.
     * @param {HTMLElement} srcDOMElm - The element providing attributes.
     */
    static mergeElements(dstDOMElm, srcDOMElm) {

        for (const attr of srcDOMElm.attributes) {
            if (!dstDOMElm.hasAttribute(attr.name)) {
                dstDOMElm.setAttribute(attr.name, attr.value);
            }
        }
    }

    /**
     * Merges two elements if they have the same tag name; otherwise, appends one to the other.
     * - If the elements have the same tag name, attributes and child nodes are merged.
     * - If they differ, the source element is appended as a child of the destination element.
     *
     * @param {HTMLElement} dstDOMElm - The target element.
     * @param {HTMLElement} srcDOMElm - The source element.
     */
    static mergeOrAppend(dstDOMElm, srcDOMElm) {

        if (dstDOMElm.tagName === srcDOMElm.tagName) {
            kwish_DOMUtils.mergeElements(dstDOMElm, srcDOMElm);
            kwish_DOMUtils.moveAllChildNodes(srcDOMElm, dstDOMElm);
        } else {
            dstDOMElm.appendChild(srcDOMElm);
        }
    }

    // Element sizes and coordinates 

    /**
     * Sets the width of a given DOM element in pixels.
     *
     * @param {HTMLElement} element - The target element.
     * @param {number} pxWidth - The width in pixels.
     * @returns {HTMLElement} - The updated element.
     */
    static setWidth(element, pxWidth) {
        element.style.width = pxWidth + "px";
        return element;
    }

    /**
     * Retrieves the width of a given DOM element in pixels.
     * If the element is hidden (`display: none`), it temporarily makes it visible to measure.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The width in pixels.
     */
    static getWidth(element) {

        if (element.style.display != "none")
            return element.clientWidth;
        else {
            const visibility = element.style.visibility;

            element.style.visibility = "hidden";
            element.style.display = "";

            const width = element.clientWidth;

            element.style.display = "none";
            element.style.visibility = visibility;

            return width;
        }
    }

    /**
     * Sets the height of a given DOM element in pixels.
     *
     * @param {HTMLElement} element - The target element.
     * @param {number} pxHeight - The height in pixels.
     * @returns {HTMLElement} - The updated element.
     */
    static setHeight(element, pxHeight) {
        element.style.height = pxHeight + "px";
        return element;
    }

    /**
     * Retrieves the height of a given DOM element in pixels.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The height in pixels.
     */
    static getHeight(element) {
        return element.clientHeight;
    }

    /**
     * Sets the left position of a given DOM element in pixels.
     *
     * @param {HTMLElement} element - The target element.
     * @param {number} pxLeft - The left position in pixels.
     * @returns {HTMLElement} - The updated element.
     */
    static setLeft(element, pxLeft) {
        element.style.left = pxLeft + "px";
        return element;
    }

    /**
     * Retrieves the left position of a given DOM element relative to its offset parent.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The left position in pixels.
     */
    static getLeft(element) {
        return element.offsetLeft;
    }

    /**
     * Sets the top position of a given DOM element in pixels.
     *
     * @param {HTMLElement} element - The target element.
     * @param {number} pxTop - The top position in pixels.
     * @returns {HTMLElement} - The updated element.
     */
    static setTop(element, pxTop) {
        element.style.top = pxTop + "px";
        return element;
    }

    /**
     * Retrieves the top position of a given DOM element relative to its offset parent.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The top position in pixels.
     */
    static getTop(element) {
        return element.offsetTop;
    }

    /**
     * Sets the right position of a given DOM element in pixels.
     *
     * @param {HTMLElement} element - The target element.
     * @param {number} pxRight - The right position in pixels.
     * @returns {HTMLElement} - The updated element.
     */
    static setRight(element, pxRight) {
        element.stype.right = pxRight;
        return this;
    }

    /**
     * Retrieves the right boundary position of a given DOM element in pixels.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The right position in pixels.
     */
    static getRight(element) {
        return element.offsetLeft + element.clientWidth;
    }

    /**
     * Retrieves the bottom boundary position of a given DOM element in pixels.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The bottom position in pixels.
     */
    static getBottom(element) {
        return element.offsetTop + element.clientHeight;
    }

    /**
     * Retrieves the starting position (left in LTR, right in RTL) of a given DOM element.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The start position in pixels.
     */
    static getStart(element) {
        return kwish_DOMUtils.isLTR() ? kwish_DOMUtils.getLeft(element) : kwish_DOMUtils.getRight(element);
    }

    /**
     * Sets the starting position (left in LTR, right in RTL) of a given DOM element.
     *
     * @param {HTMLElement} element - The target element.
     * @param {number} pxStart - The start position in pixels.
     * @returns {HTMLElement} - The updated element.
     */
    static setStart(element, pxStart) {

        if (kwish_DOMUtils.isLTR())
            kwish_DOMUtils.setLeft(element, pxStart);
        else {
            const maxX = kwish_DOMUtils.getMaxX(element);
            const width = kwish_DOMUtils.getWidthWithBorders(element);
            kwish_DOMUtils.setLeft(element, maxX - width - pxStart);
        }

        return element;;
    }

    /**
     * Retrieves the stopping position (right in LTR, left in RTL) of a given DOM element.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The stop position in pixels.
     */
    static getStop(element) {
        return kwish_DOMUtils.isLTR() ? kwish_DOMUtils.getRight(element) : kwish_DOMUtils.getLeft(element);
    }

    /**
     * Sets the position and dimensions of a given DOM element.
     *
     * @param {HTMLElement} element - The target element.
     * @param {number} left - The left position in pixels.
     * @param {number} top - The top position in pixels.
     * @param {number} width - The width in pixels.
     * @param {number} height - The height in pixels.
     * @returns {HTMLElement} - The updated element.
     */
    static setRect(element, left, top, width, height) {

        kwish_DOMUtils.setLeft(element, left);
        kwish_DOMUtils.setTop(element, top);
        kwish_DOMUtils.setWidth(element, width);
        kwish_DOMUtils.setHeight(element, height);

        return element;
    }

    // Element borders 

    /**
     * Retrieves the width of a specified border of a given DOM element.
     *
     * @param {HTMLElement} element - The target element.
     * @param {string} borderName - The CSS property name of the border (e.g., "border-left-width").
     * @returns {number} - The width of the specified border in pixels.
     */
    static getBorderWidth(element, borderName) {
        const computedStyle = window.getComputedStyle(element);
        const borderWidth = computedStyle.getPropertyValue(borderName);
        return parseFloat(borderWidth);
    }

    /**
     * Retrieves the left border width of a given DOM element.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The left border width in pixels.
     */
    static getLeftBorderWidth(element) {
        return this.getBorderWidth(element, "border-left-width");
    }

    /**
     * Retrieves the right border width of a given DOM element.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The right border width in pixels.
     */
    static getRightBorderWidth(element) {
        return this.getBorderWidth(element, "border-right-width");
    }

    /**
     * Retrieves the top border width of a given DOM element.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The top border width in pixels.
     */
    static getTopBorderWidth(element) {
        return this.getBorderWidth(element, "border-top-width");
    }

    /**
     * Retrieves the bottom border width of a given DOM element.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The bottom border width in pixels.
     */
    static getBottomBorderWidth(element) {
        return this.getBorderWidth(element, "border-bottom-width");
    }

    /**
     * Retrieves the total width of a given DOM element, including its left and right borders.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The total width in pixels, including borders.
     */
    static getWidthWithBorders(element) {
        return this.getLeftBorderWidth(element)
            + this.getWidth(element)
            + this.getRightBorderWidth(element);
    }

    /**
     * Retrieves the total height of a given DOM element, including its top and bottom borders.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The total height in pixels, including borders.
     */
    static getHeightWithBorders(element) {
        return this.getTopBorderWidth(element)
            + this.getHeight(element)
            + this.getBottomBorderWidth(element);
    }

    // Element margins 

    /**
     * Retrieves the width of a specified margin of a given DOM element.
     *
     * @param {HTMLElement} element - The target element.
     * @param {string} marginName - The CSS property name of the margin (e.g., "margin-left").
     * @returns {number} - The width of the specified margin in pixels.
     */
    static getMarginWidth(element, marginName) {
        return parseFloat(window.getComputedStyle(element).getPropertyValue(marginName));
    }

    /**
     * Retrieves the left margin width of a given DOM element.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The left margin width in pixels.
     */
    static getLeftMarginWidth(element) {
        return kwish_DOMUtils.getMarginWidth(element, "margin-left");
    }

    /**
     * Retrieves the right margin width of a given DOM element.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The right margin width in pixels.
     */
    static getRightMarginWidth(element) {
        return kwish_DOMUtils.getMarginWidth(element, "margin-right");
    }

    /**
     * Retrieves the top margin width of a given DOM element.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The top margin width in pixels.
     */
    static getTopMarginWidth(element) {
        return kwish_DOMUtils.getMarginWidth(element, "margin-top");
    }

    /**
     * Retrieves the bottom margin width of a given DOM element.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The bottom margin width in pixels.
     */
    static getBottomMarginWidth(element) {
        return kwish_DOMUtils.getMarginWidth(element, "margin-bottom");
    }

    /**
     * Retrieves the total width of a given DOM element, including its left and right margins.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The total width in pixels, including margins.
     */
    static getWidthWithMargins(element) {
        return this.getLeftMarginWidth(element)
            + this.getWidthWithBorders(element)
            + this.getRightMarginWidth(element);
    }

    /**
     * Retrieves the total height of a given DOM element, including its top and bottom margins.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The total height in pixels, including margins.
     */
    static getHeightWithMargins(element) {
        return this.getTopMarginHeight(element)
            + this.getHeightWithBorders(element)
            + this.getBottomMarginHeight(element);
    }

    // Misc. element properties

    static getWindowWidth() {
        return window,innerWidth;
    }

    static getWindowHeight() {
        return window,innerHeight;
    }

    /**
     * Sets the position of a given DOM element to absolute.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {HTMLElement} - The updated DOM element.
     */
    static makeAbsolute(element) {
        element.style.position = "absolute";
        return element;
    }

    /**
     * Sets the title attribute of a given DOM element.
     *
     * @param {HTMLElement} element - The target element.
     * @param {string} title - The title text to be set.
     * @returns {HTMLElement} - The updated DOM element.
     */
    static setTitle(element, title) {
        element.setAttribute("title", title);
        return element;
    }

    /**
     * Sets the z-index of a given DOM element.
     *
     * @param {HTMLElement} element - The target element.
     * @param {number} zIndex - The z-index value to be applied.
     * @returns {HTMLElement} - The updated DOM element.
     */
    static setZIndex(element, zIndex) {
        element.style.zIndex = zIndex;
        return element;
    }

    /**
     * Sets the cursor style of a given DOM element.
     *
     * @param {HTMLElement} element - The target element.
     * @param {string} cursor - The CSS cursor style to be applied.
     * @returns {HTMLElement} - The updated DOM element.
     */
    static setCursor(element, cursor) {
        element.style.cursor = cursor;
        return element;
    }

    /**
     * Sets the border-radius of a given DOM element.
     *
     * @param {HTMLElement} element - The target element.
     * @param {number} r - The border-radius value in pixels.
     * @returns {HTMLElement} - The updated DOM element.
     */
    static setBorderRadius(element, r) {
        element.style.borderRadius = r + "px";
        return element;
    }

    /**
     * Sets the background color of a given DOM element.
     *
     * @param {HTMLElement} element - The target element.
     * @param {string} color - The CSS color value to be applied.
     * @returns {HTMLElement} - The updated DOM element.
     */
    static setBackgroundColor(element, color) {
        element.style.background = color;
        return element;
    }

    /**
     * Generates a random RGBA color.
     *
     * @param {number} [opacity=0.5] - The opacity value (0 to 1).
     * @returns {string} - The randomly generated RGBA color string.
     */
    static randomColor(opacity = 0.5) {

        const r = (Math.round(Math.random() * 255)).toString();
        const g = (Math.round(Math.random() * 255)).toString();
        const b = (Math.round(Math.random() * 255)).toString();

        const randomColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;

        return randomColor;
    }

    /**
     * Retrieves the maximum horizontal position (X coordinate) of a given DOM element.
     *
     * @param {HTMLElement} element - The target element.
     * @returns {number} - The maximum X coordinate relative to its parent.
     */
    static getMaxX(element) {

        const maxX = element.offsetLeft + element.offsetWidth;
        const parentWidth = element.parentNode.offsetWidth;

        return Math.max(maxX, parentWidth);
    }

    // Working with certain elements

    /**
     * Retrieves the content attribute of a meta tag by its name.
     *
     * @param {string} metaName - The name attribute of the meta tag.
     * @returns {string|undefined} - The content of the specified meta tag, or undefined if not found.
     */
    static getMetaContent(metaName) {

        let content = undefined

        let metas = document.getElementsByTagName("meta");

        for (let meta of metas)
            if (meta.getAttribute("name") == metaName) {
                content = meta.getAttribute("content");
                break;
            }

        return content;
    }

    // Effects

    static tremblers = new Map();

    /**
     * Applies a trembling effect to a given DOM element by slightly changing its position.
     *
     * @param {HTMLElement} element - The DOM element to be trembled.
     */
    static tremble(element) {

        const trembler = kwish_DOMUtils.tremblers.get(element);

        if (Math.abs(trembler.left - kwish_DOMUtils.getLeft(element)) < trembler.amplitude) {
            const left = kwish_DOMUtils.getLeft(element) + (Math.random() - .5) * trembler.amplitude;
            kwish_DOMUtils.setLeft(element, left);
        } else
            kwish_DOMUtils.setLeft(element, trembler.left);

        if (Math.abs(trembler.top - kwish_DOMUtils.getTop(element)) < trembler.amplitude) {
            const top = kwish_DOMUtils.getTop(element) + (Math.random() - .5) * trembler.amplitude;
            kwish_DOMUtils.setTop(element, top);
        } else
            kwish_DOMUtils.setTop(element, trembler.top);

        if (trembler.timeout) {
            const now = (new Date()).getTime();
            if (now - trembler.start > trembler.timeout)
                kwish_DOMUtils.stopTremble(element);
        }
    }

    /**
     * Initiates a trembling effect on a given DOM element.
     *
     * @param {HTMLElement} element - The DOM element to tremble.
     * @param {number} amplitude - The maximum displacement in pixels.
     * @param {number} period - The interval (in milliseconds) between position changes.
     * @param {number} [timeout] - The duration (in milliseconds) after which the effect stops automatically.
     */
    static startTremble(element, amplitude, period, timeout = undefined) {

        if (!kwish_DOMUtils.tremblers.get(element)) {

            const left = kwish_DOMUtils.getLeft(element);
            const top = kwish_DOMUtils.getTop(element);

            const trembler = {
                "amplitude": amplitude,
                "left": left,
                "top": top,
                "timer": setInterval(() => { kwish_DOMUtils.tremble(element, amplitude) }, period),
                "start": new Date().getTime(),
                "timeout": timeout
            };

            kwish_DOMUtils.tremblers.set(element, trembler);
        }
    }

    /**
     * Stops the trembling effect on a given DOM element and restores its original position.
     *
     * @param {HTMLElement} element - The DOM element whose trembling effect should be stopped.
     */
    static stopTremble(element) {
        const trembler = kwish_DOMUtils.tremblers.get(element);
        clearInterval(trembler.timer);
        kwish_DOMUtils.setLeft(element, trembler.left);
        kwish_DOMUtils.setTop(element, trembler.top);
        kwish_DOMUtils.tremblers.delete(element);
    }

    // Parsing HTML

    /**
     * Parses an HTML document string and extracts elements marked with a specific attribute.
     *
     * @param {string} htmlDocument - The HTML document string to be parsed.
     * @param {string} [spotAttrName='data-kwish-spot'] - The attribute name used to identify elements of interest.
     * @returns {[Document, Object]} - A tuple containing the parsed HTML document and an object mapping spot names to elements.
     */
    static parseDocument(htmlDocument, spotAttrName = 'data-kwish-spot') {
        const spots = {};
        const parser = new DOMParser();
        const domDoc = parser.parseFromString(htmlDocument, 'text/html');
        const rawSpots = [...domDoc.querySelectorAll(`[${spotAttrName}]`)];
        rawSpots.forEach(sp => spots[sp.getAttribute(spotAttrName)] = sp);
        return [domDoc, spots];
    }

    /**
     * Checks whether a given DOM element has a parent element.
     *
     * @param {HTMLElement} domElement - The DOM element to check.
     * @returns {boolean} - Returns true if the element has a parent that is an element node, otherwise false.
     */
    static hasParentElement(domElement) {
        if (!domElement || !domElement.parentNode) return false;
        return domElement.parentNode.nodeType === Node.ELEMENT_NODE;
    }

    /**
     * Retrieves the closest ancestor of a given DOM element that is a `<body>` element.
     *
     * @param {HTMLElement} domElement - The DOM element whose body ancestor is to be found.
     * @returns {HTMLElement|null} - The closest `<body>` ancestor element or null if not found.
     */
    static getBodyAncestor(domElement) {
        if (!domElement) return null;
        return domElement.closest('body');
    }

    /**
     * Checks whether a given DOM element is part of the main document.
     *
     * @param {HTMLElement} domElement - The DOM element to check.
     * @returns {boolean} - Returns true if the element belongs to the main document, otherwise false.
     */
    static inMainDocument(domElement) {

        if (!kwish_DOMUtils.isDOMElement(domElement)) return false;

        const body = kwish_DOMUtils.getBodyAncestor(domElement);
        if (!body) return false;
        return body.getAttribute('data-parsed-flag') !== 'yes';
    }

    /**
     * Parses an HTML snippet and extracts its root elements and marked spots.
     *
     * @param {string} htmlSnippet - The HTML snippet string to be parsed.
     * @param {string} [spotAttrName='data-kwish-spot'] - The attribute name used to identify elements of interest.
     * @returns {[HTMLElement[], Object]} - A tuple containing an array of top-level elements and an object mapping spot names to elements.
     */
    static parseSnippet(htmlSnipet, spotAttrName = 'data-kwish-spot') {
        const domNodes = [];
        const [tmpDoc, spots] = kwish_DOMUtils.parseDocument(htmlSnipet, spotAttrName);
        const domBody = tmpDoc.getElementsByTagName('body')[0];
        domBody.setAttribute('data-parsed-flag', 'yes');
        [...domBody.children].forEach(domNode => domNodes.push(domNode));
        return [domNodes, spots];
    }

    // Events

    /**
     * Calculates the local coordinates of an event relative to a given element.
     *
     * @param {Event} event - The event object.
     * @param {HTMLElement} element - The reference element.
     * @returns {kwish_Vect} - The local vector representing the event position relative to the element.
     */
    static getEventLocalVect(event, element) {

        const elementRect = element.getBoundingClientRect();

        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        const localX = event.clientX - elementRect.left + scrollX - window.pageXOffset;
        const localY = event.clientY - elementRect.top + scrollY - window.pageYOffset;

        return new kwish_Vect(localX, localY);
    }

    /**
     * Computes the difference in screen coordinates between two events.
     *
     * @param {Event} currEvent - The current event.
     * @param {Event} prevEvent - The previous event.
     * @returns {kwish_Vect} - The vector representing the difference in position.
     */
    static eventsDeltaVect(currEvent, prevEvent) {

        const deltaX = Math.round(currEvent.screenX - prevEvent.screenX);
        const deltaY = Math.round(currEvent.screenY - prevEvent.screenY);

        return new kwish_Vect(deltaX, deltaY);
    }

    /**
     * Determines if a specific key combination was pressed during an event.
     *
     * @param {KeyboardEvent} event - The keyboard event to check.
     * @param {string} keys - A string representing the key combination (e.g., "Ctrl+Shift+X").
     * @returns {boolean} - True if the key combination was pressed, otherwise false.
     */
    static isKeyPressed(event, keys) {

        const keyCombination = keys.split('+');

        if (!event || !event.key || typeof event.getModifierState !== 'function') {
            return false;
        }

        const hasCtrl = keyCombination.includes('Ctrl') ? event.ctrlKey : !event.ctrlKey;
        const hasAlt = keyCombination.includes('Alt') ? event.altKey : !event.altKey;
        const hasShift = keyCombination.includes('Shift') ? event.shiftKey : !event.shiftKey;
        const hasCommand = keyCombination.includes('Cmd') ? event.getModifierState('Meta') : true;
        const hasWin = keyCombination.includes('Win') ? event.getModifierState('Win') : true;

        const mainKey = keyCombination[keyCombination.length - 1];
        const hasMainKey = event.key === mainKey;

        return hasCtrl && hasAlt && hasShift && hasCommand && hasWin && hasMainKey;
    }

    /**
     * Retrieves a list of all standard DOM event names.
     *
     * @returns {string[]} - An array containing the names of all known DOM events.
     */
    static getDOMEventNames() {

        const DOMEventNames = [
            "abort",
            "activate",
            "addstream",
            "addtrack",
            "afterprint",
            "afterscriptexecute",
            "animationcancel",
            "animationend",
            "animationiteration",
            "animationstart",
            "appinstalled",
            "audioend",
            "audioprocess",
            "audiostart",
            "auxclick",
            "beforeinput",
            "beforeprint",
            "beforescriptexecute",
            "beforeunload",
            "beginEvent",
            "blocked",
            "blur",
            "boundary",
            "bufferedamountlow",
            "cancel",
            "canplay",
            "canplaythrough",
            "change",
            "click",
            "close",
            "closing",
            "complete",
            "compositionend",
            "compositionstart",
            "compositionupdate",
            "connect",
            "connectionstatechange",
            "contentdelete",
            "contextmenu",
            "copy",
            "cuechange",
            "cut",
            "datachannel",
            "dblclick",
            "devicechange",
            "devicemotion",
            "deviceorientation",
            "DOMActivate",
            "DOMContentLoaded",
            "DOMContentLoaded",
            "DOMMouseScroll",
            "drag",
            "dragend",
            "dragenter",
            "dragleave",
            "dragover",
            "dragstart",
            "drop",
            "durationchange",
            "emptied",
            "end",
            "ended",
            "endEvent",
            "enterpictureinpicture",
            "error",
            "focus",
            "focusin",
            "focusout",
            "formdata",
            "fullscreenchange",
            "fullscreenerror",
            "gamepadconnected",
            "gamepaddisconnected",
            "gatheringstatechange",
            "gesturechange",
            "gestureend",
            "gesturestart",
            "gotpointercapture",
            "hashchange",
            "icecandidate",
            "icecandidateerror",
            "iceconnectionstatechange",
            "icegatheringstatechange",
            "IDBTransaction",
            "input",
            "inputsourceschange",
            "install",
            "invalid",
            "keydown",
            "keypress",
            "keyup",
            "languagechange",
            "leavepictureinpicture",
            "load",
            "loadeddata",
            "loadedmetadata",
            "loadend",
            "loadstart",
            "lostpointercapture",
            "mark",
            "merchantvalidation",
            "message",
            "messageerror",
            "mousedown",
            "mouseenter",
            "mouseleave",
            "mousemove",
            "mouseout",
            "mouseover",
            "mouseup",
            "mousewheel",
            "msContentZoom",
            "MSGestureChange",
            "MSGestureEnd",
            "MSGestureHold",
            "MSGestureStart",
            "MSGestureTap",
            "MSInertiaStart",
            "MSManipulationStateChanged",
            "mute",
            "negotiationneeded",
            "nomatch",
            "notificationclick",
            "offline",
            "online",
            "open",
            "orientationchange",
            "pagehide",
            "pageshow",
            "paste",
            "pause",
            "payerdetailchange",
            "paymentmethodchange",
            "play",
            "playing",
            "pointercancel",
            "pointerdown",
            "pointerenter",
            "pointerleave",
            "pointerlockchange",
            "pointerlockerror",
            "pointermove",
            "pointerout",
            "pointerover",
            "pointerup",
            "popstate",
            "progress",
            "push",
            "pushsubscriptionchange",
            "ratechange",
            "readystatechange",
            "rejectionhandled",
            "removestream",
            "removetrack",
            "removeTrack",
            "repeatEvent",
            "reset",
            "resize",
            "resourcetimingbufferfull",
            "result",
            "resume",
            "scroll",
            "search",
            "seeked",
            "seeking",
            "select",
            "selectedcandidatepairchange",
            "selectend",
            "selectionchange",
            "selectstart",
            "shippingaddresschange",
            "shippingoptionchange",
            "show",
            "signalingstatechange",
            "slotchange",
            "soundend",
            "soundstart",
            "speechend",
            "speechstart",
            "squeeze",
            "squeezeend",
            "squeezestart",
            "stalled",
            "start",
            "statechange",
            "storage",
            "submit",
            "success",
            "suspend",
            "timeout",
            "timeupdate",
            "toggle",
            "tonechange",
            "touchcancel",
            "touchend",
            "touchmove",
            "touchstart",
            "track",
            "transitioncancel",
            "transitionend",
            "transitionrun",
            "transitionstart",
            "unhandledrejection",
            "unload",
            "unmute",
            "upgradeneeded",
            "versionchange",
            "visibilitychange",
            "voiceschanged",
            "volumechange",
            "vrdisplayactivate",
            "vrdisplayblur",
            "vrdisplayconnect",
            "vrdisplaydeactivate",
            "vrdisplaydisconnect",
            "vrdisplayfocus",
            "vrdisplaypointerrestricted",
            "vrdisplaypointerunrestricted",
            "vrdisplaypresentchange",
            "waiting",
            "webglcontextcreationerror",
            "webglcontextlost",
            "webglcontextrestored",
            "webkitmouseforcechanged",
            "webkitmouseforcedown",
            "webkitmouseforceup",
            "webkitmouseforcewillbegin",
            "wheel"
        ];

        return DOMEventNames;
    }
}

/**
 * A utility class for logging and managing DOM events over time.
 * This class keeps track of events and determines whether they are still relevant based on a defined timeout.
 */
class kwish_DOMEventLog {

    static timeout = 10000;
    static events = new Map();

    /**
     * Adds an event to the log with the current timestamp.
     *
     * @param {Event} event - The event to be logged.
     */
    static addEvent(event) {
        kwish_DOMEventLog.events.set(event, kwish_Utils.getCurrTime());
    }

    /**
     * Checks whether an event is already logged.
     *
     * @param {Event} event - The event to check.
     * @returns {boolean} - True if the event is logged, otherwise false.
     */
    static isLogged(event) {
        return !!kwish_DOMEventLog.events.get(event);
    }

    /**
     * Retrieves the timestamp of a logged event.
     *
     * @param {Event} event - The event to check.
     * @returns {number|undefined} - The timestamp of the event or undefined if not found.
     */
    static getEventTimeStamp(event) {
        return kwish_DOMEventLog.events.get(event);
    }

    /**
     * Calculates the age of an event in milliseconds.
     *
     * @param {Event} event - The event to check.
     * @returns {number} - The age of the event in milliseconds.
     */
    static getEventAge(event) {
        return kwish_Utils.getCurrTime() - kwish_DOMEventLog.getEventTimeStamp(event);
    }

    /**
     * Removes a specific event from the log.
     *
     * @param {Event} event - The event to be removed.
     */
    static removeEvent(event) {
        kwish_DOMEventLog.events.delete(event);
    }

    /**
     * Retrieves the current timeout value for obsolete events.
     *
     * @returns {number} - The timeout value in milliseconds.
     */
    static getEventsTimeout() {
        return kwish_DOMEventLog.timeout;
    }

    /**
     * Determines whether a logged event has become obsolete.
     *
     * @param {Event} event - The event to check.
     * @returns {boolean} - True if the event is obsolete, otherwise false.
     */
    static isObsolete(event) {
        return kwish_DOMEventLog.getEventAge(event) > kwish_DOMEventLog.getEventsTimeout();
    }

    /**
     * Removes obsolete events that have exceeded the timeout threshold.
     */
    static removeObsolete() {
        for (const event of kwish_DOMEventLog.events.keys()) {
            if (kwish_DOMEventLog.isObsolete(event)) {
                kwish_DOMEventLog.removeEvent(event);
            }
        }
    }

    /**
     * Starts the event logging system, periodically removing obsolete events.
     */
    static start() {
        kwish_DOMEventLog.timer = setInterval(
            () => kwish_DOMEventLog.removeObsolete(kwish_Utils.getCurrTime()),
            kwish_DOMEventLog.getEventsTimeout()
        )
    }

    /**
     * Stops the event logging system.
     */
    static stop() {
        clearInterval(kwish_DOMEventLog.timer);
    }
}