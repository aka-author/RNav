// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      uicontrols.js                    (\(\
// Func:        Basic UI controls                (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_IconicButton extends RNav_DOMControl {

    constructor(major, propsRec = {}, id = undefined) {

        const defaultPropsRec = {
            'iconSpotsDef': {},
            'iconsPath': 'img', 
            'buttonState': 'enabled'               
        }

        super(major, RNav_Utils.mergeProps(defaultPropsRec, propsRec), id);
        
        this.defineFSMachine();
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
        console.log(`The buttin ${this.getId()} is pressed.`);
    }

    handle_dom_click(task) {
        
        if (this.isEnabled()) {
            this.doCommand('userActionRequet');
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

        this.inject(new RNav_MultiIconMaker()
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
        return this.getButtonState() === 'enabled';
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

class RNav_FlipFlopButton extends RNav_IconicButton {

    defineFSMachine() {

        const fsm = new RNav_FSMachine()
        
            .defineFromPlantUML(
                `[*] --> ${this.getButtonState()}

                flipped --> flopped : toggle
                flopped --> flipped : toggle
                
                flipped --> disabledFlipped : disable
                flopped --> disabledFlopped : disable 

                disabledFlipped --> enable : flipped
                disabledFlopped --> enable : flopped`
            )

        this.installFSMachine(fsm, 'enabledState');
    }

    showIconFlipped() {
        this.hideIcon(this.getVisibleIconSpotName());
        RNav_DOMUtils.show(this.provideOneSpot('flipped'));
        return this;
    }

    showIconFlopped() {
        this.hideIcon(this.getVisibleIconSpotName());
        RNav_DOMUtils.show(this.provideOneSpot('flopped'));
        return this;
    }

    isEnabled() {
        return !this.getButtonState().includes('isabled');
    }

    handle_flipped_entered(task) {
        this.showIcon('flipped')
            .performButtonAction(task.setPayload('flipped'));
    }

    handle_flopped_entered(task) {
        this.showIcon('flopped')
            .performButtonAction(task.setPayload('flopped'));
    }

    handle_dom_click(task) {
        
        if (this.isEnabled()) {
            this.doCommand('toggle');
        }

        this.terminateTask(task);
    }
}