
import { UpdateQueue, Update } from './UpdateQueue';
import { ELEMENT_TEXT, UPDATE } from './constants';
import { scheduleRoot, useReducer, useState } from '../react-dom/scheduler';
function createElement(type, config = {}, ...children) {
    return {
        type,
        props: {
            ...config,
            children: children.map(child => {
                return typeof child === 'object' ? child : {
                    type: ELEMENT_TEXT,
                    props: {
                        text: child, children: []
                    }
                }
            })
        }
    }
}

class Component {
    constructor(props) {
        this.props = props;

    }

    setState(payload) {//可能是对象,也可能是函数
        let update = new Update(payload);
        this.internalFiber.updateQueue.enqueueUpdate(update);
        scheduleRoot()

    }

}

Component.prototype.isReactComponent = {};//类组件
const React = {
    createElement,
    Component,
    useReducer, useState
}

export default React;