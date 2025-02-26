// * * ** *** ***** ******** ************* *********************
// Product:     Kit for Web-based Interactive Stand-alone Help
// Part:        Front-End JS library
// Module:      task.js                           (\(\
// Func:        Representing events and tasks     (^.^)  
// * * ** *** ***** ******** ************* *********************


const kwish_TASK_PRIVAT = 'privat';
const kwish_TASK_PUBLIC = 'public';
const kwish_TASK_BUBBLE = 'bubble';
const kwish_TASK_SINKER = 'sinker';
const kwish_TASK_EVENED = 'evened';


class kwish_Task extends kwish_Gear {

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
        return this.setPropagationStrategyCode(kwish_TASK_PUBLIC);
    }

    isPublic() {
        return this.getPropagationStrategyCode() === kwish_TASK_PUBLIC;
    }

    makePrivat() {
        return this.setPropagationStrategyCode(kwish_TASK_PRIVAT);
    }

    isPrivat() {
        return this.getPropagationStrategyCode() === kwish_TASK_PRIVAT;
    }

    makeBubble() {
        return this.setPropagationStrategyCode(kwish_TASK_BUBBLE);
    }

    isBubble() {
        return this.getPropagationStrategyCode() === kwish_TASK_BUBBLE;
    }

    makeSinker() {
        return this.setPropagationStrategyCode(kwish_TASK_SINKER);
    }

    isSinker() {
        return this.getPropagationStrategyCode() === kwish_TASK_SINKER;
    }

    makeEvened() {
        return this.setPropagationStrategyCode(kwish_TASK_EVENED);
    }

    isEvened() {
        return this.getPropagationStrategyCode() === kwish_TASK_EVENED;
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
        return !!e ? new kwish_Vect(e.clientX, e.clientY) : null;
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