// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      uicontrols.js                    (\(\
// Func:        Basic UI controls                (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_BasicDOMControl extends RNav_DOMControl {

    constructor(major, propsRec, id = undefined) {
        super(major, propsRec, id)
        this.declare('content');
    }

    makeDOMView() {
        return new RNav_BoxShellViewMaker()
            .setOrigin(this)
            .nestArgs(this.getContent())
            .provideOneElement();
    }
}

class RNav_IconicButton extends RNav_DOMControl {

    constructor(major, propsRec = {}, id = undefined) {

        const defaultPropsRec = {
            'iconSpotsDef': {},
            'iconsPath': 'img', 
            'buttonState': 'enabled',
            'callback': null              
        }

        super(major, RNav_Utils.mergeProps(defaultPropsRec, propsRec), id);
        
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
        
        const fsm = new RNav_FSMachine()
        
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
        const iconsPath = this.getIconsPath();
        
        const iconSpotVals = {};
        icons.forEach(
            ic => {
                iconSpotVals[`${ic.spotName}@src`] = `${iconsPath}/${ic.fileName}`;
                iconSpotVals[`${ic.spotName}@alt`] = ic.altText
            }
        );

        this.inject(new RNav_MultiIconViewMaker()
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
            if (RNav_DOMUtils.hasTagName(elm, 'img') && RNav_DOMUtils.isShown(elm)) {
                return spotName;
            }
        }

        throw this.createGearError(`A visible icon is not found.`);
    }

    showIcon(iconSpotName) {
        this.hideIcon(this.getVisibleIconSpotName());
        RNav_DOMUtils.show(this.provideOneSpot(iconSpotName));
        return this;
    }

    hideIcon(iconSpotName) {
        RNav_DOMUtils.hide(this.provideOneSpot(iconSpotName));
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

class RNav_FlipperButton extends RNav_IconicButton {

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

        const fsm = new RNav_FSMachine()
            .defineFromPlantUML(
                this.assembleFSMachineDef(states, initialState)
            );
            
        this.installFSMachine(fsm, 'buttonState');
    }

    // Public interface

    forceToState(toState) {
        
        if (this.getButtonState() !== toState) {
            this.doCommand('toggle');
        }

        return this;
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

class RNav_ShowHideButton extends RNav_FlipperButton {

    constructor(major, propsRec, id = undefined) {

        const cElem = document.getElementById(propsRec.idref);
        const initState = cElem ? (RNav_DOMUtils.isShown(cElem) ? 'shown' : 'hidden') : 'hidden';

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
                            'fileName': 'arrow_right.svg'
                        },
                        {
                            'spotName': 'shown', 
                            'altText':  'Hide',
                            'fileName': 'arrow_down.svg'
                        }
                    ]
                }
            }

        super(major, RNav_Utils.mergeProps(localPropsRec, propsRec), id);
    }

    getControlledElement() {
        return document.getElementById(this.getControlledElementId());
    }

    showControlledContent() {
        RNav_DOMUtils.hide(this.getControlledElement());
    }

    hideControlledContent() {
        RNav_DOMUtils.show(this.getControlledElement());
    }

    performButtonAction(task) { 

        if (this.getButtonState() === 'hidden') {
            this.showControlledContent()
        } else {
            this.hideControlledContent()
        }
    }
}

class RNav_ShowHideBlock extends RNav_DOMControl {

    constructor(major, propsRec, id = undefined) {

        const localPropsRec = {
            'showHideButtonDOMView': null,
            'showHideButtonControl': null,
            'titleDOMView': null,
            'titleControl': null,
            'contentDOMView': null,
            'contentControls': [],
            'initialState': 'hidden',
            'showIconFileName': 'arrow_right.svg',
            'hideIconFileName': 'arrow_down.svg'
        }

        super(major, RNav_Utils.mergeProps(localPropsRec, propsRec), id);

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
                new RNav_ShowHideButton(this, buttonPropsRec)
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

        const vm = new RNav_FlipperViewMaker(vmPropsRec)
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