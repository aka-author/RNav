// * * ** *** ***** ******** ************* *********************
// Product:     Kit for Web-based Interactive Stand-alone Help
// Part:        Front-End JS library
// Module:      jsonfetcher.js                          (\(\
// Func:        Fetching and parsing JSON documents     (^.^)  
// * * ** *** ***** ******** ************* *********************

class kwish_JSONFetcher extends kwish_HTTPFetcher {

    constructor(id = undefined) {
        super(id);
    }

    parse(responseBody) {
        
        if (!responseBody) return null;

        let parsedJSON = null;
        
        try {
            parsedJSON = JSON.parse(responseBody);
        } catch (error) {
            this.setErrorMessage(error.message);
        } finally {
            this.setParsedBody(parsedJSON);
            return parsedJSON;
        }
    }
}