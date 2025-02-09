// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      tags.js                            (\(\
// Func:        Arranging and checking tags        (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_Tags {

    constructor(...args) {
        this.tagsSet = new Set([...args]);
    }

    add(...taglist) {
        this.tagsSet = new Set([...taglist]);
        return this;
    }

    mergeTags(tags) {
        this.tagsSet = new Set([...this.list(), ...tags.list()]);
        return this;
    }

    list() {
        return Array.from(this.tagsSet);
    }

    select(...taglist) {
        return taglist.filter(tag => this.tagsSet.has(tag));    
    }

    has(...taglist) {
        return this.select(...taglist).length > 0;
    }

    hasAll(...taglist) {
        return taglist.every(tag => this.tagsSet.has(tag));
    }

    selectOne(...taglist) {
        return this.select(...taglist)[0];
    }

    hasOne(...taglist) {
        return !!this.selectOne(...taglist);
    }
}
