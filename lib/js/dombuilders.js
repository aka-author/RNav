// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      dombuilders.js                        (\(\
// Func:        Building DOM objects by templates     (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_DOMBuilder extends RNav_Generic {

    constructor(id) {
        super(id);
        this.declare('domElements', 'spots', 'spotAttrName', 'template');
    }

    assembleTemplate() {
        return `<div data-rnav-spot='spot'></div>`;
    }

    nest(spotName, domElement) {
        this.getSpots()[spotName].appendChild(domElement);
        return this;
    }

    fillInSpots(spotSubsts) {
        for(const spotName of this.getSpotNames())
            this.nest(spotName, spotSubsts[spotName]);
        return this;
    }

    buildAll(spotSubsts = {}) {
        
        const template = this.getTemplate();
        const [domElements, spots] = RNav_DOMUtils.parseSnippet(template);
        
        this.setProps({'domElements': domElements, 'spots': spots})
            .fillInSpots(spotSubsts);
        
        return domElements;
    }

    buildOne(spotSubsts = {}) {
        return this.buildAll(spotSubsts)[0];
    }

    getSpotNames() {
        return Object.keys(this.getSpots());
    }
}


class RNav_DOMDoubleBoxBuilder extends RNav_DOMBuilder {

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
         
        const tpl = 
            `<div 
                id="${this.getOuterId()}"
                class="${this.getCfgParam('outerCSSClassName')}">
                <div 
                    id="${this.getOuterId()}"
                    class="${this.getCfgParam('innerCSSClassName')}"
                    data-rnac-spot="content">
                </div>
            </div>`;

         return tpl;
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


const db = new RNav_DOMDoubleBoxBuilder()




domHW = db.setId('hwmsg').buildOne(
        {
            '#content': 'Hello Word!',
            'title@content': 'This is attr'

        }
    );

domAnimalImg = new RNav_ImgDOMBuilder();

const imgCow = domAnimalImg.buildOne({'id': 'cow', 'src': 'cow.jpg'});
        