

class RNav_IconicButton extends RNav_DOMControl {

    constructor(major, id = undefined) {

        super(major, id);
        
        this.setProps(
            {
                'iconsPath': 'img',
                'iconDescs': {},
                'visibleIconName': undefined
            }
        )
    }

    makeDOMView() {

        const iconDescs = this.getIconDescs()

        const icons = iconDescs.icons;
        const visibleIconName = iconDescs.visibleIconName;
        const iconsPath = this.getIconsPath();
        
        const spots = {};

        icons.forEach(
            ic => {
                spots[`${ic.spot}@src`] = `${iconsPath}/${ic.file}`
                spots[`${ic.spot}@alt`] = ic.alt
            }
        );

        this.inject(new RNav_MultiIconMaker()
            .setOrigin(this)
            .setIconNames(Array.from(icons, ic => ic.spot))
            .setVisibleIconName(visibleIconName)
            .nestProps(spots)
        );

        return this.provideOneElement();
    }

    getVisibleIconSpotName() {

        for(const spotName of this.getSpotNames()) {

            let spotElement = this.getSpotElement(spotName)

            if (spotElement.tagName === 'IMG' && spotElement.style.display !== 'none') {
                return spotName;
            }
        }

        return null;
    }

    showIcon(spotName) {

        this.provideOneSpot(spotName).style.display = '';

        const visibleIconSpotName = this.getVisibleIconSpotName();
        if(!!visibleIconSpotName) {
           this.hideIcon(visibleIconSpotName);
        }

        return this;
    }

    hideIcon(spotName) {
        this.provideOneSpot(spotName).style.display = 'none';
        return this;
    }

}