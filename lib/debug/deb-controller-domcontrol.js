const zoo = new RNav_Tasker();

const cage1 = new RNav_Tasker(zoo);
const cage2 = new RNav_Tasker(zoo);

class Animal extends RNav_Tasker {

    constructor(chief) {

        super(chief);
        this.declare('name');

        this.installFiniteStateMachine(
            (new RNav_FiniteStateMachine())
                .defineFromPlantUML(
                    `[*] --> sleeping
                    sleeping --> hungry   : openZoo
                    hungry   --> wellFed  : food
                    hungry   --> angry    : closeZoo
                    wellFed  --> sleeping : closeZoo
                    angry    --> hungry   : openZoo`
                )
        );

    }    

    handle_angry_entered(task) {
        console.log(`${this.getName()}: I'm angry!`)
    }

    handle_funnyVisitor(task) {
        console.log(`${this.getName()}: ha-ha!`);
    }

    handle_hungry_entered(task) {
        console.log(`Hi, I'm ${this.getName()}!`);
        console.log(`${this.getName()}: I'm hungry!`)
    }

    handle_personalRequest(task) {
        console.log(`${this.getName()}: personal request!`);
        this.terminateTask(task);
    }

    handle_sleeping_entered(task) {
        console.log(`${this.getName()}: I go to bed!`)
    }
}

const hippoHubert = (new Animal(cage1)).setName('Hubert');
const gorillaLisa = (new Animal(cage2)).setName('Lisa');

zoo.doTask((new RNav_Task('openZoo')).makeSinker());
gorillaLisa.doTask((new RNav_Task('funnyVisitor')).makePublic());
gorillaLisa.doTask((new RNav_Task('personalRequest')).makePublic());
hippoHubert.doTask((new RNav_Task('food')).makePrivat());
zoo.doTask((new RNav_Task('closeZoo')).makeSinker());

const fsm  = (new RNav_FiniteStateMachine()).defineFromPlantUML(
    `[*] --> sleeping
     sleeping --> hungry   : openZoo
     hungry   --> well_fed : food
     hungry   --> angry    : openZoo
     wellFed  --> sleeping : openZoo
     angry    --> hungry   : openZoo`
).setCallback((info) => console.log(info));

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
