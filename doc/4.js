import React from './react';
import ReactDOM from './react-dom';



class Count extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      number: 0
    }
  }
  handleClick = () => {
    this.setState({
      number: this.state.number + 1
    })
  }
  render() {
    return React.createElement("div", {}, React.createElement("div", {}, this.state.number),
      React.createElement("button", {
        onClick: this.handleClick
      }, "+"))
  }
}
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

  return  React.createElement("div", {}, React.createElement("span", {}, 0),
      React.createElement("button", {
        onClick: () => {
          dispatch({
            type: 'ADD'
          })
        }
      }, "+1"),
      React.createElement("div", {}, countState.count % 2 ?
        React.createElement("div", {key:'hahaha'}, React.createElement("p", {key:'wenhao'}, "a"),
          React.createElement("h3", {key:'xu'}, "xu")) :
        React.createElement("div", {key:'hahaha'}, React.createElement("h3", {key:'xu'}, "xu"),
          React.createElement("p", {key:'wenhao'}, "wenhao"))))





}

ReactDOM.render(<FunctionCounter />, document.getElementById('root'));

