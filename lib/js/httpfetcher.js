// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      httpfetcher.js                       (\(\
// Func:        The base class for HTTP fetchers     (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_HTTPFetcher extends RNav_Equipment {

    constructor(id = undefined) {

        super(id);
        
        this.declare(
            'url', 'statusCode', 'responseBody', 
            'headers', 'parsedBody', 'errorMessage'
        );
    }

    returnParsedBody(callback) {

        if(!!callback)
            callback(this.getParsedBody());
        else
            this.callBack(this.getParsedBody()); 
    }

    async fetch(url, callback = null) {

        this.setUrl(url);

        try {
            const response = await fetch(url);
            this.setStatusCode(response.status);
            
            if (!response.ok) return;

            this.setHeaders(response.headers);
            
            const responseBody = await response.text();
            this.setResponseBody(responseBody);            
            this.setParsedBody(this.parse(responseBody));

            this.returnParsedBody(callback);
        
        } catch (error) {
            this.setErrorMessage(error.message);
            return null;
        }
    }

    parse(responseBody) {
        this.setParsedData(responseBody);
        return responseBody;
    }
}
