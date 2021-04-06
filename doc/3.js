let A1 = { type: 'div', key: 'A1' };
let B1 = { type: 'div', key: 'B1',return:A1  };
let B2 = { type: 'div', key: 'B2',return:A1  };
let C1 = { type: 'div', key: 'C1',return:B1  };
let C2 = { type: 'div', key: 'C2',return:B1 };

A1.child = B1;
B1.slbling = B2;
B1.child = C1;
C1.slbling = C2;

let nextUnitofWork = null;
function workLoop(deadline) {
    if ((deadline.timeRemaining() > 0 || deadline.didTimeout) && nextUnitofWork) {
        nextUnitofWork=  performUnitofWork(nextUnitofWork)
    }
    if (!nextUnitofWork) {
        console.log('render阶段结束');
    } else {
        console.log('下一次执行单元执行');
        requestIdleCallback(workLoop, { timeout: 500 })
    }

}

function performUnitofWork(fiber) {
    beginWork(fiber);
    if (fiber.child) {
        return fiber.child
    }
    //如果没有儿子说明节点已经完成了
    while (fiber) {
        completeUnitOfWork(fiber);
        if (fiber.slbling) return fiber.slbling

        fiber = fiber.return
    }

}

function completeUnitOfWork(fiber) {
    console.log(`${fiber.key}完成`);
}

function beginWork(fiber) {

    console.log(fiber.key);
}


nextUnitofWork = A1;
requestIdleCallback(workLoop, { timeout: 500 })





