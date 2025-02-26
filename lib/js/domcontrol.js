// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      domcontrol.js                           (\(\
// Func:        Managing objects exinsing in a page     (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_DOMControl extends RNav_Controller {

    constructor(major = null, propsRec = {}, id = undefined) {

        const defaultPropsRec = {
            'CSSClassNameBase': undefined,
            'DOMView': null,
            'defaultSpot': null
        }

        super(major, RNav_Utils.mergeProps(defaultPropsRec, propsRec), id);

        if (!this.getCSSClassNameBase()) {
            this.setCSSClassNameBase(RNav_Utils.deprefix(this.getClassName()));
        }

    }

    // Public interface

    provideDOMView() {

        if (this.hasDOMView()) {
            return this.getDOMView();
        }

        if (this.hasPresetElement()) {
            this.setDOMView(this.getPresetElement());
            return this.getDOMView();
        }

        this.setDOMView(this.makeDOMView());
        if (this.hasDOMView()) {
            return this.getDOMView();
        }

        throw this.createGearError(`Failed to make a DOMView.`);
    }
    
    // Overridable methods

    makeDOMView() {
        return null;
    }

    // Guts

    getControlAttrName() {
        return RNav_Setup.controlAttrName;
    }

    getOptionsAttrName() {
        return RNav_Setup.optionsAttrName;
    }

    getDOMTaskTypeNamePrefix() {
        return RNav_Setup.domTaskTypeNamePrefix;
    }

    getControlClassName(domElement) {
        return domElement.getAttribute(this.getControlAttrName());
    }

    getControlOptions(domElement) {
        return RNav_Utils.parseStyle(domElement.getAttribute(this.getOptionsAttrName()));
    }

    
    verifyDOMEvent(event) {

        if (RNav_DOMEventLog.isLogged(event)) return false;

        RNav_DOMEventLog.addEvent(event);

        return true;
    }

    assembleDOMTaskTypeName(domEventType) {
        return `${this.getDOMTaskTypeNamePrefix()}${domEventType}`;
    }

    hasDOMView() {
        return !!this.DOMView;
    }

    installEventListners(domView) {

        if (!domView) return this;

        const domEventNames = RNav_DOMUtils.getDOMEventNames();

        for (const domEventName of domEventNames) {
            if (this.hasTaskHandler(this.assembleDOMTaskTypeName(domEventName))) {
                domView.addEventListener(
                    domEventName, e => this.onDOMEvent(e)
                );
            }
        }

        return this;
    }

    isControlledElement(domElement) {
        return domElement.hasAttribute(this.getControlAttrName());
    }

    hasPresetElement() {

        const domElement = document.getElementById(this.getId());

        if (!!domElement) {
            return this.isControlledElement(domElement);
        }

        return false;
    }

    getPresetElement() {
        return document.getElementById(this.getId());
    }

    bindDOMView() {
        return this.installEventListners(this.provideDOMView());
    }

    getDefaultSpot() {
        return this.defaultSpot || this.provideDOMView();
    }

    isNested() {

        if (RNav_ViewMaker.hasBeenNested(this.provideDOMView())) return true;

        return RNav_DOMUtils.inMainDocument(this.provideDOMView());
    }

    nestAlienDOMView(domControl) {

        if (domControl.isNested()) return this;

        const spot = this.getDefaultSpot();
        const domView = domControl.provideDOMView();
        
        if (RNav_DOMUtils.isDOMElement(spot) && RNav_DOMUtils.isDOMNode(domView)) {
            spot.appendChild(domView);
        } else {
            throw this.createGearError(`domView is ${domView}, spot is ${spot}.`);
        }

        return this;
    }

    mountDOMView() {

        this.forEach(ctrl => ctrl.mountDOMView());

        if (this.hasPresetElement()) {
            const domView = this.makeDOMView();
            if (domView) {
                RNav_DOMUtils.mergeOrAppend(this.getPresetElement(), domView);
            }
        }
        
        this.bindDOMView(this.provideDOMView());

        for (const ctrl of this) {
            this.nestAlienDOMView(ctrl);
        }

        return this;
    }

    onDOMEvent(domEvent) {

        if (!this.verifyDOMEvent(domEvent)) return;

        const taskTypeName = this.assembleDOMTaskTypeName(domEvent.type);
        const task = this.createTask(taskTypeName).setDOMEvent(domEvent);
        this.doTask(task);
    }
}