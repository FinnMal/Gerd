import React from "react";
import AutoHeightImage from "react-native-auto-height-image";
import {
  Alert,
  TextInput,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Dimensions
} from "react-native";

import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faPlusCircle} from "@fortawesome/free-solid-svg-icons";
import {Headlines} from "./../app/constants.js";
import {withNavigation} from "react-navigation";
import database from "@react-native-firebase/database";
import HeaderScrollView from "./../components/HeaderScrollView.js";
import Setting from "./../components/Setting.js";
import InputBox from "./../components/InputBox.js";
import Button from "./../components/Button.js";
import User from "./../classes/User.js";
import {faTrash, faEye, faUser} from "@fortawesome/free-solid-svg-icons";

class SettingsScreen extends React.Component {
  user: null;

  constructor(props) {
    super(props);
    var utils = this.props.utilsObject;
    this.state = {
      utils: utils,
      moveTo: "none",
      image_upload: {
        active: false,
        progress: 0
      }
    };

    this.user = new User(utils.getUserID());

    var cb = function() {
      this.forceUpdate();
    }.bind(this);

    this.user.startListener("name", cb);
    this.user.startListener("email", cb);
    this.user.startListener("password", cb);
    this.user.startListener("img", cb);
    this.user.startListener(
      "options",
      function() {
        this.forceUpdate();
      }.bind(this)
    );

    this.margin = new Animated.Value(0);
  }

  render() {
    const s_width = Dimensions.get("window").width;

    const user = this.user;
    var s = require("./../app/style.js");
    const marginLeft = this.margin.interpolate({
      inputRange: [0, 2000],
      outputRange: [0, 2000]
    });

    if (this.props.show) {
      return (
        <HeaderScrollView
          marginTop={80}
          headline="Einstellungen"
          headlineFontSize={47}
          backButton={false}
          showHeadline={false}
        >
          <View style={{marginLeft: -20, marginRight: -20}}>
            <View style={{backgroundColor: "#38304C", padding: 15}}>
              <View
                style={{
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  flexDirection: "row"
                }}
              >
                <TouchableOpacity onPress={() => this.openImagePicker()}>
                  {this.state.image_upload.active ? (
                    <AnimatedCircularProgress
                      size={57}
                      width={3}
                      style={{
                        position: "absolute",
                        marginTop: -3.5,
                        marginLeft: -3.5
                      }}
                      fill={this.state.image_upload.progress}
                      tintColor="#0DF5E3"
                      onAnimationComplete={() =>
                        console.log("onAnimationComplete")
                      }
                      backgroundColor="#201A30"
                    />
                  ) : (
                    void 0
                  )}

                  <AutoHeightImage
                    style={{borderRadius: 50}}
                    width={50}
                    source={{
                      uri: user.getImage()
                    }}
                  />
                </TouchableOpacity>
                <View
                  style={{
                    marginLeft: 15,
                    height: 50,
                    justifyContent: "center",
                    maxWidth: 275
                  }}
                >
                  <Text
                    style={{
                      fontSize: 21,
                      color: "white",
                      fontFamily: "Poppins-SemiBold"
                    }}
                  >
                    {user.getName()}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{marginTop: 60, backgroundColor: "#38304C", padding: 15}}
            >
              <Setting
                label="Account"
                icon={faUser}
                utils={this.props.utilsObject}
              >
                <AccountSetting
                  name={user.getName()}
                  email={user.getMail()}
                  password={user.getPassword()}
                  onChange={values => {
                    this.user.updateName(values.name);
                    this.user.updateMail(values.email);
                    this.user.updatePassword(values.password);
                    this.state.utils.getNavigation().navigate("ScreenHandler");
                  }}
                />
              </Setting>
            </View>
            <View
              style={{marginTop: 40, backgroundColor: "#38304C", padding: 15}}
            >
              <Setting
                type="switch"
                isEnabled={this.user.getOption("show_groups")}
                onSwitch={() => {
                  this.user.toggleOption("show_groups");
                }}
                label="Empfänger anzeigen"
                icon={faEye}
              />
              <Setting
                type="switch"
                isEnabled={this.user.getOption("send_notifications")}
                onSwitch={() => {
                  this.user.toggleOption("send_notifications");
                }}
                label="Mitteilungen senden"
                icon={faEye}
              />
            </View>
            <View
              style={{marginTop: 40, backgroundColor: "#38304C", padding: 15}}
            >
              <Setting
                label="Vereine"
                icon={faTrash}
                onPress={() => alert("setting")}
              />
              <Setting
                label="Konto löschen"
                icon={faTrash}
                onPress={() => alert("setting")}
              />
            </View>

            <View
              style={{marginTop: 40, backgroundColor: "#38304C", padding: 15}}
            >
              <Setting
                color="red"
                label="Konto löschen"
                icon={faTrash}
                iconColor="light"
                type="action"
                onPress={() => alert("setting")}
              />
            </View>
          </View>
        </HeaderScrollView>
      );
    }
    return null;
  }

  checkIfScrollViewIsNeeded(viewHeight) {
    if (viewHeight < Dimensions.get("window").height) {
      this.props.setScrollViewEnabled(false);
    } else {
      this.props.setScrollViewEnabled(true);
    }
  }
}

//Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent"
  }
});

class AccountSetting extends React.Component {
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
        <InputBox
          returnKeyType="next"
          type="name"
          label="Name"
          marginTop={-10}
          value={this.state.name}
          onChange={v => (this.state.name = v)}
        />
        <InputBox
          keyboardType="email-address"
          returnKeyType="next"
          type="emailAddress"
          label="E-Mail"
          marginTop={20}
          value={this.state.email}
          onChange={v => (this.state.email = v)}
        />
        <InputBox
          returnKeyType="done"
          type="newPassword"
          secure={true}
          label="Passwort"
          marginTop={20}
          value={this.state.password}
          onChange={v => (this.state.password = v)}
        />
        <Button
          marginTop={40}
          label="Fertig"
          onPress={() => this.props.onChange(this.state)}
        />
      </View>
    );
  }
}

export default withNavigation(SettingsScreen);
