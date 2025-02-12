// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      dombuilders.js                        (\(\
// Func:        Building DOM objects by templates     (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_DOMBuilder extends RNav_Generic {

    constructor(id) {
        
        super(id);

        this.setProps(
            {
                'domElements': [], 
                'spots': {}, 
                'spotAttrName': 'data-rnav-spot', 
                'template':  undefined
            }
        );
    }

    assembleTemplate() {
        return `<div data-rnav-spot='spot'></div>`;
    }

    detectSpotType(spotName) {
        if(spotName.includes('@'))
            return 'attr';
        if(spotName.includes('#'))
            return 'text'
        return 'node'; 
    }

    getSpotName(spotName) {
        if(spotName.endsWith('@') || spotName.endsWith('#'))
            return undefined;
        if(spotName.includes('@'))
            return  RNav_Utils.substringAfter(spotName, '@');
        if(spotName.includes('#'))
            return  RNav_Utils.substringAfter(spotName, '#');
        return spotName;
    }

    getSpotElement(spotName) {
        if(spotName.endsWith('@') || spotName.endsWith('#'))
            return this.getDomElements()[0];
        if(spotName.includes('@'))
            return  this.getSpots(RNav_Utils.substringAfter(spotName, '@'));
        if(spotName.includes('#'))
            return  this.getSpots(RNav_Utils.substringAfter(spotName, '#'));
        return this.getSpots()[spotName];
    }

    nest(spotName, nestee) {
    
        const spotElement = this.getSpotElement(this.getSpotName(spotName));
    
        switch(this.detectSpotType(spotName)) {
            case 'attr': 
                const attrName = RNav_Utils.substringBefore(spotName, '@');
                spotElement.setAttribute(attrName, nestee);
                break;
            case 'text':
                const textNode = document.createTextNode(nestee);
                spotElement.appendChild(textNode);
                break;
            default:
                spotElement.appendChild(nestee);
        }

        return this;
    }

    getSpotNames() {
        return Object.keys(this.getSpots());
    }

    fillInSpots(spotSubsts) {
        
        for(const spotName in spotSubsts) {
            let actualSpotName = this.getSpotName(spotName);
            if(!!this.getSpots()[actualSpotName]) 
                this.nest(spotName, spotSubsts[spotName]);
        }

        return this;
    }

    getActualTemplate() {
        return this.getTemplate() || this.buildTemplate();
    }

    buildAll(spotSubsts = {}) {
        
        const template = this.getActualTemplate();

        const [domElements, spots] = RNav_DOMUtils.parseSnippet(template);
        
        this.setProps({'domElements': domElements, 'spots': spots})
            .fillInSpots(spotSubsts);
        
        return domElements;
    }

    buildOne(spotSubsts = {}) {
        return this.buildAll(spotSubsts)[0];
    }
}


class RNav_WrapperDOMBuilder extends RNav_DOMBuilder {

    constructor(id = undefined) {

        super(id);
        
        this.setProps(
            {
                'outerElementName': 'div',
                'outerId': `${this.getId()}Outer`,
                'outerCSSClassName': this.getCfgParam('outerCSSClassName'),
                'innerElementName': 'div', 
                'innerId': `${this.getId()}Inner`,
                'innerCSSClassName': this.getCfgParam('innerCSSClassName')
            }
        )

        this.setTemplate(this.assembleTemplate());
    }

    assembleTemplate() {

        const outer = this.getOuterElementName();
        const inner = this.getInnerElementName();
         
        const template = 
            `<${outer} 
                id="${this.getOuterId()}"
                class="${this.getCfgParam('outerCSSClassName')}">
                <${inner} 
                    id="${this.getInnerId()}"
                    class="${this.getCfgParam('innerCSSClassName')}"
                    ${this.getSpotAttrName()}="content">
                </${inner}>
            </${outer}>`;

         return template;
    }
}


class RNav_ImgDOMBuilder extends RNav_DOMBuilder {

    constructor(id = undefined) {

        super(id);
        
        this.define(
            {
                'outerElementName': 'div',
                'outerId': `${this.getId()}Outer`,
                'outerCSSClassName': this.getCfgParam('outerCSSClassName'),
                'innerElementName': 'div', 
                'innerId': `${this.getId()}Inner`,
                'innerCSSClassName': this.getCfgParam('innerCSSClassName')
            }
        )

        this.setTemplate(this.assembleTemplate());
    }

    assembleTemplate() {
        return `<img>`;
    }
}