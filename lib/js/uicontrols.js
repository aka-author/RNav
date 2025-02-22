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
            this.callbeck(task);
        } else {
            this.getMajor().doCommand(`${this.getId()}${task.getPayload()}`); 
        }

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

class RNav_FlipperButton extends RNav_IconicButton {

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

class RNav_ContentFlipper extends RNav_DOMControl {

    constructor(major, propsRec = {}, id = undefined) {  

        super(major, propsRec, id);
        
        this.declare('titleDOMView', 'contentDOMViews', 
            'showHideButtonProps', 'showHideButton')
            .easyFSMachine(
                `[*] --> open
                open --> closed : toggle
                closed --> open : toggle`
            );

        this.setProps({'showHideButtonProps': propsRec});
    }

    createShowHideButton() {
        
        return new RNav_FlipperButton(this, this.getShowHideButtonProps())
            .setCallback(() => me.doCommand('toggle'));
    }

    mountMinorControllers() {
        
        this.setProp('showHideButton', 
            this.createShowHideButton(this, this.getShowHideButtonProps()));
        
        this.addMinors(
            this.getShowHideButton()
        );
        
        return this;
    }

    makeDOMView() {
        
        const propsRec = {
            'shelfNames': ['button', 'title', 'content']
        };

        this.inject(new RNav_ContentFlipperViewMaker(propsRec)
                .setOrigin(this)
                .nestProps(
                    {
                        'button': this.getShowHideButton().makeDOMView(),
                        'title': this.getTitleDOMView(), 
                        'content': this.getContentDOMViews()
                    }
                )
            )
            
        return this.provideOneElement();
    }

    getContentSpot() {
        return this.getSpot('content');
    }

    handle_open_entered(task) {
        RNav_DOMUtils.show(this.getContentSpot());
    }

    handle_closed_entered(task) {
        RNav_DOMUtils.hide(this.getContentSpot());
    }

}