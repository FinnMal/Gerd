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

export default class ClubGroups extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      groups: {},
      modal: {
        group: {},
        headline: "Gruppe bearbeiten"
      }
    };

    this.props.setting_screen.showActionButton(true);

    this.props.club.startListener('groups', function() {
      this.forceUpdate();
    }.bind(this))
  }

  componentDidMount() {
    this.props.setting_screen.onChildRef(this);
  }

  actionButtonOnPress() {
    this.state.modal.headline = "Gruppe erstellen";
    this.state.modal.group = {
      members: 0,
      id: "NEW",
      name: "",
      public: true,
      has_admin_rights: false
    };
    this.forceUpdate();
    this.groupModal.open();
  }

  _openOptions(key) {
    ActionSheetIOS.showActionSheetWithOptions({
      options: [
        "Abbrechen", "Bearbeiten", "Löschen"
      ],
      destructiveButtonIndex: 2,
      cancelButtonIndex: 0
    }, buttonIndex => {
      if (buttonIndex === 0) {
        // cancel
      } else if (buttonIndex === 1) {
        this.state.modal.group = this.props.club.getGroups()[key];
        this.forceUpdate();
        this.groupModal.open();
      } else if (buttonIndex === 2) {
        //delete this groups
        this._deleteGroup(key);
      }
    });
  }

  _editGroup() {
    this.groupModal.close();
    const club = this.props.club;
    var group = this.state.modal.group;
    if (group.id != "NEW") {
      club.updateGroupName(group.id, group.name);
      club.updateGroupPublic(group.id, group.public);
      club.updateGroupAdminRights(group.id, group.has_admin_rights);
      this.forceUpdate();
    } else {
      // create new group
      club.createGroup(this.state.modal.group);
      this.forceUpdate();
    }
  }

  _deleteGroup(key) {
    this.props.utils.showAlert("Gruppe löschen?", "", [
      "Ja", "Nein"
    ], function(btn_id) {
      if (btn_id == 0) {
        // delete group
        this.props.club.deleteGroup(key);
        this.forceUpdate();
        this.props.setting_screen.showToast("Gruppe gelöscht", faTrash)
      }
    }.bind(this), true, false);
  }

  renderGroupCard(group) {
    return (
      <Theme.View
        key={group.id}
        color={group.has_admin_rights
          ? 'primary'
          : ''}
        style={{
          borderRadius: 15,
          marginBottom: 20
        }}>
        <Theme.TouchableOpacity
          style={{
            padding: 7,
            borderRadius: 15,
            borderBottomLeftRadius: group.public && group.has_admin_rights
              ? 0
              : 15,
            borderBottomRightRadius: group.public && group.has_admin_rights
              ? 0
              : 15,
            flexWrap: "wrap",
            alignItems: "flex-start",
            flexDirection: "row"
          }}
          onPress={() => this._openOptions(group.id)}>
          <View style={{
              padding: 8
            }}>
            <Theme.Icon
              backgroundColor={group.has_admin_rights
                ? 'primary'
                : ''}
              size={24}
              color={group.has_admin_rights
                ? ''
                : 'primary'}
              icon={group.public === false
                ? faLock
                : faLayerGroup}/>
          </View>
          <View style={{
              marginLeft: 20,
              height: 42,
              maxWidth: 220,
              justifyContent: "center"
            }}>
            <Theme.Text
              backgroundColor={group.has_admin_rights
                ? 'primary'
                : ''}
              style={{
                fontFamily: "Poppins-SemiBold",
                fontSize: 21
              }}>
              {group.name}
            </Theme.Text>
            <Theme.Text
              backgroundColor={group.has_admin_rights
                ? 'primary'
                : ''}
              style={{
                marginTop: -4,
                fontFamily: "Poppins-Medium",
                fontSize: 16,
                opacity: 0.77
              }}>
              {group.members.toLocaleString() + ' '}
              Mitglieder
            </Theme.Text>
          </View>
          <Theme.TouchableOpacity
            style={{
              padding: 11,
              opacity: 0.7,
              marginLeft: 'auto',
              alignSelf: 'flex-end'
            }}
            onPress={() => this._openOptions(group.id)}>
            <Theme.Icon backgroundColor={group.has_admin_rights
                ? 'primary'
                : ''} size={20} icon={faEllipsisV}/>
          </Theme.TouchableOpacity>
        </Theme.TouchableOpacity>
        {
          group.public && group.has_admin_rights
            ? (
              <Theme.View
                color={'danger'}
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
                <Theme.Icon backgroundColor={'danger'} size={15} icon={faExclamationCircle}/>
                <Theme.Text
                  backgroundColor={'danger'}
                  style={{
                    marginLeft: 10,
                    fontSize: 16,
                    fontFamily: "Poppins-Bold"
                  }}>
                  Öffentliche Administrator-Rechte!
                </Theme.Text>
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
    const groups = club.getGroups();
    const pageContent = Object.keys(groups).map(group_id => {
      var group = groups[group_id];
      if (group) {
        return this.renderGroupCard(group);
      }
    });
    return (
      <View>
        <Modal ref={m => {
            this.groupModal = m;
          }} headline={this.state.modal.headline} onDone={() => this._editGroup()}>
          <View>
            <InputBox label="Name" marginTop={20} value={this.state.modal.group.name} onChange={v => (this.state.modal.group.name = v)}/>
            <View
              style={{
                marginTop: 30,
                marginBottom: 30,
                flexWrap: "wrap",
                alignItems: "flex-start",
                flexDirection: "row",
                alignItems: "center"
              }}>
              <Theme.Text
                style={{
                  marginLeft: 5,
                  marginRight: 20,
                  opacity: 0.8,
                  fontSize: 20,
                  fontFamily: "Poppins-SemiBold"
                }}>
                Öffentlich
              </Theme.Text>
              <Theme.Switch
                onValueChange={() => {
                  this.state.modal.group.public = !this.state.modal.group.public;
                  this.forceUpdate();
                }}
                value={this.state.modal.group.public}/>
            </View>
            <View
              style={{
                marginBottom: 30,
                flexWrap: "wrap",
                alignItems: "flex-start",
                flexDirection: "row",
                alignItems: "center"
              }}>
              <Theme.Text
                style={{
                  marginLeft: 5,
                  marginRight: 20,
                  opacity: 0.8,
                  fontSize: 20,
                  fontFamily: "Poppins-SemiBold"
                }}>
                Administrator Rechte
              </Theme.Text>
              <Theme.Switch
                onValueChange={() => {
                  this.state.modal.group.has_admin_rights = !this.state.modal.group.has_admin_rights;
                  this.forceUpdate();
                }}
                value={this.state.modal.group.has_admin_rights}/>
            </View>
          </View>
        </Modal>
        <Theme.ActivityIndicator
          style={{
            alignSelf: 'flex-start',
            marginRight: 'auto',
            marginLeft: 20,
            marginBottom: 50
          }}
          scale={1.2}
          visible={!club.hasGroups()}></Theme.ActivityIndicator>
        {pageContent}
      </View>
    );
  }
}
