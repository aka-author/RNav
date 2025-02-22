// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      page.js                                   (\(\
// Func:        Managing a page and the nested controls   (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_Page extends RNav_DOMControl {

    constructor(chief, id = undefined) {
        super(chief, id);
        this.setDOMView(RNav_DOMUtils.getPageRootElement()).bindDOMView();
    }

    // Public interface

    usePresetControls() {
        this.installControlsOntoPage();
        return this;
    }

    // Guts 

    findAllControlledElements() {
        return document.querySelectorAll(`[${this.getControlAttrName()}]`);
    }

    findMajorControlledElement(domElement) {

        if (!RNav_DOMUtils.hasParentElement(domElement)) return null;

        return domElement.parentNode.closest(
            `[${this.getControlAttrName()}]`
        );
    }

    createControlForElement(domElement) {

        let control = null;

        let domElementId = RNav_DOMUtils.getId(domElement);

        if (!domElementId) {
            domElementId = RNav_Utils.getShortId();
            RNav_DOMUtils.setId(domElement, domElementId);
        }

        const controlClassName = this.getControlClassName(domElement);

        if (RNav_Utils.classExists(controlClassName)) {
            control = eval(`new ${controlClassName}(null, {}, '${domElementId}')`);
            control.setProps(this.getControlOptions(domElement));
        }

        return control;
    }

    integrateIntoControlTree(control) {

        const domElement = control.provideDOMView();
        const domMajorElement = this.findMajorControlledElement(domElement);

        if (!!domMajorElement) {
            const majorElementId = RNav_DOMUtils.getId(domMajorElement)
            const chief = this.getGear(majorElementId);
            chief.addMinor(control);
        } else
            this.addMinor(control);

        return this;
    }

    installControlsOntoPage() {

        const controlledElements = this.findAllControlledElements();
        const controls = [];
        for (const domElement of controlledElements) {
            controls.push(this.createControlForElement(domElement));
        }

        for (const control of controls) {
            this.integrateIntoControlTree(control);
        }

        return this;
    }
}