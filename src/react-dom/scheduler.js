import { ELEMENT_TEXT, TAG_ROOT, TAG_TEXT, TAG_HOST, PLACEMENT, DELETION, UPDATE } from '../react/constants';
import { updateDOM } from './utils';
let nextUnitOfWork = null;//下一个工作单元
let workInProgressRoot = null;//RootFiber应用的根
let currentRoot = null;//渲染成功之后的树
let deletions = [];//删除的节点我们不放在effect list中，所以要单独执行
//render阶段有两个任务1.根据虚拟dom生成fiber树，收集effectlist
export function scheduleRoot(rootFiber) {
    if (currentRoot && currentRoot.alternate) {
        workInProgressRoot = currentRoot.alternate;//第一次渲染出来的fiber tree
        workInProgressRoot.props = rootFiber.props;
        workInProgressRoot.alternate = currentRoot;
    } else if (currentRoot) {
        rootFiber.alternate = currentRoot;
        workInProgressRoot = rootFiber;
    } else {
        workInProgressRoot = rootFiber;
    }
    workInProgressRoot.firstEffect = workInProgressRoot.lastEffect = null;
    nextUnitOfWork = workInProgressRoot;

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
    deletions.forEach(commitWork);
    let currentFiber = workInProgressRoot.firstEffect;
    while (currentFiber) {

        commitWork(currentFiber);
        currentFiber = currentFiber.nextEffect;

    }
    deletions.length = 0;
    currentRoot = workInProgressRoot;
    workInProgressRoot = null;
}

function commitWork(currentFiber) {
    if (!currentFiber) return;
    let returnFiber = currentFiber.return;
    let returnDOM = returnFiber.stateNode;
    if (currentFiber.effectTag === PLACEMENT) {
        returnDOM.appendChild(currentFiber.stateNode)
    } else if (currentFiber.effectTag === DELETION) {
        returnDOM.removeChild(currentFiber.stateNode);
    } else if (currentFiber.effectTag === UPDATE) {
        if (currentFiber.tag === TAG_TEXT) {
            if (currentFiber.alternate.props.text !== currentFiber.props.text) {
                currentFiber.stateNode.textContent = currentFiber.props.text;
            }
        } else {

            updateDOM(currentFiber.stateNode, currentFiber.alternate.props, currentFiber.props)

        }
    }
    currentFiber.effectTag = null

}



function updateHostRoot(currentFiber) {
    let newChildren = currentFiber.props.children;
    reconcileChildren(currentFiber, newChildren);
}



function reconcileChildren(currentFiber, newChildren) {

    let newChildIndex = 0;
    let oldFiber = currentFiber.alternate && currentFiber.alternate.child;
    let prevSibling;//上一个子元素的索引
    let newFiber;
    while (newChildIndex < newChildren.length) {
        let newChild = newChildren[newChildIndex];//拿出虚拟dom节点
        let sameType = oldFiber && newChild && newChild.type === oldFiber.type;
        let tag;
        if (newChild && typeof newChild.type === 'string') {
            tag = TAG_HOST;
        } else if (newChild && newChild.type === ELEMENT_TEXT) {
            tag = TAG_TEXT;
        }

        if (sameType) {//老fiber和新的虚拟dom一样，可以复用老的DOM节点，更新即可
            if (oldFiber.alternate) {
                newFiber = oldFiber.alternate;
                newFiber.props = newChild.props;
                newFiber.alternate = oldFiber;
                newFiber.effectTag = UPDATE;
                newFiber.nextEffect = null;
            } else {
                newFiber = {
                    tag: oldFiber.tag,
                    type: oldFiber.type,
                    props: newChild.props,
                    stateNode: oldFiber.stateNode,
                    return: currentFiber,
                    alternate: oldFiber,
                    effectTag: UPDATE,//副作用标识
                    nextEffect: null
                }
            }


        } else {

            if (newChild) {
                newFiber = {
                    tag,
                    type: newChild.type,
                    props: newChild.props,
                    stateNode: null,
                    return: currentFiber,
                    effectTag: PLACEMENT,//副作用标识
                    nextEffect: null
                }
            }
            if (oldFiber) {
                oldFiber.effectTag = DELETION;
                deletions.push(oldFiber);
            }
        }
        if (oldFiber) {
            oldFiber = oldFiber.sibling;
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
            returnFiber.lastEffect = currentFiber.lastEffect
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