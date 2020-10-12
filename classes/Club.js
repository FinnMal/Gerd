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
  Dimensions,
  Image
} from "react-native";
import AutoHeightImage from "react-native-auto-height-image";
import FileViewer from "react-native-file-viewer";
import {faChevronCircleRight} from "@fortawesome/free-solid-svg-icons";
import {withNavigation} from "react-navigation";
import {useNavigation} from "@react-navigation/native";
import OneSignal from "react-native-onesignal";
import DatabaseConnector from "./database/DatabaseConnector";

export default class Club extends DatabaseConnector {
  id = null;

  constructor(id) {
    super("clubs", id, ["name", "logo", "public", "members", "color"])
    this.id = id;
  }

  getName() {
    return this.getValue("name");
  }

  setName(v) {
    this.setValue(v, "name");
  }

  updateName(v) {
    this.setValue(v, "name", true);
  }

  getImage() {
    return this.getValue("logo");
  }

  setImage(v) {
    this.setValue(v, "logo");
  }

  updateImage(v) {
    this.setValue(v, "logo", true);
  }

  isPublic() {
    return this.getValue("public") === true;
  }

  setPublic(v) {
    this.setValue(v, "public");
  }

  updatePublic(v) {
    this.setValue(v, "public", true);
  }

  togglePublic() {
    this.setValue(!this.isPublic(), "public", true);
  }

  getColor() {
    return this.getValue("color");
  }

  setColor(v) {
    this.setValue(v, "color");
  }

  updateColor(v) {
    this.setValue(v, "color", true);
  }

  getMembersCount() {
    return this.getValue('members');
  }

  hasGroups() {
    return this.hasValue('groups');
  }

  getGroups() {
    if (this.hasValue('groups')) {
      var groups = this.getValue('groups');
      Object.keys(groups).map(group_id => {
        if (groups[group_id]) {
          groups[group_id].id = group_id;
          groups[group_id].public = groups[group_id].public === true;
          groups[group_id].has_admin_rights = groups[group_id].has_admin_rights === true;
        }
      });
      return groups;
    }

    return {};
  }

  deleteGroup(key) {
    this.removeValue('groups/' + key);
  }

  createGroup(group) {
    this.pushValue(group, 'groups');
  }

  updateGroupName(key, value) {
    this.setValue(value, 'groups/' + key + '/name', true);
  }

  updateGroupAdminRights(key, value) {
    this.setValue(value, 'groups/' + key + '/has_admin_rights', true);
  }

  updateGroupPublic(key, value) {
    this.setValue(value, 'groups/' + key + '/public', true);
  }

  hasInviteCodes() {
    return this.hasValue('invite_codes');
  }

  getInviteCodes() {
    if (this.hasInviteCodes()) {
      var invite_codes = this.getValue('invite_codes');
      Object.keys(invite_codes).map(code => {
        if (invite_codes[code]) {
          invite_codes[code].code = code;
        }
      });
      return invite_codes;
    }
    return {};
  }

  deleteInviteCode(key) {
    this.removeValue('invite_codes/' + key);
  }

  createInviteCode(invite, code) {
    this.setValue(invite, 'invite_codes/' + code, true);
  }

  updateInviteCodeGroups(key, groups) {
    this.setValue(groups, 'invite_codes/' + key + '/groups', true);
  }
}
