import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActionSheetIOS,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Platform,
  Switch
} from "react-native";
import AutoHeightImage from "react-native-auto-height-image";
import FileViewer from "react-native-file-viewer";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {
  faPlusCircle,
  faChevronCircleLeft,
  faChevronRight
} from "@fortawesome/free-solid-svg-icons";

import database from "@react-native-firebase/database";

export default class Setting extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isEnabled: false
    };
  }

  _onPress() {
    if (this.props.setting == "logo") {
      this.props.imagePicker();
    } else if (this.props.setting != "switch") {
      this.props.utils.getNavigation().navigate("SettingScreen", {
        type: this.props.setting,
        headline: this.props.label,
        club: this.props.club,
        utils: this.props.utils,
        callback: this.props.callback
      });
    }
  }

  render() {
    return (
      <TouchableOpacity
        style={{
          marginTop: 7.5,
          marginBottom: 9,
          flexWrap: "wrap",
          alignItems: "flex-start",
          flexDirection: "row",
          alignItems: "center"
        }}
        onPress={() => this._onPress()}
      >
        <TouchableOpacity
          style={{
            padding: 8,
            backgroundColor: this.props.color ? this.props.color : "#16FFD7",
            borderRadius: 11
          }}
          onPress={() => this._onPress()}
        >
          <FontAwesomeIcon
            size={20}
            color={!this.props.iconColor ? "#38304C" : "white"}
            icon={this.props.icon}
          />
        </TouchableOpacity>
        <Text
          style={{
            width: this.props.type == "switch" ? 238 : 240,
            marginLeft: 20,
            fontFamily: "Poppins-SemiBold",
            fontSize: 20,
            color: "white"
          }}
        >
          {this.props.label}
        </Text>
        {this.props.type == null ? (
          <TouchableOpacity
            style={{padding: 8, opacity: 0.77}}
            onPress={() => this._onPress()}
          >
            <FontAwesomeIcon size={20} color="white" icon={faChevronRight} />
          </TouchableOpacity>
        ) : (
          void 0
        )}
        {this.props.type == "switch" ? (
          <Switch
            style={{
              transform: [{scale: 0.8}]
            }}
            trackColor={{false: "#575757", true: "#16FFD7"}}
            thumbColor={this.props.isEnabled ? "#38304C" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => this.props.onSwitch()}
            value={this.props.isEnabled}
          />
        ) : (
          void 0
        )}
      </TouchableOpacity>
    );
  }
}
