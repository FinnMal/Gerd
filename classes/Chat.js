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
import DatabaseConnector from "./database/DatabaseConnector";
import ReactNativeHapticFeedback from "react-native-haptic-feedback"

export default class Chat extends DatabaseConnector {
  id = null;
  db = null;
  uid = null;
  offset = 0;
  limit = 500;
  messages = {};
  partner_user = null;
  last_message = null;
  partnerUserCreatedCb: null;
  unreadMessagesCount = 0;
  _unreadMessagesCountListener: null;
  last_message_id = null;
  message_added_cb = null;
  message_removed_cb = null;
  last_message_cb = null;
  unread_messages_count_cb = null;
  constructor(id, uid) {
    super("chats", id, ["user_id_1", "user_id_2"])
    this.id = id;
    this.uid = uid;

    this.state = {}

    //load read messages this.loadMessagesFromSQL();
  }

  getUID() {
    return this.uid;
  }

  setTyping(typing) {
    this.setValue(typing, this.getUID() + '_typing', true)
  }

  setTypingListener(cb) {
    this.startListener(this.getPartnerUserId() + '_typing', function(value) {
      value = value === true;
      cb(value);
    });
  }

  isTyping() {
    return this.getValue(this.getPartnerUserId() + '_typing') === true
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

  setUnreadMessagesCount(value) {
    this.unreadMessagesCount = value;
    if (this.unread_messages_count_cb) 
      this.unread_messages_count_cb(value)
  }

  countUpUnreadMessages(value) {
    this.setUnreadMessagesCount(this.unreadMessagesCount + value)
  }

  getUnreadMessagesCount() {
    return this.unreadMessagesCount
  }

  startUnreadMessagesCountListener(cb) {
    this.unread_messages_count_cb = cb;
  }

  getLimit() {
    return this.limit;
  }

  setLimit(increase) {
    //this.offest = this.offest + this.limit;
    this.loadMessagesFromSQL();
  }

  startMessagesListener(added, removed) {
    this.messages = {};
    this.offset = 0;
    this.load_to_page = 0;
    this.message_added_cb = added;
    this.message_removed_cb = removed;
    this.startUnreadMessagesLister();
    this.loadMessagesFromSQL();
  }

  loadMessagesFromSQL() {
    var message_added_cb = this.message_added_cb;
    var sql_start_time = Date.now();
    this.executeSQL('SELECT send_at, text, is_own FROM chat_messages WHERE chat_id=? ORDER BY send_at DESC LIMIT ? OFFSET ?', [
      this.getID(), this.limit, this.offset
    ], function(tx, results) {
      this.offset = this.offset + this.limit;
      var sql_end_time = Date.now();
      var diff = sql_end_time - sql_start_time;
      console.log("fetched " + results.rows.length + " messages in " + (
        diff / 1000
      ) + ' Sek.')

      var new_messages = [];
      this.setUnreadMessagesCount(0);
      results.rows.raw(0).forEach((data, i) => {
        if (!this.messages[data.send_at]) {
          this.messages[data.send_at] = true;
          var mes = new ChatMessage(this, data)
          new_messages.push(mes);
        }
      });
      message_added_cb(new_messages);
      //if (results.rows.length > 0) this.loadMessagesFromSQL();
    }.bind(this))
  }

  startUnreadMessagesLister() {
    this.stopListener('unread_by_' + this.getUID())

    // load unread messages
    this.startListener('unread_by_' + this.getUID(), function(messages) {
      if (messages) {
        var total_unread = Object.keys(messages).length;
        this.countUpUnreadMessages(total_unread);
        Object.keys(messages).forEach((send_at, i) => {
          var mes_id = messages[send_at];
          this.removeValue('unread_by_' + this.getUID() + '/' + send_at)
          // download message from firebase
          this.getDatabaseValue('messages/' + mes_id, function(mes) {
            // delete message
            this.removeValue('messages/' + mes_id)
            if (mes) {
              var data = {}
              data.send_at = send_at;
              data.text = mes.text;
              data.is_own = mes.sender == this.getUID()
              new ChatMessage(this, data, false, function(mes) {
                this.messages[send_at] = mes;

                if (i == total_unread - 1) {
                  this.setLastMessage(mes)
                }

                if (this.message_added_cb) 
                  this.message_added_cb([mes], false);
                }
              .bind(this))
            }
          }.bind(this))
        });
      }
    }.bind(this))
  }

  startLastMessageListener(cb) {
    this.last_message_cb = cb;
    this.startUnreadMessagesLister();
  }

  getMessages() {
    return this.messages;
  }

  getLastMessage() {
    return this.last_message;
  }

  setLastMessage(mes) {
    this.last_message = mes;
    if (this.last_message_cb) 
      this.last_message_cb(mes);
    }
  
  getCurrentPage(cb) {
    return this.getValue('current_page');
  }

  sendMessage(text, cb) {
    if (text) {
      //this.setTyping(false)
      var data = {
        text: text,
        send_at: new Date().getTime(),
        sender: this.getUID(),
        receiver: this.getPartnerUserId()
      }

      var mes = new ChatMessage(this, data, false)
      this.messages[data.send_at] = mes;
      this.last_message_cb(mes);
      this.message_added_cb([mes], false)

      console.log('sending chat message ...')
      this.pushValue(data, 'messages', function(mes_id) {
        console.log('message send')
        this.setValue(mes_id, 'unread_by_' + this.getPartnerUserId() + '/' + data.send_at)
      }.bind(this))
    }
  }
}
