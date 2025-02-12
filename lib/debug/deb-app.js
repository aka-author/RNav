
const staticCfg = {
        "general": {
            "ipRelatedParams": {
                "@method": "get",
                "@url": "https://api.country.is",
                "ip": undefined,
                "country": undefined
            }
        },
        "name": "Karl Ivanovich",
        "page": {
            "width": 100,
            "height": 100
        },
        "list": {
            "length": "25",
            "selected": "karabas",
            "items": {
                "start": "korova",
                "finish": "koza"
            }
        }
    }


class MyApp extends RNav_App {

    goOn() {
        console.log(this.getCfg());
    }
}

var DEB_APP = null;

function main() {
    DEB_APP = (new MyApp('RNavDebApp')).start(staticCfg);
}