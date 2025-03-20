// * * ** *** ***** ******** ************* *********************
// Product:     DITA Too Web Output
// Part:        Front-End JS module
// Module:      arnav.js                                (\(\
// Func:        Managing objects exinsing in a page     (^.^)  
// * * ** *** ***** ******** ************* *********************

// Utils and shortcuts

function $(srcHTML) {
    return kwish_DOMUtils.dom(srcHTML)[0];
}

// Models

class ArnavTocEntry extends kwish_Model {

	constructor(major, id, title, level, uri = undefined) {
		
		super(major, id);
		
		this.title = title;
		this.uri = uri;
        this.level = level;
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

    getTreePath(_path = null) {

        const path = _path || [];

        if (this.level > 0) {
            this.getMajor().getTreePath(path).push(this.getMajor());
        }
        
        return path;
    }
}


class ArnavDoc extends kwish_Model {

	getLevel() {
		return 0;
	}

    getTreeNodeById(id) {
        return this.nodes[id];
    }

	createEntryOfDto(major, entryDto, level) {

        const id = entryDto.entry['@id'];

        this.nodes[id] = new ArnavTocEntry(
                    major, 
                    id, 
                    entryDto.entry['@title'], 
                    level,
                    entryDto.entry['@uri'],
                );

		return this.nodes[entryDto.entry['@id']];
	}

	extractTocEntriesFromDto(dto) {
		return dto["entries"];
	}

	loadEntryFromDto(major, entryDto, level = 0) {
		let entry = this.createEntryOfDto(major, entryDto, level);
		this.entriesByUri[entry.getUri] = entry; 
		if(entryDto.entry.entries)
			this.loadEntriesFromDto(entry, entryDto.entry.entries, level + 1);
        
		return entry;	
	}

	loadEntriesFromDto(major, entriesDtoArray, level = 0) {
		for(let i in entriesDtoArray) {
			this.loadEntryFromDto(major, entriesDtoArray[i], level);
		}
	}

	loadFromDto(dto) {
        this.nodes = {};
		this.id = dto["entry"]["@id"];
		this.title = dto["entry"]["@title"];
        this.url = `${this.id}.html`;
		this.entriesByUri = {};
		this.loadEntriesFromDto(this, this.extractTocEntriesFromDto(dto["entry"])); 
	}
	
	getEntries() {
		return this.minors;
	}

    getTreePath(nodeId) {

        const targetNode = this.getTreeNodeById(nodeId);
        const treePath = targetNode.getTreePath();
        console.log(treePath);
        return treePath
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
        
        if (!this.entries[topicId]) return {};

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

        for(const topicId of topicIds) {
            console.log(topicId)
            searchResults.push(this.getTopicInfo(topicId, topicRatings));
        }

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
        this.getGear('searcher').toggleTaxonomyPane();
    }
}

class ClearButton extends SearchToolButton {

    constructor(major) {
        super(major, {}, 'clearButton');
        this.setProps(this.assembleButtonPropsRec('clear'));
    }

    handle_userActionRequest(task) {
        
        this.tossUpCommand('cancelSearch');

        if (this.getApp().hasTaxonomy()) {
            const taxonomyPane = document.getElementById('taxonomyPane');
            kwish_DOMUtils.hide(taxonomyPane);
        }
    }
}

class SearchButton extends SearchToolButton {

    constructor(major) {
        super(major, {}, 'searchButton');
        this.setProps(this.assembleButtonPropsRec('search'));
    }

    handle_userActionRequest(task) { 
        this.tossUpCommand('search');
    }
}

class QueryInput extends kwish_DOMControl {

    makeDOMView() {
        this.inputQuery = $('<input id="query">');
        return this.inputQuery;
    }

    setValue(str) {
        this.inputQuery.value = str;
        return this;
    }

    getValue() {
        return this.inputQuery.value.trim();
    }

    appendValue(str) {
        return this.setValue(`${this.getValue()}${str}`);
    }
    
    hasHashtag(hashtag) {
        return kwish_Utils.hasHashtag(this.getValue(), hashtag);
    }

    addHashtag(hashtag) {
        this.setValue(kwish_Utils.safeHashtag(this.getValue(), hashtag));
        return this;
    }

    removeHashtag(hashtag) {
        this.setValue(kwish_Utils.unhashtag(this.getValue(), hashtag));
        return this;
    }

    handle_dom_keypress(task) {

        const key = task.getDOMEvent().key;
        
        switch(key) {
            case '#': 
                this.getGear('searcher').showTaxonomyPane();            
                break;
            case 'Enter':
                this.tossUpCommand('search');
                break;
        }
    }
}

class TaxonomyTree extends kwish_SelectableTreeControl {

    constructor(major, propsRec, id) {
        super(major, propsRec, id);
        this.setProps({'checkboxes': []});
    }

    assembleTaxCheckbox(srcTreeNodeRec) {

        const checkbox = $(`<input id="${srcTreeNodeRec.value}" type="checkbox">`); 
        checkbox.title = srcTreeNodeRec.title;

        this.checkboxes.push(checkbox);

        checkbox.addEventListener(
            'change', e => this.getGear('searcher').useTaxonomy(
                    srcTreeNodeRec.title, e
                )
        );

        return checkbox;
    }

    assembleLeafTitle(srcTreeNodeRec, level) {
        
        const domTitle = document.createElement('div');
        const checkbox = this.assembleTaxCheckbox(srcTreeNodeRec);
        const label = document.createTextNode(this.extractSrcTitle(srcTreeNodeRec));
        domTitle.append(checkbox, label);

        return domTitle;
    }

    assembleHubTitle(srcTreeNodeRec, level) {
        
        const domTitle = document.createElement('div');
        const label = document.createTextNode(this.extractSrcTitle(srcTreeNodeRec));

        if (!!srcTreeNodeRec.value) {
            const checkbox = this.assembleTaxCheckbox(srcTreeNodeRec);
            domTitle.append(checkbox, label);
        } else {
            domTitle.append(label);
        }

        return domTitle;
    }
}

class TaxonomyPane extends kwish_DOMControl {

    configureMinorControllers() {
        if (this.getApp().hasTaxonomy()) {
            const taxonomyRec = this.getApp().getTaxonomyRec();
            this.taxonomyTree = new TaxonomyTree(this, {}, 'taxonomyTree');
            this.taxonomyTree.mountTreeNodeControls(taxonomyRec, this.taxonomyTree);
        }
    }

    makeDOMView() {

        if (!this.getApp().hasTaxonomy()) {
            return $('<div id="taxonomyPane" style="display: none"></div>');
        }

        const vm = new kwish_BoxShellViewMaker()
            .setOrigin(this)
            .nestProps({'content': this.taxonomyTree.provideDOMView()});
        
            const div = vm.provideOneElement();

        div.setAttribute('style', 'display: none');

        return div;
    }

    handle_prepare(task) {
        this.configureMinorControllers();
    }
}

class Searcher extends kwish_BasicDOMControl {

    constructor(major, propsRec, id) {  
        super(major, propsRec, id);  
    }

    configureSearchFeatures() {
        const doc = this.getApp().getModel();
        const searchIndex = this.getApp().getSearchIndex();
        this.engine = new SearchEngine(null, doc, searchIndex);
        this.setModel(this.engine);
        return this;
    }

    createMinorControls() {

        if (this.getApp().hasTaxonomy()) {
            this.taxonomyButton = new TaxonomyButton(this);
            this.taxonomyPane = new TaxonomyPane(this, {}, 'taxonomyPane');
        }

        this.clearButton = new ClearButton(this);
        this.searchButton = new SearchButton(this);
        this.queryInput = new QueryInput(this, {}, 'queryInput');
        
        return this;
    }

    makeDOMView() {

        const content =  [
            this.queryInput.provideDOMView(), 
            this.clearButton.provideDOMView(),
            this.searchButton.provideDOMView()
        ];

        if (this.getApp().hasTaxonomy()) {
            content.push(this.taxonomyButton.provideDOMView());
        }

        const vm = new kwish_BoxShellViewMaker()
            .setOrigin(this)
            .nestProps({'content': content});

        return vm.provideOneElement();
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

    isTaxonomyPaneShown() {
        return kwish_DOMUtils.isShown(document.getElementById('taxonomyPane'));
    }

    showTaxonomyPane() {

        if (this.isTaxonomyPaneShown()) return this;

        const taxonomyTree = this.getGear('taxonomyTree');

        for (const checkbox of taxonomyTree.checkboxes) {
            checkbox.checked ?
                this.queryInput.addHashtag(checkbox.title) :
                checkbox.checked = this.queryInput.hasHashtag(checkbox.title);
        }

        kwish_DOMUtils.show(document.getElementById('taxonomyPane'));

        return this;
    }

    hideTaxonomyPane() {
        kwish_DOMUtils.hide(document.getElementById('taxonomyPane'));
    }

    toggleTaxonomyPane() {
        return this.isTaxonomyPaneShown() ?
            this.hideTaxonomyPane() :
            this.showTaxonomyPane(taxonomyPane);
    }

    useTaxonomy(taxonName, event) {
        event.srcElement.checked ?
            this.queryInput.addHashtag(taxonName) :
            this.queryInput.removeHashtag(taxonName); 
    }

    getSearchResultsFramelet() { 
        return this.getPage().searchConsole.resultsFramelet;
    }

    cleanSearchResultsFramelet() {
        
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

        divTaxons.classList.add('searchResultsTaxons');

        const taxonomy = this.engine.getTaxonomy();

        for(const taxonValue of topicInfo.taxons) 
            if(tokens.some(t => t === this.engine.hashTaxon(taxonValue))) {
                let taxonBun = document.createElement('span');  
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
        
        divRelevancyIndicator.classList.add('relevanceIndicator');

        for(const starTypeIdx of pattern) {
            const imgStar = document.createElement("img");
            imgStar.setAttribute("src", stars[starTypeIdx]);
            divRelevancyIndicator.appendChild(imgStar);
        }

        return divRelevancyIndicator;
    }
    
    extractUseful(domObject, id) {
        return domObject.querySelector(`[id='${id}']`) || $('div');
    }

    removeMarkup(htmlText) {
        const body = new DOMParser().parseFromString(htmlText, 'text/html').body
        const usefulText = this.extractUseful(body, 'divTopicBody');

        if (!usefulText) return '';

        const h1 = usefulText.querySelector('h1');
        if (h1) {
            h1.remove();
        }
        const decodedText = convertToPlainText(usefulText);
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

    extractFirstNSentences(n, sourceText) {
        if (!sourceText) return [];
    
        const sentences = sourceText.split(/([\.\!\?])\s*/).filter(Boolean).reduce((acc, val, index) => {
            if (index % 2 === 0) {
                acc[acc.length - 1] = val + acc[acc.length - 1];
            } else {
                acc.push(val);
            }
            return acc;
        }, ['']);
    
        return sentences.slice(0, n);
    }
    
    displayTargetSnippet(tokens, topicId, htmlPageAsText) {
        
        const divPreview = document.getElementById(`preview_${topicId}`);

        const sourceText = this.removeMarkup(htmlPageAsText);

        let relevantSentences = this.extractRelevantSentences(tokens, sourceText);

        if (relevantSentences.length === 0 ) {
            relevantSentences = this.extractFirstNSentences(5, sourceText);
        }

        for(let i = 0; i < relevantSentences.length; i++) {
            const sentence = relevantSentences[i];
            const spanSentence = document.createElement("span");
            spanSentence.innerHTML = sentence.trim() + (i < relevantSentences.length - 1 ? " в—Џ&nbsp;" : "");
            for(const token of tokens) {
                this.getGear('matterFramelet').highlightSubstringInDOM(spanSentence, token);
            }
            divPreview.appendChild(spanSentence);
        }

        return this;
    }

    assembleTopicPreview(tokens, topicId) {

        const divPreview = document.createElement("div");
        divPreview.setAttribute("id", `preview_${topicId}`);
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
                divEntry.classList.add('searchResultsEntry');

                let a = document.createElement("a");
                a.textContent = topicInfo.title;
                a.setAttribute("href", topicInfo.url);

                let divLink = document.createElement("div");
                divLink.appendChild(a);

                divEntry.appendChild(divLink);

                if (this.getApp().hasTaxonomy()) {
                    divEntry.appendChild(this.assembleTaxons(tokens,  topicInfo));
                }

                divEntry.appendChild(this.assembleTopicPreview(tokens, topicInfo.id));
                divEntry.appendChild(this.assembleRelevanceIndicator(topicInfo.rating));

                divEntrySequence.appendChild(divEntry);
            }
        else {
            const divEmptyMessage = document.createElement("div");
            divEmptyMessage.classList.add('emptyMessage');
            divEmptyMessage.textContent = this.emptyMessage;
            divEntrySequence.appendChild(divEmptyMessage);
        }   
        
        this.fillSearchResultsFramelet(divEntrySequence);
    }

    performSearch() {
        const searchTokens = this.getSearchTokens();
        const searchResults = this.engine.searchTopics(searchTokens);
        console.log(searchResults);
        this.displayRelevantTopicLinks(searchTokens, searchResults);
        localStorage.setItem("icapwebhelpsearch", this.queryInput.getValue());
    }

    cleanSearch() {
        this.queryInput.setValue('');
        localStorage.removeItem("icapwebhelpsearch");
    }

    handle_cancelSearch(task) {
        this.cleanSearch();
    }

    handle_search(task) {
        this.performSearch();
    }

    handle_prepare(task) {
        this.configureSearchFeatures()
            .createMinorControls();
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

        super(major, localPropsRec, 'burger');
    }

    handle_shown_entered(task) {
        this.getGear('tocFramelet').bringToFront();
    }
}

class Banner extends kwish_DOMControl {


}  

class TocShortcut extends kwish_BasicDOMControl {

    makeDOMView() {

        const vmBox = new kwish_BoxShellViewMaker()
                .setOrigin(this);
         
        const vmIcon = new kwish_ImgViewMaker()
                .setOrigin(this)
                .nestProps({'@src': this.getRsrcAsset('index_white')})

        vmBox.nestArgs(vmIcon.provideOneElement());

        const domView = vmBox.provideOneElement();

        console.log(this.getGear('readerConsole').isMaximized())

        const display = this.getGear('readerConsole').isMaximized() ? 'unset' : 'none';
        domView.setAttribute('style', `display: ${display}`);

        return domView;
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

        if (this.getApp().isInDocRoot()) {
            kwish_DOMUtils.setCursor(pDocTitle, 'default');
        }

        return pDocTitle;
    }

    handle_dom_click(task) {

        if (!this.getApp().isInDocRoot()) {
            this.tossUpCommand('browseToDocRoot');
        }
    }
}

class Breadcrumbs extends kwish_DOMControl {

    makeDOMView() {
        const doc = this.getApp().getModel();
        const treePath = doc.getTreePath(this.getApp().getCurrPageId());
        const crumbsTplItems = [];
        for (const entry of treePath) {
            const url = this.getApp().assemblePageURLById(entry.id);
            crumbsTplItems.push(`<span><a href="${url}">${entry.title}</a></span>`);
        }
        const separ = this.getCfgParam('breadcrumbs.separator') || '/';
        const crumbsTpl = crumbsTplItems.join(separ);
        return $(`<div id="breadcrumbs">${crumbsTpl}</div>`);
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
        this.tossUpCommand('browseToPage', browseToPageFileName);
    }

    handle_stateChanged(task) {

        const unfoldedNodes = this.getUnfoldedNodes();
        const pathsToUnfoldedNodes = unfoldedNodes.map(n => n.getTreePathString());
        
        const strListOfUnfoldedNodes = pathsToUnfoldedNodes.join('\n');

        this.setCfgParam('toc.framelet.openIds', strListOfUnfoldedNodes)
            .getCfg().commitUserParams();
    }
}

class TocFramelet extends kwish_BasicDOMControl {

    constructor(major, propsRec, id = undefined) {

        super(major, propsRec, 'tocFramelet');
        
        this.setCSSClassNameBase('framelet');
        
        this.easyFSMachine(
            `[*] --> normal 
            normal --> folded : maximize
            folded --> normal : normalize`
        );

        this.setPrimaryScreenEventTypes(['DOMMouseScroll', 'mousemove', 'mouseup', 'scroll', 'wheel']);
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

    saveScroll() {
        const scroll = document.getElementById('tocFrameletTocTreeInner').scrollTop;
        this.setCfgParam('toc.framelet.yscroll', scroll)
               .getCfg().commitUserParams();
    }

    restoreScroll() {
        const scroll = this.getCfgParam('toc.framelet.yscroll');
        document.getElementById('tocFrameletTocTreeInner').scrollTop = scroll;
    }

    handle_dom_mouseup(task) {
        this.saveScroll();
    }

    handle_dom_wheel(task) {
       this.saveScroll();
    }

    handle_prepare(task) {
        this.configureMinorControllers();
    }
}

/*class PrintButton extends kwish_DOMControl {

    makeDOMView() {

        const [spanButton] = $('<span>Print</span>');

        const vm = new kwish_BoxShellViewMaker()
            .setOrigin(this)
            .nestProps({'content': spanButton});

        return vm.provideOneElement();
    }
}*/

class PrintButton extends kwish_DOMControl {

    makeDOMView() {

        const spanButton = $('<span>Print</span>');
        this.inject(new kwish_BoxShellViewMaker()).nestArgs(spanButton);
        return this.provideOneElement();
    }
    /*
    configureMinorControllers() {
        this.icbutt = new kwish_IconicButton(
            this,
            {
                'iconsPath': 'front/img',
                'iconSpotsDef': {
                    'defaultIconSpotName': 'enabled',
                    'icons': [
                        {
                            'spotName': 'enabled', 
                            'altText':  'print',
                            'fileName': 'print'
                        },
                        {
                            'spotName': 'disabled', 
                            'altText':  'print',
                            'fileName': 'print'
                        }
                    ]
                }
            }
        );

        this.setContent(this.icbutt.provideDOMView());
    }

    handle_prepare(task) {
        this.configureMinorControllers();
    }*/
}

class MatterFramelet extends kwish_DOMControl {

    constructor(major, propsRec, id = undefined) {

        super(major, propsRec, 'matterFramelet');
        
        this.setCSSClassNameBase('framelet');
        
        this.easyFSMachine(
            `[*] --> normal 
            normal --> maximized : maximize
            maximized --> normal : normalize`
        );
    }

    highlightSubstringInDOM(rootElement, searchTerm) {
        const walker = document.createTreeWalker(
            rootElement,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
    
        const nodesToHighlight = [];
    
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const content = node.nodeValue;
            const index = content.toLowerCase().indexOf(searchTerm);
            if (index !== -1) 
                nodesToHighlight.push({ node, index, content });
        }
    
        nodesToHighlight.forEach(({ node, index, content }) => {
            const before = document.createTextNode(content.substring(0, index));
            const inner = content.substring(index, index + searchTerm.length);
            const bold = document.createElement('b');
            bold.className = 'searchTerm';
            bold.appendChild(document.createTextNode(inner));
            const after = document.createTextNode(content.substring(index + searchTerm.length));
    
            node.parentNode.insertBefore(before, node);
            node.parentNode.insertBefore(bold, node);
            node.parentNode.insertBefore(after, node);
            node.parentNode.removeChild(node);
        });

    }

    updateMatter() {
        const tokens = this.getGear('searcher').getSearchTokens();
        for(const token of tokens) {
            this.highlightSubstringInDOM(document.getElementById('pageMatter'), token);
        }
    }
}

class ReaderConsole extends kwish_DOMControl {

    constructor(major, propsRec, id) {
        
        super(major, propsRec, 'readerConsole');
        
        this.configureFSMachine();

        this.setProps(
            {
                'maxMobileSize': 480,

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

        window.addEventListener('resize', (e) => this.doCommand('dom_resize'));
    }

    configureFSMachine() {

        const initialState = this.getCfgParam('toc.framelet.folded') || 'normal';

        this.easyFSMachine(
            `[*] --> ${initialState}
            
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

    isMaximized() {
        return this.getEasyFSMState() === 'maximized';
    }

    isMobileSize() {
        return this.getWidth() <= this.getMaxMobileSize();
    }

    getMajorIndent() {
        return kwish_DOMUtils.measureCSSProp('--major_indent');
    }

    getTocShortcut() {
        return this.getGear(this.getTocShortcutId());
    }

    getTocFrameletSize() {
        const tocFrameletWidth = this.getTocFramelet().getWidth();
        const windowWidth = window.innerWidth;
        return `${tocFrameletWidth}/${windowWidth}`;
    }

    getConsoleState() {
        return this.getEasyFSMState();
    }

    prepareTocFrameletForMobile() {
        this.getTocFramelet().hide();
        return this;
    }

    forceCloseBurger() {
        this.getGear('burger').forceToState('hidden');
        return this;
    }

    markContentFramelet(mark) {

        this.getMatterFramelet()
            .getDOMView()
            .setAttribute('data-maximized', mark);

        return this;  
    }

    commitConsoleState() {

        this.setCfgParam('toc.framelet.size', this.getTocFrameletSize())
            .setCfgParam('toc.framelet.folded', this.getConsoleState())
            .getCfg().commitUserParams();

        return this;
    }

    tileTwoFramelets() {
        
        const navf = this.getTocFramelet();
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

        return this.commitConsoleState();
    }

    tileMaximizedFramelet() {    
        
        kwish_DOMUtils.setCSSProps(
            this.getContentStartCSSPropName(), '0',
            this.getContentTopCSSPropName(), '0',
            this.getContentWidthCSSPropName(), '100vw',
            this.getContentHeightCSSPropName(), '100vh'
        );

        return this.commitConsoleState();
    }

    tileMobile() {

        this.getTocFramelet().hide();
        this.getTocShortcut().hide();
        
        kwish_DOMUtils.setCSSProps(
            this.getContentStartCSSPropName(), '0',
            this.getContentTopCSSPropName(), '0',
            this.getContentWidthCSSPropName(), '100vw',
            this.getContentHeightCSSPropName(), '100vh',
        );

        return this.commitConsoleState();
    }

    // Initial setup

    handle_prepare(task) {
        
        this.configureMinorControllers();

        if (this.isMaximized()) {
            kwish_DOMUtils.hide(document.getElementById('tocFramelet'));
            this.markContentFramelet('yes');
        }        
    }

    // Folding and unfolding the TOC framelet

    handle_normal_entered(task) {
        
        this.getTocFramelet().show();
        
        this.getTocShortcut().hide();

        this.markContentFramelet('no')
            .tileTwoFramelets()
            .setCursor('grab'); 
    }

    handle_maximized_entered(task) {

        this.getTocFramelet().hide();
        
        this.getTocShortcut().show();
        
        this.markContentFramelet('yes')
            .tileMaximizedFramelet()
            .terminateTask(task);
    }

    // Splitting a console

    handle_startingSplit_entered(task) {
        this.initNavWidth = this.getTocFramelet().getWidth();
        this.initCntWidth = this.getMatterFramelet().getWidth();
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
        const newCntWidth = this.getWidth() - newNavWidth - 3*mi; 
        
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

    // Resizing a window

    handle_normalResized_entered(task) {
        this.isMobileSize() ? 
            this.doCommand('getMobile') : 
            this.tileTwoFramelets().doCommand('stopResize');
    }

    handle_maximizedResized_entered(task) {
        this.isMobileSize() ? 
            this.doCommand('getMobile').tileMobile() :
            this.tileTwoFramelets().doCommand('stopResize');
    }

    handle_mobileFromNormal_entered(task) {
        this.tileMobile();
    }

    handle_mobileFromNorResized_entered(task) {
        this.doCommand(this.isMobileSize() ? 'stopResize' : 'getLargeScreen');
    }

    handle_mobileFromMax_entered(task) {
        this.getTocShortcut().hide();
    }

    handle_mobileFromMaxResized_entered(task) {
        this.doCommand(this.isMobileSize() ? 'stopResize' : 'getLargeScreen');
    }

    handle_normalResized_mobileFromNormal(task) {
        this.forceCloseBurger().prepareTocFrameletForMobile();
    }

    handle_maximizedResized_mobileFromMaximized(task) {
        this.forceCloseBurger()
            .prepareTocFrameletForMobile()
            .markContentFramelet('no');
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
            searching --> reading : cancelSearch`
        )
    }

    handle_searching_entered(task) {
        this.getGear('readerConsole').hide()
            .getGear('searchConsole').show();
    }

    handle_reading_entered(task) {
        this.getGear('readerConsole').show().doCommand('dom_resize')
            .getGear('searchConsole').hide();
    }
} 

class Page extends kwish_Page {

    getConsoleKeeper() {
        return this.getGear('consoleKeeper');
    }

    handle_cancelSearch(task) {
        this.getConsoleKeeper().doCommand('cancelSearch');
    }

    handle_search(task) {
        this.getConsoleKeeper().doCommand('search');
    }

    handle_read(task) {
        this.getConsoleKeeper().doCommand('read');
    }
}

class App extends kwish_App {

    mountDoc() {
        let doc = new ArnavDoc(this, "tocModel");
        doc.loadFromDto(GLOBAL_DITATOO_TOC_STRUCT_DTO);
        this.declare('model');
        this.setProps({'model': doc});
    }

    getSearchIndex() {
        return GLOBAL_DITATOO_SEARCH_INDEX_DTO;
    }

    hasTaxonomy() {
        return !!GLOBAL_DITATOO_SEARCH_INDEX_DTO.taxonomy;
    }

    restoreTocTreeState() {
        const tocUnfoldedStrList = this.getCfgParam('toc.framelet.openIds');
        const tocUnfoldedList = tocUnfoldedStrList.split('\n');
        this.getGear('toctree').openRoot().openByTreePaths(tocUnfoldedList); 
        return this;
    }

    restoreSearcherState() {
        const query = localStorage.getItem("icapwebhelpsearch");
        this.getGear('queryInput').setValue(query);
        return this;
    }

    restoreTocScroll() {
        this.getGear('tocFramelet').restoreScroll();
        return this;
    }

    highlightCurrentTocEntry() {
        const refCode = kwish_Utils.substringAfterLast(location.href, '/');
        this.getGear('toctree').forceHighlight(refCode);
        return this;
    }

    restoreTocFrameletState() {
        
        this.restoreTocTreeState()
            .restoreTocScroll()
            .highlightCurrentTocEntry();

        return this;
    }

    updateMatter() {
        this.getGear('matterFramelet').updateMatter();
        return this;
    }

    getCurrBaseURL() {
        return kwish_Utils.substringBeforeLast(location.href, '/');
    }

    getCurrPageFileName() {
        return kwish_Utils.substringAfterLast(location.href, '/');
    }

    getCurrPageId() {

        const currPageId = kwish_Utils.substringBeforeLast(
                this.getCurrPageFileName(),
                `.${this.getCfgParam('html.fileType')}`
            );

        return currPageId;
    }

    assemblePageURL(pageFileName) {
        return `${this.getCurrBaseURL()}/${pageFileName}`;
    }

    assemblePageURLById(id) {
        const fName = `${id}.${this.getCfgParam('html.fileType')}`;
        return this.assemblePageURL(fName);
    }

    getDocRootPageFileName() {
        return this.getApp().model.url;
    }

    isInDocRoot() {
        return this.getCurrPageFileName().toLowerCase() === this.getDocRootPageFileName().toLowerCase();
    }

    browseToPage(pageFileName) {
        const browseToURL = this.assemblePageURL(pageFileName);
        location = browseToURL;
        return this;
    }

    browseToDocRoot() {
        return this.browseToPage(this.getDocRootPageFileName());
    }

    goOn() {
        const page = new Page(this).usePresetControls();
        
        this.mountDoc();
        this.doCommand('prepare', kwish_TASK_SINKER);

        page.appear();

        this.restoreTocFrameletState()
            .restoreSearcherState()
            .updateMatter();

        if (this.hasTaxonomy()) {
            this.getGear('taxonomyTree').openRoot();
        }
    }

    handle_commit_cfg() {
        this.getCfg().commitUserParams();
    }

    handle_browseToDocRoot(task) {
        this.browseToDocRoot().terminateTask(task);
    }

    handle_userAction(task) {
        this.browseToPage(task.getPayload());
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

    function buildNode(entry, prefix = '') {
        const index = prefix ? prefix + '.' : '';
        const title = strings[entry['@id']] || entry['@title'] || '';
        const node = {
            'title': title,
            'number': index,  
            'state': 'hidden'
        };

        if (entry['@uri']) {
            node.uri = entry['@uri'];
        }

        if (entry.entries && entry.entries.length) {
            node.nodes = entry.entries.map((e, i) => buildNode(e.entry, index + (i + 1)));
        }

        return node;
    }

    return buildNode(toc.entry);
}

function importTaxonomy(searchIndexRec) {

    function convertNode(node) {
        const newNode = { title: node.name, state: 'hidden' };
        if (node.value) {
            newNode.value = node.value; 
        }
        if (node.taxa) {
            newNode.nodes = node.taxa.map(convertNode);
        }
        return newNode;
    }

    if (!!searchIndexRec.taxonomy) {
        return {
            title: searchIndexRec.taxonomy.name || "",
            nodes: searchIndexRec.taxonomy.taxa.map(convertNode)
        };
    } 

    return {};
}

function assembleAppKey() {
    return `help_${kwish_Utils.hashObject(GLOBAL_DITATOO_TOC_STRUCT_DTO)}`;
}

(function () {

    const keyBase = assembleAppKey();

    const consoleState = kwish_Cfg.getFromLocalStorage(keyBase, 'toc.framelet.folded');

    if (consoleState === 'maximized') {
        
        kwish_DOMUtils.setCSSProp('--matter_framelet_start', 0);
        kwish_DOMUtils.setCSSProp('--matter_framelet_top', 0);
        kwish_DOMUtils.setCSSProp('--matter_framelet_width', 'var(--console_width)');
        kwish_DOMUtils.setCSSProp('--matter_framelet_height', 'var(--console_height)');    

        return;
    }

    const tocFrameletSize = kwish_Cfg.getFromLocalStorage(keyBase, 'toc.framelet.size');

    if (!!tocFrameletSize) {

        const tocFrameletWidth = parseInt(kwish_Utils.substringBefore(tocFrameletSize, '/'));
        const windowWidth = parseInt(kwish_Utils.substringAfter(tocFrameletSize, '/'));
        const actualWindowWidth = window.innerWidth;
        const newTocFrameletWidth = actualWindowWidth*tocFrameletWidth/windowWidth;
    
        kwish_DOMUtils.setCSSProp(
            '--toc_framelet_default_width', `${newTocFrameletWidth}px`
        );
    }
    
})();

function main() {

    const staticCfgRec = importCfg(GLOBAL_DITATOO_CFG_DTO);
    
    const tocRec = importTree(
        GLOBAL_DITATOO_TOC_STRUCT_DTO, GLOBAL_DITATOO_TOC_TITLES_DTO
    );
    
    const taxonomyRec = importTaxonomy(
        GLOBAL_DITATOO_SEARCH_INDEX_DTO
    );

    const propsRec = {
        'tocRec': tocRec,
        'taxonomyRec': taxonomyRec
    }

    const appId = assembleAppKey();
    var WH_GLOBAL_APP = new App(propsRec, appId).start(staticCfgRec, GLOBAL_DITATOO_RSRC_DTO);
}