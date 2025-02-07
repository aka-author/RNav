// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      tasker.js                                (\(\
// Func:        Handling events and filfilling tasks     (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_Tasker extends RNav_Vertex {

    static taskHandlerNamePrefix = 'handle_';
    static fsmStateExitingTaskTypeNamePostfix = '_exiting';
    static fsmStateTransitTaskTypeNameInfix = '_';
    static fsmStateEnteredTaskTypeNamePostfix = '_entered';

    constructor(chief, id = undefined) {
        super(chief, id);
        this.fsms = {};
    }

    setChief(tasker) {
        return this.setUpperVertex(tasker);
    }

    hasChief() {
        return this.hasUpperVertex();
    }

    getChief() {
        return this.getUpperVertex();
    }

    static getTaskHandlerNamePrefix() {
        return RNav_Tasker.taskHandlerNamePrefix;
    }

    assembleTaskHandlerName(taskTypeName) {
        return `${RNav_Tasker.getTaskHandlerNamePrefix()}${taskTypeName}`;
    }

    static createTask(taskTypeName) {
        return new RNav_Task(taskTypeName).setInitiator(this);
    }

    createTask(taskTypeName) {
        return RNav_Tasker.createTask(taskTypeName);
    }

    assignTask(assigneeTasker, task) {
        assigneeTasker.doTask(task);
        return this; 
    }

    escalateTask(task) {

        if(this.hasChief())
            this.assignTask(this.getChief(), task);

        return this;
    }

    delegateTask(task) {

        for(const underTasker of this) {
            if(task.isActive())
                this.assignTask(underTasker, task);
            else
                break;
        }

        return this;
    }

    shareTask(task) {

        if(this.hasChief()) {
            for(const siblingTasker of this.getChief()) {
                if(task.isActive())
                    assignTask(siblingTasker, task);
                else
                    break;
            }
        }

        return this;
    } 

    hasTaskHandler(taskTypeName) {
        return !!this[this.assembleTaskHandlerName(taskTypeName)];
    }

    handleDefaultTask(task) { }

    callTaskHandler(task) {

        const taskTypeName = task.getTypeName();

        if(this.hasTaskHandler(taskTypeName)) 
            this[this.assembleTaskHandlerName(taskTypeName)](task);
        else 
            this.handleDefaultTask(task);

        return this;
    }

    startTask(task) { }

    finishTask(task) { }

    attemptTask(task) {
        return this.callTaskHandler(task);
    }

    verifySuggestedTask(task) {
        return task.isActive() && !task.hasAspirant(this);
    }

    doTask(task) {

        if(this.verifySuggestedTask(task)) {
        
            task.registerAspirant(this);
            
            this.startTask(task);

            this.attemptTask(task);
            
            switch(task.getPropagationStrategyCode()) {
                case RNav_TASK_PUBLIC: 
                    this.delegateTask(task).escalateTask(task);
                    break;
                case RNav_TASK_BUBBLE:
                    this.escalateTask(task);
                    break;
                case RNav_TASK_SINKER:
                    this.delegateTask(task);
                    break;
                case RNav_TASK_EVENED:
                    this.shareTask(task);
            }
            
            this.finishTask();
        }

        return this;
    }

    doCommand(taskTypeName, propagStrategy = RNav_TASK_PRIVAT) {
        const task = new RNav_Task(taskTypeName);
        task.setPropagationStrategyCode(propagStrategy);
        return this.doTask(task);
    }

    escalateCommand(taskTypeName, propagStrategy = RNav_TASK_PRIVAT) {
        return this.getChief().doCommand(taskTypeName, propagStrategy);
    }

    terminateTask(task) {
        task.terminate(this);
        return this;
    }

    assembleFSMStateExitingTaskTypeName(stateName) {
        return `${stateName}${RNav_Tasker.fsmStateExitingTaskTypeNamePostfix}`;
    }

    assembleFSMStateTransitTaskTypeName(stateName1, stateName2) {
        return `${stateName1}${RNav_Tasker.fsmStateTransitTaskTypeNameInfix}${stateName2}`;
    }

    assembleFSMStateEnteredTaskTypeName(stateName) {
        return `${stateName}${RNav_Tasker.fsmStateEnteredTaskTypeNamePostfix}`;
    }

    defaultFSMCallback(transInfo) {

        const exitingTask = new RNav_Task(
                this.assembleFSMStateExitingTaskTypeName(transInfo.oldStateCode)
            );

        const transitTask = new RNav_Task(
                this.assembleFSMStateTransitTaskTypeName(
                    transInfo.oldStateCode, transInfo.newStateCode
                )
            );    

        const enteredTask = new RNav_Task(
                this.assembleFSMStateEnteredTaskTypeName(transInfo.newStateCode)
            );

        for(const task of [exitingTask, transitTask, enteredTask]) 
            this.doTask(task.setPayload(transInfo.payload).makePrivat());

        return this;
    }

    installFiniteStateMachine(fsm) {

        this.fsms[fsm.getId()] = fsm;

        const me = this;
        if(!fsm.hasCallback())
            fsm.setCallback((info) => me.defaultFSMCallback(info))

        for(const signalCode of fsm.getSignalCodes()) {
            const handlerName = this.assembleTaskHandlerName(signalCode);
            this[handlerName] = (task) => {
                fsm.transite(task.getTypeName(), task)
            }
        }

        return this;
    }
}