// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      equipment.js                          (\(\
// Func:        The base for FSMachine, Stack, etc.   (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_Equipment extends RNav_Gear {

    constructor(id = undefined) {
        super(id);
        this.declare('callback', 'servicedObject', 'servicedPropNames')
            .setServicedPropNames([]);
    }

    declareServicedProps(...propNames) {
        
        this.setServicedPropNames(propNames);
        return this;
    }

    hasServicedObject() {
        return !!this.getServicedObject();
    }

    setServicedProp(propName, newPropValue) {
        const servicedObject = this.getServicedObject();
        let setterName = servicedObject.assembleSetterName(propName);
        servicedObject[setterName](newPropValue);
        return this;
    }

    getServicedProp(propName) {
        const servicedObject = this.getServicedObject();
        let getterName = servicedObject.assembleGetterName(propName);
        return servicedObject[getterName]();
    }

    getSingleServicedPropName() {
        return this.servicedPropNames[0];
    }

    setSingleServicedProp(propValue) {

        const servicedPropName = this.getSingleServicedPropName();
        if(!!servicedPropName) 
            this.setServicedProp(servicedPropName, propValue);

        return this;
    }

    hasCallback() {
        return !!this.getCallback();
    }

    callBack(...args) {

        if(this.hasCallback())
            return this.getCallback()(...args);

        return undefined;
    }

    restart() {
        throw new Error(`RNav ERROR: ${this.getClassName()}.restart() must be defined.`);
    }
}