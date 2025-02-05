const zoo = new RNav_Tasker();

const cage1 = new RNav_Tasker(zoo);
const cage2 = new RNav_Tasker(zoo);

class Animal extends RNav_Tasker {

    constructor(chief) {
        super(chief);
        this.declare('name');
    }

    handle__open_zoo(task) {
        console.log(`Hi, I'm ${this.getName()}!`);
    }

    handle__funny_visitor(task) {
        console.log(`${this.getName()}: ha-ha!`);
    }

    handle__personal_request(task) {
        console.log(`${this.getName()}: personal request!`);
        this.terminateTask(task);
    }
}

const hippoHubert = (new Animal(cage1)).setName('Hubert');
const gorillaLisa = (new Animal(cage2)).setName('Lisa');

zoo.doTask((new RNav_Task('open_zoo')).makeSinker());
gorillaLisa.doTask((new RNav_Task('funny_visitor')).makePublic());
gorillaLisa.doTask((new RNav_Task('personal_request')).makePublic());


const fsm  = (new RNav_FiniteStateMachine()).defineFromPlantUML(
    `[*] --> sleeping
     sleeping --> hungry   : open_zoo
     hungry   --> well_fed : food
     hungry   --> angry    : close_zoo
     well_fed --> sleeping : close_zoo
     angry    --> hungry   : close_zoo`
);

console.log(fsm.transRules);
console.log(`Current code: ${fsm.getCurrStateCode()}`);
fsm.transite('open_zoo');
console.log(`Current code: ${fsm.getCurrStateCode()}`);
fsm.transite('food');
console.log(`Current code: ${fsm.getCurrStateCode()}`);
fsm.transite('food');
console.log(`Current code: ${fsm.getCurrStateCode()}`);
fsm.transite('close_zoo');
console.log(`Current code: ${fsm.getCurrStateCode()}`);
