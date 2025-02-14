// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      page.js                                   (\(\
// Func:        Managing a page and the nested controls   (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_Page extends RNav_DOMControl {

    
    constructor(chief, id = undefined) {
        super(chief, id);
        this.bindDOMView(RNav_DOMUtils.getPageRootElement());
    }

    isControlledElement(domElement) {
        return domElement.hasAttribute(this.getControlAttrName());
    }

    findAllControlledElements() {
        return document.querySelectorAll(`[${this.getControlAttrName()}]`);
    }

    findUpperControlledElement(domElement) {

        let upperControlledElement = null;

        let currDomNode = domElement;
        while(currDomNode.parentNode.nodeType === Node.ELEMENT_NODE) {
            
            currDomNode = currDomNode.parentNode;
            
            if(this.isControlledElement(currDomNode)) {
                upperControlledElement = currDomNode;
                break;
            }
        }

        return upperControlledElement;
    }

    createControlForElement(domElement) {

        let control = null;

        let domElementId = RNav_DOMUtils.getId(domElement);
    
        if(!domElementId) {
            domElementId = RNav_Utils.getShortId();
            RNav_DOMUtils.setId(domElement, domElementId);            
        }

        const controlClassName = this.getControlClassName(domElement);

        if(RNav_Utils.classExists(controlClassName)) {
            control = eval(`new ${controlClassName}(null, '${domElementId}')`);
            control.setProps(this.getControlOptions(domElement));
        }

        return control;
    }

    integrateIntoControlTree(control) {
        
        const domElement = control.getDOMView();
        const domUpperElement = this.findUpperControlledElement(domElement);

        if(!!domUpperElement) {
            const upperElementId = RNav_DOMUtils.getId(domUpperElement)
            const chief = this.getVertexById(upperElementId);  
            chief.addUnder(control);     
        } else
            this.addUnder(control);

        return this;
    }

    installControlsOntoPage() {

        const controlledElements = this.findAllControlledElements();
        const controls = [];
        for(const domElement of controlledElements) 
            controls.push(
                this.createControlForElement(domElement)
                    .bindDOMView(domElement)
            );

        for(const control of controls) 
            this.integrateIntoControlTree(control);

        return this;
    }

    usePresetControls() {
        this.installControlsOntoPage();
        return this;
    }
}