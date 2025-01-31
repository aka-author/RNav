// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      vertex.js                                (\(\
// Func:        Managing a tree of application objects   (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_Vertex extends RNav_Generic {

    static vertices = {};
    static app = null;

    constructor(upperVertex, id = undefined) {

        super(id);

        this.upperVertex = upperVertex;
        this.appFlag = false;
        this.id = id || this.generateId();
        this.underVertices = {};

        if(!!upperVertex)
            upperVertex.addUnderVertex(this);
    }

    hasUpperVertex() {
        return !!this.upperVertex;
    }

    getUpperVertex() {
        return this.upperVertex;
    }

    isApp() {
        return this.appFlag;
    }

    getApp() {
        return this.hasUpperVertex() ? this.getUpperVertex().getApp() : null;
    }

    getProp(propName) {

        if(!this.hasUsefulProp(propName) && !this.isApp())
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

    hasUnderVertex(vertexId) {
        return !!this.underVertices[vertexId];
    }

    addUnderVertex(vertex) {
        this.underVertices[vertex.getId()] = vertex;
        this.registerVertex(vertex);
        return this;
    }

    getVertex(vertexId = undefined) {

        if(!!vertexId)
            return RNav_Vertex.vertices[vertexId];
        
        return this.underVertices[Object.keys(this.underVertices)[0]];
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