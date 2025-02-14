
const staticCfg = {
        'hippo': {'look': 'img/hippo.jpg'},
        'gorilla': {'look': 'img/gorilla.jpg'},
        'hog': {'look': 'img/hog.jpg'},
        'porcupine': {'look': 'img/porcupine.jpg'}
    }


class Animal extends RNav_DOMControl {

    buildDOMView() {

        const nProps = {
                '@src': this.getCfgParam(`${this.getId()}.look`)
            };

        const look = (new RNav_ImgMaker())
            .setOrigin(this).make().nestProps(nProps).getOne(); 
            
        return look;
    }

    handle_dom_click(task) {
        RNav_DOMUtils.startTremble(this.getDOMView(), 1, 100, 3000);
    }
} 

class Cage extends RNav_DOMControl {

    constructor(zoo) {
        super(zoo);
        this.declare('animal');
    }
} 

class Zoo extends RNav_DOMControl {

    constructor(contentArea) {
        super(contentArea);
        this.cage1 = this.createCage('hippo');
        this.cage2 = this.createCage('gorilla');
        this.cage3 = this.createCage('hog');
        this.cage4 = this.createCage('porcupine');
    }

    createCage(animalId) {
        const cage = new Cage(this);
        const animal = new Animal(cage, animalId);
        return cage.setAnimal(animal);
    }

    buildDOMView() {
        
        const vm = (new RNav_TableShellMaker())
            .setOrigin(this).setRows(2).setCols(2);
        
        vm.make().nestArgs(
            this.cage1.getDOMView(), this.cage2.getDOMView(),
            this.cage3.getDOMView(), this.cage4.getDOMView()
        );

        return vm.getOne();
    }
}


class Toolbar extends RNav_DOMControl {

    handle_dom_click(task) {
        console.log(task);
    }
}


class MyApp extends RNav_App {

    goOn() {
        console.log('Going on...');

        const page = new RNav_Page(this).usePresetControls();
        new Zoo(page.getById('content'));
        page.mountDOMView();
    }
}


var DEB_APP = null;

function main() {
    DEB_APP = (new MyApp('RNavDebApp')).start(staticCfg);
}