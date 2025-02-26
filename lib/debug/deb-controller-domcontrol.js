
class Zoo extends kwish_DOMControl {

    handle_openZoo(task) {
        this.getCloseZooButton().doCommand('enable');
        task.makeSinker();
    }

    handle_closeZoo(task) {
        this.getOpenZooButton().doCommand('enable');
        task.makeSinker();
    }
}


class Button extends kwish_DOMControl {

    constructor(chief, id) {

        super(chief, id);
        this.declare('state');
        
        this.installFSMachine(
            new kwish_FSMachine, 
            'state',
            `[*] --> disabled
             enabled  --> disabled : dom_click
             disabled --> enabled  : enable`
        );
    } 

    displayEnabled() {
        kwish_DOMUtils.replaceCSSClass(
            this.getDOMElement(), 'disabled', 'enabled'
        );
    }

    displayDisabled() {
        kwish_DOMUtils.replaceCSSClass(
            this.getDOMElement(), 'enabled', 'disabled'
        );
    }

    handle_enabled_entered(task) {
        this.displayEnabled();
    }

    handle_disabled_entered(task) {
        this.displayDisabled();
        this.doCommand('changeZooState');
    }
}


class OpenButton extends Button {

    constructor(chief, id) {
        super(chief, 'openZooButton')
    }

    handle_start(task) {
        this.doCommand('enable');
    }

    handle_changeZooState(task) {
        this.escalateCommand('openZoo');
    }
}


class CloseButton extends Button {

    constructor(chief, id) {
        super(chief, 'closeZooButton');
    }

    handle_changeZooState(task) {
        this.escalateCommand('closeZoo');
    }
}


class Animal extends kwish_DOMControl {

    constructor(chief) {

        super(chief);
        this.declare('name', 'state');

        this.installFSMachine(
            new kwish_FSMachine(), 
            'state',
            `[*] --> sleeping
             sleeping --> hungry   : openZoo
             hungry   --> wellFed  : food
             hungry   --> angry    : closeZoo
             wellFed  --> sleeping : closeZoo
             angry    --> hungry   : openZoo`
    
        );
    }    

    createImgPortrait() {
        const species = this.getSpecies();
        const imageSrc = this.getSrc();
        const imgPortrait = document.createElement('img');
        imgPortrait.setAttribute('src', `img/${imageSrc}`);
        imgPortrait.setAttribute('alt', species);
        imgPortrait.setAttribute('title', species);
        return imgPortrait;
    }

    handle_start(task) {
        this.getDOMElement().appendChild(this.createImgPortrait());
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

    handle_dom_click() {
        console.log(`I'm ${this.getName()}!`);
    }
}


function main() {
    const page = (new kwish_Page())
        .install()
        .doCommand('start', kwish_TASK_SINKER);
}