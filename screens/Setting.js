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
  ActionSheetIOS,
  Switch,
  ActivityIndicator,
  ImageBackground
} from "react-native";
import {BlurView, VibrancyView} from "@react-native-community/blur";

import RNFetchBlob from "rn-fetch-blob";
import FileViewer from "react-native-file-viewer";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import CheckBox from "@react-native-community/checkbox";
import {
  faPlus,
  faChevronCircleLeft,
  faLayerGroup,
  faLock,
  faEllipsisV,
  faExclamationCircle,
  faQrcode,
  faTimesCircle,
  faPlusCircle,
  faInfoCircle,
  faCheck,
  faChevronLeft
} from "@fortawesome/free-solid-svg-icons";
import {Headlines} from "./../app/constants.js";
import {withNavigation} from "react-navigation";
import ClubCard from "./../components/ClubCard.js";
import InputBox from "./../components/InputBox.js";
import Button from "./../components/Button.js";

import {default as Modal} from "./../components/Modal.js";
import HeaderScrollView from "./../components/HeaderScrollView.js";
import database from "@react-native-firebase/database";

export default class Setting extends React.Component {
  groupModal: null;
  inviteModal: null;
  constructor(props) {
    super(props);
    var type = this.props.navigation.getParam("type", null);
    var headline = this.props.navigation.getParam("headline", null);
    var club = this.props.navigation.getParam("club", null);
    var utils = this.props.navigation.getParam("utils", null);
    var childs = this.props.navigation.getParam("childs", null);
    this.state = {
      headline: headline,
      club: club,
      utils: utils,
      type: type,
      isEnabled: false,
      colors: {},
      modal: {
        group: {
          name: ""
        },
        invite: {
          code: "0"
        }
      },
      callback: this.props.navigation.getParam("callback", null),
      childs: childs
    };

    if (!this.state.club) this.state.club = {};
    if (!this.state.club.invite_codes) this.state.club.invite_codes = {};

    //firebase listener
    if (this.state.type == "qrcodes") {
      database()
        .ref("clubs/" + club.id + "/invite_codes")
        .on(
          "value",
          function(snap) {
            if (snap.val()) this.state.club.invite_codes = snap.val();
            else this.state.club.invite_codes = {};
            this.forceUpdate();
          }.bind(this)
        );
    } else if (this.state.type == "color") {
      database()
        .ref("colors")
        .on(
          "value",
          function(snap) {
            var colors = snap.val();
            colors[club.color].selected = true;
            this.state.colors = colors;
            this.forceUpdate();
          }.bind(this)
        );
    }
  }

  _openGroupOptions(g_key) {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Abbrechen", "Bearbeiten", "Löschen"],
        destructiveButtonIndex: 2,
        cancelButtonIndex: 0
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          // cancel
        } else if (buttonIndex === 1) {
          this.state.modal.headline = "Gruppe bearbeiten";
          this.state.modal.group = JSON.parse(
            JSON.stringify(this.state.club.groups[g_key])
          );
          this.state.modal.group.key = g_key;
          if (!this.state.modal.group.has_admin_rights)
            this.state.modal.group.has_admin_rights = false;
          if (this.state.modal.group.public !== false)
            this.state.modal.group.public = true;
          console.log(this.state.modal.group.public);
          this.forceUpdate();
          this.groupModal.open();
        } else if (buttonIndex === 2) {
          //delete this groups
          this.state.utils.showAlert(
            "Gruppe löschen?",
            "",
            ["Ja", "Nein"],
            function(btn_id) {
              if (btn_id == 0) {
                // delete group
                this.state.club.groups[g_key] = undefined;
                database()
                  .ref("clubs/" + this.state.club.id + "/groups/" + g_key)
                  .remove();
                this.forceUpdate();
              }
            }.bind(this),
            true,
            false
          );
        }
      }
    );
  }

  _openQrcodeOptions(code) {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Abbrechen", "Bearbeiten", "Teilen", "Löschen"],
        destructiveButtonIndex: 3,
        cancelButtonIndex: 0
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          // cancel
        } else if (buttonIndex === 1) {
          this.state.modal.headline = "QR-Code bearbeiten";
          this.state.modal.invite = JSON.parse(
            JSON.stringify(this.state.club.invite_codes[code])
          );
          this.state.modal.invite.code = code;
          this.forceUpdate();
          this.inviteModal.open();
        } else if (buttonIndex === 2) {
          // download qrcode image
          RNFetchBlob.config({
            path: RNFetchBlob.fs.dirs.DocumentDir + "/" + code + ".jpg",
            fileCache: true,
            appendExt: "image"
          })
            .fetch("GET", this.state.club.invite_codes[code].img, {
              "Cache-Control": "no-store"
            })
            .progress({count: 1000}, (received, total) => {
              console.log("progress: " + (received / total) * 100 + "%");
            })
            .then(res => {
              console.log(res.path());
              FileViewer.open(
                Platform.OS === "android"
                  ? "file://" + res.path()
                  : "" + res.path()
              )
                .then(() => {})
                .catch(error => {});
            });
        } else if (buttonIndex === 3) {
          //delete qrcode
          this.state.utils.showAlert(
            "QR-Code löschen?",
            "",
            ["Ja", "Nein"],
            function(btn_id) {
              if (btn_id == 0) {
                // delete code
                this.state.club.invite_codes[code] = undefined;
                database()
                  .ref("clubs/" + this.state.club.id + "/invite_codes/" + code)
                  .remove();
                this.forceUpdate();
              }
            }.bind(this),
            true,
            false
          );
        }
      }
    );
  }

  _editGroup() {
    this.groupModal.close();
    var group = JSON.parse(JSON.stringify(this.state.modal.group));
    var key = group.key;
    if (key != "NEW") {
      this.state.club.groups[key] = group;
      database()
        .ref("clubs/" + this.state.club.id + "/groups/" + key + "/name")
        .set(group.name);
      database()
        .ref("clubs/" + this.state.club.id + "/groups/" + key + "/public")
        .set(group.public);
      database()
        .ref(
          "clubs/" + this.state.club.id + "/groups/" + key + "/has_admin_rights"
        )
        .set(group.has_admin_rights);
      this.forceUpdate();
    } else {
      group.key = null;
      key = database()
        .ref("clubs/" + this.state.club.id + "/groups")
        .push(group).key;
      this.state.club.groups[key] = group;
      this.forceUpdate();
    }
  }

  _editInviteCode() {
    this.inviteModal.close();

    var filteredGroups = {};
    var invite = JSON.parse(
      JSON.stringify(this.state.club.invite_codes[this.state.modal.invite.code])
    );
    Object.keys(invite.groups).map(code => {
      if (invite.groups[code] === true) filteredGroups[code] = true;
    });
    invite.groups = filteredGroups;
    this.state.club.invite_codes[this.state.modal.invite.code] = JSON.parse(
      JSON.stringify(invite)
    );

    invite.code = null;
    database()
      .ref(
        "clubs/" +
          this.state.club.id +
          "/invite_codes/" +
          this.state.modal.invite.code
      )
      .set(invite);

    this.forceUpdate();
  }

  _updateClubName(name) {
    if (this.state.callback) {
      database()
        .ref("clubs/" + this.state.club.id + "/name")
        .once(
          "value",
          function(snap) {
            database()
              .ref("clubs/" + this.state.club.id + "/name")
              .set(name);
            if (snap.val() != name) {
              this.state.callback(snap.val(), name);
            }
            this.props.navigation.goBack();
          }.bind(this)
        );
    } else {
      database()
        .ref("clubs/" + this.state.club.id + "/name")
        .set(name);
      this.props.navigation.goBack();
    }
  }

  render() {
    const s_width = Dimensions.get("window").width;
    const s_height = Dimensions.get("window").height;

    var s = require("./../app/style.js");

    const club = this.state.club;

    var pageContent = <Text>Setting not found</Text>;
    var pageHeadline = this.state.headline;

    if (this.state.type == "groups") {
      pageContent = Object.keys(this.state.club.groups).map(key => {
        var group = this.state.club.groups[key];
        if (group) {
          return (
            <View
              key={key}
              style={{
                borderRadius: 15,
                marginBottom: 20
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: group.has_admin_rights
                    ? "#16FFD7"
                    : "#38304C",
                  padding: 7,
                  borderRadius: 15,
                  borderBottomLeftRadius:
                    group.public && group.has_admin_rights ? 0 : 15,
                  borderBottomRightRadius:
                    group.public && group.has_admin_rights ? 0 : 15,
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  flexDirection: "row"
                }}
                onPress={() => this._openGroupOptions(key)}
              >
                <View style={{padding: 8}}>
                  <FontAwesomeIcon
                    size={24}
                    color={group.has_admin_rights ? "#38304C" : "#16FFD7"}
                    icon={group.public === false ? faLock : faLayerGroup}
                  />
                </View>
                <View
                  style={{
                    marginLeft: 20,
                    height: 42,
                    width: 220,
                    justifyContent: "center"
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins-SemiBold",
                      fontSize: 21,
                      color: group.has_admin_rights ? "#38304C" : "white"
                    }}
                  >
                    {group.name}
                  </Text>
                  <Text
                    style={{
                      marginTop: -4,
                      fontFamily: "Poppins-Medium",
                      fontSize: 16,
                      color: group.has_admin_rights ? "#38304C" : "white",
                      opacity: 0.77
                    }}
                  >
                    {group.members.toLocaleString()} Mitglieder
                  </Text>
                </View>
                <TouchableOpacity
                  style={{padding: 8, opacity: 0.7}}
                  onPress={() => this._openGroupOptions(key)}
                >
                  <FontAwesomeIcon
                    size={22}
                    color={group.has_admin_rights ? "#38304C" : "white"}
                    icon={faEllipsisV}
                  />
                </TouchableOpacity>
              </TouchableOpacity>

              {group.public && group.has_admin_rights ? (
                <View
                  style={{
                    opacity: 0.9,
                    marginTop: 0,
                    padding: 6,
                    borderRadius: 15,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    backgroundColor: "#ff1629",
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <FontAwesomeIcon
                    size={15}
                    color="white"
                    icon={faExclamationCircle}
                  />
                  <Text
                    style={{
                      marginLeft: 10,
                      color: "white",
                      fontSize: 16,
                      fontFamily: "Poppins-Bold"
                    }}
                  >
                    Gruppe ist öffentlich!
                  </Text>
                </View>
              ) : (
                void 0
              )}
            </View>
          );
        }
      });
    } else if (this.state.type == "qrcodes") {
      pageContent = <Text>Keine QR-Codes</Text>;
      if (club.invite_codes) {
        pageContent = Object.keys(club.invite_codes).map(code => {
          var invite = club.invite_codes[code];
          if (invite) {
            return (
              <View
                key={code}
                style={{
                  borderRadius: 15,
                  marginBottom: 20
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: "#38304C",
                    padding: 7,
                    borderRadius: 15,
                    borderBottomLeftRadius:
                      invite.qr_code_ready === false ? 0 : 15,
                    borderBottomRightRadius:
                      invite.qr_code_ready === false ? 0 : 15,
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                    flexDirection: "row"
                  }}
                  onPress={() => this._openQrcodeOptions(code)}
                >
                  <View style={{padding: 8}}>
                    <FontAwesomeIcon
                      size={24}
                      color="#16FFD7"
                      icon={faQrcode}
                    />
                  </View>
                  <View
                    style={{
                      marginLeft: 15,
                      width: 225
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins-SemiBold",
                        fontSize: 21,
                        color: "white"
                      }}
                    >
                      #{code}
                    </Text>
                    <Text
                      style={{
                        marginTop: -4,
                        fontFamily: "Poppins-Medium",
                        fontSize: 16,
                        color: "white",
                        opacity: 0.77
                      }}
                    >
                      {Object.keys(invite.groups).length}{" "}
                      {Object.keys(invite.groups).length == 1
                        ? "Gruppe"
                        : "Gruppen"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{padding: 8, opacity: 0.7}}
                    onPress={() => this._openQrcodeOptions(code)}
                  >
                    <FontAwesomeIcon
                      size={22}
                      color={"white"}
                      icon={faEllipsisV}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>

                {invite.qr_code_ready === false ? (
                  <View
                    style={{
                      opacity: 0.9,
                      marginTop: 0,
                      padding: 6,
                      borderRadius: 15,
                      borderTopLeftRadius: 0,
                      borderTopRightRadius: 0,
                      backgroundColor: "#16ffd7",
                      flexWrap: "wrap",
                      alignItems: "flex-start",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    <ActivityIndicator
                      style={{transform: [{scale: 0.9}]}}
                      size="small"
                      color="#38304C"
                    />
                    <Text
                      style={{
                        marginLeft: 10,
                        color: "#38304C",
                        fontSize: 16,
                        fontFamily: "Poppins-Bold"
                      }}
                    >
                      QR-Code wird erstellt
                    </Text>
                  </View>
                ) : (
                  void 0
                )}
              </View>
            );
          }
        });

        var groupsList = <Text>No groups</Text>;
        var curCode = club.invite_codes[this.state.modal.invite.code];
        if (curCode) {
          groupsList = Object.keys(club.groups).map(g_key => {
            var group = club.groups[g_key];
            var group_active = curCode.groups[g_key];

            var iconColor = group_active ? "white" : "#ADA4A9";
            var icon = group_active ? faTimesCircle : faPlusCircle;

            return (
              <TouchableOpacity
                onPress={() => {
                  club.invite_codes[this.state.modal.invite.code].groups[
                    g_key
                  ] = !club.invite_codes[this.state.modal.invite.code].groups[
                    g_key
                  ];
                  this.forceUpdate();
                }}
                key={g_key}
                style={{
                  borderRadius: 5,
                  paddingTop: 5,
                  paddingBottom: 5,
                  backgroundColor: group_active ? "#615384" : "#201A30",
                  marginTop: 5,
                  marginBottom: 5,
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  flexDirection: "row"
                }}
              >
                <View
                  style={{
                    marginLeft: 8,
                    marginTop: 5,
                    zIndex: 100,
                    height: 30,
                    width: 30,
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <CheckBox
                    lineWidth={2}
                    animationDuration={0.15}
                    onCheckColor="#0DF5E3"
                    onTintColor="#0DF5E3"
                    value={group_active}
                    onValueChange={() => {
                      club.invite_codes[this.state.modal.invite.code].groups[
                        g_key
                      ] = !club.invite_codes[this.state.modal.invite.code]
                        .groups[g_key];
                      this.forceUpdate();
                    }}
                    style={{
                      height: 20,
                      width: 20
                    }}
                  />
                </View>
                <View style={{marginLeft: 18}}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "Poppins-SemiBold",
                      color: "white",
                      opacity: 0.85
                    }}
                  >
                    {group.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: "Poppins-SemiBold",
                      color: "white",
                      opacity: 0.6
                    }}
                  >
                    {group.members.toLocaleString()} Mitglieder
                  </Text>
                </View>
              </TouchableOpacity>
            );
          });
        }
      }
    } else if (this.state.type == "color") {
      pageContent = Object.keys(this.state.colors).map(hex => {
        var color = this.state.colors[hex];
        return (
          <TouchableOpacity
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
              this.state.colors[hex].selected = true;
              this.state.colors[this.state.club.color].selected = false;
              this.state.club.color = hex;
              database()
                .ref("clubs/" + club.id + "/color")
                .set(hex);
              this.forceUpdate();
            }}
          >
            {color.selected ? (
              <FontAwesomeIcon
                size={22}
                color={"#" + color.font_hex}
                icon={faCheck}
              />
            ) : (
              void 0
            )}
          </TouchableOpacity>
        );
      });
      pageContent = (
        <View
          style={{
            flexWrap: "wrap",
            alignItems: "flex-start",
            flexDirection: "row"
          }}
        >
          {pageContent}
        </View>
      );
    } else if (this.state.type == "name" || this.state.type == "textbox") {
      pageContent = (
        <View>
          <InputBox
            marginTop={-15}
            value={club.name}
            onChange={text => (this.state.club.name = text)}
          />
          <Button
            marginTop={40}
            label="Fertig"
            onPress={() => this._updateClubName(this.state.club.name)}
          />
        </View>
      );
    }

    return (
      <View
        style={[
          {
            height: "100%",
            backgroundColor: "#201A30"
          }
        ]}
      >
        <Modal
          ref={m => {
            this.inviteModal = m;
          }}
          headline={this.state.modal.headline}
          onDone={() => this._editInviteCode()}
        >
          <ScrollView>{groupsList}</ScrollView>
        </Modal>
        <Modal
          ref={m => {
            this.groupModal = m;
          }}
          headline={this.state.modal.headline}
          onDone={() => this._editGroup()}
        >
          <View>
            <View style={{marginBottom: 30}}>
              <Text
                style={{
                  fontFamily: "Poppins-SemiBold",
                  marginLeft: 10,
                  color: "#5C5768"
                }}
              >
                NAME
              </Text>
              <View style={{borderRadius: 10, backgroundColor: "#38304C"}}>
                <TextInput
                  multiline
                  autoCorrect={false}
                  keyboardType="default"
                  multiline={true}
                  style={{
                    fontFamily: "Poppins-Medium",
                    marginTop: 8,
                    padding: 15,
                    fontSize: 17,
                    color: "#D5D3D9"
                  }}
                  value={this.state.modal.group.name}
                  onChangeText={text => {
                    this.state.modal.group.name = text;
                    this.forceUpdate();
                  }}
                />
              </View>
            </View>
            <View
              style={{
                marginBottom: 30,
                flexWrap: "wrap",
                alignItems: "flex-start",
                flexDirection: "row",
                alignItems: "center"
              }}
            >
              <Text
                style={{
                  marginLeft: 5,
                  marginRight: 20,
                  opacity: 0.8,
                  color: "white",
                  fontSize: 20,
                  fontFamily: "Poppins-SemiBold"
                }}
              >
                Öffentlich
              </Text>
              <Switch
                style={{
                  transform: [{scale: 0.8}]
                }}
                trackColor={{false: "#575757", true: "#16FFD7"}}
                thumbColor={
                  this.state.modal.group.public ? "#38304C" : "#f4f3f4"
                }
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => {
                  this.state.modal.group.public = !this.state.modal.group
                    .public;
                  this.forceUpdate();
                }}
                value={this.state.modal.group.public}
              />
            </View>
            <View
              style={{
                marginBottom: 30,
                flexWrap: "wrap",
                alignItems: "flex-start",
                flexDirection: "row",
                alignItems: "center"
              }}
            >
              <Text
                style={{
                  marginLeft: 5,
                  marginRight: 20,
                  opacity: 0.8,
                  color: "white",
                  fontSize: 20,
                  fontFamily: "Poppins-SemiBold"
                }}
              >
                Administrator Rechte
              </Text>
              <Switch
                style={{
                  transform: [{scale: 0.8}]
                }}
                trackColor={{false: "#575757", true: "#16FFD7"}}
                thumbColor={
                  this.state.modal.group.has_admin_rights
                    ? "#38304C"
                    : "#f4f3f4"
                }
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => {
                  this.state.modal.group.has_admin_rights = !this.state.modal
                    .group.has_admin_rights;
                  this.forceUpdate();
                }}
                value={this.state.modal.group.has_admin_rights}
              />
            </View>
          </View>
        </Modal>

        <HeaderScrollView headline={pageHeadline}>
          {this.state.childs ? this.state.childs : pageContent}
        </HeaderScrollView>
        {this.state.type == "groups" || this.state.type == "qrcodes" ? (
          <TouchableOpacity
            style={{
              justifyContent: "center",
              alignSelf: "center",
              width: 60,
              height: 60,
              marginTop: s_height * 0.89,
              marginLeft: 138,
              borderRadius: 40,
              position: "absolute",
              backgroundColor: "#0DF5E3",
              justifyContent: "center",

              shadowColor: "#0DF5E3",
              shadowOffset: {
                width: 0,
                height: 0
              },
              shadowOpacity: 0.4,
              shadowRadius: 15.0
            }}
            onPress={() => {
              if (this.state.type == "groups") {
                this.state.modal.headline = "Gruppe erstellen";
                this.state.modal.group = {
                  members: 0,
                  key: "NEW",
                  name: "",
                  public: true,
                  has_admin_rights: false
                };
                this.forceUpdate();
                this.groupModal.open();
              } else if (this.state.type == "qrcodes") {
                var code = this.state.utils.generate_invite_code();

                this.state.modal.headline = "QR-Code erstellen";
                var invite = {
                  clicks: 0,
                  expires_at: -1,
                  groups: {},
                  qr_code_ready: false,
                  code: code
                };
                this.state.modal.invite = invite;
                this.state.club.invite_codes[code] = invite;
                this.inviteModal.open();
                this.forceUpdate();
              }
            }}
          >
            <FontAwesomeIcon
              style={{
                alignSelf: "center",
                textAlign: "center",
                zIndex: 0
              }}
              size={27}
              color="#38304C"
              icon={faPlus}
            />
          </TouchableOpacity>
        ) : (
          void 0
        )}
      </View>
    );
  }
}
