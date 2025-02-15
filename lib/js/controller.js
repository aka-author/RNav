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

    bindModel(model) {
        this.setModel(model);
        model.setController(this);
        return this;
    }

    simulate(taskTypeName, info = null) {
        if(!this.hasModel()) return this;
        const task = this.createTask(taskTypeName).setPayload(info);
        this.assignTask(this.getModel(), task);
        return this;
    }
}
