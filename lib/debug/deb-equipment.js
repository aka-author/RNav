

class eqTester extends RNav_Generic {

    constructor() {

        super();

        this.setProps(
            {
                'stack': null,
                'name': 'Quak the Toad',
                'length': 200,
                'weight': 50,
                'color': 'toad in love'
            }
        )

        this.installEquipment(new RNav_Stack(), 'length', 'weight', 'color');
    }

    mutate() {
        this.getStack().push();
        
        this.setLength(Math.floor(this.getLength()*Math.random()))
            .setWeight(Math.floor(this.getWeight()*Math.random()))
            .setColor(Math.random() > 0.5 ? 'green' : 'yellow')
            .setName(`Quack the ${Math.random() > 0.5 ? 'Ripper' : 'Confessor'}`);
        
        return this;
    }

    restore() {
        this.getStack().pop();
        return this;
    }

    report() {
        const msg = `${this.getName()} ${this.getLength()} ${this.getColor()}`;
        console.log(msg);
        return this;
    }

}

const toad = new eqTester();

for(let i = 0; i < 5; i++)
    toad.report().mutate();

for(let i = 0; i < 5; i++)
    toad.restore().report();
