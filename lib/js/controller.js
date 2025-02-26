// * * ** *** ***** ******** ************* *********************
// Product:     Kit for Web-based Interactive Stand-alone Help
// Part:        Front-End JS library
// Module:      controller.js                            (\(\
// Func:        Providing a base for all controllers     (^.^)  
// * * ** *** ***** ******** ************* *********************


class kwish_Controller extends kwish_Bureaucrat {

    constructor(chief, propsRec = {}, id = undefined) {

        super(chief, propsRec, id);
        
        this.declare('model');
    }

    // Public interface

    hasModel() {
        return !!this.getModel();
    }

    bindModel(model) {
        model.setController(this);
        this.setModel(model).createMinorControllers();
        return this;
    }

    updateModel(taskTypeName, info = null) {
        if(!this.hasModel()) return this;
        const task = this.createTask(taskTypeName).setPayload(info);
        this.assignTask(this.getModel(), task);
        return this;
    }

    // Overridable methods

    createMinorControllers() {}
}
