// * * ** *** ***** ******** ************* *********************
// Product:     Kit for Web-based Interactive Stand-alone Help
// Part:        Front-End JS library
// Module:      uicontrols.js                    (\(\
// Func:        Basic UI controls                (^.^)  
// * * ** *** ***** ******** ************* *********************


class kwish_BasicDOMControl extends kwish_DOMControl {

    constructor(major, propsRec, id = undefined) {
        super(major, propsRec, id)
        this.declare('content');
    }

    makeDOMView() {
        const vm = new kwish_BoxShellViewMaker()
            .setOrigin(this)
            .nestArgs(this.getContent());

        this.inject(vm);
        
        return this.provideOneElement();
    }
}

class kwish_IconicButton extends kwish_DOMControl {

    constructor(major, propsRec = {}, id = undefined) {

        const defaultPropsRec = {
            'iconSpotsDef': {},
            'iconsPath': 'img', 
            'buttonState': 'enabled',
            'callback': null              
        }

        super(major, kwish_Utils.mergeProps(defaultPropsRec, propsRec), id);
        
        this.defineFSMachine();
    }

    // Private interface

    getIconDefsArray() {
        return this.getIconSpotsDef().icons;
    }

    getInitialState() {
        return this.getIconSpotsDef().defaultIconSpotName;
    }

    // Overridable methods

    defineFSMachine() {
        
        const fsm = new kwish_FSMachine()
        
            .defineFromPlantUML(
                `[*] --> ${this.getButtonState()}
                disabled --> enabled : enable
                enabled --> disabled : disable`
            )

        this.installFSMachine(fsm, 'buttonState');
    }

    performButtonAction(task) { 

        if (!this.callback) {
            this.callback(task);
        } else {
            this.getMajor().doCommand(`${this.getId()}${task.getPayload()}`); 
        }
    }

    handle_dom_click(task) {
        
        if (this.isEnabled()) {
            this.doCommand('userActionRequest');
        }

        this.terminateTask(task);
    }

    // Guts

    extractIconNames() {
        return Array.from(this.getIconSpotsDef().icons, ic => ic.spotName);
    }

    makeDOMView() {

        const icSpDef = this.getIconSpotsDef();

        const icons = icSpDef.icons;
        const defaultIconSpotName = icSpDef.defaultIconSpotName;
        
        const iconSpotVals = {};
        icons.forEach(
            ic => {
                iconSpotVals[`${ic.spotName}@src`] = this.getRsrcAsset(ic.fileName);
                iconSpotVals[`${ic.spotName}@alt`] = ic.altText
            }
        );

        this.inject(new kwish_MultiIconViewMaker()
            .setOrigin(this)
            .setIconNames(this.extractIconNames())
            .setVisibleIconName(defaultIconSpotName)
            .nestProps(iconSpotVals)
        );
        
        return this.provideOneElement();
    }

    getVisibleIconSpotName() {

        for(const spotName of this.getSpotNames()) {
            let elm = this.getSpotElement(spotName)
            if (kwish_DOMUtils.hasTagName(elm, 'img') && kwish_DOMUtils.isShown(elm)) {
                return spotName;
            }
        }

        throw this.createGearError(`A visible icon is not found.`);
    }

    showIcon(iconSpotName) {
        this.hideIcon(this.getVisibleIconSpotName());
        kwish_DOMUtils.show(this.provideOneSpot(iconSpotName));
        return this;
    }

    hideIcon(iconSpotName) {
        kwish_DOMUtils.hide(this.provideOneSpot(iconSpotName));
        return this;
    }

    isEnabled() {
        return !this.getButtonState().toLowerCase().includes('disabled');
    }

    handle_userActionRequet(task) {
        this.performButtonAction(task);
    }

    handle_enabled_entered(task) {
        this.showIcon('enabled').terminateTask(task);
    }

    handle_disabled_entered(task) {
        this.showIcon('disabled').terminateTask(task);
    }
}

class kwish_FlipperButton extends kwish_IconicButton {

    // Public interface

    forceToState(toState) {
        
        if (this.getButtonState() !== toState) {
            this.doCommand('toggle');
        }

        return this;
    }

    // Overridable methods

    assembleFSMachineDef(states, initialState) {
        
        const fsmDef =  
            `[*] --> ${initialState}
            ${states[0]} --> ${states[1]} : toggle
            ${states[1]} --> ${states[0]} : toggle`; 

        return fsmDef;
    }

    defineFSMachine() {
        
        const states = this.extractStates(this.getIconDefsArray());
        const initialState = this.getInitialState();

        const fsm = new kwish_FSMachine()
            .defineFromPlantUML(
                this.assembleFSMachineDef(states, initialState)
            );
            
        this.installFSMachine(fsm, 'buttonState');
    }

    // Guts

    extractStates() {
        return [...new Set(Array.from(this.getIconDefsArray(), ic => ic.spotName))];
    }

    handle_toggle(task) {

        const newState = this.getButtonState();

        this.showIcon(newState)
            .performButtonAction(task.setPayload(newState));
    }

    handle_dom_click(task) {
        if (this.isEnabled()) {
            this.doCommand('toggle');
        }

        this.terminateTask(task);
    }
}

class kwish_ShowHideButton extends kwish_FlipperButton {

    constructor(major, propsRec, id = undefined) {

        const cElem = document.getElementById(propsRec.idref);
        const initState = cElem ? (kwish_DOMUtils.isShown(cElem) ? 'shown' : 'hidden') : 'hidden';

        const localPropsRec = {
                'controlledElementId': propsRec.idref,
                'controlledElement': cElem,
                'initialState': initState,
                'iconSpotsDef': {
                    'defaultIconSpotName': initState,
                    'icons': [
                        {
                            'spotName': 'hidden', 
                            'altText':  'Show',
                            'fileName': 'hiden-show'
                        },
                        {
                            'spotName': 'shown', 
                            'altText':  'Hide',
                            'fileName': 'shown-hide'
                        }
                    ]
                }
            }

        super(major, kwish_Utils.mergeProps(localPropsRec, propsRec), id);
    }

    getControlledElement() {
        return document.getElementById(this.getControlledElementId());
    }

    showControlledContent() {
        kwish_DOMUtils.hide(this.getControlledElement());
    }

    hideControlledContent() {
        kwish_DOMUtils.show(this.getControlledElement());
    }

    performButtonAction(task) { 

        if (this.getButtonState() === 'hidden') {
            this.showControlledContent()
        } else {
            this.hideControlledContent()
        }
    }
}

class kwish_ShowHideBlock extends kwish_DOMControl {

    constructor(major, propsRec, id = undefined) {

        const localPropsRec = {
            'showHideButtonDOMView': null,
            'showHideButtonControl': null,
            'titleDOMView': null,
            'titleControl': null,
            'contentDOMView': null,
            'contentControls': [],
            'initialState': 'hidden',
            'showIconFileName': 'hidden-show',
            'hideIconFileName': 'shown-hide'
        }

        super(major, kwish_Utils.mergeProps(localPropsRec, propsRec), id);

        this.mountShowHideButton()
            .mountTitleControl()
            .mountContentControls();
    }

    hasShowHideButtonControl() {
        return !!this.getShowHideButtonControl();
    }

    mountShowHideButton() {

        const buttonPropsRec = {
                'iconSpotsDef': {
                    'defaultIconSpotName': this.getInitialState(),
                    'icons': [
                        {
                            'spotName': 'hidden', 
                            'altText':  'Show',
                            'fileName': this.showIconFileName,
                        },
                        {
                            'spotName': 'shown', 
                            'altText':  'Hide',
                            'fileName': this.hideIconFileName
                        }
                    ]
                }
            }

        if (!this.hasShowHideButtonControl()) {
            this.setShowHideButtonControl(
                new kwish_ShowHideButton(this, buttonPropsRec)
            );                
        }

        return this.addMinor(this.getShowHideButtonControl());
    }

    hasTitleDOMView() {
        return !!this.getTitleDOMView();
    }

    hasTitleControl() {
        return !!this.getTitleControl()
    }

    setTitleControl(control) {
        this.titleControl = control;
        return this.addMinor(control);
    }

    mountTitleControl() {

        if (!this.hasTitleControl()) return this;

        return this.addMinor(this.getTitleControl());
    }

    hasContentDOMView() {
        return !!this.getContentDOMView();
    }

    hasContentControls() {
        return this.getContentControls().length > 0;
    }
    
    mountContentControls() {

        if (!this.hasContentControls()) return this;
    
        return this.addMinors(...this.getContentControls());
    }

    setContentControls(...controls) {
        this.contentControls = controls;
        return this.mountContentControls();
    }

    provideTitleDOMView() {

        if (this.hasTitleDOMView()) {
            return this.getTitleDOMView();
        } 

        if (this.hasTitleMinorControl) {
            return this.getTitieMinorControl();
        }

        return '';
    }

    provideContentDOMView() {

        if (this.hasContentDOMView()) {
            return this.getContentDOMView();
        } 

        if (this.hasContentControls()) {

            const contentDOMViews = [];
            this.getContentControls().forEach(
                c => contentDOMViews.push(c.provideDOMView())
            );
            
            return contentDOMViews
        }

        return '';
    }

    makeDOMView() {

        const vmPropsRec = {
            'contentDisplay': this.getInitialState() === 'hidden' ? 'none' : 'unset'
        }

        const vm = new kwish_FlipperViewMaker(vmPropsRec)
            .setOrigin(this);
            
        this.showHideButtonControl.setControlledElementId(
            vm.assembleContentBlockId()
        );
            
        vm.nestProps(
                {
                    'button': this.showHideButtonControl.provideDOMView(),
                    'title': this.provideTitleDOMView(),
                    'content': this.provideContentDOMView()
                }
            );

        this.inject(vm);

        return vm.provideOneElement();
    }

    forceShow() {
        return this.getShowHideButtonControl().forceToState('shown');
    }

    forceHide() {
        return this.getShowHideButtonControl().forceToState('hidden');
    }
}