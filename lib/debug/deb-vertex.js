

const burbulator = {
    'calcBurbulationRate': function(water, substance) {
        return substance/water;
    },

    'burbulate': function(times) {
        for(let i = 0; i < times; i++)
            console.log('Bur, bur, bur!');
    },

    'murmurate': function(times) {
        for(let i = 0; i < times; i++)
            console.log('Mur, Mur, Mur!');
    }
}

const vTop = (new kwish_Vertex())
    .setProps(
        {
            'barcode': 1234567890,
            'product': 'Mice rats'
        }
    );

const member1 = (new kwish_Vertex(vTop))
    .declare('barcode', 'product');

const member2 = (new kwish_Vertex(vTop))
    .setProps(
        {
            'customer': 'Bamba Mutamba'
        }
    )
    .inject(burbulator, 'burb');


for(const member of vTop)
    console.log(member.getId());

vTop.forEach(m => console.log(m.getId()));

console.log(`Barcode: ${member1.getBarcode()}, product: ${member1.getProduct()}`);

member1.setProduct('Beer');
console.log(`The product is ${member1.getProduct()} now!`)

console.log(`Customer: ${member2.getCustomer()}`);
console.log(`Burb. rate: ${member2.calcBurbulationRate(100, 20)}`);

member2.burbulate(2).murmurate(3);

console.log(member2.getBurb());
