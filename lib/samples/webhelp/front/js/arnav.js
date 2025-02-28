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
        console.log('appearing');
        this.show();
    }

    handle_disappear(task) {
        console.log('disappearing');
        this.hide();
    }

    handle_dom_click(task) {
        
        this.getGear('tocFramelet').doCommand('unfold')
            .getGear('matterFramelet').doCommand('normalize')
            .getGear('tocShortcut').doCommand('disappear');
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
        console.log('Closing!');
        this.terminateTask(task);

        this.getGear('tocFramelet').doCommand('fold')
            .getGear('matterFramelet').doCommand('maximize')
            .getGear('tocShortcut').doCommand('appear');
    }

    handle_dom_mouseover(task) {
        //kwish_DOMUtils.startTremble(this.getDOMView(), 3, 50, 3000);
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
            normal --> folded : fold
            folded --> normal : unfold`
        );
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

    handle_folded_entered(task) {
        console.log('folded');
        this.hide();
    }

    handle_normal_entered(task) {
        console.log('normalized');
        this.show();
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

    handle_maximized_entered(task) {
        console.log('maximized');

        console.log(this.start);

        document.documentElement.style.setProperty('--matter_framelet_start', '0');
        document.documentElement.style.setProperty('--matter_framelet_top', '0');
        document.documentElement.style.setProperty('--matter_framelet_width', '100vw');
        document.documentElement.style.setProperty('--matter_framelet_height', '100%');
    }

    handle_normal_entered(task) {
        
        console.log('normalized');

        document.documentElement.style.setProperty(
            '--matter_framelet_start', 
            'calc(var(--toc_framelet_width) + 2*var(--major_indent))'
        );
        
        document.documentElement.style.setProperty(
            '--matter_framelet_top', 
            'var(--major_indent)'
        );

        document.documentElement.style.setProperty(
            '--matter_framelet_width', 
            'calc(var(--matter_framelet_size_base) - 1.5*var(--major_indent))'
        );

        document.documentElement.style.setProperty(
            '--matter_framelet_height', 
            'calc(100vh - var(--page_header_height) - 2*var(--major_indent))'
        );
    }

}

class ReaderConsole extends kwish_DOMControl {

    constructor(major, propsRec, id) {

        super(major, propsRec, id);
        
        this.easyFSMachine(
            `[*] --> normal
            normal         --> startingResize : startResize
            startingResize --> resizing       : dom_mousemove
            startingResize --> normal         : dom_mouseup
            resizing       --> resizing       : dom_mousemove
            resizing       --> normal         : dom_mouseup
            normal         --> maximized      : maximize
            maximized      --> normal         : normalize`
        );

        window.addEventListener('resize', (e) => this.doCommand('dom_resize'));
    }

    configureMinorControllers() { 
        this.tocShortcut = new TocShortcut(this, {}, 'tocShortcut');
    }

    getMajorIndent() {
        return kwish_DOMUtils.measureCSSProp('--major_indent');
    }

    tileFramelets() {

        const winWidth = kwish_DOMUtils.getWindowWidth();
        const tocWidth = this.getGear('tocFramelet').getWidth();
        const matterWidth = winWidth - tocWidth - 3*this.getMajorIndent();
        kwish_DOMUtils.setCSSProp('--matter_framelet_width', `${matterWidth}px`);    
    }

    handle_dom_mousedown(task) {

        const newTask = this.createTask('startResize')
            .setPropagationStrategyCode(kwish_TASK_PRIVAT)
            .setDOMEvent(task.getDOMEvent());

        this.doTask(newTask);
    }

    handle_startingResize_entered(task) {
        this.initTocWidth = this.getGear('tocFramelet').getWidth();
        this.initMatterWidth = this.getGear('matterFramelet').getWidth();
        this.startedFromPos = task.getPayload().getDOMClientVect();
        this.tileFramelets();
    }
   
    handle_resizing_entered(task) { 
        const currPos = task.getPayload().getDOMClientVect();
        const deltaX = currPos.x - this.startedFromPos.x;
        const newTocWidth = this.initTocWidth + deltaX;
        const newMatterWidth = this.initMatterWidth - deltaX;
        kwish_DOMUtils.setCSSProp('--toc_framelet_width', `${newTocWidth}px`);
        kwish_DOMUtils.setCSSProp('--matter_framelet_width', `${newMatterWidth}px`);
    }

    handle_normal_entered(task) {
        this.tileFramelets();
    } 

    handle_dom_resize(task) {
        this.tileFramelets();
    }

    handle_prepare(task) {
        this.configureMinorControllers();
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
