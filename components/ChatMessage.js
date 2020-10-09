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
import * as utils from './../utils.js';
import AutoHeightImage from "react-native-auto-height-image";
import FileViewer from "react-native-file-viewer";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faChevronCircleRight} from "@fortawesome/free-solid-svg-icons";
import {withNavigation} from "react-navigation";
import {useNavigation} from "@react-navigation/native";
import database from "@react-native-firebase/database";
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import {Theme} from './../app/index.js';

export default class ChatMessage {
  data = {};
  listener = {};

  constructor(data) {
    this.data = data;
    this.getValue('sender', function() {})
    this.getValue('receiver', function() {})
  }

  delete() {
    database().ref("chats/" + this.data.chat_id + "/messages/" + this.data.id).remove();
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
          database().ref("chats/" + this.data.chat_id + "/messages/" + this.data.id + '/' + path).set(value);
        } else 
          this._triggerCallbacks(path, value);
        }
      }
  }

  getDatabaseValue(path, cb) {
    database().ref("chats/" + this.data.chat_id + "/messages/" + this.data.id + '/' + path).once("value", function(snap) {
      this.setValue(snap.val(), path);
      cb(snap.val());
    }.bind(this));
  }

  startListener(path, cb) {
    if (!this.listener[path]) {
      this.listener[path] = {
        callbacks: [cb]
      };
      this.setValue(this.getValue(path), path)
    } else {
      this.listener[path].callbacks.push(cb);
    }
  }

  _triggerCallbacks(path, value = null) {
    if (this.listener[path]) {
      if (this.listener[path].callbacks) {
        this.listener[path].callbacks.forEach((cb, i) => {
          cb(
            value
              ? value
              : this.getValue(path)
          );
        });
      }
    }
  }

  _onLongPress() {
    if (this.isOwnMessage()) {
      ReactNativeHapticFeedback.trigger("impactHeavy")
      ActionSheetIOS.showActionSheetWithOptions({
        options: [
          'Abbrechen', 'Nachricht zurückziehen'
        ],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 0
      }, buttonIndex => {
        if (buttonIndex === 0) {
          // cancel
        } else if (buttonIndex === 1) {
          // delete message
          utils.showAlert('Nachricht für alle löschen?', '', [
            'Ja', 'Nein'
          ], function(a) {
            if (a == 0) 
              this.delete();
            }
          .bind(this))
        }
      });
    }
  }

  _getSendAtString() {
    var now = new Date().getTime();
    var today = new Date().setHours(0, 0, 0, 0);
    var yesterday = today - 86400000;
    var last_week = today - 604800000;
    var send_at = new Date(this.getSendAt() * 1000);
    var send_at_midnight = new Date(this.getSendAt() * 1000).setHours(0, 0, 0, 0)

    if (today == send_at_midnight) {
      // message send today
      return "Heute, " + send_at.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (yesterday == send_at_midnight) {
      // message send yesterday
      return "Gestern, " + send_at.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (last_week < send_at_midnight) {
      // message send < 7 days ago
      return send_at.toLocaleTimeString('de-DE', {
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      // message send long ago
      return send_at.toLocaleDateString("de-DE", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  getID() {
    return this.data.id;
  }

  getSendAt() {
    return this.data.send_at;
  }

  isOwnMessage() {
    return this.data.uid == this.getValue('sender')
  }

  getText() {
    return this.data.text;
  }

  setRead(read) {
    this.getValue('read', function(db_read) {
      if (read != db_read && !this.isOwnMessage()) {
        database().ref("chats/" + this.data.chat_id + "/messages/" + this.data.id + '/read').set(read);
      }
    }.bind(this))

  }

  getRender() {
    this.setRead(true);
    return (
      <View key={this.getID()} style={{
          marginBottom: 30,
          marginLeft: this.isOwnMessage()
            ? 100
            : 20
        }}>
        <Theme.View
          style={{
            padding: 10,
            paddingLeft: 20,
            minWidth: 100,
            maxWidth: 270,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderBottomLeftRadius: this.isOwnMessage()
              ? 20
              : 0,
            borderBottomRightRadius: this.isOwnMessage()
              ? 0
              : 20
          }}>
          <TouchableOpacity onLongPress={() => this._onLongPress()}>
            <Theme.Text style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 16
              }}>{this.getText()}</Theme.Text>
          </TouchableOpacity>
        </Theme.View>
        <View style={{
            maxWidth: 260
          }}>
          <Theme.Text
            style={{
              marginTop: 3,
              marginRight: 10,
              marginLeft: 10,
              textAlign: this.isOwnMessage()
                ? 'right'
                : 'left',
              color: "white",
              opacity: 0.2,
              fontSize: 12,
              fontFamily: 'Poppins-Medium'
            }}>{this._getSendAtString()}</Theme.Text>
        </View>
      </View>
    );
  }
}
