const zoo = new RNav_Tasker();

const cage1 = new RNav_Tasker(zoo);
const cage2 = new RNav_Tasker(zoo);

class Animal extends RNav_Tasker {

    constructor(chief) {
        super(chief);
        this.declare('name');
        this.defineFsm(
            `sleeping --> woke : open_zoo
             woke --> hungry : time_passed
             hungry --> well_fed : feeding
             well_fed --> hungry : time_passed
             well_fed --> sleeping : close_zoo
             hungry --> angry : close_zoo (rebel)
             angry --> well_fed : feeding`
        );
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
