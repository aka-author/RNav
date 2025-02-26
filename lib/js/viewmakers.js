// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      viewmakers.js                         (\(\
// Func:        Building DOM objects by templates     (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_ViewMaker extends RNav_Gear {

    static spotAttrName = 'data-rnav-spot';

    constructor(id) {
        
        super(id);

        this.setProps(
            {
                'origin': null,
                'CSSClassNameBase': undefined,
                'elements': [], 
                'spots': {}, 
                'spotAttrName': RNav_ViewMaker.spotAttrName, 
                'template':  undefined
            }
        );
    }

    // Public interface

    hasOrigin() {
        return !!this.getOrigin();
    }

    setOrigin(objOrigin) {
        
        this.origin = objOrigin;

        if(!this.getCSSClassNameBase()) {
            this.setCSSClassNameBase(this.getOriginCSSClassNameBase(objOrigin));
        }

        return this;
    }

    nestAttr(element, spotName, nestee) {

        this.provideAllElements();
    
        const attrName = RNav_Utils.substringAfter(spotName, '@');
    
        element.setAttribute(attrName, nestee);
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
        this.provideAllElements();
        for(const spotName in spotSubsts) {

            let spotNameBase = this.getSpotNameBase(spotName);
        
            if(!!this.getSpots()[spotNameBase] || !spotNameBase) {
                Array.isArray(spotSubsts[spotName]) ?
                    this.nest(spotName, ...spotSubsts[spotName]) : 
                    this.nest(spotName, spotSubsts[spotName]);
            }
        }

        return this;
    }

    provideAllElements() {

        if(!this.hasElements()) {
            this.formElementsAndSpots();
        }

        return this.getElements();
    }

    provideOneElement() {
        return this.provideAllElements()[0];
    }

    // Overridable methods

    assembleTemplate() {
        return `<div data-rnav-spot='spot'></div>`;
    }

    // Guts

    bem(part, modifier = undefined) {
        
        const name = RNav_DOMUtils.assembleBEMName(
            this.getCSSClassNameBase(),
            part,
            modifier
        );

        return name;
    }

    getOriginCSSClassNameBase(objOrigin) {
        return objOrigin.getCSSClassNameBase();
    }

    spotAttr(spotName) {
        return `${this.getSpotAttrName()}="${spotName}"`;
    }

    idAttr(...idItems) {
        return `id="${idItems.join()}"`;
    }

    classAttr(...nameItems) {
        return `class="${nameItems.join()}"`;
    }

    bemAttr(part, modifier = undefined) {
        return this.classAttr(this.bem(part, modifier));
    }

    styleDisplayAttr(displayMode = 'unset') {
        return `style="display: ${displayMode}"`;
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

    provideAllSpots() {
        this.provideAllElements();
        return this.getSpots();
    }

    provideOneSpot(spotName = undefined) {

        const allSpots = this.provideAllSpots();

        if (RNav_Utils.hasProps(allSpots)) {
            return spotName ? allSpots[spotName] : RNav_Utils.getOneProp(allSpots);
        }

        throw this.createGearError(`${this.getId()} has no spot ${spotName}`);
    }    

    getSpotNames() {
        return Object.keys(this.provideAllSpots());
    }

    provideTemplate() {
        return this.getTemplate() || this.assembleTemplate();
    }

    formElementsAndSpots() {

        const template = this.provideTemplate();
        const [elements, spots] = RNav_DOMUtils.parseSnippet(template);
        
        this.setProps({'elements': elements, 'spots': spots})

        if (elements.length === 0) {
            const originId = this.getOrigin()?.getId() || this.getId();
            throw this.createGearError(`${originId}: no elements have been made.)`)
        }
        
        return this;
    }

    hasElements() {
        return this.elements.length > 0;
    }

    getSpotElement(spotName) {
        if(spotName.startsWith('@'))
            return this.provideAllElements()[0];    
        if(spotName.includes('@'))
            return  this.provideOneSpot(RNav_Utils.substringBefore(spotName, '@'));
        return this.provideAllSpots()[spotName];
    }

    static markNested(node) {
        
        if (RNav_DOMUtils.isDOMElement(node)) {
            node.nestedFlag = true;
        }

        return node;
    }

    static hasBeenNested(node) {

        if(RNav_DOMUtils.isDOMElement(node)) {
            return node.nestedFlag;
        }

        return false;
    }

    nestNodes(element, nestees) {
        
        element.append(
            ...Array.from(
                nestees.filter(n => !!n), 
                n => RNav_ViewMaker.markNested(
                        RNav_DOMUtils.isDOMNode(n) ? n : document.createTextNode(n)      
                    )
            )
        )
    
        return this;
    }

    nest(spotName, ...nestees) {
        
        const spotElement = this.getSpotElement(spotName);
        
        if(this.isAttrSpot(spotName))
            return this.nestAttr(spotElement, spotName, nestees[0]);

        return this.nestNodes(spotElement, nestees);
    }    
}

class RNav_ImgViewMaker extends RNav_ViewMaker {

    assembleTemplate() {
        return `<img id="${this.getId()}" class="${this.bem()}">`;
    }
}

class RNav_BoxShellViewMaker extends RNav_ViewMaker {

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

    assembleTemplate() {

        const outer = this.getOuterElementName();
        const inner = this.getInnerElementName();
         
        const template = 
            `<${outer} 
                ${this.idAttr(this.getOuterId())}
                ${this.bemAttr('outer')}>
                <${inner}
                    ${this.idAttr(this.getInnerId())}
                    ${this.bemAttr('inner')}
                    ${this.spotAttr('content')}>
                </${inner}>
            </${outer}>`;

         return template;
    }
}

class RNav_TableShellViewMaker extends RNav_ViewMaker {

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

    formElementsAndSpots(spotSubsts = {}) {
        super.formElementsAndSpots(spotSubsts);
        this.setSpotMatrix(this.assembleSpotMatrix(this.provideAllSpots()));
        return this;
    }

} 

class RNav_MultiIconViewMaker extends RNav_ViewMaker {

    constructor(id = undefined) {
        super(id);
        this.setProps(
            {
                'outerElementName': 'div',
                'outerId': `${this.getId()}Outer`,
                'innerElementName': 'div',
                'innerId': `${this.getId()}Inner`,
                'iconNames': ['enabled', 'disabled'],
                'visibleIconName': 'enabled'
            }
        );
    }

    setOrigin(origin) {
        super.setOrigin(origin);
        this.setOuterId(`${origin.getId()}_outer`);
        this.setInnerId(`${origin.getId()}_inner`);
        return this;
    }

    countIconSpots() {
        return this.getIconSpots().length;
    }

    setIconSpots(...spotNames) {
        return this.setProp('iconSpots', spotNames);
    }
 
    assembleIconId(iconName) {
        return `${this.hasOrigin() ? this.origin.getId() : this.getId()}_${iconName}`;
    }

    assembleTemplate() {

        const iconNames = this.getIconNames();
        const initN = this.getVisibleIconName();

        let icons = '';
        for (let i = 0; i < iconNames.length; i++) {
            let currN = iconNames[i];
            icons += 
                `<img 
                    ${this.idAttr(this.assembleIconId(currN))}
                    ${this.bemAttr('icon', currN)}
                    ${this.styleDisplayAttr(currN === initN ? 'unset' : 'none')}
                    ${this.spotAttr(currN)}>`;
        }

        const outer = this.getOuterElementName();
        const inner = this.getInnerElementName();

        const template = 
            `<${outer} 
                ${this.idAttr(this.getOuterId())}
                ${this.bemAttr('outer')}>
                <${inner} 
                    ${this.idAttr(this.getInnerId())}
                    ${this.bemAttr('inner')}
                    ${this.spotAttr('icons')}>
                    ${icons}
                </${inner}>
            </${outer}>`;

        return template;
    }
}

class RNav_RackViewMaker extends RNav_ViewMaker {

    constructor(propsRec, id = undefined) {

        super(propsRec, id);

        this.setProps(
            {
                'outerElementName': 'div',
                'innerElementName': 'div',
            }
        );
    }

    assembleBlockId(erName = undefined, shelfName = undefined, ) {
        const shelf = !!shelfName ? RNav_Utils.capitalizeFirst(shelfName) : '';
        const er = !!erName ? RNav_Utils.capitalizeFirst(erName) : '';
        return `${this.getOrigin().getId()}${shelf}${er}`;
    }

    assembleTemplate() {

        const outer = this.getOuterElementName();
        const inner = this.getInnerElementName();

        let shelves = '';
        for (const shelfName of this.getShelfNames()) {
            shelves += 
                `<${outer} 
                ${this.idAttr(this.assembleBlockId('Outer', shelfName))}
                class="${this.bem(shelfName + '_outer')}">
                <${inner} 
                    id="${this.idAttr(this.assembleBlockId('Inner', shelfName))}"
                    class="${this.bem(shelfName + '_inner')}"
                    ${this.spotAttr(shelfName)}>
                </${inner}>
            </${outer}>`
        }
         
        const template = 
            `<${outer} 
                ${this.idAttr(this.assembleBlockId('Outer'))}
                ${this.bemAttr('outer')}>
                <${inner} 
                    ${this.idAttr(this.assembleBlockId('Inner'))}
                    ${this.bemAttr('inner')}>
                        ${shelves}
                </${inner}>
            </${outer}>`;

         return template;
    }

}

class RNav_FlipperViewMaker extends RNav_ViewMaker {

    constructor(propsRec, id = undefined) {

        const localPropsRec = {
                'outerElementName': 'div',
                'headerElementName': 'div',
                'buttonElementName': 'div',
                'buttonSpotName': 'button',
                'titleElementName': 'div',
                'titleSpotName': 'title',
                'contentElementName': 'div',
                'contentSpotName': 'content',
                'contentDisplay': 'unset'
            }

        super(RNav_Utils.mergeProps(localPropsRec, propsRec), id);
    }

    assembleBlockId(erName = undefined, shelfName = undefined, ) {
        const shelf = !!shelfName ? RNav_Utils.capitalizeFirst(shelfName) : '';
        const er = !!erName ? RNav_Utils.capitalizeFirst(erName) : '';
        return `${this.getOrigin().getId()}${shelf}${er}`;
    }

    assembleContentBlockId() {
        return this.assembleBlockId('Content');
    }

    assembleTemplate() {

        const outerElementName = this.getOuterElementName();
        const headerElementName = this.getHeaderElementName();
        const buttonElementName = this.getButtonElementName();
        const titleElementName = this.getTitleElementName();
        const contentElementName = this.getContentElementName();
         
        const template = 
            `<${outerElementName} 
                ${this.idAttr(this.assembleBlockId('Outer'))}
                ${this.bemAttr('outer')}>
                
                <${headerElementName} 
                    ${this.idAttr(this.assembleBlockId('Header'))}
                    ${this.bemAttr('header')}>

                        <${buttonElementName} 
                            ${this.idAttr(this.assembleBlockId('Button'))}
                            ${this.bemAttr('button')}
                            ${this.spotAttr(this.getButtonSpotName())}>
                        </${buttonElementName}>

                        <${titleElementName} 
                            ${this.idAttr(this.assembleBlockId('Title'))}
                            ${this.bemAttr('title')}
                            ${this.spotAttr(this.getTitleSpotName())}>
                        </${titleElementName}>

                </${headerElementName}>

                <${contentElementName} 
                    ${this.idAttr(this.assembleContentBlockId())}
                    ${this.bemAttr('content')}
                    ${this.spotAttr(this.getContentSpotName())}
                    ${this.styleDisplayAttr(this.getContentDisplay())}>
                </${contentElementName}>

            </${outerElementName}>`;

         return template;
    }

}