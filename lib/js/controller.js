// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      controller.js                            (\(\
// Func:        Providing a base for all controllers     (^.^)  
// * * ** *** ***** ******** ************* *********************

class RNav_Controller extends RNav_Tasker {

    constructor(chief, id = undefined) {
        super(chief, id);
        this.declare('appFlag', 'model');
    }

    
}
