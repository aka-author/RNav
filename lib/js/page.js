// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      page.js                                   (\(\
// Func:        Managing a page and the nested controls   (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_Page extends RNav_DOMControl {

    static controlAttrName = 'data-rnav-control';
    static optionsAttrName = 'data-rnav-options';

    constructor(chief, id = undefined) {
        super(chief, id);
        this.setDOMObject(RNav_DOMUtils.getPage());
    }

    getControlAttrName() {
        return RNav_Page.controlAttrName;
    }

    getOptionsAttrName() {
        return RNav_Page.optionsAttrName;
    }

    getControlClassName(domElement) {
        return domElement.getAttribute(this.getControlAttrName());
    }

    getControlOptions(domElement) {
        return RNav_Utils.parseStyle(domElement.getAttribute(this.getOptionsAttrName()));
    }

    isControlledElement(domElement) {
        return domElement.hasAttribute(this.getControlAttrName());
    }

    findAllControlledElements() {
        return document.querySelectorAll(`[${this.getControlAttrName()}]`);
    }

    findContainingControlledElement(domElement) {

        let containingControlledElement = null;

        let currDomNode = domElement;
        while(currDomNode.parentNode.nodeType !== Node.ELEMENT_NODE) {
            
            currDomNode = currDomNode.parentNode;
            
            if(this.isControlledElement(currDomNode)) {
                containingControlledElement = currDomNode;
                break;
            }
        }

        return containingControlledElement;
    }

    createControlForElement(domElement) {

        let control = null;

        let domControlId = RNav_DOMUtils.getId(domElement);

        if(!domControlId) 
            RNav_DOMUtils.setId(domElement, RNav_Utils.getShortId());            

        const arnavControlName = this.getArnavDOMElementControlName(domElement);

        if(ArnavUtils.classExists(arnavControlName)) {
            control = eval(`new ${arnavControlName}(null, "${domControlId}")`);
            control.setProps(this.getControlOptions(domElement));
        }

        return control;
    }

    integrateIntoControlTree(domControl) {
        const domElement = domControl.getDOMObject();
        const domUpper = this.findUpperControlledElement(domElement);
        const upperId = RNav_DOMUtils.getId(domUpper)
        const chief = this.getVertexById(upperId) || this;
        chief.addUnderVertex(domControl);
        return this;
    }

    installControlsOntoPage() {

        const controlledElements = this.findAllControlledElements();

        const domControls = [];
        for(const domElement of controlledElements) 
            domControls.push(
                this.createControlForElement(domElement)
                    .setDOMObject(domElement)
            );

        for(const domControl of domControls) 
            this.integrateIntoControlTree(domControl);

        return this;
    }
}