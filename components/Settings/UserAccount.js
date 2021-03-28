import React from "react";
import {Alert, StyleSheet, Text, View} from "react-native";
import {Theme} from './../../app/index.js';
import InputBox from "./../../components/InputBox.js";
import Button from "./../../components/Button.js";

export default class UserAccount extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: this.props.name,
      email: this.props.email,
      password: this.props.password
    };
  }

  render() {
    return (
      <View>
        <InputBox returnKeyType="next" type="name" label="Name" marginTop={-10} value={this.state.name} onChange={v => (this.state.name = v)}/>
        <InputBox
          keyboardType="email-address"
          returnKeyType="next"
          type="emailAddress"
          label="E-Mail"
          marginTop={20}
          value={this.state.email}
          onChange={v => (this.state.email = v)}/>
        <InputBox
          returnKeyType="done"
          type="newPassword"
          secure={true}
          label="Passwort"
          marginTop={20}
          value={this.state.password}
          onChange={v => (this.state.password = v)}/>
        <Button marginTop={40} label="Fertig" onPress={() => this.props.onChange(this.state)}/>
      </View>
    );
  }
}
