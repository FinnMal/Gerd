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
  Platform
} from "react-native";
import AutoHeightImage from "react-native-auto-height-image";
import FileViewer from "react-native-file-viewer";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faPlusCircle, faChevronCircleLeft, faChevronRight} from "@fortawesome/free-solid-svg-icons";
import {Theme} from './../app/index.js';

import database from "@react-native-firebase/database";

// SETTING class: component for a setting element (used for User Settings)
export default class Setting extends React.Component {
  constructor(props) {
    super(props);

  }

  _onPress() {
    if (this.props.onPress) 
      this.props.onPress();
    else if (this.props.setting == "logo") {
      this.props.imagePicker();
    } else if (this.props.setting != "switch") {
      if (this.props.utils) {
        this.props.utils.getNavigation().navigate("SettingScreen", {
          headline: this.props.label,
          club: this.props.club,
          utils: this.props.utils,
          childs: this.props.children
        });
      }
    }
  }

  render() {
    return (
      <Theme.View style={{
          marginTop: .7
        }}>
        <TouchableOpacity
          style={{
            padding: 3,
            paddingLeft: 20,
            paddingRight: 20,
            marginTop: 7.5,
            marginBottom: 9,
            flexWrap: "wrap",
            alignItems: "flex-start",
            flexDirection: "row",
            alignItems: "center"
          }}
          onPress={() => this._onPress()}>
          <Theme.TouchableOpacity color={"primary"} style={{
              padding: 8,
              borderRadius: 11
            }} onPress={() => this._onPress()}>
            <Theme.IconOnColor
              backgroundColor={"primary"}
              size={19}
              color={!this.props.iconColor
                ? "#1e1e1e"
                : "white"}
              icon={this.props.isEnabled || this.props.isEnabled == null
                ? this.props.icon
                : this.props.iconInactive}/>
          </Theme.TouchableOpacity>
          <Theme.Text
            style={{
              marginLeft: 20,
              opacity: 0.85,
              fontFamily: "Poppins-SemiBold",
              fontSize: 19
            }}>
            {this.props.label}
          </Theme.Text>
          {
            this.props.type == null
              ? (
                <TouchableOpacity
                  style={{
                    alignSelf: 'flex-end',
                    marginLeft: 'auto',
                    padding: 8,
                    opacity: 0.77
                  }}
                  onPress={() => this._onPress()}>
                  <Theme.Icon size={16} color="white" icon={faChevronRight}/>
                </TouchableOpacity>
              )
              : (void 0)
          }
          {
            this.props.type == "switch"
              ? (
                <Theme.Switch
                  style={{
                    alignSelf: 'flex-end',
                    marginLeft: 'auto'
                  }}
                  onValueChange={() => this.props.onSwitch()}
                  value={this.props.isEnabled}/>
              )
              : (void 0)
          }
        </TouchableOpacity>
      </Theme.View>
    );
  }
}
