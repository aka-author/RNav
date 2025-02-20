
// Data

const staticCfg = {
    'system': {
        'imagePath': 'img',
        'messages': {
            'goOn': 'Going on...'
        }
    },
    'animal': {
        'tremble': {
            'amplitude': 5,
            'period': 100,
            'duration': 999999
        },
        'messages': {
            'iam': "I'm",
            'hungry': "I'm hungry!",
            'wellfed': "I'm well-fed!"
        }
    },
    'zoo': {
        'design': {
            'nColumns': 3
        },
        'messages': {
            'open': 'The Zoo is open!',
            'close': 'The Zoo is closed!'
        }
    }
}

const zooDataset = {
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
            },
            {
                'species': 'toad',
                'name': 'Plato',
                'dateOfBirth': '2020-02-20',
                'look': 'toad.jpg'
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
        this.easyFSMachine(
            `[*] --> sleeping
            sleeping --> hungry   : openZoo
            hungry   --> wellFed  : food
            wellFed  --> hungry   : getHungry
            wellFed  --> sleeping : closeZoo`
        )
    }

    report(message) {
        console.log(`${this.getName()}: ${message}`);
    }

    handle_openZoo(task) {
        this.report(
            `${this.getCfgParam('animal.messages.iam')} ${this.getName()}!`
        );
    }

    handle_hungry_entered(task) {
        this.updateController('hungry');
        this.report(this.getCfgParam('animal.messages.hungry'));
    }

    handle_wellFed_entered(task) {
        this.updateController('wellFed');
        const me = this;
        setTimeout(() => { me.doCommand('getHungry') }, 10000 * Math.random());
        this.report(this.getCfgParam('animal.messages.wellfed'));
    }
}

class CageModel extends RNav_Model {

}

class ZooModel extends RNav_Model {

    constructor(chief, id) {
        super(chief, id);
        this.declare('name', 'address');
        this.easyFSMachine(
            `[*] --> closed
            closed --> open   : openZoo
            open   --> closed : closeZoo`
        )
    }

    handle_open_entered(task) {
        this.updateController('ctrlOpenZoo')
        console.log(this.getCfgParam('zoo.messages.open'));
    }

    handle_closed_entered(task) {
        console.log(this.getCfgParam('zoo.messages.close'));
    }
}

class ModelMaker extends RNav_ModelMaker {

    recognize(srcObj, chief, path) {

        if (path.match(/.*\/zoo$/))
            return new ZooModel(chief, 'zooModel').import(srcObj);

        if (path.match(/.*\/animals\[\d+\]$/)) {
            const id = `${srcObj.species}-${srcObj.name}`;
            const cageModel = new CageModel(chief, `${id}-cage`);
            return new AnimalModel(cageModel, id).import(srcObj);
        }
    }
}

// Controllers

class AnimalCtrl extends RNav_DOMControl {

    assembleImgPath(filename) {
        return `${this.getCfgParam('system.imagePath')}/${filename}`;
    }

    makeDOMView() {

        const nProps = {
            '@src': this.assembleImgPath(this.getModel().getLook())
        };

        const look = (new RNav_ImgMaker())
            .setOrigin(this).nestProps(nProps).provideOneElement();
        
        return look;
    }

    handle_hungry(task) {
        RNav_DOMUtils.startTremble(this.getDOMView(),
            this.getCfgParam('animal.tremble.amplitude'),
            this.getCfgParam('animal.tremble.period'),
            this.getCfgParam('animal.tremble.duration')
        );
    }

    handle_wellFed(task) {
        RNav_DOMUtils.stopTremble(this.getDOMView());
    }

    handle_dom_click(task) {
        this.updateModel('food');
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

    createCageCtrl(cageModel) {
        const cageCtrl = new CageCtrl(this);
        const animalModel = cageModel.getMinor();
        const animalCtrl = new AnimalCtrl(cageCtrl).bindModel(animalModel);
        return cageCtrl.setAnimal(animalCtrl);
    }

    createMinorControllers() {
        for (const animal of this.getModel())
            this.createCageCtrl(animal);
    }

    makeDOMView() {

        const nCols = this.getCfgParam('zoo.design.nColumns') || 4;
        const nRows = Math.ceil(this.getModel().countMinors() / nCols) || 4;

        const vm = (new RNav_TableShellMaker())
            .setOrigin(this).setRows(nRows).setCols(nCols)
            .nestArgs(...Array.from(this, cageCtrl => cageCtrl.provideDOMView()));
        return vm.provideOneElement();
    }

    handle_ctrlOpenZoo(task) {
        //console.log('Ctrl: open the zoo');
    }
}

class PrintButton extends RNav_IconicButton {

    constructor(major, propsRec) {

        propsRec.iconSpotsDef = {
                'defaultIconSpotName': propsRec.enabledState,
                'icons': [
                    {
                        'spotName': 'enabled', 
                        'altText':  'Print (enabled)',
                        'fileName': 'print-enabled.svg'
                    },
                    {
                        'spotName': 'disabled', 
                        'altText':  'Print (disable)',
                        'fileName': 'print-disabled.svg'
                    }
                ]
            }

        super(major, propsRec, 'printButton');
    }

    performButtonAction(task) {
        console.log(`Let's print the Zoo!`);
    }

    handle_enablePrint(task) {
        this.doCommand('enable');
    }
    
    handle_disablePrint(task) {
        this.doCommand('disable');
    }
}

class TextDirectionButton extends RNav_FlipFlopButton {

    constructor(major, propsRec) {
    
        propsRec.iconSpotsDef = {
                'defaultIconSpotName': propsRec.buttonState,
                'icons': [
                    {
                        'spotName': 'flipped', 
                        'altText':  'Left-to-right',
                        'fileName': 'dir-ltr.svg'
                    },
                    {
                        'spotName': 'flopped', 
                        'altText':  'Right-to-left',
                        'fileName': 'dir-rtl.svg'
                    }
                ]
            }
        
        super(major, propsRec, 'textDirectionButton');
    }

    performButtonAction(task) {
        console.log(`RTL`);
    }

}

class Toolbar extends RNav_DOMControl {

    constructor(major, id) {
        super(major, id);
        this.createMinorControllers();
    }

    createPrintButton() {
        
        const propsRec = {
            'enabledState': 'disabled',
            'imagePath': this.getCfgParam('system.imagePath')
        }

        new PrintButton(this, propsRec);

        return this;
    }

    createTextDirectionButton() {

        const propsRec = {
            'buttonState': 'flipped',
            'imagePath': this.getCfgParam('system.imagePath')
        }

        new TextDirectionButton(this, propsRec);

        return this;
    }

    createMinorControllers() {
        
        this.createPrintButton()
            .createTextDirectionButton()

        return this;
    }

    handle_dom_click(task) {
        console.log(task);
    }
}

// Application

class ZooGameApp extends RNav_App {

    goOn() {
        console.log(this.getCfgParam('system.messages.goOn'));

        // Building models
        new ModelMaker().import(zooDataset, this);
        const zooModel = this.getGear('zooModel');

        // Building controllers
        const pageCtrl = new RNav_Page(this).usePresetControls();
        const contentCtrl = this.getGear('content');
        new ZooCtrl(contentCtrl).bindModel(zooModel);

        // Building views
        pageCtrl.mountDOMView();

        // Beginning the gameplay
        this.doCommand('openZoo', RNav_TASK_SINKER);
        //this.doCommand('disablePrint', RNav_TASK_SINKER);
    }
}

// Initializing and launching the application

var DEB_APP = null;

function main() {

    console.log('Persistent objects: ', RNav_Gear.gears);
    
    DEB_APP = (new ZooGameApp('RNavDebApp')).start(staticCfg);
}