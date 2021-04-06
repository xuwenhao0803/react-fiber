/**
 * fiber之前是怎么样的
 * 
 */
let root = {
    key: 'A1',
    children: [
        {
            key: 'B1', children: [
                { key: 'C1', children: [] },
                { key: 'C2', children: [] },
            ]
        },
        { key: 'B2', children: [] },
    ]
};


function work(vdom) {
    dowork(vdom);
    vdom.children.forEach((child)=>{
        work(child)
    })

}


function dowork(vdom) {
    console.log(vdom.key);
}

work(root)