// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      fsmachine.js                          (\(\
// Func:        Simulating a finite state machine     (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_FSMachine extends RNav_Equipment {

    constructor(id = undefined) {
        super(id);
        this.states = {};
        this.signals = {};
        this.transRules = {};
        this.declare('currStateCode', 'initStateCode');
    }

    parsePlantUML(fsmDef) {

        const defs = {'initStateCode': undefined, 'transitions': []};

        const initStateRegex = /\[\*\] --> (\w+)/;
        const transRegex = /^(\w+) --> (\w+) : (\w+)(?: (\[[\w\s]+\]))?(?: \w+\(\))?$/;

        for(const line of fsmDef.split('\n')) {

            let dryLine = RNav_Utils.dry(line);

            let match = dryLine.match(transRegex);
            if(!!match) {
                const [, currStateCode, newStateCode, signalCode, details, callbackText] = match;
                defs.transitions.push(
                    {
                        currStateCode: currStateCode,
                        newStateCode: newStateCode,
                        signalCode: signalCode,
                        details: details ? details : undefined,
                        callbackText: callbackText ? callbackText : undefined
                    }
                );
                continue;
            }

            match = dryLine.match(initStateRegex);
            if(!!match) 
                defs.initStateCode = match[1];
        }

        return defs;
    }

    addState(stateCode) {
        this.states[stateCode] = true;
        return this;
    }

    getStateCodes() {
        return Object.keys(this.states);
    }

    addSignal(signalCode) {
        this.signals[signalCode] = true;
        return this;
    }

    getSignalCodes() {
        return Object.keys(this.signals);
    }

    hasCallback() {
        return !!this.getCallback();
    }

    addTransRule(trans) {

        this.transRules[trans.currStateCode] ||= {};
        this.transRules[trans.currStateCode][trans.signalCode] ||= {};

        this.transRules[trans.currStateCode][trans.signalCode] = {
                'newStateCode': trans.newStateCode,
                'details': trans.details,
                'callbakText': trans.callbackText
            }

        return this;
    }

    defineFromPlantUML(plantUMLText) {
        const defs = this.parsePlantUML(plantUMLText);
        this.setInitStateCode(defs.initStateCode);
        this.setCurrStateCode(defs.initStateCode);
        this.defineTransRules(defs.transitions);
        return this;
    }

    getTransRule(currStateCode, signalCode) {

        if(!!this.transRules[currStateCode]) {
            if(!!this.transRules[currStateCode][signalCode])
                return this.transRules[currStateCode][signalCode];
        }

        return null;
    }

    defineTransRules(transitions) {

        for(const trans of transitions) 
            this.addState(trans.currStateCode)
                .addState(trans.newStateCode)
                .addSignal(trans.signalCode)
                .addTransRule(trans);
        
        return this;
    }

    setCurrStateCode(newStateCode) {
        this.currStateCode = newStateCode;
        this.setSingleServicedProp(newStateCode);
        return this;
    }

    restart() {
        return this.setCurrStateCode(currStateCode);
    }

    updateServicedProp() {

        if (this.hasServicedObject()) {
            
            const propName = this.getServicedPropNames()[0];
            
            if (!!propName) {
                this.getServicedObject()
                    .setProp(propName, this.getCurrStateCode());
            }
        }

        return this;
    }
 
    transite(signalCode, payload = undefined) {
        
        const oldStateCode = this.getCurrStateCode();
        const transRule = this.getTransRule(oldStateCode, signalCode);

        if(!!transRule) {
            const newStateCode = transRule.newStateCode;
            this.setCurrStateCode(newStateCode)
                .callBack(
                    {
                        'oldStateCode': oldStateCode, 
                        'newStateCode': newStateCode,
                        'payload': payload
                    }
                );
        }

        this.updateServicedProp();

        return this;
    }
}