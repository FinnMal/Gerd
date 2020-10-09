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
import functions from '@react-native-firebase/functions';
import ChatMessage from './../components/ChatMessage.js';
import User from './../classes/User.js';

export default class Chat {
  id = null;
  uid = null;
  limit = 20;
  load = 0;
  data = {};
  listener = {};
  messages = {};
  message_keys: null;
  message_added_cb = null;
  message_removed_cb = null;
  ref = null;
  partner_user = null;
  last_message = {};
  partnerUserCreatedCb: null;
  unreadMessageCount = 0;
  _unreadMessageCountListener: null;

  constructor(id, uid) {
    this.id = id;
    this.uid = uid;
    this.message_keys = [];

    this.startListener('user_id_1', function() {
      this._createPartnerUser();
    }.bind(this))
    this.startListener('user_id_2', function() {
      this._createPartnerUser();
    }.bind(this))
  }

  getValue(path, cb = null) {
    var obj = this.data;
    if (obj) {
      path_arr = path.split("/");
      if (path_arr) {
        for (i = 0; i < path_arr.length - 1; i++) 
          obj = obj[path_arr[i]];
        
        if (obj && path_arr && path_arr[i]) 
          var value = obj[path_arr[i]];
        
        if (value) 
          return value;
        if (cb) 
          getDatabaseValue(path, cb);
        }
      }
  }

  setValue(value, path, store = false) {
    path_arr = path.split("/");

    if (path_arr) {
      var obj = this.data;
      for (i = 0; i < path_arr.length - 1; i++) 
        obj = obj[path_arr[i]];
      obj[path_arr[i]] = value;

      if (store) {
        database().ref("chats/" + this.getID() + "/" + path).set(value);
      } else 
        this._triggerCallbacks(path, value);
      }
    }

  getDatabaseValue(path, cb) {
    database().ref("chats/" + this.id + "/" + path).once("value", function(snap) {
      this.setValue(snap.val(), path);
      cb(snap.val());
    }.bind(this));
  }

  startListener(path, cb) {
    if (!this.listener[path]) {
      this.listener[path] = {
        callbacks: [cb]
      };

      console.log("chats/" + this.getID() + "/" + path)
      this.listener[path].ref = database().ref("chats/" + this.getID() + "/" + path);
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

  getID() {
    return this.id;
  }

  getUID() {
    return this.uid;
  }

  getPartnerUserId() {
    var user_id_1 = this.getValue('user_id_1');
    if (user_id_1 != this.getUID()) 
      return user_id_1
    return this.getValue('user_id_2');
  }

  getPartnerUser(cb) {
    if (!this.partner_user) {
      if (cb) {
        this.partnerUserCreatedCb = cb;
      }
    } else {
      if (cb) 
        cb(this.partner_user)
    }
    return this.partner_user;
  }

  _createPartnerUser() {
    if (this.getPartnerUserId() && !this.partner_user) {
      this.partner_user = new User(this.getPartnerUserId())
      if (this.partnerUserCreatedCb) 
        this.partnerUserCreatedCb(this.partner_user);
      }
    }

  getUnreadMessageCount(cb) {
    if (this.unreadMessageCount == 0) 
      return false;
    
    return this.unreadMessageCount > 39
      ? this.unreadMessageCount + "+"
      : this.unreadMessageCount;
  }

  startUnreadMessageCountListener(cb) {
    // count unread messages (max=40)
    var unreadMessageCount = 0;
    var ref = database().ref('chats/' + this.id + '/messages').orderByChild('send_at').limitToLast(40);
    ref.on('value', function(snap) {
      this.unreadMessageCount = 0;
      var messages = snap.val();
      if (messages) {
        Object.keys(messages).forEach((key, i) => {
          var mes = messages[key];
          var unread = mes.read === false && mes.receiver == this.getUID();
          if (unread) 
            this.unreadMessageCount++;
          cb(this.unreadMessageCount);
        });
      }
    }.bind(this));
  }

  getLimit() {
    return this.limit;
  }

  _setLimit(increase) {
    var old_limit = this.limit;
    if (this.limit == Object.keys(this.messages).length) {
      this.limit = old_limit + increase;
      this._updateMessageList();
    } else {
      //console.log("LIMIT: " + this.limit) console.log("-> LIMIT IS TO HIGH")
    }
  }

  startMessagesListener(added, removed) {
    this.message_added_cb = added;
    this.message_removed_cb = removed;
    this._updateMessageList();
  }

  _updateMessageList() {
    if (this.ref) 
      this.ref.off();
    this.ref = database().ref('chats/' + this.id + '/messages').orderByChild('send_at').limitToLast(this.limit);
    this.ref.on('child_added', function(snap) {
      if (!this.messages[snap.key]) {

        var data = snap.val();
        data.id = snap.key;
        data.chat_id = this.getID();
        data.uid = this.getUID();
        var mes = new ChatMessage(data);
        this.messages[snap.key] = mes;
        if (this.message_added_cb) 
          this.message_added_cb(mes);
        }
      }.bind(this));
    this.ref.on('child_removed', function(snap) {
      if (this.messages[snap.key]) {
        if (this.message_removed_cb) 
          this.message_removed_cb(this.messages[snap.key]);
        }
      }.bind(this));
  }

  getMessage(id, cb = false) {
    return this.getValue('messages/' + id, cb);
  }

  getLastMessage() {
    return {ago_text: "1w", text: "Text"};
  }

  sendMessage(text) {
    database().ref('chats/' + this.getID() + '/messages').push({
      text: text,
      send_at: new Date().getTime() / 1000,
      read: false,
      //sender: "default",
      sender: this.getUID(),
      receiver: this.getPartnerUserId()
    });
  }
}
