const zoo = new kwish_Tasker();

const cage1 = new kwish_Tasker(zoo);
const cage2 = new kwish_Tasker(zoo);

class Animal extends kwish_Tasker {

    constructor(chief) {

        super(chief);
        this.declare('name');

        this.installFiniteStateMachine(
            (new kwish_FiniteStateMachine())
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

zoo.doTask((new kwish_Task('openZoo')).makeSinker());
gorillaLisa.doTask((new kwish_Task('funnyVisitor')).makePublic());
gorillaLisa.doTask((new kwish_Task('personalRequest')).makePublic());
hippoHubert.doTask((new kwish_Task('food')).makePrivat());
zoo.doTask((new kwish_Task('closeZoo')).makeSinker());

const fsm  = (new kwish_FiniteStateMachine()).defineFromPlantUML(
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
