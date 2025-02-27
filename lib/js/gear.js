// * * ** *** ***** ******** ************* *********************
// Product:     Kit for Web-based Interactive Stand-alone Help
// Part:        Front-End JS library
// Module:      gear.js                                (\(\
// Func:        The root of the RNav class hierarchy   (^.^)  
// * * ** *** ***** ******** ************* *********************


class kwish_Gear {

    static gears = {};

    static disposableIdPostfix = '__auto';

    static funcNameBeginnings = [
        'assemble', 'build', 'calc', 'create', 'collect', 'detect',
        'extract', 'generte', 'get', 'has', 'is', 'make', 'provide',
        'select', 'verify'
    ];

    declaredProps = new Set();
    propNamePrefix = undefined;

    constructor(props = null, id = undefined) {

        const propsRec = kwish_Utils.isUsefulObj(props) ? props : {};
        const actualId = typeof props === 'string' ? props : id || this.generateId();

        if (kwish_Gear.verifyGearId(actualId)) {
            throw this.createGearError(`Gear #${actualId} already exists.`);
        }

        const corePropsRec = {
            'id': actualId,
            'cfgParamNamePrefix': '',
            'refPropName': ''
        }

        this.setProps(corePropsRec, propsRec)
            .registerGear(this)
            .setRefPropName(this.assembleDefaultRefPropName())
            .configure();
    }

    // Public interface

    isDisposable() {
        return this.isDisposableId(this.getId());
    }

    getClassName() {
        return this.constructor.name;
    }

    setProps(...propsRecs) {

        for (const propsRec of propsRecs) {
            for (const propName of Object.keys(propsRec)) {

                this[propName] = propsRec[propName];

                if (!this.hasSetter(propName)) {
                    this.defineSetter(propName);
                }

                if (!this.hasGetter(propName)) {
                    this.defineGetter(propName);
                }
            }
        }

        return this;
    }

    safeSetProps(propsRec) {

        for (const propName of this.declaredProps) {
            if (propName in propsRec) {
                this.setProp(propName, propsRec[propName]);
            }
        }

        return this;
    }

    // Private interface

    createGearError(description = undefined, clues = null) {

        const errWhere = `#${this.getId()}`;
        const errWhy = description ? `: ${description}` : '';
        const errMsg = `Issue in ${errWhere}${errWhy}`;

        const errEvidence = {
            'victim': this,
            'clues': clues,
        }

        return new Error(errMsg, errEvidence);
    }

    getGear(gearId) {

        if (kwish_Gear.verifyGearId(gearId)) {
            return kwish_Gear.gears[gearId];
        }

        throw this.createGearError(`Gear #${gearId} doesn't exist`, this);
    }

    declare(...args) {
        const props = {};
        const s = this.declaredProps;
        args.forEach(p => s.add(p));
        args.forEach(arg => props[arg] = this[arg] || undefined);
        this.setProps(props);
        return this;
    }

    inject(injectee, propName = undefined) {

        if (!!propName) this.declare(propName);

        const injecteePropName = propName || this.generateId(injectee);

        this[injecteePropName] = injectee;

        const injecteePropNames = kwish_Utils.getAllPropNames(injectee);

        for (const methodName of injecteePropNames) {
            if (!this[methodName] && kwish_Utils.isFunc(injectee[methodName])) {
                if (this.isFuncName(methodName)) {
                    this[methodName] = (...args) => {
                        return injectee[methodName](...args)
                    };
                } else {
                    this[methodName] = (...args) => {
                        injectee[methodName](...args);
                        return this;
                    }
                }
            }
        }

        return this;
    }

    mixin(...classes) {

        for (const classObject of classes) {
            let methodNames = kwish_Utils.allClassMethodNames(classObject);
            for (const propName of methodNames) {
                if (!this[propName] && propName != 'constructor') {
                    this[propName] = classObject.prototype[propName];
                }
            }
        }

        return this;
    }

    installEquipment(equipment, ...servicedProps) {

        const props = {};
        props[equipment.getRefPropName()] = equipment;
        this.setProps(props);

        if (!equipment.hasServicedObject()) {
            equipment.setServicedObject(this);
        }

        equipment.declareServicedProps(...servicedProps);

        return this;
    }

    getCfgParam(shortcut) {
        return this.getCfg().get(this.getCfgParamName(shortcut));
    }

    setCfgParam(shortcut, parVal) {
        this.getCfg().userSet(this.getCfgParamName(shortcut), parVal);
        return this;
    }

    // Overridable methods

    configure() { }

    // Guts

    setProp(propName, propValue = true) {
        this[propName] = propValue;
        return this;
    }

    getProp(propName) {
        return this[propName];
    }

    static verifyGearId(gearId) {
        return !!kwish_Gear.gears[gearId];
    }

    registerGear(gear) {

        if (gear.isDisposable()) return this;

        kwish_Gear.gears[gear.getId()] = gear;

        return this;
    }

    unregisterGear(gearId) {

        if (kwish_Gear.verifyGearId(gearId)) {
            delete kwish_Gear.gears[gearId];
        }

        throw this.createGearError(`Gear #${id} doesn't exist`, this);
    }

    getDisposableIdPostfix() {
        return kwish_Gear.disposableIdPostfix;
    }

    isDisposableId(id) {
        return id.endsWith(this.getDisposableIdPostfix());
    }

    static getNextIdCount() {
        return kwish_Utils.getNextIdCount();
    }

    generateMyId() {
        const className = kwish_Utils.dernav(this.getClassName());
        const localUnique = kwish_Gear.getNextIdCount();
        const postfix = this.getDisposableIdPostfix();
        return `${className}_${localUnique}${postfix}`;
    }

    generateForeignId(obj) {

        if (!!obj['getId']) {
            return obj['getId']();
        }

        const localUnique = kwish_Gear.getNextIdCount();
        const postfix = this.getDisposableIdPostfix();

        return `i${localUnique}${postfix}`;
    }

    generateId(obj = undefined) {
        return !!obj ? this.generateForeignId(obj) : this.generateMyId();
    }

    assembleDefaultRefPropName() {

        let rawName = this.getClassName();
        const rnavPrefix = 'kwish_';

        if (rawName.startsWith(rnavPrefix)) {
            rawName = kwish_Utils.substringAfter(rawName, rnavPrefix);
        }

        return kwish_Utils.decapitalizeFirst(rawName);
    }

    getMethodName() {
        const error = new Error();
        const stackLines = error.stack.split("\n");
        const callerStackLine = stackLines[2];
        const match = callerStackLine.match(/at .*?\.(\w+)/);
        return match ? match[1] : 'Unknown';
    }

    getPropNamePrefix() {
        return this.propNamePrefix;
    }

    getEtterNameBase(propName) {

        let base = propName;

        const prefix = this.getPropNamePrefix();

        if (!!prefix) {
            if (propName.startsWith(prefix)) {
                base = kwish_Utils.substringAfter(propName, this.getPropNamePrefix());
            }
        }

        return base;
    }

    hasUsefulProp(propName) {
        return this[propName] !== undefined;
    }

    assembleSetterName(propName) {
        return `set${kwish_Utils.capitalizeFirst(this.getEtterNameBase(propName))}`;
    }

    hasSetter(propName) {
        return !!this[this.assembleSetterName(propName)];
    }

    defineSetter(propName) {

        //const me = this;
        const setter = (propValue) => {
            return this.setProp(propName, propValue);
        };

        this[this.assembleSetterName(propName)] = setter;

        return this;
    }

    assembleGetterName(propName) {
        return `get${kwish_Utils.capitalizeFirst(this.getEtterNameBase(propName))}`;
    }

    hasGetter(propName) {
        return !!this[this.assembleGetterName(propName)];
    }

    defineGetter(propName) {

        const getter = function () {
            return this.getProp(propName);
        };

        this[this.assembleGetterName(propName)] = getter;

        return this;
    }

    isFuncName(methodName) {
        return kwish_Gear.funcNameBeginnings.some(prefix =>
            methodName.startsWith(prefix) &&
            methodName.length > prefix.length &&
            !/[a-z]/.test(methodName[prefix.length])
        );
    }

    getRsrc() {
        return kwish_Rsrc.getRsrc();
    }

    getRsrcAsset(rsrcCode) {
        console.log(this.getRsrc())
        return this.getRsrc().getAsset(rsrcCode, this.getVertexPath());
    }

    getCfg() {
        return kwish_Cfg.getCfg();
    }

    getCfgParamName(shortcut) {
        return `${this.getCfgParamNamePrefix()}${shortcut}`;
    }
}