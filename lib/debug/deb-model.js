
// Data

const staticCfg = {}

const src = {
    'zoo': {
        'name': 'The Zoo of Haifa', 
        'address': 'Mirkaz Carmel',
        'animals': [
            {
                'species': 'hippo', 
                'name': 'Hubert', 
                'dateOfBirth': '2010-04-18', 
                'look': 'hippo.jpg'
            },
            {
                'species': 'gorilla', 
                'name': 'James', 
                'dateOfBirth': '2012-10-01', 
                'look': 'gorilla.jpg'
            },
            {
                'species': 'hog', 
                'name': 'Lisa', 
                'dateOfBirth': '2015-09-15', 
                'look': 'hog.jpg'
            },
            {
                'species': 'porcupine', 
                'name': 'Shira', 
                'dateOfBirth': '2018-11-11', 
                'look': 'porcupine.jpg'
            }
        ]
    },
    'garbage': {
        'arnocles': 'shmarnocles'
    }
}

// Models

class AnimalModel extends RNav_Model {

    constructor(chief, id) {
        super(chief, id);
        this.declare('species', 'name', 'dateOfBirth', 'look', 'state');
        this.installFSMachine(
            new RNav_FSMachine()
                .defineFromPlantUML(
                    `[*] --> sleeping
                     sleeping --> hungry   : openZoo
                     hungry   --> wellFed  : food
                     wellFed  --> hungry   : getHungry
                     wellFed  --> sleeping : closeZoo`
                )
        )
    }

    import(srcObj) {
        this.setSpecies(srcObj.species)
            .setName(srcObj.name)
            .setDateOfBirth(new Date(srcObj.dateOfBirth))
            .setLook(srcObj.look);
        return this;
    }

    report(message) {
        console.log(`${this.getName()}: ${message}`);
    }

    handle_openZoo(task) {
        this.report(`I'm ${this.getName()}!`);
    }

    handle_hungry_entered(task) {
        this.control('hungry');
        this.report(`I'm hungry!`);
    }

    handle_wellFed_entered(task) {
        this.control('wellFed');
        const me = this;
        setTimeout(() => {me.doCommand('getHungry')}, 10000*Math.random());
        this.report(`I'm well-fed!`);
    }

}


class CageModel extends RNav_Model {

} 


class ZooModel extends RNav_Model {

    constructor(chief, id) {
        super(chief, id);
        this.declare('name', 'address');
        this.installFSMachine(
            new RNav_FSMachine()
                .defineFromPlantUML(
                    `[*] --> closed
                     closed --> open   : openZoo
                     open   --> closed : closeZoo`
                )
        )
    }

    import(srcObj) {
        this.setName(srcObj.name)
            .setAddress(srcObj.address);
        return this;
    }

    handle_open_entered(task) {
        this.control('ctrlOpenZoo')
        console.log('The zoo is open!');
    }

    handle_closed_entered(task) {
        console.log('The zoo is closed!');
    }
}


class ModelMaker extends RNav_ModelMaker {

    recognize(srcObj, chief, path) {

        if(path.match(/.*\/zoo$/)) 
            return new ZooModel(chief, 'zooModel').import(srcObj);

        if(path.match(/.*\/animals\[\d+\]$/)) {
            const id = `${srcObj.species}-${srcObj.name}`;
            const cageModel = new CageModel(chief, `${id}-cage`);            
            return new AnimalModel(cageModel, id).import(srcObj);    
        }
    } 
}


// Controllers

class AnimalCtrl extends RNav_DOMControl {

    assembleImgPath(filename) {
        return `img/${filename}`;
    }

    buildDOMView() {

        const nProps = {
                '@src': this.assembleImgPath(this.getModel().getLook())
            };

        const look = (new RNav_ImgMaker())
            .setOrigin(this).make().nestProps(nProps).getOne(); 
            
        return look;
    }

    handle_hungry(task) {
        RNav_DOMUtils.startTremble(this.getDOMView(), 1, 100, 999999999);
    }

    handle_wellFed(task) {
        RNav_DOMUtils.stopTremble(this.getDOMView());
    } 

    handle_dom_click(task) {
        this.simulate('food');
        this.terminateTask(task);
    }
} 


class CageCtrl extends RNav_DOMControl {

    constructor(zoo) {
        super(zoo);
        this.declare('animal');
    }
} 


class ZooCtrl extends RNav_DOMControl {

    constructor(contentArea) {
        super(contentArea);
    }

    createCageCtrl(cageModel) {
        const cageCtrl = new CageCtrl(this);
        const animalModel = cageModel.getOne();
        console.log(animalModel);
        const animalCtrl = new AnimalCtrl(cageCtrl).bindModel(animalModel);
        return cageCtrl.setAnimal(animalCtrl);
    }

    buildDOMView() {
        
        const vm = (new RNav_TableShellMaker())
            .setOrigin(this).setRows(2).setCols(2);
        
        vm.make();/*.nestArgs(
            this.cage1.getDOMView(), this.cage2.getDOMView(),
            this.cage3.getDOMView(), this.cage4.getDOMView()
        );*/

        return vm.getOne();
    }

    handle_ctrlOpenZoo(task) {
        console.log('Ctrl: open the zoo');
    }
}


class Toolbar extends RNav_DOMControl {

    handle_dom_click(task) {
        console.log(task);
    }
}


// Application

class MyApp extends RNav_App {

    goOn() {
        console.log('Going on...');

        new ModelMaker().import(src, this);

        const zooModel = this.getOne('zooModel');
        
        const pageCtrl = new RNav_Page(this).usePresetControls();
        const contentCtrl = this.getOne('content');

        const zooCtrl = new ZooCtrl(contentCtrl).bindModel(zooModel);

        for(const cageModel of zooModel) {
            zooCtrl.createCageCtrl(cageModel);
        }
            

        console.log(zooCtrl);
        pageCtrl.mountDOMView();

        this.doCommand('openZoo', RNav_TASK_SINKER);
    }
}


var DEB_APP = null;

function main() {
    DEB_APP = (new MyApp('RNavDebApp')).start(staticCfg);
}