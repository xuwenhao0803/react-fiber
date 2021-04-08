import React from './react';
import ReactDOM from './react-dom';

const style = { border: '1px solid red', padding: '5px' }

let element = React.createElement("div", {
  style: style,
  id: "A1"
}, "A1", React.createElement("div", {
  style: style,
  id: "B1"
}, React.createElement("div", {
  style: style,
  id: "C1"
}, "C1"), React.createElement("div", {
  style: style,
  id: "C2"
}, "C2")), React.createElement("div", {
  style: style,
  id: "B2"
}, "B2"));




ReactDOM.render(
  element,
  document.getElementById('root')
);
let render2 = document.getElementById('render2');
render2.addEventListener('click', () => {

  let element2 = React.createElement("div", {
    style: style,
    id: "A1-new"
  }, "A1-new", React.createElement("div", {
    style: style,
    id: "B1-new"
  }, React.createElement("div", {
    style: style,
    id: "C1-new"
  }, "C1-new"), React.createElement("div", {
    style: style,
    id: "C2-new"
  }, "C2-new")));




  ReactDOM.render(
    element2,
    document.getElementById('root')
  );

})


