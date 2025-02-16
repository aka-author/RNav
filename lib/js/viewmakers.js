// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      viewmakers.js                         (\(\
// Func:        Building DOM objects by templates     (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_ViewMaker extends RNav_Generic {

    static nestedRegistry = new WeakMap();

    constructor(id) {
        
        super(id);

        this.setProps(
            {
                'origin': null,
                'CSSClassNameBase': undefined,
                'DOMElements': [], 
                'spots': {}, 
                'defaultSpot': null,
                'spotAttrName': 'data-rnav-spot', 
                'template':  undefined
            }
        );
    }

    getOriginCSSClassNameBase(objOrigin) {
        return RNav_Utils.dernav(objOrigin.getClassName());
    }

    setOrigin(objOrigin) {
        
        this.origin = objOrigin;

        if(!this.getCSSClassNameBase())
            this.setCSSClassNameBase(this.getOriginCSSClassNameBase(objOrigin));
        
        return this;
    }

    bem(part, modifier = undefined) {
        
        const name = RNav_DOMUtils.assembleBEMName(
            this.getCSSClassNameBase(),
            part,
            modifier
        );

        return name;
    }

    assembleTemplate() {
        return `<div data-rnav-spot='spot'></div>`;
    }

    isAttrSpot(spotName) {
        return spotName.includes('@'); 
    }

    getSpotNameBase(spotName) {
        if(spotName.startsWith('@'))
            return undefined;
        if(spotName.includes('@'))
            return  RNav_Utils.substringBefore(spotName, '@');
        return spotName;
    }

    getSpotNames() {
        return Object.keys(this.getSpots());
    }

    getActualTemplate() {
        return this.getTemplate() || this.assembleTemplate();
    }

    make() {
        const template = this.getActualTemplate();
        const [domElements, spots] = RNav_DOMUtils.parseSnippet(template);
        this.setProps({'DOMElements': domElements, 'spots': spots})
            .setDefaultSpot();
        return this;
    }

    hasDOMElements() {
        return this.DOMElements.length > 0;
    }

    assureDOMElements() {
        return this.hasDOMElements() ? this : this.make();
    }

    getDOMElements() {
        return this.assureDOMElements().DOMElements;
    }

    getSpots() {
        return this.assureDOMElements().spots;
    }

    getSpot(spotName) {
        return getSpots()[spotName];
    }

    getSpotElement(spotName) {
        if(spotName.startsWith('@'))
            return this.getDOMElements()[0];
        if(spotName.includes('@'))
            return  this.getSpots(RNav_Utils.substringBefore(spotName, '@'));
        return this.getSpots()[spotName];
    }

    nestAttr(domElement, spotName, nestee) {
        const attrName = RNav_Utils.substringAfter(spotName, '@');
        domElement.setAttribute(attrName, nestee);
    }

    static markNested(node) {
        RNav_ViewMaker.nestedRegistry[node] = true;
    }

    static hasBeenNested(node) {
        return RNav_ViewMaker.nestedRegistry[node];
    }

    nestNodes(domElement, nestees) {
        
        for(const nestee of nestees) {
            let actualNestee = typeof nestee === 'string' ? 
                    document.createTextNode(nestee) : nestee
            RNav_ViewMaker.markNested(actualNestee);
            domElement.appendChild(actualNestee);
        }

        return this;
    }

    nest(spotName, ...nestees) {
        
        const spotElement = this.getSpotElement(spotName);
        
        if(this.isAttrSpot(spotName))
            return this.nestAttr(spotElement, spotName, nestees[0]);

        return this.nestNodes(spotElement, nestees);
    }

    getSpotNames() {
        return Object.keys(this.getSpots());
    }

    getSpot(spotName) {
        return this.getSpots()[spotName];
    }

    nestArgs(...nestees) {

        let i = 0;
        for(const spotName of this.getSpotNames()) {
            this.nest(spotName, nestees[i]);
            if(++i == nestees.length) break;
        }
        return this;
    }

    nestProps(spotSubsts) {
        
        for(const spotName in spotSubsts) {
            let spotNameBase = this.getSpotNameBase(spotName);
            if(!!this.getSpots()[spotNameBase] || !spotNameBase) 
                Array.isArray(spotSubsts[spotName]) ?
                    this.nest(spotName, ...spotSubsts[spotName]) : 
                    this.nest(spotName, spotSubsts[spotName]);
        }

        return this;
    }


    getAll() {
        return this.getDOMElements();
    }

    getOne() {
        return this.getAll()[0];
    }
}

class RNav_ImgMaker extends RNav_ViewMaker {

    assembleTemplate() {
        return `<img id="${this.getId()}" class="${this.bem()}">`;
    }
}

class RNav_BoxShellMaker extends RNav_ViewMaker {

    constructor(id = undefined) {

        super(id);
        
        this.setProps(
            {
                'outerElementName': 'div',
                'outerId': `${this.getId()}Outer`,
                'innerElementName': 'div', 
                'innerId': `${this.getId()}Inner`,
            }
        )
    }

    arrangeDefaultSpot() {
        this.setDefaultSpot(this.getSpot('content'));
    }

    assembleTemplate() {

        const outer = this.getOuterElementName();
        const inner = this.getInnerElementName();
         
        const template = 
            `<${outer} 
                id="${this.getOuterId()}"
                class="${this.bem('outer')}">
                <${inner} 
                    id="${this.getInnerId()}"
                    class="${this.bem('inner')}"
                    ${this.getSpotAttrName()}="content">
                </${inner}>
            </${outer}>`;

         return template;
    }
}

class RNav_TableShellMaker extends RNav_ViewMaker {

    constructor(id = undefined) {
        super(id);
        this.setProps(
            {
                'rows': 1,
                'cols': 1,
                'spotMatrix': null
            }
        ) 
    }

    getTdBase(row, col) {
        return `${row}_${col}`;
    } 

    getTdId(row, col) {
        return `${this.getId()}_${this.getTdBase(row, col)}`;
    }

    getTdTemplate(row, col) {
        return `<td id="${this.getTdId(row, col)}" 
                ${this.getSpotAttrName()}="${this.getTdBase(row, col)}"></td>`

    }

    assembleTemplate() {

        let tableBody = '';
        for(let r = 0; r < this.getRows(); r++) {
            let row = '';
            for(let c = 0; c < this.getCols(); c++)
                row += this.getTdTemplate(r, c);
                    
            tableBody += `<tr>${row}</tr>`;
        }

        return `<table id="${this.getId()}"
                class="${this.bem('outer')}">${tableBody}</table>`;
    }

    assembleSpotMatrix(spots) {

        const spotMatrix = RNav_Utils.getMatrix(this.getRows(), this.getCols());
    
        for(let spotName of Object.keys(spots)) {
            let row = parseInt(RNav_Utils.substringBefore(spotName, '_'));
            let col = parseInt(RNav_Utils.substringAfter(spotName, '_'));
            spotMatrix[row][col] = spots[spotName];
        }
        
        return spotMatrix;
    }

    make(spotSubsts = {}) {
        super.make(spotSubsts);
        this.setSpotMatrix(this.assembleSpotMatrix(this.getSpots()));
        return this;
    }

} 