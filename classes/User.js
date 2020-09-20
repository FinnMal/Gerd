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
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faChevronCircleRight} from "@fortawesome/free-solid-svg-icons";
import {withNavigation} from "react-navigation";
import {useNavigation} from "@react-navigation/native";
import database from "@react-native-firebase/database";

export default class User {
  uid = null;
  data = {};
  listener = {};

  constructor(uid) {
    this.uid = uid;
  }

  getValue(path, cb = null) {
    var obj = this.data;
    path_arr = path.split("/");
    for (i = 0; i < path_arr.length - 1; i++) obj = obj[path_arr[i]];
    var value = obj[path_arr[i]];

    if (value) return value;
    if (cb) getDatabaseValue(path, cb);
  }

  setValue(value, path, store = false) {
    console.log("SET_VALUE: " + path);
    path_arr = path.split("/");

    var obj = this.data;
    for (i = 0; i < path_arr.length - 1; i++) obj = obj[path_arr[i]];
    obj[path_arr[i]] = value;

    if (store) {
      database()
        .ref("users/" + this.uid + "/" + path)
        .set(value);
    } else this._triggerCallbacks(path, value);

    console.log(this.data);
  }

  getDatabaseValue(path, cb) {
    database()
      .ref("users/" + this.uid + "/" + path)
      .once(
        "value",
        function(snap) {
          this.setValue(snap.val(), path);
          cb(snap.val());
        }.bind(this)
      );
  }

  startListener(path, cb) {
    if (!this.listener[path]) {
      this.listener[path] = {callbacks: [cb]};

      this.listener[path].ref = database().ref(
        "users/" + this.uid + "/" + path
      );
      this.listener[path].ref.on(
        "value",
        function(snap) {
          this.setValue(snap.val(), path);
        }.bind(this)
      );
    } else {
      this.listener[path].callbacks.push(cb);
    }
  }

  _stopListener(path) {
    this.listener[path].off();
  }

  _triggerCallbacks(path, value = null) {
    if (this.listener[path]) {
      if (this.listener[path].callbacks) {
        this.listener[path].callbacks.forEach((cb, i) => {
          cb(value ? value : this.getValue(path));
        });
      }
    }
  }

  getUID() {
    return this.uid;
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

  getMail() {
    return this.getValue("email");
  }

  setMail(v) {
    this.setValue(v, "email");
  }

  updateMail(v) {
    this.setValue(v, "email", true);
  }

  getPassword() {
    return this.getValue("password");
  }

  setPassword(v) {
    this.setValue(v, "password");
  }

  updatePassword(v) {
    this.setValue(v, "password", true);
  }

  getOption(name) {
    return this.getValue("options/" + name);
  }

  setOption(name, v) {
    this.setValue(v, "options/" + name);
  }

  updateOption(name, v) {
    this.setValue(v, "options/" + name, true);
  }

  toggleOption(name) {
    var v = this.getOption(name);
    this.updateOption(name, !v);
  }

  getImage() {
    var img = this.getValue("img");
    return img
      ? img
      : "https://yt3.ggpht.com/a/AATXAJy6_f0l3LV_ewft6LltTAEwa1NO8nwbFtkvFz6S4w=s900-c-k-c0xffffffff-no-rj-mo";
  }
}
