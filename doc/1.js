class Update {
    constructor(payload, nextUpdate) {
        this.payload = payload;
        this.nextUpdate = nextUpdate;
    }
}
class UpdateQueue {
    constructor() {
        this.baseState = null;
        this.firstUpdate = null;
        this.lastUpdate = null;
    }
    enqueueUpdate(state) {

        if (this.firstUpdate === null) {
            this.firstUpdate = this.lastUpdate = state;
        } else {
            this.lastUpdate.nextUpdate = state
            this.lastUpdate = state
        }
    }

    forceUpdate() {
        let currenState = this.baseState || {};
        let queue = this.firstUpdate;

        while (queue) {
            let nextState = queue.payload;
            currenState = { ...currenState, ...nextState };
            queue = queue.nextUpdate;

        }
        this.baseState=currenState;
        this.firstUpdate = this.lastUpdate = null;
    }


}
let update = new UpdateQueue();
update.enqueueUpdate(new Update({ name: 'xwh' }));
update.enqueueUpdate(new Update({ age: 11 }));
update.enqueueUpdate(new Update({ age: 12 }));

console.log(update);

update.forceUpdate();


