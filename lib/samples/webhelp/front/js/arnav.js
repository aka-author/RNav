// * * ** *** ***** ******** ************* *********************
// Product:     DITA Too Web Output
// Part:        Front-End JS module
// Module:      arnav.js                                (\(\
// Func:        Managing objects exinsing in a page     (^.^)  
// * * ** *** ***** ******** ************* *********************


// Models

class ArnavTocEntry extends kwish_Model {

	constructor(major, id, title, uri = undefined) {
		
		super(major, id);
		
		this.title = title;
		this.uri = uri;
	}

	setTitle(title) {
		this.title = title;
	}

	getTitle() {
		return this.title;
	}

	hasUri() {
		return !!this.uri;
	}

	getUri() {
		return this.uri;
	}

	getLevel() {
		return this.getMajor().getLevel() + 1;
	}

	matchUri(uri) {
		let clauses = uri.split("/");
		return clauses[clauses.length-1] == this.getUri();	
	}

	getEntries() {
		return this.workers;
	}

	/*handle__localize(issue) {
		this.setTitle(this.getI18n().getstr(this.getId()));
	}*/
}


class ArnavDoc extends kwish_Model {

	getLevel() {
		return 0;
	}

	createEntryOfDto(major, entryDto) {
		return new ArnavTocEntry(
            major, entryDto.entry['@id'], 
            entryDto.entry['@title'], 
            entryDto.entry['@uri']
        );
	}

	extractTocEntriesFromDto(dto) {
		return dto["entries"];
	}

	loadEntryFromDto(major, entryDto) {
		let entry = this.createEntryOfDto(major, entryDto);
		this.entriesByUri[entry.getUri] = entry; 
		if(entryDto.entry.entries)
			this.loadEntriesFromDto(entry, entryDto.entry.entries);
        
		return entry;	
	}

	loadEntriesFromDto(major, entriesDtoArray) {
		for(let i in entriesDtoArray) {
			this.loadEntryFromDto(major, entriesDtoArray[i]);
		}
	}

	loadFromDto(dto) {
		this.id = dto["entry"]["@id"];
		this.title = dto["entry"]["@title"];
		this.entriesByUri = {};
		this.loadEntriesFromDto(this, this.extractTocEntriesFromDto(dto["entry"])); 
	}
	
	getEntries() {
		return this.workers;
	}

}

function safeInc(n, increment=1) {
    return n !== undefined ? n + increment : increment;
}

function normalizeString(string) {
    return string.trim().replace(/\s+/g, ' ');
}

function splitByFirstHash(str) {

    const normStr = normalizeString(str);

    const index = str.indexOf('#');

    if (index === -1) 
        return [normStr, '']; 

    return [normStr.substring(0, index), normStr.substring(index + 1)];
}

function convertToPlainText(domElement) {
    const elementsWithPeriod = new Set(['li', 'p', 'td', 'div']);

    function processElement(element) {
        let text = '';

        for (const child of element.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
                text += child.nodeValue.trim();
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                text += processElement(child);
            }
        }

        if (elementsWithPeriod.has(element.tagName.toLowerCase())) {
            text = text.trim();
            if (text !== '' && !/[.!?]$/.test(text)) {
                text += '.';
            }
        }

        return text;
    }

    return processElement(domElement);
}

function getTaxonomySubtree(rootTaxon, subtreeRootTaxonValue) {

    let subtreeRootTaxon = null;

    if(rootTaxon.value === subtreeRootTaxonValue) 
        subtreeRootTaxon = rootTaxon; 
    else 
        if(rootTaxon.taxa)  
            for(const childTaxon of rootTaxon.taxa) {
                subtreeRootTaxon = getTaxonomySubtree(
                    childTaxon, subtreeRootTaxonValue
                );

                if(subtreeRootTaxon) 
                    break; 
            }

    return subtreeRootTaxon; 
}

function collectTaxonValues(rootTaxon, taxonValues = []) {
    
    if(!rootTaxon) return [];

    if(!!rootTaxon.value)
        taxonValues.push(rootTaxon.value); 

    if(rootTaxon.taxa)
        for(const childTaxon of rootTaxon.taxa) 
            collectTaxonValues(childTaxon, taxonValues);

    return taxonValues;
}

function matchTaxonName(taxonName, taxonNamePattern) {
    return taxonName.toLowerCase() === taxonNamePattern.toLowerCase();
}

function getTaxonNameByValue(taxonRoot, taxonValue) {
    return getTaxonomySubtree(taxonRoot, taxonValue).name;
}

function getTaxonValueByName(rootTaxon, taxonNamePattern) {

    if(matchTaxonName(rootTaxon.name, taxonNamePattern))
        return rootTaxon.value;
    else if(rootTaxon.taxa) 
        for(const childTaxon of rootTaxon.taxa) {
            let taxonValue = getTaxonValueByName(childTaxon, taxonNamePattern);
            if(!!taxonValue)
                return taxonValue;
        }

    return undefined;
}

function completeTaxonValueList(rootTaxon, taxonValues) {

    const rawCompleteList = [];

    for(const taxonValue of taxonValues) {
        let taxon = getTaxonomySubtree(rootTaxon, taxonValue);
        rawCompleteList.push(...collectTaxonValues(taxon));
    }

    return [...new Set(rawCompleteList)];
}

class SearchEngine extends kwish_Model {

    constructor(chief, doc, searchIndex) {

        super(chief);

        this.doc = doc;
        this.searchIndex = searchIndex;
        this.rebuildSearchIndex();

        this.entries = {};
        
        this.parseDoc(doc, this.entries);
    }

    getSearchIndex() {
        return this.searchIndex;
    }

    getWordIndex() {
        return this.getSearchIndex().entries;
    }

    getTaxonomy() {
        return this.getSearchIndex().taxonomy;
    }

    getTaxonomyIndex() {
        return this.getSearchIndex().taxonomyIndex;
    }

    hashTaxon(taxon) {
        return '#' + taxon;
    }

    unhashTaxon(hashedTaxon) {
        return hashedTaxon.substring(1);
    }

    isHashed(taxon) {
        return taxon[0] === '#';
    }

    rebuildSearchIndex() {

        const wordIndex = this.getWordIndex();
        const taxonomy = this.getTaxonomy();
        const taxonomyIndex = this.getTaxonomyIndex();
        
        const taxonValues = collectTaxonValues(taxonomy);

        for(const taxonValue of taxonValues) {

            let rawTaxonEntry = [];

            let subtreeRoot = getTaxonomySubtree(taxonomy, taxonValue);
            let subtaxonValues = collectTaxonValues(subtreeRoot);

            

            for(const subtaxonValue of subtaxonValues) 
                if(!!taxonomyIndex[subtaxonValue])
                    rawTaxonEntry.push(...taxonomyIndex[subtaxonValue]);

            let taxonEntry = [...new Set(rawTaxonEntry)];

            wordIndex[this.hashTaxon(taxonValue)] = taxonEntry;
        }

    }

    parseDoc(entry, entries) {
        
        for(const currEntry of entry) {
            entries[currEntry.id] = currEntry;
            this.parseDoc(currEntry, entries);
        }
    }

    getTopicInfo(topicId, rating) {
        
        const topicInfo = {
            "id": this.entries[topicId].id,
            "title": this.entries[topicId].title,
            "url": this.entries[topicId].id + ".html",
            "taxons": this.getTopicTaxons(topicId),
            "rating": rating[this.entries[topicId].id]
        };

        return topicInfo;
    }

    matchSerchToken(token, word) {

        if(word.includes(token)) 
            return token.length/word.length;
        
        return 0;
    }

    detectMatchingWords(tokens, searchIndex) {
        
        const wordMatchScores = {};
        
        for(const word in searchIndex.entries) {
            
            for(const token of tokens) {
                let matchScore = this.matchSerchToken(token, word);
                if(matchScore > 0)
                    wordMatchScores[word] = matchScore; 
            }
        }

        return wordMatchScores;
    }

    hasTopicTaxon(topicId, taxonValue) {
        
        const wordIndex = this.getWordIndex();

        const hashedTaxon = this.hashTaxon(taxonValue);
        
        if(wordIndex[hashedTaxon]) 
            return wordIndex[hashedTaxon].some(e => e.i === topicId);

        return false;
    }

    getTopicTaxons(topicId) {

        const topicTaxons = [];

        const taxonomy = this.getTaxonomy();

        const taxonValues = collectTaxonValues(taxonomy); 

        for(const taxonValue of taxonValues)
            if(this.hasTopicTaxon(topicId, taxonValue))
                topicTaxons.push(taxonValue);

        return topicTaxons;
    }

    substituteTaxonValue(term) {
        
        if(this.isHashed(term)) {
            const taxonmy = this.getTaxonomy();
            const taxonName = this.unhashTaxon(term);
            return this.hashTaxon(getTaxonValueByName(taxonmy, taxonName));
        } else
            return term;
    }

    expandTaxonValues(searchTokens) {

        const taxonomy = this.getTaxonomy();

        let rawTaxons = [];
        const words = [];

        for(const term of searchTokens) 
            if(this.isHashed(term)) {
                let taxon = this.unhashTaxon(term);
                rawTaxons.push(...completeTaxonValueList(taxonomy, [taxon]));
            }
            else words.push(term);

        const taxons = ([...new Set(rawTaxons)]).map(t => this.hashTaxon(t));

        return [...words, ...taxons];
    }

    searchRelevantTopicIds(searchTokens) {

        const searchIndex = this.searchIndex;
        let stopWords = [];
        stopWords = searchIndex.stopwords?.split(" ") || [];

        const rawTokens = searchTokens.map(
            t => this.substituteTaxonValue(t.toLowerCase())
        ).filter(t => !stopWords.includes(t));

        // const tokens = this.expandTaxonValues(rawTokens);

        const tokens = rawTokens;

        const wordMatchScores = this.detectMatchingWords(tokens, searchIndex);
        
        const matchingWords = Object.keys(wordMatchScores);
        const relevanceScores = {}; 

        for(const word of matchingWords) 
            for(const topicEntry of searchIndex.entries[word]) {
                let topicId = topicEntry.i;
                relevanceScores[topicId] = safeInc(relevanceScores[topicId], wordMatchScores[word]);
            }

        for(const topicId in relevanceScores)
            relevanceScores[topicId] /= tokens.length;

        const sortedRelevanceScores = Object.entries(relevanceScores).sort((b, a) => a[1] - b[1]);
        const sortedTopicIds = sortedRelevanceScores.map(entry => entry[0]);
    
        return [sortedTopicIds, relevanceScores];
    }

    getTopicIdsByTaxonValue(taxonValue) {

        const topicIds = [];

        const taxonomyIndex = this.getTaxonomyIndex();

        if(!!taxonomyIndex[taxonValue])
            for(const topicEntry of taxonomyIndex[taxonValue])
                topicIds.push(topicEntry['i'])

        return topicIds;
    }

    getTopicIdsByTaxonValues(taxonValues) {

        const topicIds = [];

        for(const taxonValue of taxonValues)
            topicIds.concat(this.getTopicIdsByTaxonValue(taxonValue));

        return [...new Set(topicIds)];
    }

    assembleSearchResults(topicIdsAndRatings) {

        const topicIds = topicIdsAndRatings[0];
        const topicRatings = topicIdsAndRatings[1];

        const searchResults = [];

        for(const topicId of topicIds) 
            searchResults.push(this.getTopicInfo(topicId, topicRatings));

        return searchResults;
    }

    searchTopics(searchTokens) {
        return this.assembleSearchResults(this.searchRelevantTopicIds(searchTokens));
    }
}

// Search controllers

class SearchToolButton extends kwish_IconicButton {

    assembleButtonPropsRec(rsrcCode) {

        const propsRec = {
            'iconSpotsDef': {
                'defaultIconSpotName': 'enabled',
                'icons': [
                    {
                        'spotName': 'enabled', 
                        'altText':  rsrcCode,
                        'fileName': rsrcCode
                    }
                ]
            }
        }

        return propsRec;
    }
}

class TaxonomyButton extends SearchToolButton {

    constructor(major) {
        super(major, {}, 'taxonomyButton');
        this.setProps(this.assembleButtonPropsRec('taxonomy'));
    }
    
    handle_userActionRequest(task) {
        console.log('Opening taxonomy!');
        this.getMajor().inputTaxonomyCreterea();
        
        return this;
    }
}

class ClearButton extends SearchToolButton {

    constructor(major) {
        super(major, {}, 'clearButton');
        this.setProps(this.assembleButtonPropsRec('clear'));
    }

    handle_userActionRequest(task) {
        console.log('Clearing!');
        this.getGear('consoleKeeper').doCommand('read');
        this.getMajor().cleanSearch();
    }
}

class SearchButton extends SearchToolButton {

    constructor(major) {
        super(major, {}, 'searchButton');
        this.setProps(this.assembleButtonPropsRec('search'));
    }

    handle_userActionRequest(task) { 
        console.log('Searching!');
        this.getGear('consoleKeeper').doCommand('search');
        this.getMajor().performSearch();
    }
}

class QueryInput extends kwish_DOMControl {

    makeDOMView() {

        this.inputQuery = document.createElement('input');
        this.inputQuery.setAttribute('id', 'query');

        return this.inputQuery;
    }

    setValue(str) {
        this.inputQuery.value = str;
        return this;
    }

    getValue() {
        return this.inputQuery.value;
    }

    appendValue(str) {
        return this.setValue(`${this.getValue()}${str}`);
    }
    

    /* handle_dom_keypress(task) {
        const e = task.getDOMEvent();

        if (e.key === ' ') {
            this.appendValue(', kopat-molotit, ')
        }
        console.log(this.getValue())
    }*/

}

class Searcher extends kwish_DOMControl {

    constructor(major, propsRec, id) {
        super(major, propsRec, id);
        this.configureSearchFeatures() 
    }

    configureSearchFeatures() {
        const doc = this.getApp().getModel();
        const searchIndex = this.getApp().getSearchIndex();
        this.engine = new SearchEngine(null, doc, searchIndex);
        this.setModel(this.engine);
    }

    createMinorControls() {

        this.taxonomyButton = new TaxonomyButton(this);
        this.clearButton = new ClearButton(this);
        this.searchButton = new SearchButton(this);
        this.queryInput = new QueryInput(this);
        
        return this;
    }

    makeDOMView() {

        const vm = new kwish_BoxShellViewMaker()
            .setOrigin(this)
            .nestProps(
                {'content': [
                        this.queryInput.provideDOMView(), 
                        this.clearButton.provideDOMView(),
                        this.taxonomyButton.provideDOMView(),
                        this.searchButton.provideDOMView()
                    ]
                }
            );

        return vm.provideOneElement();
    }

    handle_prepare(task) {
        this.createMinorControls();
    }

    

    splitSearchQuery(query) {
        
        const [before, after] = splitByFirstHash(query);
    
        const words = before
            .split(/\s+/)
            .filter(token => token);
    
        const taxonNames = after
            .split('#')
            .map(taxon => `#${taxon}`) 
            .filter(taxon => taxon.length > 1); 
    
        return [...words, ...taxonNames];
    }

    getSearchTokens() {
    
        const searchQuery = this.queryInput.getValue();
        
        const rawSearchTokens = this.splitSearchQuery(searchQuery);
        
        const stopWords = this.getApp().getSearchIndex().stopwords || [];
        
        const unsortedSearchTokens = rawSearchTokens.map(
            t => t.trim().toLowerCase()).filter(t => !stopWords.includes(t)
        ); 
        
        const sortedSearchTokens = unsortedSearchTokens.sort(
            (t1, t2) => t2.length - t1.length
        ); 

        return sortedSearchTokens; 
    }

    getSearchResultsFramelet() { 
        return this.getPage().searchConsole.resultsFramelet;
    }

    cleanSearchResultsFramelet() {
        console.log('clean')
        const searchResultsArea = document.getElementById("searchResultsFrameletInner");

        localStorage.removeItem("icapwebhelpsearch");

        while(searchResultsArea.firstChild) 
            searchResultsArea.removeChild(searchResultsArea.firstChild);
    }

    fillSearchResultsFramelet(domObject) {

        this.cleanSearchResultsFramelet();

        const searchResultsArea = document.getElementById("searchResultsFrameletInner");
        searchResultsArea.appendChild(domObject);
    }

    // Taxons

    assembleTaxons(tokens, topicInfo) {

        const divTaxons = document.createElement('div');

        /*divTaxons.classList.add(
            this.getCfgProp("search.results.matchingTaxonList.classBlock")
        );*/
        divTaxons.classList.add('searchResultsTaxons');

        const taxonomy = this.engine.getTaxonomy();

        for(const taxonValue of topicInfo.taxons) 
            if(tokens.some(t => t === this.engine.hashTaxon(taxonValue))) {
                let taxonBun = document.createElement('span');
                /*taxonBun.classList.add(
                    this.getCfgProp("search.results.matchingTaxonList.classTaxon")
                );   */   
                taxonBun.classList.add('searchResultsTaxon');
        
                taxonBun.textContent = getTaxonNameByValue(taxonomy, taxonValue);
                divTaxons.appendChild(taxonBun);
            }

        return divTaxons;
    }

    // Relevancy indiator

    assembleRelevanceIndicator(relevance) {

        const patterns = [
            [0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [2, 0, 0, 0, 0],
            [2, 1, 0, 0, 0],
            [2, 2, 0, 0, 0],
            [2, 2, 1, 0, 0],
            [2, 2, 2, 0, 0],
            [2, 2, 2, 1, 0],
            [2, 2, 2, 2, 0],
            [2, 2, 2, 2, 1],
            [2, 2, 2, 2, 2]
        ];

        const stars = [
            'front/img/nullstar.svg',
            'front/img/halfstar.svg',
            'front/img/fullstar.svg'
        ];
        
        const patternIdx = Math.round(relevance <= 1 ? relevance*10 : 10);

        const pattern = patterns[patternIdx];

        const divRelevancyIndicator = document.createElement("div");
        
        //divRelevancyIndicator.classList.add(this.getCfgProp("search.results.relevance.indicator.classBlock"));
        divRelevancyIndicator.classList.add('relevanceIndicator');

        for(const starTypeIdx of pattern) {
            const imgStar = document.createElement("img");
            imgStar.setAttribute("src", stars[starTypeIdx]);
            divRelevancyIndicator.appendChild(imgStar);
        }

        return divRelevancyIndicator;
    }
    
    removeMarkup(htmlText) {
        const body = new DOMParser().parseFromString(htmlText, 'text/html').body
        const decodedText = convertToPlainText(body);
        return decodedText;
    }
    
    emphaseTokens(tokens, sourceText) {

        let wrappedText = sourceText;

        for(const token of tokens) 
            wrappedText = wrappedText.replace(token, `<b>${token}</b>`);
    
        return wrappedText;
    }

    extractRelevantSentences(tokens, sourceText) {
        if(!sourceText) return [];
        // const sentences = sourceText.split(/(?<=[\.\!?])/);  

        const sentences = sourceText.split(/([\.\!\?])\s*/).filter(Boolean).reduce((acc, val, index) => {
            if (index % 2 === 0) {
              // Even index means it's not a punctuation mark, concatenate with the next element
              acc[acc.length - 1] = val + acc[acc.length - 1];
            } else {
              // Odd index means it's a punctuation mark, start a new sentence
              acc.push(val);
            }
            return acc;
          }, ['']);          

        const resultSentences = sentences.filter(s => tokens.some(t => s.toLowerCase().includes(t)));
        return resultSentences;
      }

    displayTargetSnippet(tokens, topicId, htmlPageAsText) {
        
        const divPreview = document.getElementById(`preview_${topicId}`);

        const sourceText = this.removeMarkup(htmlPageAsText);

        const relevantSentences = this.extractRelevantSentences(tokens, sourceText);

        
        for(let i = 0; i < relevantSentences.length; i++) {
            const sentence = relevantSentences[i];
            const spanSentence = document.createElement("span");
            spanSentence.innerHTML = sentence.trim() + (i < relevantSentences.length - 1 ? " в—Џ&nbsp;" : "");
            for(const token of tokens)
                this.getPage().readerConsole.matterFramelet.highlightSubstringInDOM(spanSentence, token);
            divPreview.appendChild(spanSentence);
        }

        return this;
    }

    assembleTopicPreview(tokens, topicId) {

        const divPreview = document.createElement("div");
        divPreview.setAttribute("id", `preview_${topicId}`);
        //divPreview.classList.add(this.getCfgProp("search.results.entry.classPreview"));
        divPreview.classList.add('searchResultsPreview');
        
        fetch(`${topicId}.html`).then(
            response => {
                if(response.ok) {
                    response.text().then(
                        responseBody => this.displayTargetSnippet(tokens, topicId, responseBody)
                    );
                }
                else 
                    console.log("Parse error"); 
            }
        ).catch(error => console.log(error));
        
        return divPreview;
    }

    displayRelevantTopicLinks(tokens, searchResults) {
        
        const divEntrySequence = document.createElement("div");

        this.cleanSearchResultsFramelet();

        if(searchResults.length > 0)
            for(const topicInfo of searchResults) {

                let divEntry = document.createElement("div");
                //divEntry.classList.add(this.getCfgProp("search.results.entry.classEntry"));
                divEntry.classList.add('searchResultsEntry');

                let a = document.createElement("a");
                a.textContent = topicInfo.title;
                a.setAttribute("href", topicInfo.url);

                let divLink = document.createElement("div");
                divLink.appendChild(a);

                divEntry.appendChild(divLink);
                divEntry.appendChild(this.assembleTaxons(tokens,  topicInfo));
                divEntry.appendChild(this.assembleTopicPreview(tokens, topicInfo.id));
                divEntry.appendChild(this.assembleRelevanceIndicator(topicInfo.rating));

                divEntrySequence.appendChild(divEntry);
            }
        else {
            const divEmptyMessage = document.createElement("div");
            //divEmptyMessage.classList.add(this.getCfgProp("search.results.empty.classMessage"));
            divEmptyMessage.classList.add('emptyMessage');
            divEmptyMessage.textContent = this.emptyMessage;
            divEntrySequence.appendChild(divEmptyMessage);
        }   
        console.log(divEntrySequence)
        this.fillSearchResultsFramelet(divEntrySequence);
    }

    performSearch() {
        const searchTokens = this.getSearchTokens();
        const searchResults = this.engine.searchTopics(searchTokens);
        console.log('Search results', searchResults)
        this.displayRelevantTopicLinks(searchTokens, searchResults);
        localStorage.setItem("icapwebhelpsearch", this.queryInput.getValue());
    }

    cleanSearch() {
        
        this.searchInput.getDomObject().value = "";

        localStorage.removeItem("icapwebhelpsearch");

        if(!this.getPage().isSearchConsoleOn()) 
            this.getPage().readerConsole.matterFramelet.unhighliteSearchTerms();

    }

    handle__search(issue) {
        this.performSearch();
    }

    show() {
        this.getDomObject().style.display = "block";
    }

    beforeRun() {
        const divEmptyMessage = document.getElementById(this.getCfgProp("search.results.empty.id"));
        this.emptyMessage = divEmptyMessage.textContent;
    }
}

class SearchSwitch extends kwish_DOMControl {

    handle__click(issue) {
        issue.terminate();
        this.getPage().turnOnMobileSearchMode();
    }
}

// Page controllers

class Logo extends kwish_DOMControl {

    makeDOMView() {

        const vm = new kwish_ImgViewMaker()
            .setOrigin(this)
            .nestProps({'@src': this.getCfgParam('logo.src')});

        return vm.provideOneElement();
    }

}   

class Burger extends kwish_ShowHideButton {

    constructor(major, propsRec, id = undefined) {

        const localPropsRec = {
            'controlledElementId': 'tocFramelet',
            'controlledElement': undefined,
            'initialState': 'hidden',
            'iconSpotsDef': {
                'defaultIconSpotName': 'hidden',
                'icons': [
                    {
                        'spotName': 'hidden', 
                        'altText':  'Open menu',
                        'fileName': 'burger-folded'
                    },
                    {
                        'spotName': 'shown', 
                        'altText':  'Close menu',
                        'fileName': 'burger-unfolded'
                    }
                ]
            }
        }

        super(major, localPropsRec, id);

    }

}



class Banner extends kwish_BasicDOMControl {

    createMinorControls() {
        this.searcher = new Searcher(this, {}, 'searcher');
        return this;
    }

    makeDOMView() {

        const vm = new kwish_BoxShellViewMaker()
            .setOrigin(this)
            .nestProps({'content': this.searcher.provideDOMView()});

        return vm.provideOneElement();
    }

    handle_prepare(task) {
        this.createMinorControls();
    }

}  

class TocShortcut extends kwish_BasicDOMControl {

    makeDOMView() {

        const vmBox = new kwish_BoxShellViewMaker()
                .setOrigin(this);
         
        const vmIcon = new kwish_ImgViewMaker()
                .setOrigin(this)
                .nestProps({'@src': this.getRsrcAsset('index_white')})

        vmBox.nestArgs(vmIcon.provideOneElement());

        const tmp = vmBox.provideOneElement();
        tmp.setAttribute('style', 'display: none');

        return tmp;
    }

    handle_appear(task) {
        this.show();
    }

    handle_disappear(task) {
        this.hide();
    }

    handle_dom_click(task) {
        this.doCommand('disappear')
            .doCommand('normalize', kwish_TASK_BUBBLE)
            .terminateTask(task);
    }

}

class CloseBox extends kwish_BasicDOMControl {


    makeDOMView() {
        this.inject(
            new kwish_ImgViewMaker('tocCloseBox')
                .setOrigin(this)
                .nestProps({'@src': this.getRsrcAsset('closebox')})
        )

        return this.provideOneElement();
    }

    handle_dom_click(task) {
        this.terminateTask(task)
            .doCommand('maximize', kwish_TASK_BUBBLE)
            .terminateTask(task);

        task.getDOMEvent().stopPropagation();
    }
}

class DocTitleBox extends kwish_BasicDOMControl {

    makeDOMView() {

        const pDocTitle = document.createElement('p');
        pDocTitle.textContent = this.getDocTitle();

        return pDocTitle;
    }

}

class TocTree extends kwish_SelectableTreeControl {

    extractRefCode(srcNodeRec) {
        return srcNodeRec.uri;
    }

    mount() {
        this.mountTreeNodeControls(this.getProp('tocRec'), this);
        return this;
    }

    handle_userAction(task) {
        const browseToPageFileName = task.getPayload();
        location = browseToPageFileName;
    }
}

class TocFramelet extends kwish_BasicDOMControl {

    constructor(major, propsRec, id = undefined) {
        super(major, propsRec, id);
        
        this.setCSSClassNameBase('framelet');
        
        this.easyFSMachine(
            `[*] --> normal 
            normal --> folded : maximize
            folded --> normal : normalize`
        );
    }

    handle_folded_entered(task) {
        
    }

    configureMinorControllers() {

        this.closeBox = new CloseBox(this, {}, 'closeToc');

        const titlePropsRec = {
                'docTitle': this.getProp('tocRec').title
            }

        this.docTitleBox = new DocTitleBox(this, titlePropsRec);
        
        this.tocTree = new TocTree(this, {}, 'toctree').mount();

        return this;
    }

    makeDOMView() {
        
        this.inject(
                new kwish_RackViewMaker(
                    {
                        'shelfNames': ['title', 'tocTree']
                    }
                )
                .setOrigin(this)
                .nestProps(
                    {
                        'title': this.docTitleBox.provideDOMView(),
                        'tocTree': this.tocTree.provideDOMView()
                    }
                )
            );

        return this.provideOneElement();
    } 

    handle_prepare(task) {
        this.configureMinorControllers();
    }
}

class MatterFramelet extends kwish_DOMControl {

    constructor(major, propsRec, id = undefined) {

        super(major, propsRec, id);
        
        this.setCSSClassNameBase('framelet');
        
        this.easyFSMachine(
            `[*] --> normal 
            normal --> maximized : maximize
            maximized --> normal : normalize`
        );
    }
}

class TwoFrameletConsole extends kwish_DOMControl {

    constructor(major, propsRec, id) {
        
        super(major, propsRec, id);
        
        this.configureFSMachine();

        this.setProps(
            {
                'maxMobileSize': 480
            }
        );

        window.addEventListener('resize', (e) => this.doCommand('dom_resize'));
    }

    getNavigationFramelet() {
        return this.getGear(this.getNavigationFrameletId());
    }

    getContentFramelet() {
        return this.getGear(this.getContentFrameletId());
    }

    getMajorIndent() {
        return kwish_DOMUtils.measureCSSProp('--major_indent');
    }

    isMobileSize() {
        return this.getWidth() <= this.getMaxMobileSize();
    }

    tileTwoFramelets() {
        
        const navf = this.getNavigationFramelet();
        const mi = this.getMajorIndent();
        const winWidth = kwish_DOMUtils.getWindowWidth();

        const navWidth = navf.getWidth();

        const cntStart = 2*mi + navWidth;
        const cntTop = mi;
        const cntWidth = winWidth - navWidth - 3*mi;
        const cntHeight = navf.getHeight();
    
        function px(n) {return `${n}px`};

        kwish_DOMUtils.setCSSProps(
            this.getContentStartCSSPropName(), px(cntStart),
            this.getContentTopCSSPropName(), px(cntTop),
            this.getContentWidthCSSPropName(), px(cntWidth), 
            this.getContentHeightCSSPropName(), px(cntHeight)
        );

        kwish_DOMUtils.setCSSProp(
            this.getContentWidthCSSPropName(), `${cntWidth}px`
        );    

        return this;
    }

    tileMobile() {

        this.getNavigationFramelet().hide();
        this.getTocShortcut().hide();
        
        kwish_DOMUtils.setCSSProps(
            this.getContentStartCSSPropName(), '0',
            this.getContentTopCSSPropName(), '0',
            this.getContentWidthCSSPropName(), '100vw',
            this.getContentHeightCSSPropName(), '100vh',
        );
    }

    markContentFramelet(mark) {
        this.getContentFramelet().getDOMView().setAttribute('data-maximized', mark);
    }

    // Initial setup

    handle_prepare(task) {
        this.configureMinorControllers();
    }

    // Splitting a console

    handle_startingSplit_entered(task) {
        this.initNavWidth = this.getNavigationFramelet().getWidth();
        this.initCntWidth = this.getContentFramelet().getWidth();
        this.startedFromPos = task.getPayload().getDOMClientVect();
        this.tileTwoFramelets();
        this.setCursor('grabbing');
    }
   
    handle_splitting_entered(task) { 

        const currPos = task.getPayload().getDOMClientVect();
        
        const dirMul = kwish_DOMUtils.isLTR() ? 1 : -1;
        const deltaX = dirMul*(currPos.x - this.startedFromPos.x);
        const mi = this.getMajorIndent();

        const newNavWidth = this.initNavWidth + deltaX;
        const newCntStart = newNavWidth + 2*mi;
        const newCntWidth = this.initCntWidth - deltaX;
        
        function p(n) {return `${n}px`};

        kwish_DOMUtils.setCSSProp(
            this.getNavigationWidthCSSPropName(), p(newNavWidth)
        );

        kwish_DOMUtils.setCSSProp(
            this.getContentStartCSSPropName(), p(newCntStart)
        );

        kwish_DOMUtils.setCSSProp(
            this.getContentWidthCSSPropName(), p(newCntWidth)
        );

        this.setCursor('grabbing');
    }

    // Resizing a large-screen layout

    handle_normal_entered(task) {
        this.getTocFramelet().show();
        this.getTocShortcut().hide();
        this.markContentFramelet('no');
        this.tileTwoFramelets().setCursor('grab'); 
    }

    handle_normalResized_entered(task) {
        this.isMobileSize() ? this.doCommand('getMobile') : 
                this.tileTwoFramelets().doCommand('stopResize');
    }

    handle_maximizedResized_entered(task) {
        this.isMobileSize() ? 
            this.doCommand('getMobile').tileMobile() :
            this.tileTwoFramelets().doCommand('stopResize');
    }

    // Resizing the mobile layout

    handle_mobileFromNormal_entered(task) {
        this.tileMobile();
    }

    handle_mobileFromMax_entered(task) {
        this.getTocShortcut().hide();
        this.tileMobile(); 
    }

    handle_mobileFromNorResized_entered(task) {
        this.doCommand(this.isMobileSize() ? 'stopResize' : 'getLargeScreen');
    }

    handle_mobileFromMaxResized_entered(task) {
        this.doCommand(this.isMobileSize() ? 'stopResize' : 'getLargeScreen');
    }

    // Handling raw DOM events

    handle_dom_mousedown(task) {

        const startSplitTask = this.createTask('startSplit')
            .setPropagationStrategyCode(kwish_TASK_PRIVAT)
            .setDOMEvent(task.getDOMEvent());
            
        this.terminateTask(task)
            .doTask(startSplitTask);
    }
} 

class ReaderConsole extends TwoFrameletConsole {

    constructor(major, propsRec, id) {

        super(major, propsRec, id);

        this.setProps(
            {
                'navigationFrameletId': 'tocFramelet',
                'navigationWidthCSSPropName': '--toc_framelet_width',

                'tocShortcutId': 'tocShortcut',
                
                'contentFrameletId': 'matterFramelet',
                'contentStartCSSPropName': '--matter_framelet_start',
                'contentTopCSSPropName': '--matter_framelet_top',
                'contentWidthCSSPropName': '--matter_framelet_width',
                'contentHeightCSSPropName': '--matter_framelet_height',

                'primaryScreenEventTypes': ['mouseup', 'mousemove']
            }                               
        );
        
    }

    configureFSMachine() {
        this.easyFSMachine(
            `[*] --> normal
            
            normal    --> maximized : maximize
            maximized --> normal    : normalize

            normal        --> startingSplit : startSplit
            startingSplit --> normal        : dom_mouseup
            startingSplit --> splitting     : dom_mousemove
            splitting     --> splitting     : dom_mousemove
            splitting     --> normal        : dom_mouseup 
            
            normal           --> normalResized    : dom_resize
            maximized        --> maximizedResized : dom_resize
            normalResized    --> normal           : stopResize
            maximizedResized --> maximized        : stopResize
                                 
            normalResized        --> mobileFromNormal    : getMobile
            mobileFromNorResized --> normal              : getLargeScreen
            maximizedResized     --> mobileFromMaximized : getMobile
            mobileFromMaxResized --> maximized           : getLargeScreen
            
            mobileFromNormal     --> mobileFromNorResized : dom_resize
            mobileFromNorResized --> mobileFromNormal     : stopResize
            mobileFromMaximized  --> mobileFromMaxResized : dom_resize
            mobileFromMaxResized --> mobileFromMaximized  : stopResize`
        );
    }

    configureMinorControllers() { 
        this.tocShortcut = new TocShortcut(this, {}, this.getTocShortcutId());
    }

    getTocShortcut() {
        return this.getGear(this.getTocShortcutId());
    }

    tileMaximizedFramelet() {    
        
        kwish_DOMUtils.setCSSProps(
            this.getContentStartCSSPropName(), '0',
            this.getContentTopCSSPropName(), '0',
            this.getContentWidthCSSPropName(), '100vw',
            this.getContentHeightCSSPropName(), '100vh'
        );

        return this;
    }

    handle_maximized_entered(task) {
        this.getTocFramelet().hide();
        this.getTocShortcut().show();
        this.tileMaximizedFramelet();
        this.markContentFramelet('yes');;
        this.terminateTask(task);
    }

    handle_mobileFromMaximized_entered(task) {
        this.markContentFramelet('no');
    }
} 



class GoBackFramelet extends kwish_DOMControl {

}

class SearchResultsFramelet extends kwish_DOMControl {

    constructor(major, propsRec, id = undefined) {
        super(major, propsRec, id);
        this.setCSSClassNameBase('framelet');
    }

}

class SearchConsole extends kwish_DOMControl {

    constructor(major, propsRec, id = undefined) {
        super(major, propsRec, id);
        this.setCSSClassNameBase('console');
    }
}

class ConsoleKeeper extends kwish_DOMControl {

    constructor(major, propsRec, id = undefined) {

        super(major, propsRec, id);

        this.easyFSMachine(
            `[*] --> reading
            reading --> searching : search
            searching --> reading : read`
        )
    }

    handle_searching_entered(task) {
        console.log('Search console comes');
        this.getGear('readerConsole').hide()
            .getGear('searchConsole').show();
    }

    handle_reading_entered(task) {
        console.log('Reader console comes');
        this.getGear('readerConsole').show()
            .getGear('searchConsole').hide();
    }

} 

class Page extends kwish_Page {

}

class App extends kwish_App {

    constructor(id) {
        super(id);
    }

    createDoc() {
        let doc = new ArnavDoc(this, "tocModel");
        
        doc.loadFromDto(GLOBAL_DOC_DTO);
        this.declare('model');
        this.setProps({'model': doc});
    }

    getSearchIndex() {
        return GLOBAL_SEARCH_INDEX;
    }

    goOn() {
        const page = new Page(this).usePresetControls();
        
        this.createDoc();
        this.doCommand('prepare', kwish_TASK_SINKER);

        page.appear();

        this.getGear('toctree').openRoot(); 
    }

}

function importCfg(xmlBasedCfg) {

    let compressed = {};

    if (!xmlBasedCfg || !xmlBasedCfg.cfg) return compressed;

    for (const entry of xmlBasedCfg.cfg) {
        const property = entry.property;
        if (property && property["@path"] && property["@content"] !== undefined) {
            compressed[property["@path"]] = property["@content"];
        }
    }

    return compressed;
}

function importTree(toc, strings) {

    function buildNode(entry) {
        const node = {
            'title': strings[entry['@id']] || entry['@title'] || '',
            'state': 'hidden'
        };

        if (entry['@uri']) {
            node.uri = entry['@uri'];
        }

        if (entry.entries && entry.entries.length) {
            node.nodes = entry.entries.map(e => buildNode(e.entry));
        }

        return node;
    }

    return buildNode(toc.entry);
}

function main() {

    const staticCfgRec = importCfg(GLOBAL_CFG_DTO)
    const tocRec = importTree(GLOBAL_DOC_DTO, GLOBAL_STRINGS_DTO);
    
    const propsRec = {
        'tocRec': tocRec
    }

    var WH_GLOBAL_APP = new App(propsRec, 'WH_APP').start(staticCfgRec, staticRsrcRec);
}
