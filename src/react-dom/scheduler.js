import { ELEMENT_TEXT, TAG_ROOT, TAG_TEXT, TAG_HOST, PLACEMENT } from '../react/constants';
import { updateDOM } from './utils';
let nextUnitOfWork = null;//下一个工作单元
let workInProgressRoot = null;//RootFiber应用的根
//render阶段有两个任务1.根据虚拟dom生成fiber树，收集effectlist
export function scheduleRoot(rootFiber) {
    workInProgressRoot = rootFiber;
    nextUnitOfWork = rootFiber;
    requestIdleCallback(workLoop, { timeout: 500 });

}

//循环工作

function workLoop(deadline) {
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {

        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

        shouldYield = deadline.timeRemaining() < 1

    }

    if (!nextUnitOfWork && workInProgressRoot) {
        commitRoot();
    }

    requestIdleCallback(workLoop, { timeout: 500 });

}


function commitRoot() {
    let currentFiber = workInProgressRoot.firstEffect;
    console.log(currentFiber);
    while (currentFiber) {

        commitWork(currentFiber);
        currentFiber = currentFiber.nextEffect;

    }
    workInProgressRoot = null;
}

function commitWork(currentFiber) {
    if (!currentFiber) return;
    let returnFiber = currentFiber.return;
    let returnDOM = returnFiber.stateNode;
    if (currentFiber.effectTag === PLACEMENT) {
        returnDOM.appendChild(currentFiber.stateNode)
    }
    currentFiber.effectTag = null

}



function updateHostRoot(currentFiber) {
    let newChildren = currentFiber.props.children;
    reconcileChildren(currentFiber, newChildren);
}



function reconcileChildren(currentFiber, newChildren) {

    let newChildIndex = 0;
    let prevSibling;//上一个子元素的索引
    while (newChildIndex < newChildren.length) {
        let newChild = newChildren[newChildIndex];//拿出虚拟dom节点
        let tag;
        if (typeof newChild.type === 'string') {
            tag = TAG_HOST;
        } else if (newChild.type === ELEMENT_TEXT) {
            tag = TAG_TEXT;
        }
        let newFiber = {
            tag,
            type: newChild.type,
            props: newChild.props,
            stateNode: null,
            return: currentFiber,
            effectTag: PLACEMENT,//副作用标识
            nextEffect: null
        }
        if (newFiber) {
            if (newChildIndex === 0) {
                currentFiber.child = newFiber;
            } else {
                prevSibling.sibling = newFiber;
            }
            prevSibling = newFiber;
        }
        newChildIndex++;
    }


}
function createDOM(currentFiber) {
    if (currentFiber.tag === TAG_TEXT) {
        return document.createTextNode(currentFiber.props.text);
    } else if (currentFiber.tag === TAG_HOST) {
        let stateNode = document.createElement(currentFiber.type);
        updateDOM(stateNode, {}, currentFiber.props)
        return stateNode;

    }
}




function updateHostText(currentFiber) {
    if (!currentFiber.stateNode) {//如果此fiber没有创建DOM节点
        currentFiber.stateNode = createDOM(currentFiber)

    }

}

function beginWork(currentFiber) {
    if (currentFiber.tag === TAG_ROOT) {
        updateHostRoot(currentFiber);
    } else if (currentFiber.tag === TAG_TEXT) {
        updateHostText(currentFiber);

    } else if (currentFiber.tag === TAG_HOST) {//原生dom节点
        updateHost(currentFiber);

    }

}
function updateHost(currentFiber) {

    if (!currentFiber.stateNode) {
        currentFiber.stateNode = createDOM(currentFiber)
    }
    reconcileChildren(currentFiber, currentFiber.props.children);


}
//收集effectList
function completeUnitOfWork(currentFiber) {
    let returnFiber = currentFiber.return;
    if (returnFiber) {
        //把父亲挂到根节点上
        let effectTag = currentFiber.effectTag;
        if (effectTag) {
            if (!returnFiber.firstEffect) {
                returnFiber.firstEffect = currentFiber.firstEffect;
            }
            if (returnFiber.lastEffect) {
                returnFiber.lastEffect.nextEffect = currentFiber.firstEffect;
            }
            returnFiber.lastEffect=currentFiber.lastEffect
            ///////////////////
            //把自己挂到父亲身上
            if (returnFiber.lastEffect) {
                returnFiber.lastEffect.nextEffect = currentFiber;
            } else {
                returnFiber.firstEffect = currentFiber;
            }
            returnFiber.lastEffect = currentFiber;
        }
    }
}

function performUnitOfWork(currentFiber) {
    debugger
    beginWork(currentFiber)
    if (currentFiber.child) {
        return currentFiber.child
    }

    while (currentFiber) {
        completeUnitOfWork(currentFiber)
        if (currentFiber.sibling) return currentFiber.sibling
        currentFiber = currentFiber.return;
    }
}