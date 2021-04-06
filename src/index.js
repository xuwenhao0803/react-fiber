import React from './react';
import ReactDOM from './react-dom';

const style={border:'1px solid red',padding:'5px'}

let element =  React.createElement("div", {
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
