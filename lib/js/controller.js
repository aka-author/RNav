// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      controller.js                            (\(\
// Func:        Providing a base for all controllers     (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_Controller extends RNav_Tasker {

    constructor(chief, id = undefined) {
        super(chief, id);
        this.declare('appFlag', 'model');
    }

    hasModel() {
        return !!this.getModel();
    }

    createUnderControllers() {
        
    }

    bindModel(model) {
        model.setController(this);
        this.setModel(model).createUnderControllers();
        return this;
    }

    updateModel(taskTypeName, info = null) {
        if(!this.hasModel()) return this;
        const task = this.createTask(taskTypeName).setPayload(info);
        this.assignTask(this.getModel(), task);
        return this;
    }
}
