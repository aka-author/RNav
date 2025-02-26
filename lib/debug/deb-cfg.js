
const cfg = new kwish_Cfg()

console.log(cfg.getOS());
console.log(cfg.isMobile());
console.log(cfg.getDefaultLanguage());
console.log(cfg.getBrowserName());

console.log(GLOBAL_CFG_DTO);

cfg.load(

        {
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
        }, () => {console.log(cfg.get('general.ipRelatedParams.country'))});

console.log(cfg.get('general.ipRelatedParams.ip'));