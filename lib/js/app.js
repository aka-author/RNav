// * * ** *** ***** ******** ************* *********************
// Product:     Kit for Web-based Interactive Stand-alone Help
// Part:        Front-End JS library
// Module:      app.js                          (\(\
// Func:        Application                     (^.^)  
// * * ** *** ***** ******** ************* *********************


class kwish_App extends kwish_Bureaucrat {

    constructor(props, id) {
        super(null, props, id);
        this.becomeApp();
    }

    // Public interface

    start(staticConfig) {
        kwish_DOMEventLog.start();
        this.getCfg().load(this.getId(), staticConfig, () => this.goOn());
    }

    // Overridable methods
    
    goOn() {
        throw new Error(`RNav ERROR: RNav.App.goOn() must be overloaded.`);
    }

    stop() {

    }
}

