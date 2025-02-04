// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      task.js                           (\(\
// Func:        Representing events and tasks     (^.^)  
// * * ** *** ***** ******** ************* *********************


const RNnav_TASK_TYPE_PRIVAT = 'privat';
const RNnav_TASK_TYPE_PUBLIC = 'public';
const RNnav_TASK_TYPE_BUBBLE = 'bubble';
const RNnav_TASK_TYPE_SINKER = 'sinker';
const RNnav_TASK_TYPE_EVENED = 'evened';


class RNav_Task extends RNav_Generic {

    constructor(typeName) {
        
        super();
        
        this.declare(
            "activeFlag",
            "DOMEvent",
            "initiator",
            "originalTask",
            "payload",
            "propagationStrategyCode",
            "terminator",
            "typeName"
        );

        this.reset().setTypeName(typeName).makeBubble();     
    }

    isActive() {
        return this.getActiveFlag();
    }

    terminate(terminatingTasker) {
        return this.setActiveFlag(false).setTerminator(terminatingTasker);
    }

    makePublic() {
        return this.setPropagationStrategyCode(RNnav_TASK_TYPE_PUBLIC);
    }

    isPublic() {
        return this.getPropagationStrategyCode() === RNnav_TASK_TYPE_PUBLIC;
    }

    makePrivat() {
        return this.setPropagationStrategyCode(RNnav_TASK_TYPE_PRIVAT);
    }

    isPrivat() {
        return this.getPropagationStrategyCode() === RNnav_TASK_TYPE_PRIVAT;
    }

    makeBubble() {
        return this.setPropagationStrategyCode(RNnav_TASK_TYPE_BUBBLE);
    }

    isBubble() {
        return this.getPropagationStrategyCode() === RNnav_TASK_TYPE_BUBBLE;
    }

    makeSinker() {
        return this.setPropagationStrategyCode(RNnav_TASK_TYPE_SINKER);
    }

    isSinker() {
        return this.getPropagationStrategyCode() === RNnav_TASK_TYPE_SINKER;
    }

    makeEvened() {
        return this.setPropagationStrategyCode(RNnav_TASK_TYPE_EVENED);
    }

    isEvened() {
        return this.getPropagationStrategyCode() === RNnav_TASK_TYPE_EVENED;
    }

    hasOriginalTask() {
        return !!this.getOriginalTask();
    }

    registerAspirant(aspirantTasker) {
        this.aspirants[aspirantTasker.getId()] = aspirantTasker;
        return this;
    }

    hasAspirant(aspirantTasker) {
        return !!this.aspirants[aspirantTasker.getId()];
    }

    hasDOMEvent() {
        return !!this.getDOMEvent();
    }

    getDOMTarget() {
        const e = this.getDOMEvent();
        return !!e ? e.target : null; 
    }

    getDOMClientVect() {
        const e = this.getDOMEvent();
        return !!e ? new RNav_Vect(e.clientX, e.clientY) : null;
    }

    addAspirantNote(aspirantTasker, note) {

        this.aspirantNotes.push(
            {
                'aspirantTaskerId': aspirantTasker.getId(), 
                'note': note
            }
        );

        return this;
    }

    getAspirantNotes() {
        return this.aspirantNotes;
    }

    reset() {
        this.setActiveFlag();
        this.aspirants = {};
        this.aspirantNotes = [];
        this.setPayload(null);
        return this;
    }
}