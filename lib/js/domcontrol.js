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
                'DOMElement': null
            }
        )
        
        this.domElementName = "div";
        this.cssClassName = this.getClassName();

        this.headerDomElementName = "div";
        this.headerCssClassName = this.cssClassName + "Header";

        this.bodyDomElementName = "div";
        this.bodyCssClassName = this.cssClassName + "Body";

        this.offspringDomElementName = "div";
        this.offspringCssClassName = this.cssClassName + "Offspring";

        this.initialDisplay = "";
        
        this.domObject = null;
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

    installEventListners(domElement) {

        const domEventNames = RNav_DOMUtils.getDOMEventNames();
            
        const me = this;

        for(const domEventName of domEventNames) 
            if(this.hasTaskHandler(this.assembleDOMTaskTypeName(domEventName))) 
                domElement.addEventListener(
                    domEventName, e => me.onDOMEvent(e)
                );

        return this;
    }

    hasDOMElement() {
        return !!this.getDOMElement();
    }

    bindDOMElement(domElement) {

        this.setDOMElement(domElement)
            .installEventListners(domElement);

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


    setDOMElementName(domElementName) {
        this.domElementName = domElementName;
        return this;
    }

    getDOMElementName() {
        return this.domElementName;
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

    setHeaderDOMElementName(domElementName) {
        this.headerDomElementName = domElementName;
        return this;
    }

    getHeaderDOMElementName() {
        return this.headerDomElementName;
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

    setBodyDOMElementName(domElementName) {
        this.bodyDomElementName = domElementName;
        return this;
    }

    getBodyDOMElementName() {
        return this.bodyDomElementName;
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

    setOffspringDOMElementName(domElementName) {
        this.offspringDomElementName = domElementName;
        return this;
    }

    getOffspringDOMElementName() {
        return this.offspringDomElementName;
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
        const domObject = document.createElement(this.getDOMElementName());
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

        const headerDomObject = document.createElement(this.getHeaderDOMElementName());
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

        const bodyDomObject = document.createElement(this.getBodyDOMElementName());
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

        const offspringDomObject = document.createElement(this.getOffspringDOMElementName());
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

