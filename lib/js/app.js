// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      app.js                          (\(\
// Func:        Application                     (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_App extends RNav_Tasker {

    constructor(id) {
        super(null, id);
        this.becomeApp();
    }

    goOn() {
        throw new Error(`RNav ERROR: RNav.App.goOn() must be overloaded.`);
    }

    start(staticConfig) {
        const me = this;
        this.getCfg().load(this.getId(), staticConfig, () => me.goOn());
    }

    stop() {

    }
}

