// * * ** *** ***** ******** ************* *********************
// Product:     Kit for Web-based Interactive Stand-alone Help
// Part:        Front-End JS library
// Module:      app.js                          (\(\
// Func:        Application                     (^.^)  
// * * ** *** ***** ******** ************* *********************


class kwish_App extends kwish_Bureaucrat {

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

