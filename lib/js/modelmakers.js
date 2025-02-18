// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      model.js                             (\(\
// Func:        Creating and and importing models    (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_ModelMaker extends RNav_Gear {

    constructor(id = undefined) {
        super(id);
        this.declare('rootModels').reset();
    }

    reset() {
        return this.setRootModels([]);
    }

    recognize(srcObj, chief, path) {
        return null;
    }

    import(srcObj, chief = null, path = '') {

        let nextChief = null;
        
        if (typeof srcObj !== 'object' || srcObj === null) return this;
        
        const detectedModel = this.recognize(srcObj, chief, path);

        if(!!detectedModel) {
            if (chief === null) this.getRootModels().push(detectedModel);
            nextChief = detectedModel;
        } else
            nextChief = chief;

        if(Array.isArray(srcObj)) {
            srcObj.forEach((item, index) => {
                this.import(item, nextChief, `${path}[${index}]`);
            });
        } else {
            for (const key in srcObj) {
                this.import(srcObj[key], nextChief, `${path}/${key}`);
            }
        }

        return this;
    }    

    hasModels() {
        return this.getRootModels().length > 0;
    }

    getAllRootModels() {
        return this.getRootModels();
    }

    getOneRootModel() {
        return this.getAll()[0]
    }
}