
const staticCfg = {
        'hippo': {'look': 'img/hippo.jpg'},
        'gorilla': {'look': 'img/gorilla.jpg'},
        'hog': {'look': 'img/hog.jpg'},
        'porcupine': {'look': 'img/porcupine.jpg'}
    }


class Animal extends RNav_DOMControl {

    makeView() {

        const look = (new RNav_ImgMaker())
            .setOrigin(this)
            .make({'@src': this.getCfgParam(`${this.getId()}.look`)})
            .getOne(); 
            
        this.bindDOMView(look);
            
        return look;
    }

    handle_dom_click(task) {
        RNav_DOMUtils.startTremble(this.getDOMView(), 1, 100, 3000);
    }
} 

class Cage extends RNav_DOMControl {

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

class Zoo extends RNav_DOMControl {

    constructor() {
        super();
        this.cage1 = (new Cage(this)).setAnimal(new Animal(this, 'hippo'));
        this.cage2 = (new Cage(this)).setAnimal(new Animal(this, 'gorilla'));
        this.cage3 = (new Cage(this)).setAnimal(new Animal(this, 'hog'));
        this.cage4 = (new Cage(this)).setAnimal(new Animal(this,'porcupine'));
    }

    makeView() {
        
        const vm = (new RNav_TableShellMaker())
            .setOrigin(this).setRows(2).setCols(2);
        
        vm.make()
            .nest('0_0', this.cage1.makeView())
            .nest('0_1', this.cage2.makeView())
            .nest('1_0', this.cage3.makeView())
            .nest('1_1', this.cage4.makeView());

        return vm.getDOMElements()[0];
    }
}


class Toolbar extends RNav_DOMControl {

    handle_dom_click(task) {
        console.log(task);
    }

}


class Content extends RNav_DOMControl {
    


}


class MyApp extends RNav_App {

    goOn() {
        console.log('Going on...');

        const page = new RNav_Page(this).install();
        const content = page.getVertexById('content');
        const zoo = new Zoo(content);

        content.getDOMView().appendChild(zoo.makeView());
        console.log(page)

        const body = document.getElementsByTagName('body')[0];
    }
}


var DEB_APP = null;

function main() {
    DEB_APP = (new MyApp('RNavDebApp')).start(staticCfg);
}