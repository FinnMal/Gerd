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
  Image,
  Easing,
  Animated
} from "react-native";
import * as utils from './../utils.js';
import AutoHeightImage from "react-native-auto-height-image";
import FileViewer from "react-native-file-viewer";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faChevronCircleRight} from "@fortawesome/free-solid-svg-icons";
import {withNavigation} from "react-navigation";
import {useNavigation} from "@react-navigation/native";
import database from "@react-native-firebase/database";
import {Theme} from './../app/index.js';
import DatabaseConnector from "./../classes/database/DatabaseConnector";

export default class ChatMessage extends DatabaseConnector {
  id = null;
  data = {};
  chat = null;
  listener = {};
  viewOpacity = new Animated.Value(1);
  constructor(chat, id) {
    super("chats/" + chat.getID() + '/messages', id, ["text", "send_at", "sender"])
    this.id = id;
    this.chat = chat;

    //console.log('MESSAGE CREATED')
  }

  _onLongPress() {
    /*
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
            if (a == 0) {
              this.chat.removeMessage(this.getID())
              this.remove();
            }
          }.bind(this))
        }
      });
    }
    */
  }

  animateOut(cb) {
    Animated.timing(this.viewOpacity, {
      useNativeDriver: false,
      toValue: 0,
      duration: 190,
      easing: Easing.ease
    }).start(() => {
      // animation done
      cb()
    });
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
      return send_at.toLocaleTimeString('de-DE', {
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
    return this.id;
  }

  getSendAt() {
    return this.data.send_at;
  }

  getAgoText() {
    return utils.getAgoText(this.getSendAt())
  }

  isOwnMessage() {
    return this.chat.getUID() == this.getValue('sender')
  }

  getText() {
    return this.data.text;
  }

  setRead(read) {
    /*
    this.getValue('read', function(db_read) {
      if (read != db_read && !this.isOwnMessage()) {
        database().ref("chats/" + this.data.chat_id + "/messages/" + this.data.id + '/read').set(read);
      }
    }.bind(this))
    */

  }

  isEmoji(str) {
    var ranges = [
      '(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-' +
          '\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]' +
          '|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|' +
          '\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])' // U+1F680 to U+1F6FF
    ];
    if (str.match(ranges.join('|'))) {
      return true;
    } else {
      return false;
    }
  }

  getRender() {
    this.setRead(true);

    const s_width = Dimensions.get("window").width;
    const opacity = this.viewOpacity.interpolate({
      inputRange: [
        0, 1
      ],
      outputRange: [0, 1]
    });

    const isEmoji = this.isEmoji(this.getText())
    return (
      <Animated.View
        key={this.getID()}
        style={{
          minWidth: 90,
          marginBottom: 15,
          marginLeft: !this.isOwnMessage()
            ? 0
            : 'auto',
          marginRight: this.isOwnMessage()
            ? 0
            : 'auto',
          opacity: opacity
        }}>
        <Theme.View
          color={this.isOwnMessage()
            ? "primary"
            : "selected_view"}
          style={{
            padding: 10,
            paddingLeft: 15,
            paddingRight: 15,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderBottomLeftRadius: this.isOwnMessage()
              ? 20
              : 0,
            borderBottomRightRadius: this.isOwnMessage()
              ? 0
              : 20,
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row'
          }}>
          <Theme.Text
            backgroundColor={this.isOwnMessage()
              ? "primary"
              : ""}
            style={{
              fontFamily: 'Poppins-Medium',
              fontSize: isEmoji && this.getText().length == 2
                ? 65
                : 17
            }}>{this.getText()}</Theme.Text>
        </Theme.View>
        <Theme.Text
          style={{
            marginTop: 3,
            marginLeft: !this.isOwnMessage()
              ? 10
              : 'auto',
            marginRight: this.isOwnMessage()
              ? 10
              : 'auto',
            color: "white",
            opacity: 0.5,
            fontSize: 12,
            fontFamily: 'Poppins-SemiBold'
          }}>{this._getSendAtString()}</Theme.Text>
      </Animated.View>
    );
  }
}
