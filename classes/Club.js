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
import Group from './Group.js'
import File from './File.js'
import storage from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';
import KeyManager from './KeyManager'

export default class Club extends DatabaseConnector {
  id = null;
  user = null;
  user_role = 'viewer';

  constructor(id, user = null, start_values = ["name", "logo", "public", "members", "color"]) {
    super("clubs", id, start_values)
    this.id = id;
    this.user = user;
    this.key_manager = new KeyManager();
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

  setTextColor(v) {
    this.setValue(v, "text_color");
  }

  getTextColor(v) {
    return this.getValue("text_color");
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

  getGroupsObjects(cb) {
    var groups_list = []
    this.getValue('groups', function(groups) {
      for (let group_id in groups) {
        groups_list.push(new Group(group_id, this.getID(), this.user))
      }
      cb(groups_list)
    }.bind(this))
  }

  getFiles(cb, start_listener = false) {
    var list = []
    var func = function(files) {
      for (let file_id in files) {
        list.push(new File(file_id, this.getID(), this.user))
      }
      cb(list)
    }.bind(this);
    if (!start_listener) 
      this.getValue('files', func)
    else 
      this.startListener('files', func)
  }

  createFile(file_info) {
    const file_id = this.pushValue(file_info, 'files');
    var file = new File(file_id, this.getID(), this.user);
    return file;
  }

  hasFiles() {
    return this.hasValue('files');
  }

  deleteGroup(key) {
    this.removeValue('groups/' + key);
  }

  createGroup(group) {
    this.pushValue(group, 'groups', function(group_id) {
      if (!group.public) {
        var keys = this.key_manager.generate()
        this.key_manager.saveKey(this.getID() + '_' + group_id + '_private_key', keys[1])
        this.setValue(JSON.parse(keys[0]), 'groups/' + group_id + '/public_key')
      }
    }.bind(this));
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

  setRole(role) {
    if (this.user && role) {
      this.user.setValue(role, 'clubs/' + this.getID() + '/role');
    }
  }

  getRole(cb) {
    if (this.user) {
      return this.user.getValue('clubs/' + this.getID() + '/role', cb);
    }
  }

  setNotificationsEnabled(enabled = true) {
    if (this.user) {
      this.user.setValue(enabled, 'clubs/' + this.getID() + '/notifications');
    }
  }

  getNotificationsEnabled(cb) {
    if (this.user) {
      return this.user.getValue('clubs/' + this.getID() + '/notifications', cb);
    }
  }

  setGroupJoined(group_id, joined = true) {
    if (this.user && group_id) {
      this.user.setValue(joined, 'clubs/' + this.getID() + '/groups/' + group_id)
    }
  }

  isGroupJoined(group_id) {
    if (this.user && group_id) {
      return this.user.getValue('clubs/' + this.getID() + '/groups/' + group_id) === true;
    }
  }

  getJoinedGroups() {
    if (this.user) {
      var joined_groups = []
      const groups = this.user.getValue('clubs/' + this.getID() + '/groups');
      for (let group_id in groups) {
        if (this.isGroupJoined(group_id)) {
          joined_groups.push(group_id);
        }
      }
      return joined_groups;
    }
    return [];
  }

  async uploadFile(file_info, cb) {
    console.log(file_info)
    if (file_info) {
      var uploaded_percentage = 0;
      var [name, extension] = this._getFilenameAndExtension(file_info.name)
      file_info.name = name
      file_info.extension = extension
      file_info.storage_path = 'clubfiles/' + this.getID() + '/' + file_info.name + '_' + new Date().getTime() + '.' + file_info.extension

      const reference = storage().ref(file_info.storage_path);
      const task = reference.putFile(file_info.uri);

      const file = this.createFile({
        'uploading': true,
        'download_url': '',
        'downloads': 0,
        'extension': file_info.extension,
        'name': file_info.name,
        'size_bytes': file_info.size,
        'storage_path': file_info.storage_path,
        'type': file_info.type,
        'uploaded_at': new Date().getTime()
      })
      file.setValue(file_info.size, 'size_bytes')
      file.setLocalPath(RNFS.DocumentDirectoryPath + '/' + this.getID() + '/' + file_info.name + '.' + file_info.extension)
      RNFS.copyFile(file_info.uri, file.getLocalPath()).then(() => {
        console.log('FILE COPYED');
        file.saveLocalPath(file.getLocalPath())
      }).catch((err) => {
        alert(err.message)
      });
      file.saveLocalPath(file_info.uri)
      cb('file_created', file)

      task.on('state_changed', taskSnapshot => {
        if (taskSnapshot.metadata.name) {
          if (file_info.storage_path == taskSnapshot.metadata.name) {
            uploaded_percentage = taskSnapshot.bytesTransferred / taskSnapshot.totalBytes * 100;
            file.setUploadedPercentage(uploaded_percentage)
            //cb(uploaded_percentage, true, file_info)
            return;
          }
        }
        task.cancel();
      });

      task.then(async () => {
        const url = await storage().ref(file_info.storage_path).getDownloadURL();
        file_info.download_url = url;
        file.setUploadedPercentage(100)
        file.setUploading(false)
        file.setDownloadUrl(url);
        cb('done', file)
      });
    } else 
      return cb('error', null)
  }

  _getFilenameAndExtension(file) {
    file = file.split("\\").pop()
    var split = file.split('.');
    if (split.length > 1) {
      var extension = split[split.length - 1];
      split.pop();
      var name = split.join('');
      return [name, extension];
    }
    return [file, null];
  }
}
