// * * ** *** ***** ******** ************* *********************
// Product:     Reader and Navigator Kit
// Part:        Front-End JS library
// Module:      uitree.js                      (\(\
// Func:        Making interactive trees       (^.^)  
// * * ** *** ***** ******** ************* *********************


class RNav_TreeHubControl extends RNav_ShowHideBlock {

    makeDOMView() {
        const DOMView = super.makeDOMView();
        RNav_DOMUtils.toggleCSSClass(DOMView, `level${this.getLevel()}`);
        return DOMView;
    }
}

class RNav_TreeLeafControl extends RNav_BasicDOMControl {
    
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

    extractSrcNodes(srcTreeNodeRec) {
        return srcTreeNodeRec.nodes;
    }

    extractNodeState(srcTreeNodeRec) {
        return srcTreeNodeRec.state || 'hidden';
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

        const tmpNodes = this.extractSrcNodes(srcTreeNodeRec);

        if (Array.isArray(tmpNodes)) {
            return tmpNodes.length === 0;
        }

        return true;
    }

    createLeafControl(srcTreeNodeRec, major, level) {

        const title = this.assembleLeafTitle(srcTreeNodeRec);

        const propsRec = {
            'level': level,
            'titleDOMView': title
        }

        const basic = new RNav_TreeLeafControl(major, propsRec);
        
        return basic;
    }

    createHubControl(srcTreeNodeRec, major, level) {

        const title = this.assembleHubTitle(srcTreeNodeRec);
        console.log(level)
        const propsRec = {
            'initialState': this.extractNodeState(srcTreeNodeRec),
            'titleDOMView': title,
            'level': level
        }

        return new RNav_TreeHubControl(major, propsRec);
    }

    createNodeControl(srcTreeNodeRec, major, level) {

        if (this.isLeaf(srcTreeNodeRec)) {
            return this.createLeafControl(srcTreeNodeRec, major, level);
        } else {
            return this.mountNodeControls(srcTreeNodeRec, major, level);
        }
    }

    mountNodeControls(srcTreeNodeRec,  major, level = 0) {

        const currShowHideBlock = this.createHubControl(srcTreeNodeRec, major, level);

        const minorControls = [];

        for(const node of this.extractSrcNodes(srcTreeNodeRec)) {
            minorControls.push(
                this.createNodeControl(node, currShowHideBlock, level + 1)
            );
        }
        
        currShowHideBlock.setContentControls(...minorControls);
        
        return currShowHideBlock;
    }

    
}