// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      vertex.js                                (\(\
// Func:        Managing a tree of application objects   (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_Vertex extends RNav_Generic {

    static vertices = {};

    constructor(upperVertex, id = undefined) {

        super(id);

        this.upperVertex = upperVertex;
        this.appFlag = false;
        this.id = id || this.generateId();
        this.underVertices = {};

        if(!!upperVertex)
            upperVertex.addUnder(this);

        this.registerVertex(this);

        
    }

    hasUpper() {
        return !!this.upperVertex;
    }

    getUpper() {
        return this.upperVertex;
    }

    getProp(propName) {

        if(!this.hasUsefulProp(propName) && !this.hasUpperVertex())
            return this.getUpperVertex().getProp(propName);
        else
            return this[propName];
    }

    registerVertex(vertex) {
        RNav_Vertex.vertices[vertex.getId()] = vertex;
        return this;
    }

    unregisterVertex(vertexId) {
        delete RNav_Vertex.vertices[vertexId];
        return this;
    }

    isImpersonal() {
        return this.getId().endsWith(this.getImersonalIdPostfix());
    }

    registerAsChiefsProperty() {
        const props = {}
        props[this.getId()] = this;
        this.getChief().setProps(props);
        return this;
    }

    acceptUpperVertex() {

        if(!this.isImpersonal())
            this.registerAsChiefsProperty();

        return this;
    }

    setUpper(vertex) {
        this.upperVertex = vertex;
        this.acceptUpperVertex();
        return this;
    }

    hasUnder(vertexId) {
        return !!this.underVertices[vertexId];
    }

    addUnder(vertex) {
        this.underVertices[vertex.getId()] = vertex;
        vertex.setUpper(this);
        return this;
    }

    getById(vertexId = undefined) {

        if(!!vertexId)
            return RNav_Vertex.vertices[vertexId];
        
        return this.underVertices[Object.keys(this.underVertices)[0]];
    }

    countUnder() {
        return Object.keys(this.underVertices).length;
    }

    *[Symbol.iterator]() {
        for(const underVertexId of Object.keys(this.underVertices)) 
            yield this.underVertices[underVertexId];
    }

    forEach(callback) {

        for(const underVertex of this) 
            callback(underVertex);

        return this;
      }
    
}