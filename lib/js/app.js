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

    start(staticCfgRec, staticRsrcRec) {
        kwish_DOMEventLog.start();
        this.getRsrc().load(staticRsrcRec);
        this.getCfg().load(this.getId(), staticCfgRec, () => this.goOn());
    }

    // Overridable methods

    goOn() {
        throw new Error(`RNav ERROR: RNav.App.goOn() must be overloaded.`);
    }

    stop() {

    }
}

