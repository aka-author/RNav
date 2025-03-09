// * * ** *** ***** ******** ************* *********************
// Product:     Kit for Web-based Interactive Stand-alone Help
// Part:        Front-End JS library
// Module:      uitree.js                      (\(\
// Func:        Making interactive trees       (^.^)  
// * * ** *** ***** ******** ************* *********************


class kwish_TreeNode {

    getTreePath() {
        let treePath = [{'origTitle': this.origTitle, 'refCode': this.refCode}];
        if (!!this.getMajor().getTreePath) {
            treePath = [...this.getMajor().getTreePath(), ...treePath];
        }
        return treePath;
    }

    getTreePathString() {
        const rawPath = [];
        const path = this.getTreePath();
        for (const chein of path) {
            rawPath.push(chein.origTitle);
        }
        const pathString = rawPath.join('/');
        return pathString;
    }

    handle_expose(task) {
        if (task.getPayload().includes(this.getRefCode())) {
            this.getMajor().doCommand('exposeMinors', kwish_TASK_BUBBLE);
        }
    }
}

class kwish_TreeHubControl extends kwish_ShowHideBlock {

    constructor(major, propsRec, id = undefined) {
        super(major, propsRec, id);
        this.mixin(kwish_TreeNode);
    }

    makeDOMView() {
        const DOMView = super.makeDOMView();
        kwish_DOMUtils.toggleCSSClass(DOMView, `level${this.getLevel()}`);
        return DOMView;
    }

    getUnfoldedNodes(unfolded) {

        if (this.isShown()) {
            unfolded.push(this)
        }

        for(const node of this) {
            if (!!node.getUnfoldedNodes) {
                node.getUnfoldedNodes(unfolded);
            }
        }

        return unfolded;
    }

    handle_contentShown(task) {
        this.tossUpCommand('stateChanged', this);
    }

    handle_contentHidden(task) {
        this.tossUpCommand('stateChanged', this);
    }

    handle_unfold(task) {
        
        if (task.getPayload().includes(this.getRefCode())) {
            this.forceShow();
        }
    }

    handle_fold(task) {

        if (task.getPayload().includes(this.getRefCode())) {
            this.forceHide();
        }
    }

    handle_exposeMinors(task) {    

        this.forceShow();
        
        if (this.getLevel() === 0) {
            this.terminateTask(task);
        }
    }

    handle_openByTreePaths(task) {

        const treePaths = task.getPayload();
        
        if (treePaths.includes(this.getTreePathString())) {
            this.doCommand('exposeMinors');
        }
    }
}

class kwish_TreeLeafControl extends kwish_BasicDOMControl {

    constructor(major, propsRec, id = undefined) {
        super(major, propsRec, id);
        this.mixin(kwish_TreeNode);        
    }
    
    makeDOMView() {
        const DOMView = super.makeDOMView();
        kwish_DOMUtils.toggleCSSClass(DOMView, `level${this.getLevel()}`);
        return DOMView;
    }
}

class kwish_TreeControl extends kwish_BasicDOMControl {

    constructor(major, propsRec, id = undefined) {
        super(major, propsRec, id)
    }

    extractSrcTitle(srcTreeNodeRec) {
        return srcTreeNodeRec.title;
    }

    extractSrcTreeNodes(srcTreeNodeRec) {
        return srcTreeNodeRec.nodes;
    }

    extractTreeNodeState(srcTreeNodeRec) {
        return srcTreeNodeRec.state || 'hidden';
    }

    extractRefCode(srcTreeNodeRec) {
        return srcTreeNodeRec.refCode;
    }

    assembleLeafTitle(srcTreeNodeRec, level) {
        
        const domTitle = document.createElement('div');
        domTitle.textContent = this.extractSrcTitle(srcTreeNodeRec);

        return domTitle;
    }

    assembleHubTitle(srcTreeNodeRec, level) {
        
        const domTitle = document.createElement('div');
        domTitle.textContent = this.extractSrcTitle(srcTreeNodeRec);

        return domTitle;
    }

    isLeaf(srcTreeNodeRec) {

        const treeNodes = this.extractSrcTreeNodes(srcTreeNodeRec);

        if (Array.isArray(treeNodes)) {
            return treeNodes.length === 0;
        }

        return true;
    }

    createLeafControl(srcTreeNodeRec, major, level) {

        const title = this.assembleLeafTitle(srcTreeNodeRec);

        const propsRec = {
            'refCode': this.extractRefCode(srcTreeNodeRec),
            'content': title,
            'level': level
        }

        return new kwish_TreeLeafControl(major, propsRec);        
    }

    createHubControl(srcTreeNodeRec, major, level) {

        const title = this.assembleHubTitle(srcTreeNodeRec);

        const propsRec = {
            'initialState': this.extractTreeNodeState(srcTreeNodeRec),
            'refCode': this.extractRefCode(srcTreeNodeRec),
            'titleDOMView': title,
            'level': level,
            'origTitle': srcTreeNodeRec.title
        }
        
        return new kwish_TreeHubControl(major, propsRec);
    }

    createTreeNodeControl(srcTreeNodeRec, major, level) {

        if (this.isLeaf(srcTreeNodeRec)) {
            return this.createLeafControl(srcTreeNodeRec, major, level);
        } else {
            return this.mountTreeNodeControls(srcTreeNodeRec, major, level);
        }
    }

    mountTreeNodeControls(srcTreeNodeRec,  major, level = 0) {

        const currShowHideBlock = this.createHubControl(srcTreeNodeRec, major, level);

        const minorControls = [];

        for(const treeNode of this.extractSrcTreeNodes(srcTreeNodeRec)) {
            minorControls.push(
                this.createTreeNodeControl(treeNode, currShowHideBlock, level + 1)
            );
        }
        
        currShowHideBlock.setContentControls(...minorControls);
        
        return currShowHideBlock;
    }

    forceHubsToState(toState, ...nodeRefCodes) {

        this.doTask(
            new kwish_Task(toState)
                .setPayload(nodeRefCodes)
                .setPropagationStrategyCode(kwish_TASK_SINKER)
            );

        return this;
    }

    unfoldHubs(...nodeRefCodes) {
        return this.forceHubsToState('unfold', ...nodeRefCodes);
    }

    foldHubs(...nodeRefCodes) {
        return this.forceHubsToState('fold', ...nodeRefCodes);
    }

    exposeNodes(...nodeRefCodes) {

        this.doTask(
            new kwish_Task('expose')
                .setPayload(nodeRefCodes)
                .setPropagationStrategyCode(kwish_TASK_SINKER)
            );

        return this;
    }

    getUnfoldedNodes() {
        let unfolded = [];
        return this.getMinor().getUnfoldedNodes(unfolded);
    }

    openRoot() {
        this.getMinor().forceShow();
        return this;
    }

    openByTreePaths(treePaths) {
        this.doCommand('openByTreePaths', kwish_TASK_SINKER, treePaths);
    }

    handle_stateChanged(task) {
        

    }
}

// Selectable trees

class kwish_SelectableTreeNode extends kwish_Gear {

    setup() {

        this.easyFSMachine(
            `[*] --> passive
            passive         --> responsive      : acceptRefcode
            responsive      --> selected        : highlight
            normal          --> selected        : highlight
            responsive      --> autoHighlighted : autoHighlight
            normal          --> autoHighlighted : autoHighlight
            selected        --> highlighted     : unhighlight
            autoHighlighted --> normal          : unhighlight
            highlighted     --> normal          : unhighlight`
        );
        
        if (!!this.getRefCode()) {
            this.doCommand('acceptRefcode')
        }
    }

    highlight() {            
        kwish_DOMUtils.applyCSSHighlight(this.getDOMView());
        return this;
    }

    unhighlight() {    
        kwish_DOMUtils.applyCSSHighlight(this.getDOMView());
        return this;
    }

    handle_selected_entered(task) {
        this.doCommand('unhighlight', kwish_TASK_PUBLIC);
    }

    handle_highlighted_entered(task) {
        this.terminateTask(task)
            .highlight()
            .doCommand('userAction', kwish_TASK_BUBBLE, this.getRefCode());
    }

    handle_autoHighlighted_entered(task) {
        this.terminateTask(task).highlight();
    }

    handle_normal_entered(task) {
        this.terminateTask(task).unhighlight();
    }

    handle_forceHighlight(task) {
        if (task.getPayload() === this.getRefCode()) {
            this.terminateTask(task).doCommand('autoHighlight');
        }
    }

    handle_dom_click(task) {
        this.terminateTask(task).doCommand('highlight');
    }
}

class kwish_SelectableTreeHubControl extends kwish_TreeHubControl {

    constructor(major, propsRec, id = undefined) {
        super(major, propsRec, id);
        this.mixin(kwish_SelectableTreeNode).setup();
    }

    getHighlightElement() {
        return this.getSpots()['title'];
    }

    highlight() {            
        kwish_DOMUtils.applyCSSHighlight(this.getHighlightElement());
        return this;
    }

    unhighlight() {    
        kwish_DOMUtils.applyCSSHighlight(this.getHighlightElement());
        return this;
    }
}

class kwish_SelectableTreeLeafControl extends kwish_TreeLeafControl {

    constructor(major, propsRec, id = undefined) {
        super(major, propsRec, id);
        this.mixin(kwish_SelectableTreeNode).setup();       
    }
}

class kwish_SelectableTreeControl extends kwish_TreeControl {

    createLeafControl(srcTreeNodeRec, major, level) {

        const title = this.assembleLeafTitle(srcTreeNodeRec);

        const propsRec = {
            'refCode': this.extractRefCode(srcTreeNodeRec),
            'content': title,
            'level': level
        }

        return new kwish_SelectableTreeLeafControl(major, propsRec);        
    }

    createHubControl(srcTreeNodeRec, major, level) {

        const title = this.assembleHubTitle(srcTreeNodeRec);

        const propsRec = {
            'initialState': this.extractTreeNodeState(srcTreeNodeRec),
            'refCode': this.extractRefCode(srcTreeNodeRec),
            'titleDOMView': title,
            'level': level,
            'origTitle': srcTreeNodeRec.title
        }
        
        return new kwish_SelectableTreeHubControl(major, propsRec);
    }

    forceHighlight(nodeRefCode) {
        this.doCommand('forceHighlight', kwish_TASK_SINKER, nodeRefCode);
        this.exposeNodes(nodeRefCode);
        return this;
    }

    handle_userAction(task) {
        console.log(`Selected: ${task.getPayload()}`);
    }
}