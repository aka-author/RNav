// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      uitree.js                      (\(\
// Func:        Making interactive trees       (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_TreeNode {

    handle_expose(task) {
        if (task.getPayload().includes(this.getRefCode())) {
            this.getMajor().doCommand('exposeMinors', RNav_TASK_BUBBLE);
        }
    }
}

class RNav_TreeHubControl extends RNav_ShowHideBlock {

    constructor(major, propsRec, id = undefined) {
        super(major, propsRec, id);
        this.mixin(RNav_TreeNode);
    }

    makeDOMView() {
        const DOMView = super.makeDOMView();
        RNav_DOMUtils.toggleCSSClass(DOMView, `level${this.getLevel()}`);
        return DOMView;
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
}

class RNav_TreeLeafControl extends RNav_BasicDOMControl {

    constructor(major, propsRec, id = undefined) {
        super(major, propsRec, id);
        this.mixin(RNav_TreeNode);        
    }
    
    makeDOMView() {
        const DOMView = super.makeDOMView();
        RNav_DOMUtils.toggleCSSClass(DOMView, `level${this.getLevel()}`);
        return DOMView;
    }
}

class RNav_TreeControl extends RNav_DOMControl {

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

        return new RNav_TreeLeafControl(major, propsRec);        
    }

    createHubControl(srcTreeNodeRec, major, level) {

        const title = this.assembleHubTitle(srcTreeNodeRec);

        const propsRec = {
            'initialState': this.extractTreeNodeState(srcTreeNodeRec),
            'refCode': this.extractRefCode(srcTreeNodeRec),
            'titleDOMView': title,
            'level': level
        }
        
        return new RNav_TreeHubControl(major, propsRec);
    }

    createTreeNodeControl(srcTreeNodeRec, major, level) {

        if (this.isLeaf(srcTreeNodeRec)) {
            return this.createLeafControl(srcTreeNodeRec, major, level);
        } else {
            return this.mountNodeControls(srcTreeNodeRec, major, level);
        }
    }

    mountNodeControls(srcTreeNodeRec,  major, level = 0) {

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
            new RNav_Task(toState)
                .setPayload(nodeRefCodes)
                .setPropagationStrategyCode(RNav_TASK_SINKER)
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
            new RNav_Task('expose')
                .setPayload(nodeRefCodes)
                .setPropagationStrategyCode(RNav_TASK_SINKER)
            );

        return this;
    }

}