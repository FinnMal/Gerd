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

import {faTrash, faEye, faUser, faUsers} from "@fortawesome/free-solid-svg-icons";
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
            <View style={{
                backgroundColor: "#2e2e2e",
                padding: 15
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
                    width={50}
                    source={{
                      uri: user.getImage()
                    }}/>
                </TouchableOpacity>
                <View
                  style={{
                    marginLeft: 15,
                    height: 50,
                    justifyContent: "center",
                    maxWidth: 275
                  }}>
                  <Text
                    style={{
                      fontSize: 21,
                      color: "white",
                      fontFamily: "Poppins-SemiBold"
                    }}>
                    {user.getName()}
                  </Text>
                </View>
              </View>
            </View>
            <View style={{
                marginTop: 60,
                backgroundColor: "#2e2e2e",
                padding: 15
              }}>
              <Setting label="Account" icon={faUser} utils={this.props.utilsObject}>
                <AccountSetting
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
                marginTop: 40,
                backgroundColor: "#2e2e2e",
                padding: 15
              }}>
              <Setting
                type="switch"
                isEnabled={this.user.getOption("show_groups")}
                onSwitch={() => {
                  this.user.toggleOption("show_groups");
                }}
                label="Empfänger anzeigen"
                icon={faEye}/>
              <Setting
                type="switch"
                isEnabled={this.user.getOption("send_notifications")}
                onSwitch={() => {
                  this.user.toggleOption("send_notifications");
                }}
                label="Mitteilungen senden"
                icon={faEye}/>
            </View>
            <View style={{
                marginTop: 40,
                backgroundColor: "#2e2e2e",
                padding: 15
              }}>
              <Setting utils={this.props.utilsObject} label="Vereine" icon={faUsers} onPress={() => alert("setting")}>
                <ClubsSetting user={this.user}/>
              </Setting>
              <Setting label="Konto löschen" icon={faTrash} onPress={() => alert("setting")}/>
            </View>

            <View style={{
                marginTop: 40,
                backgroundColor: "#2e2e2e",
                padding: 15
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

class ClubsSetting extends React.Component {
  constructor(props) {
    super(props);

    var user = this.props.user;
    this.state = {
      clubs: [],
      clubs_list: [],
      modal_visible: false,
      selected_club: null
    }
    user.getClubsList(function(list) {
      this.state.clubs = list;
      this.state.clubs_list = []
      list.forEach((item, i) => {
        this.state.clubs_list.push(
          <ClubCard
            editable={true}
            color="#1e1e1e"
            club_img={item.logo}
            club_name={item.name}
            club_groups={Object.keys(item.groups).length}
            onPress={() => this._showOptions(i)}/>
        )
      });

      this.forceUpdate();
    }.bind(this))
  }

  _showOptions(club_id) {
    ActionSheetIOS.showActionSheetWithOptions({
      options: [
        "Abbrechen", "Verwalten", "Löschen"
      ],
      destructiveButtonIndex: 2,
      cancelButtonIndex: 0
    }, buttonIndex => {
      if (buttonIndex === 0) {
        // cancel
      } else if (buttonIndex === 1) {
        this.state.selected_club = club_id;
        this.forceUpdate();
        this.modal.open();
      } else if (buttonIndex === 2) {}
    });
  }

  render() {
    var groupsList = null;
    if (this.state.clubs) {
      if (this.state.selected_club) {
        if (this.state.clubs[this.state.selected_club]) {
          if (Object.keys(this.state.clubs[this.state.selected_club].groups)) {
            groupsList = Object.keys(this.state.clubs[this.state.selected_club].groups).map(key => {
              var group = this.state.clubs[this.state.selected_club].groups[key];
              return (<Group key={key} id={key} name="Test" onSelect={(key, selected) => alert("onSelect")} selected={false}/>);
            });
          }
        }
      }
    }

    return (
      <View>
        <Modal ref={(modal) => this.modal = modal} headline="Headline" done_text="Fertig">
          {groupsList}
        </Modal>
        {this.state.clubs_list}
      </View>
    );
  }
}

export default withNavigation(SettingsScreen);
