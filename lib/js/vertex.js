// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      vertex.js                                (\(\
// Func:        Managing a tree of application objects   (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_Vertex extends RNav_Gear {

    constructor(majorVertex, propsRec = {}, id = undefined) {

        super(propsRec, id);

        this.setProps(
            {
                'major': majorVertex,
                'minors': {},
                'appFlag': false,
            }
        );
        
        if (!!majorVertex) {
            majorVertex.addMinor(this);
        }       
    }

    // Public interface

    getProp(propName) {

        if (!this.hasUsefulProp(propName) && !this.hasMajor()) {
            return this.getMajor().getProp(propName);
        } else {
            return this[propName];
        }
    }

    hasMajor() {
        return !!this.major;
    }
    
    setMajor(vertex) {
        this.major = vertex;
        this.acceptMajorVertex();
        return this;
    }

    hasMinor(vertexId) {
        return !!this.minors[vertexId];
    }

    countMinors() {
        return Object.keys(this.minors).length;
    }

    addMinor(vertex) {
        this.minors[vertex.getId()] = vertex;
        vertex.setMajor(this);
        return this;
    }

    getMinorIds() {
        return Object.keys(this.minors);
    }

    getMinor(vertexId = undefined) {
        
        const actualId = vertexId || this.getMinorIds()[0];
        
        if (!this.hasMinor(actualId)) {
            throw this.createGearError(`Vertex #${actualId} does not exist`);
        }
        
        return this.minors[actualId];
    }

    getMinorByIndex(idx) {

        if (idx >= this.countMinors()) {
            throw this.createGearError(`Getting #${idx} of ${this.countMinors()}`);
        }

        return this.getMinor(Object.keys(this.minors)[idx]);
    }

    forEach(callback) {

        for(const minor of this) {
            callback(minor);
        }

        return this;
    }

    // Guts

    registerAsMajorsProperty() {
        const props = {}
        props[this.getId()] = this;
        this.getMajor().setProps(props);
        return this;
    }

    acceptMajorVertex() {

        if (!this.isDisposable()) {
            this.registerAsMajorsProperty();
        }

        return this;
    }

    *[Symbol.iterator]() {
        for(const minorId of this.getMinorIds()) {
            yield this.minors[minorId];
        }
    }    
}