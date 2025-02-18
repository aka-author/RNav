// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      gear.js                                (\(\
// Func:        The root of the RNav class hierarchy   (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_Gear {

    static gears = {};
    static idCount = 0;

    static disposableIdPostfix = '__auto';

    static funcNameBeginnings = [
        'assemble', 'build', 'calc', 'create', 'collect', 'detect',
        'generte', 'get', 'has', 'is', 'select', 'verify'
    ];

    declaredProps = new Set();
    propNamePrefix = undefined;

    constructor(id = undefined) {

        const actualId = id || this.generateId();

        if(RNav_Gear.verifyGearId(actualId)) {
            throw this.createGearError(`Gear #${actualId} already exists.`);
        }

        this.setProps(
            {
                'id': actualId,
                'cfgParamNamePrefix': '',
                'refPropName': this.assembleDefaultRefPropName()
            }
        )
        
        this.registerGear(this);
    }

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

    static verifyGearId(gearId) {
        return !!RNav_Gear.gears[gearId];
    }

    registerGear(gear) {

        if (gear.isDisposable()) return this;

        RNav_Gear.gears[gear.getId()] = gear;

        return this;
    }

    unregisterGear(gearId) {

        if (RNav_Gear.verifyGearId(gearId)) {
            delete RNav_Gear.gears[gearId];
        }

        throw this.createGearError(`Gear #${id} doesn't exist`, this);
    }

    getGear(gearId) {

        if (RNav_Gear.verifyGearId(gearId)) {
            return RNav_Gear.gears[gearId]; 
        }

        throw this.createGearError(`Gear #${id} doesn't exist`, this);
    }

    getDisposableIdPostfix() {
        return RNav_Gear.disposableIdPostfix;
    }

    isDisposableId(id) {
        return id.endsWith(this.getDisposableIdPostfix());
    }

    isDisposable() {
        return this.isDisposableId(this.getId());
    }

    static getNextIdCount() {
        return RNav_Gear.idCount++;
    }

    generateMyId() {
        const className = this.getClassName();
        const localUnique = RNav_Gear.getNextIdCount();
        const postfix = this.getDisposableIdPostfix();
        return `${className}_${localUnique}${postfix}`;
    }

    generateForeignId(obj) {

        if (!!obj['getId']) {
            return obj['getId']();
        }

        const localUnique = RNav_Gear.getNextIdCount();
        const postfix = this.getDisposableIdPostfix();

        return `i${localUnique}${postfix}`;
    }

    generateId(obj = undefined) {
        return !!obj ? this.generateForeignId(obj) : this.generateMyId();
    }

    getClassName() {
        return this.constructor.name;
    }

    assembleDefaultRefPropName() {

        let rawName = this.getClassName();
        const rnavPrefix = 'RNav_';

        if (rawName.startsWith(rnavPrefix)) {
            rawName = RNav_Utils.substringAfter(rawName, rnavPrefix);
        }

        return RNav_Utils.decapitalizeFirst(rawName);
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
                base = RNav_Utils.substringAfter(propName, this.getPropNamePrefix());
            }
        }

        return base;
    }

    setProp(propName, propValue = true) {
        this[propName] = propValue;
        return this;
    }

    hasUsefulProp(propName) {
        return this[propName] !== undefined;
    }

    getProp(propName) {
        return this[propName];
    }

    assembleSetterName(propName) {
        return `set${RNav_Utils.capitalizeFirst(this.getEtterNameBase(propName))}`;
    }

    hasSetter(propName) {
        return !!this[this.assembleSetterName(propName)];
    }

    defineSetter(propName) {

        const me = this;
        const setter = (propValue) => {
            return me.setProp(propName, propValue);
        };

        this[this.assembleSetterName(propName)] = setter;

        return this;
    }

    assembleGetterName(propName) {
        return `get${RNav_Utils.capitalizeFirst(this.getEtterNameBase(propName))}`;
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

    setProps(props) {

        for (const propName in props) {

            this[propName] = props[propName];

            if (!this.hasSetter(propName)) {
                this.defineSetter(propName);
            }

            if (!this.hasGetter(propName)) {
                this.defineGetter(propName);
            }
        }

        return this;
    }

    declare(...args) {
        const props = {};
        const s = this.declaredProps;
        args.forEach(p => s.add(p));
        args.forEach(arg => { props[arg] = undefined; });
        this.setProps(props);
        return this;
    }

    safeSetProps(props) {

        for (const propName of this.declaredProps) {
            if (propName in props) {
                this.setProp(propName, props[propName]);
            }
        }

        return this;
    }

    isFuncName(methodName) {
        return RNav_Gear.funcNameBeginnings.some(prefix =>
            methodName.startsWith(prefix) &&
            methodName.length > prefix.length &&
            !/[a-z]/.test(methodName[prefix.length])
        );
    }

    inject(injectee, propName = undefined) {

        if (!!propName) this.declare(propName);

        const injecteePropName = propName || this.generateId(injectee);

        this[injecteePropName] = injectee;

        Object.keys(injectee).forEach(
            methodName => {
                if (!this.hasOwnProperty(methodName) && this.isFunc(injectee[methodName])) {
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
        );

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

    getCfg() {
        return RNav_Cfg.getCfg();
    }

    getCfgParamName(shortcut) {
        return `${this.getCfgParamNamePrefix()}${shortcut}`;
    }

    getCfgParam(shortcut) {
        return this.getCfg().get(this.getCfgParamName(shortcut));
    }

    setCfgParam(shortcut, parVal) {
        this.getCfg().userSet(this.getCfgParamName(shortcut), parVal);
        return this;
    }

    
}