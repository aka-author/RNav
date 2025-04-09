// * * ** *** ***** ******** ************* *********************
// Product:     Kit for Web-based Interactive Stand-alone Help
// Part:        Front-End JS library
// Module:      i18n.js                          (\(\
// Func:        Getting local strings            (^.^)  
// * * ** *** ***** ******** ************* *********************


class kwish_I18n {

    static i18n = null;
    static i18nRec = {};
    static customCreateI18nFunc = function() {
        return new kwish_I18n();
    };

    constructor() {
        this.i18n = {};
    }

    // Public interface

    load(i18nRec) {        
        kwish_I18n.i18nRec = i18nRec;
    }

    static getI18n() {

        if(!kwish_I18n.i18n) {
            kwish_I18n.i18n = kwish_I18n.customCreateI18nFunc();
        }
        
        return kwish_I18n.i18n;
    }

    getString(keyStr, langCode) {

        const local = kwish_I18n.i18nRec[langCode];

        if (!local) {
            return keyStr;
        }

        return local[keyStr] || keyStr;
    }

    static setCustomCreateRsrcFunc(ccrf) {
        kwish_Cfg.customCreateRsrcFunc = ccrf;
    }
}