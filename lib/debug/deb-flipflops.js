
class ContentFlipper extends RNav_ContentFlipper {

    constructor(major, propsRec, id = undefined) {
        
        propsRec.iconSpotsDef = {
                'defaultIconSpotName': 'hidden',
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