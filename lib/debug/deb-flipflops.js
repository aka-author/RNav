

class ShowHideBlock extends RNav_ShowHideBlock {

    constructor(major, propsRec, id) {

        const title = document.createElement('h2');
        title.textContent = 'Snake';

        const content = document.createElement('p');
        content.textContent = `Snakes are elongated limbless reptiles 
        of the suborder Serpentes Cladistically squamates, snakes 
        are ectothermic, amniote vertebrates covered in overlapping 
        scales much like other members of the group. Many species 
        of snakes have skulls with several more joints than their 
        lizard ancestors and relatives, enabling them to swallow 
        prey much larger than their heads (cranial kinesis). `;

        const localPropsRec = {
            'titleDOMView': title,
            'contentDOMView': content,
            'contentControls': [],
            'initialState': 'hidden'
        }

        super(major, RNav_Utils.mergeProps(localPropsRec, propsRec), id);
    }

    


}

class TreeControl extends RNav_TreeControl {

    constructor(major, props, id) {
        super(major, props, id)
        this.mount();
    }    

    extractRefCode(srcNodeRec) {
        return srcNodeRec.title.toLowerCase();
    }

    mount() {

        const tree = {
            "title": "Animals",
            "state": "shown",
            "nodes": [
                {
                    "title": "Mammals",
                    "nodes": [
                        {
                            "title": "Carnivores",
                            "nodes": [
                                {
                                    "title": "Big Cats",
                                    "nodes": [
                                        { "title": "Lion" },
                                        { "title": "Tiger" },
                                        { "title": "Leopard" },
                                        { "title": "Jaguar" }
                                    ]
                                },
                                {
                                    "title": "Canines",
                                    "nodes": [
                                        { "title": "Wolf" },
                                        { "title": "Fox" },
                                        { "title": "Coyote" }
                                    ]
                                },
                                {
                                    "title": "Bears",
                                    "nodes": [
                                        { "title": "Grizzly Bear" },
                                        { "title": "Polar Bear" },
                                        { "title": "Black Bear" }
                                    ]
                                }
                            ]
                        },
                        {
                            "title": "Herbivores",
                            "nodes": [
                                {
                                    "title": "Ungulates",
                                    "nodes": [
                                        { "title": "Horse" },
                                        { "title": "Zebra" },
                                        { "title": "Giraffe" }
                                    ]
                                },
                                {
                                    "title": "Elephants",
                                    "nodes": [
                                        { "title": "African Elephant" },
                                        { "title": "Asian Elephant" }
                                    ]
                                }
                            ]
                        },
                        {
                            "title": "Primates",
                            "nodes": [
                                { "title": "Chimpanzee" },
                                { "title": "Gorilla" },
                                { "title": "Orangutan" },
                                { "title": "Baboon" }
                            ]
                        }
                    ]
                },
                {
                    "title": "Birds",
                    "nodes": [
                        {
                            "title": "Raptors",
                            "nodes": [
                                { "title": "Eagle" },
                                { "title": "Hawk" },
                                { "title": "Falcon" }
                            ]
                        },
                        {
                            "title": "Waterfowl",
                            "nodes": [
                                { "title": "Duck" },
                                { "title": "Goose" },
                                { "title": "Swan" }
                            ]
                        },
                        {
                            "title": "Flightless Birds",
                            "nodes": [
                                { "title": "Penguin" },
                                { "title": "Ostrich" },
                                { "title": "Emu" }
                            ]
                        }
                    ]
                },
                {
                    "title": "Reptiles",
                    "nodes": [
                        {
                            "title": "Snakes",
                            "nodes": [
                                { "title": "Viper" },
                                { "title": "Python" },
                                { "title": "Cobra" },
                                { "title": "Boa Constrictor" }
                            ]
                        },
                        {
                            "title": "Lizards",
                            "nodes": [
                                { "title": "Komodo Dragon" },
                                { "title": "Iguana" },
                                { "title": "Gecko" }
                            ]
                        },
                        {
                            "title": "Turtles",
                            "nodes": [
                                { "title": "Sea Turtle" },
                                { "title": "Box Turtle" },
                                { "title": "Snapping Turtle" }
                            ]
                        }
                    ]
                },
                {
                    "title": "Amphibians",
                    "nodes": [
                        {
                            "title": "Frogs",
                            "nodes": [
                                { "title": "Tree Frog" },
                                { "title": "Poison Dart Frog" },
                                { "title": "Bullfrog" }
                            ]
                        },
                        {
                            "title": "Salamanders",
                            "nodes": [
                                { "title": "Axolotl" },
                                { "title": "Giant Salamander" }
                            ]
                        }
                    ]
                },
                {
                    "title": "Fish",
                    "nodes": [
                        {
                            "title": "Freshwater Fish",
                            "nodes": [
                                { "title": "Goldfish" },
                                { "title": "Trout" },
                                { "title": "Bass" }
                            ]
                        },
                        {
                            "title": "Saltwater Fish",
                            "nodes": [
                                { "title": "Shark" },
                                { "title": "Clownfish" },
                                { "title": "Barracuda" }
                            ]
                        }
                    ]
                },
                {
                    "title": "Invertebrates",
                    "nodes": [
                        {
                            "title": "Arachnids",
                            "nodes": [
                                { "title": "Spider" },
                                { "title": "Scorpion" },
                                { "title": "Tick" }
                            ]
                        },
                        {
                            "title": "Insects",
                            "nodes": [
                                { "title": "Butterfly" },
                                { "title": "Bee" },
                                { "title": "Ant" },
                                { "title": "Dragonfly" }
                            ]
                        },
                        {
                            "title": "Mollusks",
                            "nodes": [
                                { "title": "Octopus" },
                                { "title": "Squid" },
                                { "title": "Snail" }
                            ]
                        }
                    ]
                }
            ]
        }

        this.mountNodeControls(tree, this);
    }

    

}


// Initializing and launching the application

var DEB_APP = null;

function main() {
   
    const page = new RNav_Page()
        .usePresetControls()
        .mountDOMView();

    page.getGear('animalsTree')
        .unfoldHubs('insects', 'amphibians')
        .exposeNodes('iguana');

    console.log(page);    
}