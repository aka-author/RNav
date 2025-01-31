// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      generic.js                             (\(\
// Func:        The root of the RNav class hierarchy   (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_Generic {

    static funcNameBeginnings = [
            'assemble', 'build', 'calc', 'create', 'collect', 'detect', 
            'generte', 'get', 'has', 'is', 'select', 'verify'
        ];

    constructor(id = undefined) {
        this.id = id || this.generateId();
        this.propNamePrefix = undefined;
    }

    generateId(obj = undefined) {

        if(!!obj) {
            if(!!obj['getId'])
                return obj['getId']();
            else
                return `i_${RNav_Utils.compressUUID(RNav_Utils.getUUID4())}`;
        }

        return `${this.getClassName()}_${RNav_Utils.compressUUID(RNav_Utils.getUUID4())}`;
    }

    getId() {
        return this.id;
    }

    getClassName() {
        return this.constructor.name;
    }

    getMethodName() {
        const error = new Error();
        const stackLines = error.stack.split("\n");
        const callerStackLine = stackLines[2]; 
        const match = callerStackLine.match(/at .*?\.(\w+)/);
        return match ? match[1] : 'Unknown';
    }

    isFunc(probableFunc) {
        return typeof probableFunc === 'function';
    }

    getPropNamePrefix() {
        return this.propNamePrefix;
    }

    getEtterNameBase(propName) {

        let base = propName;

        const prefix = this.getPropNamePrefix();

        if(!!prefix) {
            if(propName.startsWith(prefix)) {
                base = RNav_Utils.substringAfter(
                    propName, this.getPropNamePrefix()
                );
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

        const setter = function(propValue) {
            return this.setProp(propName, propValue);
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

        const getter = function() {
            return this.getProp(propName);
        };

        this[this.assembleGetterName(propName)] = getter;
    
        return this;
    }

    setProps(props) {

        for(let propName in props) {
            
            this[propName] = props[propName];
        
            if(!this.hasSetter(propName)) 
                this.defineSetter(propName);

            if(!this.hasGetter(propName)) 
                this.defineGetter(propName);                
        }

        return this;
    }

    declare(...args) {

        const props = {};
    
        args.forEach(arg => {props[arg] = undefined;});
    
        this.setProps(props);

        return this;
    }

    isFuncName(methodName) {
        return RNav_Generic.funcNameBeginnings.some(prefix =>
            methodName.startsWith(prefix) && 
            methodName.length > prefix.length &&
            !/[a-z]/.test(methodName[prefix.length])
        );
    }

    inject(injectee, propName = undefined) {

        if(!!propName)
            this.declare(propName);

        const injecteePropName = propName || this.generateId(injectee);

        this[injecteePropName] = injectee; 

        Object.keys(injectee).forEach(
            methodName => {
                if(!this.hasOwnProperty(methodName) && this.isFunc(injectee[methodName])) {  
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
    

}