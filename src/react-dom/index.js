

import {  TAG_ROOT } from '../react/constants';
import {scheduleRoot} from './scheduler';
function render(element, container) {

    let rootFiber = {
        tag: TAG_ROOT,
        stateNode: container,//一般情况下指向原生dom节点
        props: { children: [element] }
    }
    scheduleRoot(rootFiber);
}

const reactDom = {
    render
}

export default reactDom;