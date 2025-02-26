

class eqTester extends kwish_Generic {

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

        this.installEquipment(new kwish_Stack(), 'length', 'weight', 'color');
        this.installEquipment(new kwish_HTMLFetcher());
        this.installEquipment(new kwish_JSONFetcher());
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

    displayHTML(url) {
    
        function output(html) {
            const fetchedBody = html.getElementsByTagName('body')[0];
            const localBody = document.getElementsByTagName('body')[0]
            kwish_DOMUtils.moveAllChildNodes(fetchedBody, localBody);
        }
        
        this.getHTMLFetcher().fetch(url, output);
    }

    displayJSON(url) {
        this.getJSONFetcher().fetch(url, (j) => console.log(j));
    }

}

const toad = new eqTester();

for(let i = 0; i < 5; i++)
    toad.report().mutate();

for(let i = 0; i < 5; i++)
    toad.restore().report();

toad.displayHTML('data/toad.html');
toad.displayJSON('data/toads.json');
