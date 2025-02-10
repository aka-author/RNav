// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      htmlfetcher.js                          (\(\
// Func:        Fetching and parsing HTML documents     (^.^)  
// * * ** *** ***** ******** ************* *********************


class HTMLFetcher extends RNav_HTTPFetcher {

    constructor(id = undefined) {
        super(id);
    }

    parse(responseBody) {

        if (!responseBody) return null;

        let parsedDOM = null;

        const parser = new DOMParser();

        try {
            parsedDOM = parser.parseFromString(responseBody, 'text/html');
        } catch (error) {
            this.setErrorMessage(error.message);
        } finally {
            this.setParsedBody(parsedDOM);
            return parsedDOM;
        }
    }
}