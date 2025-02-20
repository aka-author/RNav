// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      uicontrols.js                    (\(\
// Func:        Basic UI controls                (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_IconicButton extends RNav_DOMControl {

    constructor(major, id = undefined) {

        super(major, id);
        
        this.setProps(
                {
                    'iconSpotsDef': {},
                    'iconsPath': 'img', 
                    'enabledState': 'enabled'              
                }
            )
            .defineFSMachine();
    }

    defineFSMachine() {

        const fsm = new RNav_FSMachine()
            .defineFromPlantUML(
                `[*] --> enabled
                disabled --> enabled : enable
                enabled --> disabled : disable`
            )

        this.installFSMachine(fsm, 'enabledState');
    }

    // Overridable methods

    performButtonAction(task) { 
        console.log(`The buttin ${this.getId()} is pressed.`);
    }

    // Guts

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
        RNav_DOMUtils.show(this.provideOneSpot(iconSpotName));
        this.hideIcon(this.getVisibleIconSpotName());
        return this;
    }

    hideIcon(iconSpotName) {
        RNav_DOMUtils.hide(this.provideOneSpot(iconSpotName));
        return this;
    }

    isEnabled() {
        return this.getEnabledState() === 'enabled';
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

    handle_dom_click(task) {
        
        if (this.isEnabled()) {
            this.doCommand('userActionRequet');
        }

        this.terminateTask(task);
    }
}