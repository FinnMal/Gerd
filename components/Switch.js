import React from "react";
import {View, Text} from "react-native";
import {Theme} from './../app/index.js';

export default class Switch extends React.Component {
  constructor(props) {
    super(props);
  }

  _onValueChange() {
    if (this.props.onValueChange) 
      this.props.onValueChange();
    }
  
  render() {
    if (this.props.label) 
      return (
        <View
          style={{
            marginTop: 30,
            marginBottom: 30,
            flexWrap: "wrap",
            alignItems: "flex-start",
            flexDirection: "row",
            alignItems: "center"
          }}>
          <Theme.Text
            style={{
              marginLeft: 5,
              marginRight: 20,
              opacity: 0.8,
              fontSize: 20,
              fontFamily: "Poppins-SemiBold"
            }}>
            {this.props.label}
          </Theme.Text>
          <Theme.Switch onValueChange={() => this._onValueChange()} value={this.props.value}/>
        </View>
      )
    return (<Theme.Switch onValueChange={() => this._onValueChange()} value={this.props.value}></Theme.Switch>)
  }
}
