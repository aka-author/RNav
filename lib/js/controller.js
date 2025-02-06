// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      controller.js                              (\(\
// Func:        Providing the base for all controllers     (^.^)  
// * * ** *** ***** ******** ************* *********************

class RNav_Controller extends RNav_Tasker {

    static arnavControlAttrName = "data-arnav-control";
    static arnavChiefIdAttrName = "data-arnav-chief";
    static arnavOptionsAttrName = "data-arnav-options"

    // Accessing Arnav properties and building hierarchy

    getArnavControlAttrName() {
        return ArnavDOMControl.arnavControlAttrName;
    }

    getArnavChiefIdAttrName() {
        return ArnavDOMControl.arnavChiefIdAttrName;
    }

    getArnavOptionsAttrName() {
        return ArnavDOMControl.arnavOptionsAttrName;
    }

    isArnavDOMElement(domElement) {
        return domElement.hasAttribute(this.getArnavControlAttrName());
    }

    detectArnavAncestorId(domElement) {

        let arnavDomAncestorId = undefined;

        let currDomNode = domElement;
        let arnavDomAncestor = null;
        
        while(currDomNode.parentNode.nodeType === Node.ELEMENT_NODE && !arnavDomAncestor) {
            
            currDomNode = currDomNode.parentNode;
            
            if(this.isArnavDOMElement(currDomNode)) {
                arnavDomAncestor = currDomNode;
                arnavDomAncestorId = arnavDomAncestor.getAttribute("id");
            }
        }

        return arnavDomAncestorId;
    }

    getArnavDOMElementControlName(domElement) {
        return domElement.getAttribute(this.getArnavControlAttrName());
    }

    getArnavDOMElementChiefId(domElement) {
        return domElement.getAttribute(this.getArnavChiefIdAttrName());
    }

    getArnavDOMElementOptions(domElement) {
        return ArnavUtils.parseStyle(domElement.getAttribute(this.getArnavOptionsAttrName()));
    }

    getArnavDOMElementOption(domElement, optionName) {

        let optionValue = undefined;

        const options = this.getArnavDOMElementOptions(domElement);

        switch(optionName) {
            default:
                optionValue = options[optionName]; 
        }

        return optionValue;
    }
}
