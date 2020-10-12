import React from "react";
import {Alert, StyleSheet, Text, View} from "react-native";
import {Theme} from './../../app/index.js';
import InputBox from "./../../components/InputBox.js";
import Button from "./../../components/Button.js";

export default class ClubName extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: this.props.club.getName()
    };
  }

  saveName() {
    this.props.club.updateName(this.state.name);
    this.props.setting_screen.navigateBack();
  }

  render() {
    return (
      <View>
        <InputBox
          returnKeyType="next"
          type="name"
          label="Name"
          placeholder={this.props.club.getName()}
          marginTop={-10}
          value={this.state.name}
          onChange={v => (this.state.name = v)}/>
        <Button marginTop={40} label="Fertig" onPress={() => this.saveName()}/>
      </View>
    );
  }
}
