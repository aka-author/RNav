
const staticCfg = {
        'zoo': {
            'outerCSSClassName': 'zoo-outer',
            'innerCSSClassName': 'zoo-inner', 
        },
        'cage': {
            'outerCSSClassName': 'cage-outer',
            'innerCSSClassName': 'cage-inner', 
        },
        'animal': {
            'CSSClassName': 'animal'
        }
    }


class MyApp extends RNav_App {

    goOn() {
        console.log('Going on...');

        const wdb = new RNav_WrapperDOMBuilder('zoo')

        const domZoo = wdb.setId('zoo').buildOne({'#content': 'Zoo'});
        
        const body = document.getElementsByTagName('body')[0];
        body.appendChild(domZoo);
    }
}

var DEB_APP = null;

function main() {
    DEB_APP = (new MyApp('RNavDebApp')).start(staticCfg);
}