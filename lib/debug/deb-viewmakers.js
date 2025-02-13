
const staticCfg = {
        'hippo': {'look': 'img/hippo.jpg'},
        'gorilla': {'look': 'img/gorilla.jpg'},
        'hog': {'look': 'img/hog.jpg'},
        'porcupine': {'look': 'img/porcupine.jpg'}
    }


class Animal extends RNav_Generic {

    makeView() {

        const look = (new RNav_ImgMaker())
            .setOrigin(this)
            .make({'@src': this.getCfgParam(`${this.getId()}.look`)})
            .getOne();    

        return look;
    }
} 

class Cage extends RNav_Generic {

    constructor() {
        super();
        this.declare('animal');
    }

    makeView() {
        return (new RNav_BoxShellMaker())
            .setOrigin(this)
            .make({'content': this.getAnimal().makeView()})
            .getOne();
    }
} 

class Zoo extends RNav_Generic {

    constructor() {
        super();
        this.cage1 = (new Cage(this)).setAnimal(new Animal('hippo'));
        this.cage2 = (new Cage(this)).setAnimal(new Animal('gorilla'));
        this.cage3 = (new Cage(this)).setAnimal(new Animal('hog'));
        this.cage4 = (new Cage(this)).setAnimal(new Animal('porcupine'));
    }

    makeView() {
        
        const vm = (new RNav_TableShellMaker())
            .setOrigin(this).setRows(2).setCols(2);
        
        vm.make()
            .nest('0_0', this.cage1.makeView())
            .nest('0_1', this.cage2.makeView())
            .nest('1_0', this.cage3.makeView())
            .nest('1_1', this.cage4.makeView());

        return vm.getDomElements()[0];
    }
}


class MyApp extends RNav_App {

    goOn() {
        console.log('Going on...');

        const zoo = new Zoo();

        const body = document.getElementsByTagName('body')[0];
        body.appendChild(zoo.makeView());
    }
}


var DEB_APP = null;

function main() {
    DEB_APP = (new MyApp('RNavDebApp')).start(staticCfg);
}