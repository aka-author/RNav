// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      model.js                             (\(\
// Func:        Managing models                      (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_Model extends RNav_Bureaucrat {

    constructor(major, id = undefined) {
        super(major, id);
        this.declare('controller');
    }

    import(srcObj) {
        this.safeSetProps(srcObj);
        return this;
    }

    hasController() {
        return !!this.getController();
    }

    updateController(taskTypeName, info = null) {
        if(!this.hasController()) return this;
        const task = this.createTask(taskTypeName).setPayload(info);
        this.assignTask(this.getController(), task);
        return this;
    }


}