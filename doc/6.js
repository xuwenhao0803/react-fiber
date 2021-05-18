const q1 = {
    pending: {
        action: 1,
        next: {
            action: 2,
            next: null
        }
    }
}


function dispatchAction(queue, action) {
    const update = {
        action, next: null
    }
    if (queue.pending === null) {
        update.next = update
    } else {
        update.next = queue.pending.next;
        queue.pending.next = update
    }
    queue.pending = update;

}

dispatchAction(q1,4);