// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      domcontrol.js                           (\(\
// Func:        Managing objects exinsing in a page     (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_DOMControl extends RNav_Controller {
    
    static domTaskTypeNamePrefix = 'dom_';

    constructor(chief = null, id = undefined) {
        
        super(chief, id);

        this.setProps(
            {
                'DOMView': null
            }
        )
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


    /*

    appendChildDOMControl(domControl) {

        const childDomObject = domControl.assembleDOMObject();

        domControl.setDOMObject(childDomObject).bind();

        this.getDOMObject().appendChild(childDomObject);

        return this;
    }

    completeDOMObject() {

        const domObject = this.getDOMObject();

        if(!RNav_DOMUtils.hasChildNodes(domObject)) {

            const domContent = this.assembleDOMObject();

            for(let i = 0; i < domContent.childNodes.length; i++) 
                domObject.appendChild(domContent.childNodes[i]);
        }
        
        this.domObject = domObject;

        return this;
    }

    

    bind() {

        const domObject = this.getDOMObject();
        
        if(!!domObject) 
            this.installEventListners(domObject).completeDOMObject();
            
        return this;
    }


    setDOMViewName(DOMViewName) {
        this.DOMViewName = DOMViewName;
        return this;
    }

    getDOMViewName() {
        return this.DOMViewName;
    }

    getDOMObjectId() {
        return this.getId();
    }

    setCssClassName(cssClassName) {
        this.cssClassName = cssClassName;
        return this;
    }

    getCssClassName() {
        return this.cssClassName;
    }

    setHeaderDOMViewName(DOMViewName) {
        this.headerDOMViewName = DOMViewName;
        return this;
    }

    getHeaderDOMViewName() {
        return this.headerDOMViewName;
    }

    getHeaderDOMObjectId() {
        return this.getDOMObjectId() + "Header";
    }

    setHeaderCssClassName(cssClassName) {
        this.headerCssClassName = cssClassName;
        return this;
    }

    getHeaderCssClassName() {
        return this.headerCssClassName;
    }

    setBodyDOMViewName(DOMViewName) {
        this.bodyDOMViewName = DOMViewName;
        return this;
    }

    getBodyDOMViewName() {
        return this.bodyDOMViewName;
    }

    getBodyDOMObjectId() {
        return this.getDOMObjectId() + "Body";
    }

    setBodyCssClassName(cssClassName) {
        this.bodyCssClassName = cssClassName;
        return this;
    }

    getBodyCssClassName() {
        return this.bodyCssClassName;
    }

    setOffspringDOMViewName(DOMViewName) {
        this.offspringDOMViewName = DOMViewName;
        return this;
    }

    getOffspringDOMViewName() {
        return this.offspringDOMViewName;
    }

    getOffspringDOMObjectId() {
        return this.getDOMObjectId() + "Offspring";
    }

    setOffspringCssClassName(cssClassName) {
        this.offspringCssClassName = cssClassName;
        return this;
    }

    getOffspringCssClassName() {
        return this.offspringCssClassName;
    }

    setInitialDisplay(display="") {
        this.initialDisplay = display;
        return this; 
    }

    getInitialDisplay() {
        return this.initialDisplay;
    }

    assembleEmptyDOMObject() {
        const domObject = document.createElement(this.getDOMViewName());
        domObject.setAttribute("id", this.getDOMObjectId());
        domObject.className = this.getCssClassName();
        domObject.setAttribute("style", "display:" + this.getInitialDisplay());
        return domObject;
    }
    
    assembleHeaderInnerDOMObjects() {
        return [];
    }

    assembleHeaderDOMObject() {

        const innerDomObjects = this.assembleHeaderInnerDOMObjects();

        if(innerDomObjects.length == 0) return null;

        const headerDomObject = document.createElement(this.getHeaderDOMViewName());
        headerDomObject.setAttribute("id", this.getHeaderDOMObjectId());
        headerDomObject.className = this.getHeaderCssClassName();

        for(const innerDomObject of innerDomObjects)
            headerDomObject.appendChild(innerDomObject);

        return headerDomObject;
    }

    assembleBodyInnerDOMObjects() {
        return [];
    }

    assembleBodyDOMObject() {

        const innerDomObjects = this.assembleBodyInnerDOMObjects();

        if(innerDomObjects.length == 0) return null;

        const bodyDomObject = document.createElement(this.getBodyDOMViewName());
        bodyDomObject.setAttribute("id", this.getBodyDOMObjectId());
        bodyDomObject.className = this.getBodyCssClassName();

        for(const innerDomObject of innerDomObjects)
            bodyDomObject.appendChild(innerDomObject);

        return bodyDomObject;
    }

    assembleOffspringInnirDOMObjects() {

        const offspringDomObjects = [];

        for(const tasker of this) 
            offspringDomObjects.push(tasker.assembleDOMObject());
        
        return offspringDomObjects;
    }

    assembleOffspringDOMObject() {

        const innerDomObjects = this.assembleOffspringInnirDOMObjects();

        if(innerDomObjects.length == 0) return null;

        const offspringDomObject = document.createElement(this.getOffspringDOMViewName());
        offspringDomObject.setAttribute("id", this.getOffspringDOMObjectId());
        offspringDomObject.className = this.getOffspringCssClassName();

        for(const innerDomObject of innerDomObjects)
            offspringDomObject.appendChild(innerDomObject);

        return offspringDomObject;
    }

    assembleDOMObject() {

        const domObject = this.assembleEmptyDOMObject();
        
        if(!domObject) return null;

        for(const partDomObject of 
            [this.assembleHeaderDOMObject(), this.assembleBodyDOMObject(), this.assembleOffspringDOMObject()])
            if(!!partDomObject) domObject.appendChild(partDomObject);

        this.installEventListners(domObject);

        this.domObject = domObject;

        return domObject;
    }


    hasDOMObject() {
        return !!document.getElementById(this.getId());
    }

    setDOMObject(domObject) {
        this.domObject = domObject;
        return this;
    }

    getDOMObject() {

        if(!this.domObject) 
            this.setDOMObject(document.getElementById(this.getDOMObjectId()));

        return this.domObject;
    }

    getHeaderDOMObject() {
        return document.getElementById(this.getHeaderDOMObjectId());
    }

    getBodyDOMObject() {
        return document.getElementById(this.getBodyDOMObjectId());
    }

    */
}

