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
  Dimensions,
  ActionSheetIOS
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
import ClubCard from "./../components/ClubCard.js";
import Modal from "./../components/Modal.js";
import Group from "./../components/Group.js";
import User from "./../classes/User.js";
import {Theme} from './../app/index.js';

// Setting
import {default as UserClubs} from './../components/Settings/UserClubs.js';
import {default as UserAccount} from './../components/Settings/UserAccount.js';

import {
  faTrash,
  faEye,
  faEyeSlash,
  faBell,
  faBellSlash,
  faUser,
  faUsers
} from "@fortawesome/free-solid-svg-icons";
import {AnimatedCircularProgress} from 'react-native-circular-progress';

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

    this.user = utils.getUser();

    var cb = function() {
      this.forceUpdate();
    }.bind(this);

    this.user.startListener("name", cb);
    this.user.startListener("email", cb);
    this.user.startListener("password", cb);
    this.user.startListener("img", cb);
    this.user.startListener("options", function() {
      this.forceUpdate();
    }.bind(this));

    this.margin = new Animated.Value(0);
  }

  openImagePicker() {
    this.state.utils.openImagePicker(function(ok, percentage_done, url, error) {
      if (ok && percentage_done > -1) {
        this.state.image_upload.active = true;
        this.state.image_upload.progress = percentage_done;
      } else if (ok && percentage_done == -1) {
        this.state.image_upload.active = false;
        this.state.image_upload.progress = percentage_done;

        if (url) 
          this.user.setImage(url);
        }
      
      this.forceUpdate();
    }.bind(this));
  }

  render() {
    const s_width = Dimensions.get("window").width;

    const user = this.user;
    var s = require("./../app/style.js");
    const marginLeft = this.margin.interpolate({
      inputRange: [
        0, 2000
      ],
      outputRange: [0, 2000]
    });

    if (this.props.show) {
      return (
        <HeaderScrollView marginBottom={100} marginTop={80} headline="Einstellungen" headlineFontSize={47} backButton={false} showHeadline={false}>
          <View style={{
              marginLeft: -20,
              marginRight: -20,
              marginBottom: 50
            }}>
            <Theme.View style={{
                padding: 10,
                paddingLeft: 20
              }}>
              <View style={{
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  flexDirection: "row"
                }}>
                <TouchableOpacity onPress={() => this.openImagePicker()}>
                  {
                    this.state.image_upload.active
                      ? (
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
                          backgroundColor="#201A30"/>
                      )
                      : (void 0)
                  }

                  <AutoHeightImage
                    style={{
                      borderRadius: 50
                    }}
                    width={55}
                    source={{
                      uri: user.getImage()
                    }}/>
                </TouchableOpacity>
                <View
                  style={{
                    marginLeft: 15,
                    height: 55,
                    justifyContent: "center",
                    maxWidth: 275
                  }}>
                  <Theme.Text
                    style={{
                      fontSize: 21,
                      color: "white",
                      fontFamily: "Poppins-SemiBold"
                    }}>
                    {user.getName()}
                  </Theme.Text>
                </View>
              </View>
            </Theme.View>
            <View style={{
                marginTop: 30
              }}>
              <Setting label="Account" icon={faUser} utils={this.props.utilsObject}>
                <UserAccount
                  name={user.getName()}
                  email={user.getMail()}
                  password={user.getPassword()}
                  onChange={values => {
                    this.user.updateName(values.name);
                    this.user.updateMail(values.email);
                    this.user.updatePassword(values.password);
                    this.state.utils.getNavigation().navigate("ScreenHandler");
                  }}/>
              </Setting>
            </View>
            <View style={{
                marginTop: 50
              }}>
              <Setting
                type="switch"
                isEnabled={this.user.getOption("show_groups")}
                onSwitch={() => {
                  this.user.toggleOption("show_groups");
                }}
                label="Empfänger anzeigen"
                icon={faEye}
                iconInactive={faEyeSlash}/>
              <Setting
                type="switch"
                isEnabled={this.user.getOption("send_notifications")}
                onSwitch={() => {
                  this.user.toggleOption("send_notifications");
                }}
                label="Benachrichtigungen"
                icon={faBell}
                iconInactive={faBellSlash}/>
            </View>
            <View style={{
                marginTop: 40
              }}>
              <Setting utils={this.props.utilsObject} label="Vereine" icon={faUsers}>
                <UserClubs user={this.user}/>
              </Setting>
            </View>

            <View style={{
                marginTop: 40
              }}>
              <Setting color="red" label="Konto löschen" icon={faTrash} iconColor="light" type="action" onPress={() => alert("setting")}/>
            </View>
          </View>
        </HeaderScrollView>
      );
    }
    return null;
  }
}

//Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent"
  }
});

export default withNavigation(SettingsScreen);
