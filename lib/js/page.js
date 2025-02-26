// * * ** *** ***** ******** ************* *********************
// Product:     Kit for Web-based Interactive Stand-alone Help
// Part:        Front-End JS library
// Module:      page.js                                   (\(\
// Func:        Managing a page and the nested controls   (^.^)  
// * * ** *** ***** ******** ************* *********************


class kwish_Page extends kwish_DOMControl {

    constructor(chief, id = undefined) {
        super(chief, id);
        this.setDOMView(kwish_DOMUtils.getPageRootElement()).bindDOMView();
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

        if (!kwish_DOMUtils.hasParentElement(domElement)) return null;

        return domElement.parentNode.closest(
            `[${this.getControlAttrName()}]`
        );
    }

    createControlForElement(domElement) {
        
        let control = null;

        let domElementId = kwish_DOMUtils.getId(domElement);

        if (!domElementId) {
            domElementId = kwish_Utils.getShortId();
            kwish_DOMUtils.setId(domElement, domElementId);
        }

        const controlClassName = this.getControlClassName(domElement);

        if (kwish_Utils.classExists(controlClassName)) {
            var kwish_STATIC_OPTIONS = this.getControlOptions(domElement);
            control = eval(`new ${controlClassName}(null, kwish_STATIC_OPTIONS, '${domElementId}')`);
            //control.setProps(this.getControlOptions(domElement));
        }

        return control;
    }

    integrateIntoControlTree(control) {

        const domElement = control.provideDOMView();
        const domMajorElement = this.findMajorControlledElement(domElement);

        if (!!domMajorElement) {
            const majorElementId = kwish_DOMUtils.getId(domMajorElement)
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