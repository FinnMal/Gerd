import React from "react";
import {Alert, StyleSheet, Text, View} from "react-native";
import {Theme} from './../../app/index.js';
import InputBox from "./../../components/InputBox.js";
import Button from "./../../components/Button.js";
import database from "@react-native-firebase/database";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import ReactNativeHapticFeedback from "react-native-haptic-feedback"

export default class ClubName extends React.Component {
  colors = {}
  selected_color = {};
  constructor(props) {
    super(props);
    this.selected_color = this.props.club.getColor();

    // load colors
    database().ref('colors').on("value", function(snap) {
      this.colors = snap.val();
      this.forceUpdate();
    }.bind(this));
  }

  saveColor() {
    this.props.club.updateColor(this.selected_color);
    this.props.setting_screen.navigateBack();
  }

  render() {
    const club = this.props.club;
    const color_circles = Object.keys(this.colors).map(hex => {
      var color = this.colors[hex];
      return (
        <Theme.TouchableOpacity
          style={{
            marginTop: 20,
            marginLeft: 10,
            marginRight: 10,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 65,
            height: 55,
            width: 55,
            backgroundColor: "#" + color.hex
          }}
          onPress={() => {
            ReactNativeHapticFeedback.trigger("impactLight");
            this.selected_color = hex;
            this.forceUpdate();
          }}>
          {
            color.hex.toString().toUpperCase() == this.selected_color.toString().toUpperCase()
              ? (<Theme.Icon backgroundColor={"#" + color.hex} size={22} icon={faCheck}/>)
              : (void 0)
          }
        </Theme.TouchableOpacity>
      );
    });

    return (
      <View>
        <View style={{
            flexWrap: "wrap",
            alignItems: "flex-start",
            flexDirection: "row"
          }}>
          {color_circles}
        </View>

        <Button marginTop={40} label="Fertig" onPress={() => this.saveColor()}/>
      </View>
    );
  }
}
