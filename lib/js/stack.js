// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      stack.js                                 (\(\
// Func:        Keeping a stack attached to some object  (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_Stack extends RNav_Equipment {

    constructor(id = undefined) {
        super(id);
        this.stackEntries = [];
    }

    push() {
        const stackEntry = {'RNav_pushedAt': performance.now()};
        for(const propName of this.getServicedPropNames())
            stackEntry[propName] = this.getServicedProp(propName);
        this.stackEntries.push(stackEntry);
        return this;
    }

    pop() {
        const stackEntry = this.stackEntries.pop();
        for(const propName of this.getServicedPropNames()) 
            this.setServicedProp(propName, stackEntry[propName]);
        return this; 
    }

    getDepth() {
        return this.stackEntries.length;
    }

    getEntry(depth) {
        return this.stackEntries[this.stackEntries.length - 1 - depth];
    }

    restart() {
        this.stackEntries = [];
        return this;
    }
}