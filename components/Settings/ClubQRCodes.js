import React from "react";
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
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import {Theme} from './../../app/index.js';
import AutoHeightImage from "react-native-auto-height-image";
import RNFetchBlob from "rn-fetch-blob";
import FileViewer from "react-native-file-viewer";
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
  faChevronLeft,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import ClubCard from "./../../components/ClubCard.js";
import InputBox from "./../../components/InputBox.js";
import Button from "./../../components/Button.js";
import {default as Modal} from "./../../components/Modal.js";

export default class ClubQRCodes extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      groups: {},
      modal: {
        invite: {},
        headline: "QR-Code bearbeiten"
      }
    };

    this.props.setting_screen.showActionButton(true);

    this.props.club.startListener('invite_codes', function() {
      this.forceUpdate();
    }.bind(this))

    this.props.club.startListener('groups', function() {
      this.forceUpdate();
    }.bind(this))
  }

  componentDidMount() {
    this.props.setting_screen.onChildRef(this);
  }

  actionButtonOnPress() {
    var code = this.props.utils.generate_invite_code();

    this.state.modal.headline = "QR-Code erstellen";
    var invite = {
      is_new: true,
      clicks: 0,
      expires_at: -1,
      groups: {},
      qr_code_ready: false,
      code: code
    };
    this.state.modal.invite = invite;
    this.forceUpdate();

    this.inviteModal.open();
  }

  _openOptions(code) {
    ActionSheetIOS.showActionSheetWithOptions({
      options: [
        "Abbrechen", "Bearbeiten", "Teilen", "Löschen"
      ],
      destructiveButtonIndex: 3,
      cancelButtonIndex: 0
    }, buttonIndex => {
      if (buttonIndex === 0) {
        // cancel
      } else if (buttonIndex === 1) {
        this.state.modal.headline = "QR-Code bearbeiten";
        this.state.modal.invite = this.props.club.getInviteCodes()[code];
        this.forceUpdate();
        this.inviteModal.open();
      } else if (buttonIndex === 2) {
        this._shareIntiveCode(code);
      } else if (buttonIndex === 3) {
        //delete qrcode
        this._deleteCode(code)
      }
    });
  }

  _shareIntiveCode(code) {
    const club = this.props.club;
    if (club.hasInviteCodes()) {
      var invite = club.getInviteCodes()[code];
      if (invite) {
        RNFetchBlob.config({
          path: RNFetchBlob.fs.dirs.DocumentDir + "/" + invite.code + ".jpg",
          fileCache: true,
          appendExt: "image"
        }).fetch("GET", invite.img, {"Cache-Control": "no-store"}).progress({
          count: 1000
        }, (received, total) => {}).then(res => {
          FileViewer.open(
            Platform.OS === "android"
              ? "file://" + res.path()
              : "" + res.path()
          ).then(() => {}).catch(error => {});
        });
      } else 
        alert('Fehler: QR-Code nicht gefunden')
    } else 
      alert('Fehler: Keine QR-Codes für Verein gefunden')
  }

  _editInviteCode() {
    this.inviteModal.close();

    var filteredGroups = {};
    var groups = this.props.club.getGroups();
    var invite = this.state.modal.invite;
    Object.keys(invite.groups).map(group_id => {
      if (invite.groups[group_id] === true && groups[group_id]) 
        filteredGroups[group_id] = true;
      }
    );

    if (Object.keys(filteredGroups).length > 0) {
      if (invite.is_new) {
        invite.is_new = undefined;
        this.props.club.createInviteCode(invite, invite.code);
      } else 
        this.props.club.updateInviteCodeGroups(invite.code, filteredGroups);
      }
    }

  _deleteCode(code) {
    this.props.utils.showAlert("QR-Code löschen?", "", [
      "Ja", "Nein"
    ], function(btn_id) {
      if (btn_id == 0) {
        // delete group
        this.props.club.deleteInviteCode(code);
        this.forceUpdate();
        this.props.setting_screen.showToast("QR-Code gelöscht", faTrash)
      }
    }.bind(this), true, false);
  }

  renderCard(invite) {
    if (!invite.groups) 
      invite.groups = {};
    return (
      <Theme.View key={invite.code} style={{
          borderRadius: 15,
          marginBottom: 20
        }}>
        <TouchableOpacity
          style={{
            padding: 7,
            borderRadius: 15,
            borderBottomLeftRadius: invite.qr_code_ready === false
              ? 0
              : 15,
            borderBottomRightRadius: invite.qr_code_ready === false
              ? 0
              : 15,
            flexWrap: "wrap",
            alignItems: "flex-start",
            flexDirection: "row"
          }}
          onPress={() => this._openOptions(invite.code)}>
          <View style={{
              padding: 8
            }}>
            <Theme.Icon size={24} color="primary" icon={faQrcode}/>
          </View>
          <View style={{
              marginLeft: 15,
              width: 225
            }}>
            <Theme.Text style={{
                fontFamily: "Poppins-SemiBold",
                fontSize: 21,
                color: "white"
              }}>
              #{invite.code}
            </Theme.Text>
            <Theme.Text
              style={{
                marginTop: -4,
                fontFamily: "Poppins-Medium",
                fontSize: 16,
                color: "white",
                opacity: 0.77
              }}>
              {Object.keys(invite.groups).length}{" "}
              {
                Object.keys(invite.groups).length == 1
                  ? "Gruppe"
                  : "Gruppen"
              }
            </Theme.Text>
          </View>
          <TouchableOpacity style={{
              padding: 8,
              opacity: 0.7
            }} onPress={() => this._openOptions(invite.code)}>
            <Theme.Icon size={22} icon={faEllipsisV}/>
          </TouchableOpacity>
        </TouchableOpacity>

        {
          invite.qr_code_ready === false
            ? (
              <Theme.View
                color={"primary"}
                style={{
                  opacity: 0.9,
                  marginTop: 0,
                  padding: 6,
                  borderRadius: 15,
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center"
                }}>
                <Theme.ActivityIndicator scale={.9} backgroundColor={"primary"} visible={true}/>
                <Theme.TextOnColor
                  backgroundColor={"primary"}
                  style={{
                    marginLeft: 10,
                    fontSize: 16,
                    fontFamily: "Poppins-Bold"
                  }}>
                  QR-Code wird erstellt
                </Theme.TextOnColor>
              </Theme.View>
            )
            : (void 0)
        }
      </Theme.View>
    );
  }

  render() {
    const s_width = Dimensions.get("window").width;
    const s_height = Dimensions.get("window").height;

    const club = this.props.club;
    const invite_codes = club.getInviteCodes();
    const pageContent = Object.keys(invite_codes).map(code => {
      var invite = invite_codes[code];
      if (invite) {
        return this.renderCard(invite);
      }
    });

    var groupsList = <Theme.Text>No invite codes</Theme.Text>;
    if (club.hasInviteCodes()) {
      if (club.hasGroups()) {
        var current_invite = this.state.modal.invite;
        if (current_invite) {
          if (current_invite.groups) {
            var club_groups = club.getGroups();
            groupsList = Object.keys(club_groups).map(g_key => {
              var group = club_groups[g_key];
              var group_active = current_invite.groups[g_key];

              return (
                <Theme.CheckBox
                  label={group.name}
                  checked={current_invite.groups[g_key]}
                  onChange={(checked, rerender) => {
                    current_invite.groups[g_key] = checked;
                    if (rerender) 
                      this.forceUpdate();
                    }}/>
              );
            });
          }
        }
      } else 
        groupsList = <Theme.Text>No groups</Theme.Text>;
      }
    
    return (
      <View>
        <Modal ref={m => {
            this.inviteModal = m;
          }} headline={this.state.modal.headline} onDone={() => this._editInviteCode()}>
          <ScrollView>{groupsList}</ScrollView>
        </Modal>
        <Theme.ActivityIndicator
          style={{
            alignSelf: 'flex-start',
            marginRight: 'auto',
            marginLeft: 20,
            marginBottom: 50
          }}
          scale={1.2}
          visible={!club.hasInviteCodes()}></Theme.ActivityIndicator>
        {pageContent}
      </View>
    );
  }
}
