export function updateDOM(stateNode, oldProps = {}, newProps) {

    for (let key in oldProps) {
        if (key !== 'children') {
            if (newProps.hasOwnProperty(key)) {
                setprop(stateNode, key, newProps[key])
            } else {
                stateNode.removeAttribute(key);
            }
        }
    }
    for (let key in newProps) {
        if (key !== 'children') {
            if (!oldProps.hasOwnProperty(key)) {
                setprop(stateNode, key, newProps[key])
            }
        }
    }
}


function setprop(dom, key, value) {
    if (/^on/.test(key)) {
        dom[key.toLowerCase()] = value;
    } else if (key === 'style') {
        if (value) {
            for (let styleName in value) {
                dom.style[styleName] = value[styleName];
            }
        }

    } else {
        console.log(value);
        if (key !== 'text') {
            dom.setAttribute(key, value)
        }


    }


}