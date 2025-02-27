// * * ** *** ***** ******** ************* *********************
// Product:     Kit for Web-based Interactive Stand-alone Help
// Part:        Front-End JS library
// Module:      rsrc.js                              (\(\
// Func:        Resolving paths to resources         (^.^)  
// * * ** *** ***** ******** ************* *********************


class kwish_Rsrc {

    static rsrc = null;
    static rsrcRec = {};
    static customCreateRsrcFunc = function() {
        return new kwish_Rsrc();
    };

    constructor() {
        this.rsrc = {};
    }

    // Public interface

    load(rsrcRec) {        
        kwish_Rsrc.rsrcRec = rsrcRec;
    }

    static getRsrc() {

        if(!kwish_Rsrc.rsrc) {
            kwish_Rsrc.rsrc = kwish_Rsrc.customCreateRsrcFunc();
        }
        
        return kwish_Rsrc.rsrc;
    }

    getAsset(rsrcCode, vertexPath) {

        const entry = kwish_Rsrc.rsrcRec[rsrcCode];
        
        if (!entry) {
            return undefined;
        }

        for (const option of entry) {
            if (!option.vertexPath || vertexPath.match(option.vertexPath)) {
                return this.resolveCfgParamRefs(option.rsrcContent);
            }
        }

        return undefined;
    }

    static setCustomCreateRsrcFunc(ccrf) {
        kwish_Cfg.customCreateRsrcFunc = ccrf;
    }

    // Guts

    resolveCfgParamRefs(value) {
        const cfg = kwish_Cfg.getCfg();
        return value.replace(/\${(.*?)}/g, (_, key) => cfg.get(key) ?? ''); 
    }
}