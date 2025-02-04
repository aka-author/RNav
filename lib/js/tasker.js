// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      tasker.js                                (\(\
// Func:        Handling events and filfilling tasks     (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_Tasker extends RNav_Vertex {

    static taskHandlerNamePrefix = "handle__";

    constructor(chief, id = undefined) {
        super(chief, id);
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

    createTask(taskTypeName) {
        return new RNav_Task(taskTypeName).setInitiator(this);
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
                case RNnav_TASK_TYPE_PUBLIC: 
                    this.delegateTask(task).escalateTask(task);
                    break;
                case RNnav_TASK_TYPE_BUBBLE:
                    this.escalateTask(task);
                    break;
                case RNnav_TASK_TYPE_SINKER:
                    this.delegateTask(task);
                    break;
                case RNnav_TASK_TYPE_EVENED:
                    this.shareTask(task);
            }
            
            this.finishTask();
        }

        return this;
    }

    terminateTask(task) {
        task.terminate(this);
        return this;
    }

}