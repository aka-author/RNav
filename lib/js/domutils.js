// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      domutils.js                           (\(\
// Func:        Working with DOM objects and events   (^.^)  
// * * ** *** ***** ******** ************* *********************



/**
 * Provides service functions and utilities for working 
 * with DOM objects as static methods.
 * 
 * @class
 */

class RNav_DOMUtils {

    // Measure units

    static recalcWidth = {};
    static recalcHeight = {};

    /**
     * Detects actual screen parameters. RNav_ uses the screen parameter
     * for recalculating points to pixels and vice versa. 
     */

    static updateScreenInfo() {
        RNav_DOMUtils.buildRecalculationTable();
    }


    // CSS classes

    /**
     * Checks whether a given DOM element contains a specific CSS class 
     * in its class list.
     *
     * @param {HTMLElement} element - The DOM element to be checked for 
     * the presence of a certain class.
     * @param {string} cssClassName - The name of the CSS class to be 
     * checked for within the element's class list.
     * @returns {boolean} - Returns true if the provided element has 
     * the specified CSS class in its class list, otherwise returns false.
     */

    static hasCSSClass(domElement, cssClassName) {
        return domElement.classList.contains(cssClassName);
    }

    /**
     * Appends a CSS class to a class list of a given DOM element.
     *  
     * @param {HTMLElement} domElement - The DOM element receiving a given 
     * CSS class to its class list. 
     * @param {string} cssClassName - The CSS class name that is getting 
     * appended to the class list of the given DOM element. 
     * @return {HTMLElement} - The updated DOM element. 
     */

    static addCSSClass(domElement, cssClassName) {
        domElement.classList.add(cssClassName);
        return domElement;
    }

    /**
     * Removes a CSS class from the class list of a given DOM element.
     * 
     * @param {HTMLElement} domElement - The element from the class list 
     * of which the given class should be removed.
     * @param {string} cssClassName - The class name that should be 
     * removed from the class list of the given DOM element. 
     * @returns {HTMLElement} - The updated DOM element.
     */

    static removeCSSClass(domElement, cssClassName) {
        domElement.classList.remove(cssClassName);
        return domElement;
    }

    /**
     * Toggles a specified CSS class name in the class list of a given DOM element.
     * If the DOM element does not have the provided CSS class in its class list,
     * the class will be added; otherwise, it will be removed.
     *
     * @param {HTMLElement} domElement - The DOM element whose class list 
     * should be toggled.
     * @param {string} cssClassName - The CSS class to be toggled.
     * @returns {HTMLElement} - The updated DOM element.
     */

    static toggleCSSClass(domElement, cssClassName) {
        domElement.classList.toggle(cssClassName);
        return domElement;
    }

    /**
     * Replaces a specified CSS class with another CSS class in the class
     * list of a given DOM element. 
     * 
     * @param {HTMLElement} domElement - A DOM element where the specified CSS 
     * class should be replaced.
     * @param {string} currentCssClassName - The CSS class name to be replaced.  
     * @param {string} replacingCssClassName - The replacing CSS class name. 
     * @returns {HTMLElement} - The updated DOM element.
     */

    static replaceCSSClass(domElement, oldCSSClassName, newCSSClassName) {
        requestAnimationFrame(() => {
            RNav_DOMUtils.addCSSClass(domElement, newCSSClassName);
            RNav_DOMUtils.removeCSSClass(domElement, oldCSSClassName);
        });

        return domElement;
    }

    static assembleBEMName(block, part = undefined, state = undefined) {
        const bemBlock = RNav_Utils.camelToSnake(block || '');
        const bemPart = part ? `__${RNav_Utils.camelToSnake(part)}` : '';
        const bemState = state ? `--${RNav_Utils.camelToSnake(state)}` : '';
        return `${bemBlock}${bemPart}${bemState}`;
    }

    // Content 

    static isDOMNode(obj) {
        return obj instanceof Node;
    }

    static isDOMElement(obj) {
        return obj instanceof Element || obj instanceof Document;
    }

    static hasTagName(domElement, elmName) {
        return domElement.tagName.toUpperCase() === elmName.toUpperCase();
    } 

    static isShown(domElement) {
        return (domElement.style.display || 'unset') !== 'none';
    }

    static isHidden(domElement) {
        return domElement.style.display || 'unset' === 'none';
    }

    static show(domElement) {
        domElement.style.display = '';
    }

    static hide(domElement) {
        domElement.style.display = 'none';
    }

    static setId(domElement, id) {
        domElement.setAttribute('id', id);
    }

    static getId(domElement) {
        return domElement.getAttribute('id');
    }

    static getPageRootElement() {
        return document.getElementsByTagName('html')[0];
    }

    static mergeElements(dstDOMElm, srcDOMElm) {

        for(const attr of srcDOMElm.attributes) {
            if (!dstDOMElm.hasAttribute(attr.name)) {
                dstDOMElm.setAttribute(attr.name, attr.value);
            }
        }
    }

    static moveChildren(dstDOMElm, srcDOMElm) {
        Array.from(srcDOMElm.children).forEach(
            kid => dstDOMElm.appendChild(kid)
        );
    }

    static mergeOrAppend(dstDOMElm, srcDOMElm) {

        if (dstDOMElm.tagName === srcDOMElm.tagName) {
            RNav_DOMUtils.mergeElements(dstDOMElm, srcDOMElm);
            RNav_DOMUtils.moveChildren(dstDOMElm, srcDOMElm);
        } else {
            dstDOMElm.appendChild(srcDOMElm);
        }

    }

    /**
     * Checks whether a DOM element has child nodes. 
     * 
     * @param {HTMLElement} domElement - A DOM element to be checked 
     * for existance of child nodes.
     * @returns {boolean} - true if the DOM element has child nodes, 
     * otherwise returns false.
     */

    static hasChildNodes(domElement) {
        return !!domElement ? domElement.childNodes.length > 0 : false;
    }

    /**
     * Removes all the child nodes of a given DOM element. 
     * 
     * @param {HTMLElement} domElement - An DOM element to be emptiedю
     * @return {HTMLElement} - The updated DOM element. 
     */

    static removeAllChildNodes(domElement) {

        while(domElement.firstChild)
            domElement.firstChild.remove();

        return domElement;
    }

    static moveAllChildNodes(domFrom, domTo) {
        while(domFrom.firstChild)
            domTo.appendChild(domFrom.firstChild);
    }

    // Effects

    static tremblers = new Map();

    static buildRecalculationTable() {
        const dummyElement = document.createElement("div");
        dummyElement.style.position = "absolute";
        dummyElement.style.visibility = "hidden";
        dummyElement.style.width = "1in";
        dummyElement.style.height = "1in";
        document.body.appendChild(dummyElement);
    
        SizeUtils.recalcWidth = {};
        SizeUtils.recalcHeight = {};
    
        const units = ["cm", "em", "in", "mm", "pt", "px", "vh", "vw"];
    
        for (const unit of units) {
          dummyElement.style.width = `1${unit}`;
          SizeUtils.recalcWidth[unit] = dummyElement.offsetWidth;
    
          dummyElement.style.height = `1${unit}`;
          SizeUtils.recalcHeight[unit] = dummyElement.offsetHeight;
        }
    
        document.body.removeChild(dummyElement);
    }

    /**
     * Converts a size to pixels from other measure units.
     * 
     * @param {number} size - A size to be converted to pixels from other
     * measure units. 
     * @param {string} unit - The name of source measure units. 
     * @param {string} dimension - The dimension: "width" or "height"
     * @returns 
     */

    static toPixels(size, unit, dimension) {

        if (!SizeUtils.recalcWidth[unit] || !SizeUtils.recalcHeight[unit]) 
            RNav_DOMUtils.buildRecalculationTable();
    
        const recalcTable = dimension === "width" ? RNav_DOMUtils.recalcWidth : RNav_DOMUtils.recalcHeight;
    
        const sizeValue = parseFloat(size);
        const sizeUnit = unit.toLowerCase();
    
        if (recalcTable[sizeUnit]) 
          return sizeValue*recalcTable[sizeUnit];
    
        return NaN;
    }

    // Detecting and setting text direction

    static getTextDirection(element=undefined) {

        const htmlElement = element ? element : document.documentElement;
      
        const computedStyle = window.getComputedStyle(htmlElement);
        const direction = computedStyle.getPropertyValue("direction");
      
        if(direction === "ltr" || direction === "rtl") 
            return direction;
      
        const parentElement = htmlElement.parentElement;
        
        if(parentElement) 
          return RNav_DOMUtils.getTextDirection(parentElement);
        
        return "ltr";
    }

    static isLTR(element=undefined) {
        return RNav_DOMUtils.getTextDirection(!!element ? documentElement : element) == "ltr";
    }

    static setTextDirection(direction, element = undefined) {
        const targetElement = !!element ? element : document.documentElement;
        targetElement.style.direction = direction;
    }

    static toggleTextDirection(element=undefined) {

        const targetElement = !!element ? element : document.documentElement;
        const currentDirection = RNav_DOMUtils.getTextDirection(targetElement);
    
        const newDirection = currentDirection === "ltr" ? "rtl" : "ltr";
        RNav_DOMUtils.setTextDirection(newDirection, targetElement);
    }

    // Displaying and hiding elements

    static show(element) {
		element.style.display = "";
        return element;
	}
	
	static hide(element) {
		element.style.display = "none";
        return element;
	}
    
    // Element sizes and coordinates 

    static setWidth(element, pxWidth) {
        element.style.width = pxWidth + "px";
        return element;
    }

    static getWidth(element) {

        if(element.style.display != "none")
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

    static setHeight(element, pxHeight) {
        element.style.height = pxHeight + "px";
        return element;
    }

    static getHeight(element) {
        return element.clientHeight;
    }

    static setLeft(element, pxLeft) {
        element.style.left = pxLeft + "px";
        return element;
    }

    static getLeft(element) {
        return element.offsetLeft;
    }

    static setTop(element, pxTop) {
        element.style.top = pxTop + "px";
        return element;
    }

    static getTop(element) {
        return element.offsetTop;
    }

    static setRight(element, pxRight) {
        element.stype.right = pxRight;
        return this;
    }

    static getRight(element) {
        return element.offsetLeft + element.clientWidth;
    }
    
    static getBottom(element) {
        return element.offsetTop + element.clientHeight;
    }

    static getStart(element) {
        return RNav_DOMUtils.isLTR() ? RNav_DOMUtils.getLeft(element) : RNav_DOMUtils.getRight(element); 
    }

    static setStart(element, pxStart) {
        
        if(RNav_DOMUtils.isLTR()) 
            RNav_DOMUtils.setLeft(element, pxStart);
        else {
            const maxX = RNav_DOMUtils.getMaxX(element);
            const width = RNav_DOMUtils.getWidthWithBorders(element);
            RNav_DOMUtils.setLeft(element, maxX - width - pxStart);
        }

        return element;;
    }

    static getStop(element) {
        return RNav_DOMUtils.isLTR() ? RNav_DOMUtils.getRight(element) : RNav_DOMUtils.getLeft(element);
    }

    static setRect(element, left, top, width, height) {
        
        RNav_DOMUtils.setLeft(element, left);
        RNav_DOMUtils.setTop(element, top);
        RNav_DOMUtils.setWidth(element, width);
        RNav_DOMUtils.setHeight(element, height);

        return element;
    }


    // Element borders 

    static getBorderWidth(element, borderName) {
        const computedStyle = window.getComputedStyle(element);
        const borderWidth = computedStyle.getPropertyValue(borderName);
        return parseFloat(borderWidth);
    }

    static getLeftBorderWidth(element) {
        return this.getBorderWidth(element, "border-left-width");
    }

    static getRightBorderWidth(element) {
        return this.getBorderWidth(element, "border-right-width");
    }

    static getTopBorderWidth(element) {
        return this.getBorderWidth(element, "border-top-width");
    }

    static getBottomBorderWidth(element) {
        return this.getBorderWidth(element, "border-bottom-width");
    }

    static getWidthWithBorders(element) {
        return this.getLeftBorderWidth(element) 
                + this.getWidth(element) 
                + this.getRightBorderWidth(element);
    }

    static getHeightWithBorders(element) {
        return this.getTopBorderWidth(element) 
                + this.getHeight(element) 
                + this.getBottomBorderWidth(element);
    }

    // Element margins 

    static getMarginWidth(element, marginName) {
        return parseFloat(window.getComputedStyle(element).getPropertyValue(marginName));
    }

    static getLeftMarginWidth(element) {
        return RNav_DOMUtils.getMarginWidth(element, "margin-left");
    }

    static getRightMarginWidth(element) {
        return RNav_DOMUtils.getMarginWidth(element, "margin-right");
    }

    static getTopMarginWidth(element) {
        return RNav_DOMUtils.getMarginWidth(element, "margin-top");
    }

    static getBottomMarginWidth(element) {
        return RNav_DOMUtils.getMarginWidth(element, "margin-bottom");
    }

    static getWidthWithMargins(element) {
        return this.getLeftMarginWidth(element) 
                + this.getWidthWithBorders(element) 
                + this.getRightMarginWidth(element);
    }
    
    static getHeightWithMargins(element) {
        return this.getTopMarginHeight(element) 
                + this.getHeightWithBorders(element) 
                + this.getBottomMarginHeight(element);
    }

    // Misc. element properties

    static makeAbsolute(element) {
        element.style.position = "absolute";
        return element;
    }

    static setTitle(element, title) {
        element.setAttribute("title", title);
        return element;
    }

    static setZIndex(element, zIndex) {
        element.style.zIndex = zIndex;
        return element;
    }

    static setCursor(element, cursor) {
        element.style.cursor = cursor;
        return element;
    }

    static setBorderRadius(element, r) {
        element.style.borderRadius = r + "px";
        return element;
    }

    static setBackgroundColor(element, color) {
        element.style.background = color;
        return element;
    }

    static randomColor(opacity=0.5) {

        const r = (Math.round(Math.random()*255)).toString();
        const g = (Math.round(Math.random()*255)).toString();
        const b = (Math.round(Math.random()*255)).toString();

        const randomColor = `rgba(${r}, ${g}, ${b}, ${opacity})`; 
                    
        return randomColor;
    }

    static getMaxX(element) {

        const maxX = element.offsetLeft + element.offsetWidth;
        const parentWidth = element.parentNode.offsetWidth;
        
        return Math.max(maxX, parentWidth);
    }
    
    // Working with certain elements

    static getMetaContent(metaName) {

        let content = undefined

        let metas = document.getElementsByTagName("meta");
    
        for(let meta of metas) 
            if(meta.getAttribute("name") == metaName) {
                content = meta.getAttribute("content");
                break;
            }
                
        return content;
    }

    // Effects

    static tremble(element) {
        
        const trembler =  RNav_DOMUtils.tremblers.get(element);

        if(Math.abs(trembler.left - RNav_DOMUtils.getLeft(element)) < trembler.amplitude) {
            const left =  RNav_DOMUtils.getLeft(element) + (Math.random() - .5)*trembler.amplitude;
            RNav_DOMUtils.setLeft(element, left);
        } else 
            RNav_DOMUtils.setLeft(element, trembler.left);

        if(Math.abs(trembler.top - RNav_DOMUtils.getTop(element)) < trembler.amplitude) {
            const top = RNav_DOMUtils.getTop(element) + (Math.random() - .5)*trembler.amplitude;
            RNav_DOMUtils.setTop(element, top);
        } else 
            RNav_DOMUtils.setTop(element, trembler.top);

        if(trembler.timeout) {
            const now = (new Date()).getTime();
            if(now - trembler.start > trembler.timeout)
                RNav_DOMUtils.stopTremble(element);
        }
    }

    static startTremble(element, amplitude, period, timeout=undefined) {
        
        if(!RNav_DOMUtils.tremblers.get(element)) {
            
            const left =  RNav_DOMUtils.getLeft(element);
            const top = RNav_DOMUtils.getTop(element);

            const trembler = {
                "amplitude": amplitude,
                "left": left, 
                "top": top, 
                "timer": setInterval(() => {RNav_DOMUtils.tremble(element, amplitude)}, period),
                "start": new Date().getTime(),
                "timeout": timeout
            };
            
            RNav_DOMUtils.tremblers.set(element, trembler);
        }
    }

    static stopTremble(element) {
        const trembler = RNav_DOMUtils.tremblers.get(element);
        clearInterval(trembler.timer);
        RNav_DOMUtils.setLeft(element, trembler.left);
        RNav_DOMUtils.setTop(element, trembler.top);
        RNav_DOMUtils.tremblers.delete(element);
    }

    // Parsing HTML

    static parseDocument(htmlDocument, spotAttrName = 'data-rnav-spot') {
        const spots = {};
        const parser = new DOMParser();
        const domDoc = parser.parseFromString(htmlDocument, 'text/html');
        const rawSpots = [...domDoc.querySelectorAll(`[${spotAttrName}]`)];
        rawSpots.forEach(sp => spots[sp.getAttribute(spotAttrName)] = sp);
        return [domDoc, spots];
    }

    static hasParentElement(domElement) {
        if(!domElement || !domElement.parentNode) return false;
        return domElement.parentNode.nodeType === Node.ELEMENT_NODE;
    }

    static getBodyAncestor(domElement) {
        if(!domElement) return null;
        return domElement.closest('body');
    }

    static inMainDocument(domElement) {
        if(!domElement) return false;
        const body = RNav_DOMUtils.getBodyAncestor(domElement);
        if(!body) return false;
        return body.getAttribute('data-parsed-flag') !== 'yes';
    }

    static parseSnippet(htmlSnipet, spotAttrName = 'data-rnav-spot') {
        const domNodes = [];
        const [tmpDoc, spots] = RNav_DOMUtils.parseDocument(htmlSnipet, spotAttrName);
        const domBody = tmpDoc.getElementsByTagName('body')[0];
        domBody.setAttribute('data-parsed-flag', 'yes');
        [...domBody.children].forEach(domNode => domNodes.push(domNode));
        return [domNodes, spots];
    }

    // Events

    static getEventLocalVect(event, element) {
        
        const elementRect = element.getBoundingClientRect();

        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        const localX = event.clientX - elementRect.left + scrollX - window.pageXOffset;
        const localY = event.clientY - elementRect.top + scrollY - window.pageYOffset;

        return new RNav_Vect(localX, localY);
    }

    static eventsDeltaVect(currEvent, prevEvent) {

        const deltaX = Math.round(currEvent.screenX - prevEvent.screenX);
        const deltaY = Math.round(currEvent.screenY - prevEvent.screenY);

        return new RNav_Vect(deltaX, deltaY);
    }

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


class RNav_DOMEventLog {

    static timeout = 10000;
    static events = new Map();

    static addEvent(event) {
        RNav_DOMEventLog.events.set(event, RNav_Utils.getCurrTime());
    }

    static isLogged(event) {
        return !!RNav_DOMEventLog.events.get(event);
    }

    static getEventTimeStamp(event) {
        return RNav_DOMEventLog.events.get(event);
    }
    
    static getEventAge(event) {
        return RNav_Utils.getCurrTime() - RNav_DOMEventLog.getEventTimeStamp(event);
    }

    static removeEvent(event) {
        RNav_DOMEventLog.events.delete(event);
    }

    static getEventsTimeout() {
        return RNav_DOMEventLog.timeout;
    }

    static isObsolete(event) {
        return RNav_DOMEventLog.getEventAge(event) > RNav_DOMEventLog.getEventsTimeout();
    }

    static removeObsolete() {

        for(const event of RNav_DOMEventLog.events.keys()) 
            if(RNav_DOMEventLog.isObsolete(event))
                RNav_Tasker.activeEvents.delete(event);
    }

    static run() {
        RNav_DOMEventLog.timer = setInterval(
                () => RNav_DOMEventLog.removeObsolete(RNav_Utils.getCurrTime()),
                RNav_DOMEventLog.getEventsTimeout()
            )
    }

    static stop() {
        clearInterval(RNav_DOMEventLog.timer);
    }
}