// * * ** *** ***** ******** ************* *********************
// Product:     DITA Too Web Output
// Part:        Front-End JS module
// Module:      arnav.js                                (\(\
// Func:        Managing objects exinsing in a page     (^.^)  
// * * ** *** ***** ******** ************* *********************

class Logo extends kwish_DOMControl {

    makeDOMView() {

        const vm = new kwish_ImgViewMaker()
            .setOrigin(this)
            .nestProps({'@src': this.getCfgParam('logo.src')});

        return vm.provideOneElement();
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
            new kwish_ImgViewMaker()
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
        this.mountTreeNodeControls(this.getProp('toc'), this);
        return this;
    }
}

class TocFramelet extends kwish_BasicDOMControl {

    constructor(major, propsRec, id = undefined) {
        super(major, propsRec, id);
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
                'docTitle': this.getProp('toc').title
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

    handle_prepare(task) {
        this.configureMinorControllers();
    }

    handle_startingSplit_entered(task) {
        this.initNavWidth = this.getNavigationFramelet().getWidth();
        this.initCntWidth = this.getContentFramelet().getWidth();
        this.startedFromPos = task.getPayload().getDOMClientVect();
        this.tileTwoFramelets();
        this.setCursor('grabbing');
    }
   
    handle_splitting_entered(task) { 

        const currPos = task.getPayload().getDOMClientVect();
        const deltaX = currPos.x - this.startedFromPos.x;
        const newNavWidth = this.initNavWidth + deltaX;

        const mi = this.getMajorIndent();
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

    handle_normalResized_entered(task) {
        this.tileTwoFramelets()
            .doCommand('stopResize');
    }

    handle_normal_entered(task) {
        this.getTocFramelet().show();
        this.getTocShortcut().hide();
        this.tileTwoFramelets();
        this.terminateTask(task);
        this.setCursor('grab');
    }

    handle_dom_mousedown(task) {

        const startSplitTask = this.createTask('startSplit')
            .setPropagationStrategyCode(kwish_TASK_PRIVAT)
            .setDOMEvent(task.getDOMEvent())
            
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

                'primaryScreenEventTypes': ['mouseup']
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
            maximizedResized --> maximized        : stopResize`
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
        this.terminateTask(task);
    }

    handle_maximizedResized_entered(task) {
        this.tileMaximizedFramelet().doCommand('stopResize');
    }
} 

class GoBackFramelet extends kwish_DOMControl {

}

class SearchResultsFramelet extends kwish_DOMControl {

}

class SearchConsole extends kwish_DOMControl {

}

class ConsoleKeeper extends kwish_DOMControl {

} 

class Page extends kwish_Page {

}

class App extends kwish_App {

    goOn() {
        const page = new Page(this).usePresetControls();
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
    const toc = importTree(GLOBAL_DOC_DTO, GLOBAL_STRINGS_DTO);
    
    const propsRec = {
        'toc': toc
    }

    var WH_GLOBAL_APP = new App(propsRec, 'WH_APP').start(staticCfgRec, staticRsrcRec);
}
