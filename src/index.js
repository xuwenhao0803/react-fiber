import React from './react';
import ReactDOM from './react-dom';



function reducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return { count: state.count + 1 }
    default:
      return state
  }

}
function FunctionCounter() {
  const [countState, dispatch] = React.useReducer(reducer, { count: 0 })

  return   React.createElement("div", {}, React.createElement("span", {}, countState.count),
  React.createElement("button", {
    onClick: () => {
      dispatch({
        type: 'ADD'
      })
    }
  }, "+1"))
}

const element=React.createElement(FunctionCounter, {});
ReactDOM.render(element, document.getElementById('root'));

