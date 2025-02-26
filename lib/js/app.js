// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      app.js                          (\(\
// Func:        Application                     (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_App extends RNav_Bureaucrat {

    constructor(id) {
        super(null, id);
        this.becomeApp();
    }

    goOn() {
        throw new Error(`RNav ERROR: RNav.App.goOn() must be overloaded.`);
    }

    start(staticConfig) {
        this.getCfg().load(this.getId(), staticConfig, () => this.goOn());
    }

    stop() {

    }
}

