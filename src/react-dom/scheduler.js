import { ELEMENT_TEXT, TAG_ROOT, TAG_TEXT, TAG_HOST, PLACEMENT, DELETION, UPDATE, TAG_CLASS, TAG_FUNCTION_COMPONENT } from '../react/constants';
import { updateDOM } from './utils';
import { UpdateQueue, Update } from '../react/UpdateQueue';
let nextUnitOfWork = null;//下一个工作单元
let workInProgressRoot = null;//RootFiber应用的根
let currentRoot = null;//渲染成功之后的树
let deletions = [];//删除的节点我们不放在effect list中，所以要单独执行
let workInProgressFiber = null;//正在工作中的fiber
let hookIndex = 0;//hook索引
//render阶段有两个任务1.根据虚拟dom生成fiber树，收集effectlist
export function scheduleRoot(rootFiber) {
    if (currentRoot && currentRoot.alternate) {
        workInProgressRoot = currentRoot.alternate;//第一次渲染出来的fiber tree

        workInProgressRoot.alternate = currentRoot;
        if (rootFiber) workInProgressRoot.props = rootFiber.props;
    } else if (currentRoot) {
        if (rootFiber) {
            rootFiber.alternate = currentRoot;
            workInProgressRoot = rootFiber;
        } else {
            workInProgressRoot = {
                ...currentRoot,
                alternate: currentRoot
            }
        }
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

    while (returnFiber.tag !== TAG_HOST &&
        returnFiber.tag !== TAG_ROOT && returnFiber.tag !== TAG_TEXT) {
        returnFiber = returnFiber.return;
    }

    let returnDOM = returnFiber.stateNode;
    if (currentFiber.effectTag === PLACEMENT) {
        let nextFiber = currentFiber;

        //如果挂载的节点不是DOM节点，比如说是类组件的Fiber,一直找第一个儿子，直到找到第一个真实DOM为止
        while (nextFiber.tag !== TAG_HOST && nextFiber.tag !== TAG_TEXT) {
            nextFiber = currentFiber.child;
        }
        returnDOM.appendChild(nextFiber.stateNode)
    } else if (currentFiber.effectTag === DELETION) {
        return commitDeletion(currentFiber, returnDOM);
        //  returnDOM.removeChild(currentFiber.stateNode);
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

function commitDeletion(currentFiber, returnDOM) {
    if (currentFiber.tag === TAG_HOST && currentFiber.tag === TAG_TEXT) {
        returnDOM.removeChild(currentFiber.stateNode);
    } else {
        currentFiber.child && commitDeletion(currentFiber.child, returnDOM)
    }

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
        if (newChild && typeof newChild.type === 'function' && newChild.type.prototype.isReactComponent) {
            tag = TAG_CLASS;
        } else if (newChild && typeof newChild.type === 'function') {
            tag = TAG_FUNCTION_COMPONENT;
        } else if (newChild && typeof newChild.type === 'string') {
            tag = TAG_HOST;
        } else if (newChild && newChild.type === ELEMENT_TEXT) {
            tag = TAG_TEXT;
        }

        if (sameType) {//老fiber和新的虚拟dom一样，可以复用老的DOM节点，更新即可
            if (oldFiber.alternate) {
                newFiber = oldFiber.alternate;
                newFiber.props = newChild.props;
                newFiber.alternate = oldFiber;
                newFiber.stateNode = oldFiber.stateNode;
                newFiber.updateQueue = oldFiber.updateQueue || new UpdateQueue();
                newFiber.effectTag = UPDATE;
                newFiber.nextEffect = null;
            } else {
                newFiber = {
                    tag: oldFiber.tag,
                    type: oldFiber.type,
                    props: newChild.props,
                    stateNode: oldFiber.stateNode,
                    return: currentFiber,
                    updateQueue: oldFiber.updateQueue || new UpdateQueue(),
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
                    updateQueue: new UpdateQueue(),
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

    } else if (currentFiber.tag === TAG_CLASS) {
        updateClassComponent(currentFiber);
    } else if (currentFiber.tag === TAG_FUNCTION_COMPONENT) {//类组件
        updateFunctionComponent(currentFiber);
    }
}

function updateFunctionComponent(currentFiber) {
    workInProgressFiber = currentFiber;
    hookIndex = 0;
    workInProgressFiber.hooks = [];
    const newChildern = [currentFiber.type(currentFiber.props)];
    reconcileChildren(currentFiber, newChildern);
}


function updateClassComponent(currentFiber) {
    if (!currentFiber.stateNode) {//类组件的stateNode组件实例
        currentFiber.stateNode = new currentFiber.type(currentFiber.props);
        currentFiber.stateNode.internalFiber = currentFiber;
        currentFiber.updateQueue = new UpdateQueue()
    }
    //给组件实例的state赋值
    currentFiber.stateNode.state = currentFiber.updateQueue.forceUpdate(currentFiber.stateNode.state);
    let newElement = currentFiber.stateNode.render();
    const newChildern = [newElement];
    reconcileChildren(currentFiber, newChildern);
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

export function useReducer(reducer, initialValue) {
    let oldHook = workInProgressFiber.alternate &&
        workInProgressFiber.alternate.hooks && workInProgressFiber.alternate.hooks[hookIndex];
    let newHook = oldHook;
    if (oldHook) {
        oldHook.state = oldHook.updateQueue.forceUpdate(oldHook.state);
    } else {
        newHook = {
            state: initialValue,
            updateQueue: new UpdateQueue()
        }
    }

    const dispatch = action => {
        newHook.updateQueue.enqueueUpdate(
            new Update(reducer ? reducer(newHook.state, action) : action)
        )

        scheduleRoot();
    }
    workInProgressFiber.hooks[hookIndex++] = newHook;
    return [newHook.state, dispatch];
}

export function useState(initialValue) {
    return useReducer(null, initialValue);

}