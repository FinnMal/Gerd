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
import OneSignal from "react-native-onesignal";

export default class User {
  uid = null;
  data = {};
  listener = {};

  constructor(uid) {
    this.uid = uid;
    this.startListener('name');
  }

  getValue(path, cb = null) {
    var obj = this.data;
    if (obj) {
      path_arr = path.split("/");
      if (path_arr) {
        for (i = 0; i < path_arr.length - 1; i++) {
          if (obj) 
            obj = obj[path_arr[i]];
          else if (cb) 
            this.getDatabaseValue(path, cb);
          else 
            return null;
          }
        
        if (obj && path_arr && path_arr[i]) 
          var value = obj[path_arr[i]];
        
        if (value) 
          return value;
        if (cb) 
          this.getDatabaseValue(path, cb);
        }
      }
  }

  setValue(value, path, store = false) {
    path_arr = path.split("/");

    if (path_arr) {
      var obj = this.data;
      if (obj) {
        for (i = 0; i < path_arr.length - 1; i++) 
          obj = obj[path_arr[i]];
        obj[path_arr[i]] = value;

        if (store) {
          database().ref("users/" + this.uid + "/" + path).set(value);
        } else 
          this._triggerCallbacks(path, value);
        }
      }
  }

  getDatabaseValue(path, cb) {
    database().ref("users/" + this.uid + "/" + path).once("value", function(snap) {
      console.log('in getDatabaseValue: ' + path)
      this.setValue(snap.val(), path);
      cb(snap.val());
    }.bind(this));
  }

  startListener(path, cb) {
    if (!this.listener[path]) {
      this.listener[path] = {
        callbacks: [cb]
      };

      this.listener[path].ref = database().ref("users/" + this.uid + "/" + path);
      this.listener[path].ref.on("value", function(snap) {
        this.setValue(snap.val(), path);
      }.bind(this));
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
          if (cb) 
            cb(
              value
                ? value
                : this.getValue(path)
            );
          }
        );
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

  setImage(url) {
    this.setValue(url, 'img', true);
  }

  hasEventSubscribed(club_id, event_id) {
    if (!this.getValue('events')) 
      this.setValue({}, 'events')
    if (!this.getValue('events/' + club_id + "_" + event_id)) {
      this.setValue({
        notification_subscribed: true
      }, 'events/' + club_id + "_" + event_id)
      return true;
    }
    return this.getValue('events/' + club_id + "_" + event_id + '/notification_subscribed') === true
  }

  toggleEventNotification(club_id, event_id, cb = false) {
    var has_notif = this.hasEventSubscribed(club_id, event_id);
    this.setValue(!has_notif, 'events/' + club_id + "_" + event_id + '/notification_subscribed', true)

    OneSignal.sendTag(
      club_id + "_" + event_id + "_before",
      !has_notif
        ? "yes"
        : "no"
    );
    OneSignal.sendTag(
      club_id + "_" + event_id + "_start",
      !has_notif
        ? "yes"
        : "no"
    );

    if (cb) 
      cb(!has_notif);
    }
  
  getChatsList(cb) {
    database().ref("users/" + this.uid + "/chats").once("value", function(snap) {
      var result = [];
      var chats = snap.val();
      if (chats) {
        Object.keys(chats).forEach((chat_id, i) => {
          var res = {
            chat_id: chat_id
          };
          database().ref("chats/" + chat_id + "/user_id_1").once("value", function(snap) {
            res.user_id_1 = snap.val();
            database().ref("chats/" + chat_id + "/user_id_2").once("value", function(snap) {
              res.user_id_2 = snap.val();
              result.push(res);
              if (i == Object.keys(chats).length - 1) 
                cb(result);
              }
            .bind(this));
          }.bind(this));
        });
      } else 
        cb([{}]);
      }
    .bind(this));
  }

  getClubsList(cb) {
    database().ref("users/" + this.uid + "/clubs").once("value", function(snap) {
      var result = [];
      var clubs = snap.val();
      if (clubs) {
        Object.keys(clubs).forEach((key, i) => {
          console.log("KEY: " + key);
          if (clubs[key]) {
            database().ref("clubs/" + key + "/name").once("value", function(snap) {
              clubs[key].name = snap.val();
              database().ref("clubs/" + key + "/logo").once("value", function(snap) {
                clubs[key].logo = snap.val();
                result.push(clubs[key]);
                if (i == Object.keys(clubs).length - 1) 
                  cb(result);
                }
              .bind(this));
            }.bind(this));
          }
        });
      } else 
        cb([{}]);
      }
    .bind(this));
  }
}
