export function updateDOM(stateNode, oldProps, newProps) {

    for (let key in oldProps) {

    }
    for (let key in newProps) {
        if (key !== 'children') {
            setprop(stateNode, key, newProps[key])
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
        dom.setAttribute(key, value)
    }


}