// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      controller.js                            (\(\
// Func:        Providing a base for all controllers     (^.^)  
// * * ** *** ***** ******** ************* *********************

class RNav_Controller extends RNav_Tasker {

    static app = null;

    constructor(chief, id = undefined) {
        super(chief, id);
        this.declare('appFlag');
    }

    becomeApp() {
        RNav_Controller.app = this;
    }

    isApp() {
        return !!this.appFlag;
    }

    getApp() {
        return RNav_Controller.app;
    }
}
