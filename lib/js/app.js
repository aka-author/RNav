// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      app.js                          (\(\
// Func:        Application                     (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_App extends RNav_Tasker {

    constructor(id) {

        super(id);

        RNav_Tasker.app = this;
        
        this.setProps(
            {
                'cfg': this.createCfg(),
                'staticCfg': {}
            }
        )
    }

    createCfg() {
        return new RNav_Cfg();
    }

    initCfg(staticCfg) {
        return this.setStaticCfg(staticCfg);
    }
    
    goOn() {
        throw new Error(`RNav ERROR: RNav.App.goOn() must be overloaded.`);
    }

    start() {
        const me = this;
        this.getCfg().load(this.getStaticCfg(), () => me.goOn());
    }

    stop() {
        
    }
}

