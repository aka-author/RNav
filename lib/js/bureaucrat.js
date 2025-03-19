// * * ** *** ***** ******** ************* *********************
// Product:     Kit for Web-based Interactive Stand-alone Help
// Part:        Front-End JS library
// Module:      tasker.js                                (\(\
// Func:        Handling events and filfilling tasks     (^.^)  
// * * ** *** ***** ******** ************* *********************


class kwish_Bureaucrat extends kwish_Vertex {

    static app = null;

    static taskHandlerNamePrefix = 'handle_';
    static fsmStateExitingTaskTypeNamePostfix = '_exiting';
    static fsmStateTransitTaskTypeNameInfix = '_';
    static fsmStateEnteredTaskTypeNamePostfix = '_entered';

    constructor(major, propsRec = {}, id = undefined) {
        super(major, propsRec, id);
    }

    // Public interface

    doTask(task) {

        if (this.verifySuggestedTask(task)) {

            task.registerAspirant(this);

            this.startTask(task);

            this.attemptTask(task);

            switch (task.getPropagationStrategyCode()) {
                case kwish_TASK_PUBLIC:
                    this.delegateTask(task).escalateTask(task);
                    break;
                case kwish_TASK_BUBBLE:
                    this.escalateTask(task);
                    break;
                case kwish_TASK_SINKER:
                    this.delegateTask(task);
                    break;
                case kwish_TASK_EVENED:
                    this.shareTask(task);
            }

            this.finishTask();
        }

        return this;
    }

    doCommand(taskTypeName, propagStrategy = kwish_TASK_PRIVAT, payload = null) {

        const task = this.createTask(taskTypeName);

        task.setPropagationStrategyCode(propagStrategy)
            .setPayload(payload);
        
        return this.doTask(task);
    }

    // Private interface

    createTask(taskTypeName) {
        return kwish_Bureaucrat.createTask(taskTypeName, this);
    }

    assignTask(assigneeTasker, task) {
        assigneeTasker.doTask(task);
        return this;
    }

    escalateTask(task) {

        if (this.hasMajor())
            this.assignTask(this.getMajor(), task);

        return this;
    }

    delegateTask(task) {

        for (const minorTasker of this) {

            if (!task.isActive()) break;

            this.assignTask(minorTasker, task);
        }

        return this;
    }

    shareTask(task) {

        if (this.hasChief()) {
            for (const siblingTasker of this.getChief()) {

                if (!task.isActive()) break;

                this.assignTask(siblingTasker, task);
            }
        }

        return this;
    }

    escalateCommand(taskTypeName, propagStrategy = kwish_TASK_PRIVAT, payload = null) {
        return this.getMajor().doCommand(taskTypeName, propagStrategy, payload);
    }

    tossUpCommand(taskName, payload = null) {
        return this.escalateCommand(taskName, kwish_TASK_BUBBLE, payload);
    }

    terminateTask(task) {
        task.terminate(this);
        return this;
    }

    installFSMachine(fsm, statePropName = undefined, umlDef = undefined) {

        fsm.setServicedObject(this)

        if (!!statePropName) {
            fsm.declareServicedProps(statePropName);
        }

        if (!!umlDef) {
            fsm.defineFromPlantUML(umlDef)
        }

        const me = this;
        if (!fsm.hasCallback()) {
            fsm.setCallback((info) => me.defaultFSMCallback(info))
        }

        for (const signalCode of fsm.getSignalCodes()) {

            const handlerName = this.assembleTaskHandlerName(signalCode);
            const bakName = this.bakExplicitHandler(handlerName);

            this[handlerName] = (task) => {

                fsm.transite(task.getTypeName(), task);

                if (!!bakName) {
                    me[bakName](task);
                }
                
            }
        }

        this.installEquipment(fsm, statePropName)
            .setProp(statePropName, fsm.getCurrStateCode());

        return this;
    }

    easyFSMachine(umlDef) {
        return this.installFSMachine(
            new kwish_FSMachine().defineFromPlantUML(umlDef),
            'easyFSMState'
        );
    }

    getApp() {
        return kwish_Bureaucrat.app;
    }

    // Overridable methods

    handleDefaultTask(task) { }

    startTask(task) { }

    finishTask(task) { }

    verifySuggestedTask(task) {
        return task.isActive() && !task.hasAspirant(this);
    }

    // Guts

    static getTaskHandlerNamePrefix() {
        return kwish_Bureaucrat.taskHandlerNamePrefix;
    }

    assembleTaskHandlerName(taskTypeName) {
        return `${kwish_Bureaucrat.getTaskHandlerNamePrefix()}${taskTypeName}`;
    }

    static createTask(taskTypeName, initiator) {
        const task = new kwish_Task(taskTypeName).setInitiator(initiator);
        return task;
    }

    hasTaskHandler(taskTypeName) {
        return !!this[this.assembleTaskHandlerName(taskTypeName)];
    }

    callTaskHandler(task) {

        const taskTypeName = task.getTypeName();

        if (this.hasTaskHandler(taskTypeName)) {
            this[this.assembleTaskHandlerName(taskTypeName)](task);
        } else {
            this.handleDefaultTask(task);
        }

        return this;
    }

    attemptTask(task) {
        return this.callTaskHandler(task);
    }

    becomeApp() {
        kwish_Bureaucrat.app = this;
        return this;
    }

    assembleFSMStateExitingTaskTypeName(stateName) {
        return `${stateName}${kwish_Bureaucrat.fsmStateExitingTaskTypeNamePostfix}`;
    }

    assembleFSMStateTransitTaskTypeName(stateName1, stateName2) {
        return `${stateName1}${kwish_Bureaucrat.fsmStateTransitTaskTypeNameInfix}${stateName2}`;
    }

    assembleFSMStateEnteredTaskTypeName(stateName) {
        return `${stateName}${kwish_Bureaucrat.fsmStateEnteredTaskTypeNamePostfix}`;
    }

    defaultFSMCallback(transInfo) {

        const exitingTask = this.createTask(
                this.assembleFSMStateExitingTaskTypeName(transInfo.oldStateCode)
            )

        const transitTask = this.createTask(
                this.assembleFSMStateTransitTaskTypeName(
                    transInfo.oldStateCode, 
                    transInfo.newStateCode
                )
            );
        
        const enteredTask = this.createTask(
                this.assembleFSMStateEnteredTaskTypeName(transInfo.newStateCode)
            )

        for (const task of [exitingTask, transitTask, enteredTask]) {
            this.doTask(task.setPayload(transInfo.payload).makePrivat());
        }

        return this;
    }

    bakExplicitHandler(handlerName) {

        const bakName = `_${handlerName}`;

        if (typeof this[handlerName] === 'function') {
            this[`_${handlerName}`] = this[handlerName];
            return bakName;
        }

        return false;
    }
}