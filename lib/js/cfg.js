// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      cfg.js                                  (\(\
// Func:        Accessing configuration paramaters      (^.^)  
// * * ** *** ***** ******** ************* *********************

class RNav_Cfg {

    static cfg = null;
    static customCreateCfgFunc = function() {
        return new RNav_Cfg()
    };

    constructor() {

        this.appId = undefined; 

        this.remoteParamGroups = {};

        this.cfg = {};
        this.userCfg = {};

        this.loadedFlag = false;

    }

    setAppId(appId) {
        this.appId = appId;
        return this;
    }

    getAppId() {
        return this.appId;
    }

    hasRemoteParams() {
        return RNav_Utils.isNotEmpty(this.remoteParamGroups);
    }


    /**
     * Verifies if configuration parameters have been loaded.
     * @returns `true` if configuration parameters have been loaded 
     * successfully, otherwise returns `false`.
     */

    isLoaded() {
        return this.loadedFlag;
    }

    setLoadedFlag(flag=true) {
        this.loadedFlag = flag;
        return this;
    }

    separName(paramName) {
        return "." + paramName;
    }

    nameSepar(paramName) {
        return paramName + ".";
    }

    joinParamName(groupName, paramName) {
        return groupName ? groupName + this.separName(paramName) : paramName;
    }

    extractGroupName(paramFullName, paramName) {
        return RNav_Utils.substringBefore(paramFullName, this.separName(paramName));
    }

    hasParam(groupName, paramName) {
        return groupName == paramName || groupName.endsWith(this.separName(paramName))
    }

    hasGroup(groupName, clause) {

        const start = this.nameSepar(clause);
        const middle = this.separName(start);

        return groupName.startsWith(start) || groupName.indexOf(middle) > -1;
    }

    hasGroupOrParam(groupName, clause) {
        return this.hasParam(groupName, clause) || hasGroup(groupName, clause);
    }

    detectParamFullName(paramName) {

        let paramFullName = undefined;

        for(const pfn in this.cfg) 
            if(pfn == paramName || this.hasParam(pfn, paramName)) {
                paramFullName = pfn;
                break;
            }

        return paramFullName;
    }

    findParams(subname) {

        let matchingParamNames = [];

        for(const paramName in this.cfg) 
            if(this.hasGroupOrParam(paramName, subname)) 
                matchingParamNames.push(paramName);

        return matchingParamNames;
    }

    set(paramName, paramValue) {

        this.cfg[paramName] = paramValue;

        return this;
    }


    /**
     * Assigns a value to a user configuration parameter.
     * A user configuration parameter is a configuration parameter mutable 
     * in the context of a certain web browser instance. 
     * @param {string} userParamName - the name of a user parameter. 
     * @param {*} paramValue - a value to be assigned to the user parameter.
     * @returns The ArnavCfg object itself.
     */

    userSet(userParamName, paramValue) {

        const paramFullName = this.detectParamFullName(userParamName);

        if(!!paramFullName) 
            this.userCfg[paramFullName] = paramValue;

        this.commitUserParams();

        return this;
    }


    /**
     * Returns the current value value of a configuration parameter. 
     * @param {string} paramName - the parameter name.
     * @returns The configuration parameter value.
     */

    get(paramName) {

        let paramValue = undefined;

        const paramFullName = this.detectParamFullName(paramName);
        
        if(!!paramFullName) 
            paramValue = !!this.userCfg[paramFullName] ? this.userCfg[paramFullName] : this.cfg[paramFullName]; 
            
        return paramValue;
    }

    parseSource(source, groupName=undefined) {

        for(const paramName in source) {

            const branchPath = this.joinParamName(groupName, paramName);
            const branchValue = source[paramName];

            if(typeof(branchValue) == "object")
                this.parseSource(branchValue, branchPath);
            else 
                this.cfg[branchPath] = branchValue;
        }

        return this;
    }

    unpackStaticParams(cfgSource) {

        this.parseSource(cfgSource);

        return this;
    }

    getUserCfgRecordKey() {
        return `${this.getAppId()}_RNavCfg`;
    }

    loadUserParams(id) {

        let userCfgSource = {};

        try {
            userCfgSource = JSON.parse(localStorage.getItem(this.getUserCfgRecordKey()));
        } catch {}
            
        this.userCfg = !!userCfgSource ? userCfgSource : {};

        return this;
    }


    /**
     * Writes user configuration parameters to the local storage. 
     * @returns The ArnavCfg object itself.
     */

    commitUserParams() {

        try {
            localStorage.setItem(
                this.getUserCfgRecordKey(), 
                JSON.stringify(this.userCfg)
            );
        } catch {}

        return this;
    }

    markRemoteParamGroupLoaded(groupName, flag=true) {

        this.remoteParamGroups[groupName] = flag;
        
        return this;
    }

    areRemoteParamsLoaded() {

        for(const groupName in this.remoteParamGroups)
            if(!this.remoteParamGroups[groupName])
                return false;

        return true;
    }

    fetchRemoteParamGroup(groupName, callback) {

        const requestURL = this.get(this.joinParamName(groupName, "@url"));

        fetch(requestURL).then(
            (response) => {
                return response.json();
            }
        ).then(
            (response) => {

                for(const propName in response) 
                    this.set(this.joinParamName(groupName, propName), response[propName]);
                
                this.markRemoteParamGroupLoaded(groupName);

                if(this.areRemoteParamsLoaded()) {
                    
                    this.setLoadedFlag();

                    if(!!callback)
                        callback();
                }
            }
        )
    }

    fetchRemoteParams(callback) {
        
        for(const paramFullName in this.cfg) 
            if(this.hasParam(paramFullName, "@url")) {
                let groupName = this.extractGroupName(paramFullName, "@url");
                this.markRemoteParamGroupLoaded(groupName, false);
            }
            
        if(this.hasRemoteParams()) {

            this.setLoadedFlag(false);
            
            for(const remoteParamGroupName in this.remoteParamGroups) 
                this.fetchRemoteParamGroup(remoteParamGroupName, callback);  
        } else {
            callback();
        }
        
        return this;
    }

    detectCustomParams() {
        /* May be redefined */
    }


    /**
     * Loading configuration parameters and then calling a function. 
     * @param {object} cfgSource - an object containing static configuration parameters.
     * @param {function} callback - a function to be called after configuration parameters have been loaded.
     * @returns The ArnavCfg object itself.
     */

    load(appId, cfgSource, callback=null) {

        this.setAppId(appId);

        this.unpackStaticParams(cfgSource);
        this.loadUserParams(this.getAppId());
        this.detectCustomParams();
        this.fetchRemoteParams(callback);
        
        return this;
    }

    getBrowserName() {

        const userAgent = navigator.userAgent;
        let browserName;
      
        if (userAgent.indexOf("Firefox") > -1) {
          browserName = "Firefox";
        } else if (userAgent.indexOf("Chrome") > -1) {
          browserName = "Chrome";
        } else if (userAgent.indexOf("Safari") > -1) {
          browserName = "Safari";
        } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
          browserName = "Opera";
        } else if (userAgent.indexOf("Edge") > -1) {
          browserName = "Edge";
        } else if (userAgent.indexOf("Trident") > -1) {
          browserName = "MSIE";
        } else {
          browserName = "Unknown";
        }
      
        return browserName;
      }

    getOS() {
        const userAgent = navigator.userAgent;
        let operatingSystem;
      
        if (userAgent.indexOf("Win") > -1) {
          operatingSystem = "Windows";
        } else if (userAgent.indexOf("Mac") > -1) {
          operatingSystem = "MacOS";
        } else if (userAgent.indexOf("Linux") > -1) {
          operatingSystem = "Linux";
        } else if (userAgent.indexOf("Android") > -1) {
          operatingSystem = "Android";
        } else if (userAgent.indexOf("iOS") > -1) {
          operatingSystem = "iOS";
        } else {
          operatingSystem = "Unknown";
        }
      
        return operatingSystem;
      }

    isMobile() {
        const userAgent = navigator.userAgent;
        const mobileKeywords = [
          "Android",
          "webOS",
          "iPhone",
          "iPad",
          "iPod",
          "BlackBerry",
          "Windows Phone"
        ];
      
        for (let i = 0; i < mobileKeywords.length; i++) {
          if (userAgent.indexOf(mobileKeywords[i]) > -1) {
            return true;
          }
        }
      
        return false;
      }

      getDefaultLanguage() {

        const navigatorLanguage = navigator.language || navigator.userLanguage;
      
        if (navigatorLanguage) 
          return navigatorLanguage;
      
        if (navigator.browserLanguage) 
          return navigator.browserLanguage;
      
        return undefined; 
      }  

      static setCustomCreateCfgFunc(cccf) {
        RNav_Cfg.customCreateCfgFunc = cccf;
      }

      static getCfg() {

        if(!RNav_Cfg.cfg)
            RNav_Cfg.cfg = RNav_Cfg.customCreateCfgFunc();
        
        return RNav_Cfg.cfg;
      }
}