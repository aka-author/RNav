// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      domcontrol.js                           (\(\
// Func:        Managing objects exinsing in a page     (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_DOMControl extends RNav_Controller {
    
    static controlAttrName = 'data-rnav-control';
    static optionsAttrName = 'data-rnav-options';
    static domTaskTypeNamePrefix = 'dom_';
    
    constructor(chief = null, id = undefined) {
        
        super(chief, id);

        this.setProps(
            {
                'DOMView': null,
                'defaultSpot': null
            }
        )
    }

    getControlAttrName() {
        return RNav_DOMControl.controlAttrName;
    }

    getOptionsAttrName() {
        return RNav_DOMControl.optionsAttrName;
    }

    getControlClassName(domElement) {
        return domElement.getAttribute(this.getControlAttrName());
    }

    getControlOptions(domElement) {
        return RNav_Utils.parseStyle(domElement.getAttribute(this.getOptionsAttrName()));
    }

    verifyDOMEvent(event) {
        
        if(RNav_DOMEventLog.isLogged(event)) 
            return false;
        
        RNav_DOMEventLog.addEvent(event);
        
        return true;
    }

    assembleDOMTaskTypeName(domEventType) {
        return `${RNav_DOMControl.domTaskTypeNamePrefix}${domEventType}`;
    }

    onDOMEvent(domEvent) {
        
        if(!this.verifyDOMEvent(domEvent))
            return;
            
        const taskTypeName = this.assembleDOMTaskTypeName(domEvent.type);
        const task = this.createTask(taskTypeName).setDOMEvent(domEvent);
        this.doTask(task);
    }

    installEventListners(DOMView) {

        const domEventNames = RNav_DOMUtils.getDOMEventNames();
            
        const me = this;

        for(const domEventName of domEventNames) 
            if(this.hasTaskHandler(this.assembleDOMTaskTypeName(domEventName))) 
                DOMView.addEventListener(
                    domEventName, e => me.onDOMEvent(e)
                );

        return this;
    }

    hasDOMView() {
        return !!this.getDOMView();
    }

    bindDOMView(DOMView) {

        this.setDOMView(DOMView)
            .installEventListners(DOMView);

        return this;
    }

    buildDOMView() {
        const vm = new RNav_BoxShellMaker();
        const domView = vm.setOrigin(this).make().getOne();
        return domView;
    }

    getDefaultSpot() {
        return this.defaultSpot || this.getDOMView();
    }

    hasPresetDOMView() {
        if(!this.hasDOMView()) return false;
        return this.getDOMView.getAttribute(this.get)
    }

    isNested() {

        const domView = this.getDOMView();
        if(!domView) return false;
        if(domView.getAttribute('data-rnav-control')) 
            return true;
            
        if(RNav_DOMUtils.isParsed(domView)) return false;
        return RNav_DOMUtils.hasParentElement(domView);
    }

    nestAlienDOMView(domControl) {
        
        if(!domControl.isNested()) {
            const spot = this.getDefaultSpot();
            const domView = domControl.getDOMView();
            spot.appendChild(domView);
        }

        return this; 
    }

    mountDOMView() {
        
        this.forEach(ctrl => ctrl.mountDOMView());
        
        if(!this.hasDOMView()) {
            const domView = this.buildDOMView();
            this.setDOMView(domView).bindDOMView(domView);
        } 

        for(const ctrl of this) 
            this.nestAlienDOMView(ctrl);
    
        return this;
    }

}