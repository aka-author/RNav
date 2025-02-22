// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      uicontrols.js                    (\(\
// Func:        Basic UI controls                (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_BasicDOMControl extends RNav_DOMControl {

    makeDOMView() {
        return new RNav_BoxShellViewMaker().setOrigin(this).provideOneElement();
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
        const initState = RNav_DOMUtils.isShown(cElem) ? 'shown' : 'hidden';

        const localPropsRec = {
                'controlledElementId': propsRec.idref,
                'controlledElement': cElem,
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

