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
import DatabaseConnector from "./database/DatabaseConnector";
import Chat from './Chat.js';
import Club from './Club.js';

export default class User extends DatabaseConnector {
  uid = null;

  constructor(uid) {
    super('users', uid, ['name', 'account_type'])
    this.uid = uid;
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

  isManager() {
    return this.getValue('account_type') === 'manager'
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
  
  getChats(cb) {
    database().ref("users/" + this.uid + "/chats").once("value", function(snap) {
      var chats = [];
      var chat_ids = snap.val();
      var d = 0;
      if (chat_ids) {
        Object.keys(chat_ids).forEach((chat_id, i) => {
          var chat = new Chat(chat_id, this.getUID());
          chat.setReadyListener(function() {
            chats.push(chat);
            if (d == Object.keys(chat_ids).length - 1) 
              cb(chats);
            d++;
          })
        })
      } else 
        cb([null]);
      }
    .bind(this));
  }

  getClubsList(cb, startListener = false, start_values = null) {
    if (!startListener) {
      this.getValue('clubs', function(club_infos) {
        this._clubInfosToObjects(club_infos, cb, start_values);
      }.bind(this))
    } else {
      this.startListener('clubs', function(club_infos) {
        this._clubInfosToObjects(club_infos, cb, start_values);
      }.bind(this))
    }
  }

  _clubInfosToObjects(club_infos, cb, start_values = null) {
    var clubs_list = [];
    if (club_infos) {
      Object.keys(club_infos).forEach((key, i) => {
        const club_info = club_infos[key];
        if (club_info) {
          var club = new Club(club_info.club_id, this, start_values);
          clubs_list.push(club);
          if (i == Object.keys(club_infos).length - 1) {
            cb(clubs_list);
          }
        }
      });
    } else 
      cb([null]);
    }
  
  /*
  Starts a new chat, from user to partner_uid
  @param partner_uid ID of the chat partner
  */
  startChat(partner_uid, utils) {
    var partner = new User(partner_uid)
    partner.getValue('name', function(name) {
      // check if any chat with parner exists
      this.getChats(function(chats) {
        var chat_found = false;
        chats.forEach((chat, i) => {
          //alert(chat.getPartnerUserId())
          if (chat) {
            if (chat.getPartnerUserId() == partner.getUID()) {
              chat_found = true;
              utils.getNavigation().navigate('ChatScreen', {
                focused: true,
                chat: chat,
                utils: utils,
                partner_name: name
              });
            }
          }

          if (i == chats.length - 1 && !chat_found) {
            // create chat if nothing found
            var new_chat = {
              user_id_1: this.getUID(),
              user_id_2: partner.getUID()
            };

            var chatRef = database().ref("chats").push(new_chat);
            database().ref("chats/" + chatRef.key + "/id").set(chatRef.key);
            database().ref("users/" + this.getUID() + "/chats/" + chatRef.key).set(true);
            database().ref("users/" + partner.getUID() + "/chats/" + chatRef.key).set(true);
            utils.getNavigation().navigate('ChatScreen', {
              focused: true,
              chat: new Chat(chatRef.key, this.getUID()),
              utils: utils,
              partner_name: name
            });
          }
        });
      }.bind(this));
    }.bind(this))
  }
}
