

const src = {
    'zoo': {
        'name': 'The Zoo of Haifa', 
        'address': 'Mirkaz Carmel'
    },
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
    ],
    'musor': {
        'pivo': 'raki'
    }
}


class Animal extends RNav_Model {

    constructor(chief, id) {
        super(chief, id);
        this.declare('species', 'name', 'dateOfBirth', 'look');
    }

    static import(srcObj) {
        return new Animal()
            .setSpecies(srcObj.species)
            .setName(srcObj.name)
            .setDateOfBirth(new Date(srcObj.dateOfBirth))
            .setLook(srcObj.look)
    }

}


class Zoo extends RNav_Model {

    constructor(chief, id) {
        super(chief, id);
        this.declare('name', 'address');
    }

    static import(srcObj) {
        return new Zoo()
            .setName(srcObj.name)
            .setAddress(srcObj.address)
    }
}


function main() {

    const out = RNav_Utils.parseObject(
        src, 
        (token, path) => {
            if(path.match(/.*\/animals$/)) 
                return Symbol.for('parse');             
            if(path.match(/.*\/animals\[\d+\]$/)) 
                return Animal.import(token);
            if(path.match(/.*\/zoo$/)) 
                return Zoo.import(token);
            if(typeof token === 'object')
                return Symbol.for('ignore');

            return token;
        }
    );

    console.log(out);
}