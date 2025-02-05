// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      fsm.js                                (\(\
// Func:        Simulating a finite state machine     (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_FiniteStateMachine extends RNav_Generic {

    static signalHandlerNamePrefix = 'handle__';

    constructor(id = undefined) {
        super(id);
        this.states = {};
        this.signals = {};
        this.transRules = {};
        this.declare('initStateCode', 'currStateCode');
    }

    getHandlerNamePrefix() {
        return RNav_FiniteStateMachine.signalHandlerNamePrefix;
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
                .addTransRule(trans);
        
        return this;
    }

    restart() {
        return this.setCurrStateCode(this.getInitStateCode());
    }

    transite(signalCode) {
        
        const currStateCode = this.getCurrStateCode();
        const transRule = this.getTransRule(currStateCode, signalCode);

        if(!!transRule)
            this.setCurrStateCode(transRule.newStateCode);
        
        return this;
    }

    /*
    assembleSignalHandelrName(signalCode) {
        return `${this.getSignalHandlerNamePrefix()}${signalCode}`;
    }

    defineSignalHandlers() {

        const me = this;

        for(const signalCode of this.getSignalCodes()) {

            let handlerName = this.assembleSignalHandelrName(signalCode);

            this[handlerName] = (signalCode, payload = undefined) => {
                    return me.handleSignal(signalCode, payload);
                }
        }

        return this;
    }

    restart() {

    }
    
    cancelCurrentState(payload) {
        this.callback(RNav_FSM_CANCEL, currentStateCode, payload);
    }

    setState(newStateCode, payload) {
        this.callback(RNav_FSM_SET, newStateCode, payload);
        return this;
    }

    transite(newStateCode, payload) {

        return this.cancelCurrentState(payload)
            .callback(RNav_FSM_TRANSITE, newStateCode, payload)
            .setState(newStateCode, payload);
    }

    handleSignal(signalName) {

        const rule = this.getRule(this.getCurrentStateName(), signalName);

        this.setNewState(rule.newStateName);

        this.getOwner().doTask((new RNav_Task(rule.callbak)));
    } */
}