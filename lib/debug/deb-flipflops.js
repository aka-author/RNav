
class ContentFlipper extends RNav_ContentFlipper {

    constructor(major, propsRec, id = undefined) {
        
        propsRec.iconSpotsDef = {
                'defaultIconSpotName': propsRec.buttonState,
                'icons': [
                    {
                        'spotName': 'flipped', 
                        'altText':  'Left-to-right',
                        'fileName': 'dir-ltr.svg'
                    },
                    {
                        'spotName': 'flopped', 
                        'altText':  'Right-to-left',
                        'fileName': 'dir-rtl.svg'
                    }
                ]
            };

        super(major, propsRec, id);
        
        const divTitle = document.createElement('div');
        divTitle.textContent = `Jacaranda`;
        this.setTitleDOMView(divTitle);
        
        const divContent = document.createElement('div');
        divContent.textContent = `Jacaranda is a genus of 49 species of 
            flowering plants in the family Bignoniaceae, native to tropical 
            and subtropical regions of the Americas[1] while cultivated 
            around the world. The generic name is also used as the common name.`;
        
        this.setContentDOMViews([divContent]);
            
        this.mountMinorControllers()
           
        //console.log('999',this.makeDOMView())
    }

}


// Initializing and launching the application

var DEB_APP = null;

function main() {
   
    const page = new RNav_Page()
        .usePresetControls()
        .mountDOMView();

    console.log(page);    
}