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
  uid = null;
  load = 0;
  load_to_page = 0;
  current_page = -1;
  messages = {};
  message_keys: null;
  page_refs = {};
  partner_user = null;
  last_message = {};
  partnerUserCreatedCb: null;
  unreadMessagesCount = 0;
  _unreadMessagesCountListener: null;
  last_message_id = null;

  constructor(id, uid) {
    super("chats", id, ["user_id_1", "user_id_2", "current_page", "last_message_id"])
    this.id = id;
    this.uid = uid;
    this.message_keys = [];

    this.state = {
      message_added_cb: null,
      message_removed_cb: null
    }

    this.startListener('current_page', function(value) {
      this.current_page = value
      this.loadPageMessages(value);
    }.bind(this))
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

  getUnreadMessagesCount(cb) {
    if (this.unreadMessagesCount == 0) 
      return false;
    
    return this.unreadMessagesCount > 39
      ? this.unreadMessagesCount + "+"
      : this.unreadMessagesCount;
  }

  startUnreadMessagesCountListener(cb) {
    // count unread messages (max=40)
    var unreadMessagesCount = 0;
    var ref = database().ref('chats/' + this.id + '/messages').orderByChild('send_at').limitToLast(40);
    ref.on('value', function(snap) {
      this.unreadMessagesCount = 0;
      var messages = snap.val();
      if (messages) {
        Object.keys(messages).forEach((key, i) => {
          var mes = messages[key];
          var unread = mes.read === false && mes.receiver == this.getUID();
          if (unread) 
            this.unreadMessagesCount++;
          cb(this.unreadMessagesCount);
        });
      }
    }.bind(this));
  }

  getLimit() {
    return this.limit;
  }

  setLimit(increase) {
    this.load_to_page = this.load_to_page + 1;
    this._updateMessageList();
  }

  startMessagesListener(added, removed) {
    this.messages = {};
    this.page_refs = {};
    this.load_to_page = 0;
    this.state.message_added_cb = added;
    this.state.message_removed_cb = removed;
    this._updateMessageList();
  }

  _updateMessageList() {
    var page = this.current_page - this.load_to_page;

    if (page > -1) {
      this.loadPageMessages(page);
    }
  }

  loadPageMessages(page) {
    if (page != undefined || page == 0) {
      if (this.page_refs[page]) 
        this.page_refs[page].off();
      
      console.log("LOADING PAGE " + page)

      var message_added_cb = this.state.message_added_cb;
      this.page_refs[page] = database().ref('chats/' + this.getID() + '/pages/' + page + '/messages');
      this.page_refs[page].once("value", function(snap) {
        var messages = snap.val();
        if (messages) {
          Object.keys(messages).reverse().forEach((key, i) => {
            var mes_id = messages[key];
            if (!this.messages[mes_id] && mes_id != this.getValue('last_message_id')) {
              var mes = new ChatMessage(this, mes_id);
              this.messages[mes_id] = mes;
              if (message_added_cb) 
                message_added_cb(mes);
              }
            });
        } else {

          this.getDatabaseValue('pages/' + page + '/count', function(count) {
            if (count < 20 && page > 0) {
              this.load_to_page++;
              this.loadPageMessages(page - 1);
            }
          }.bind(this))
        }
      }.bind(this));

      this.page_refs[page].on('child_removed', function(snap) {
        console.log('child_removed')
        var mes = this.messages[snap.val()]
        if (mes) {
          if (this.state.message_removed_cb) {
            mes.animateOut(function() {
              this.state.message_removed_cb(mes);
            }.bind(this));
          } else 
            alert('has no callback')

        }
      }.bind(this));
    }

  }

  getMessage(id, cb = false) {
    return this.getValue('messages/' + id, cb);
  }

  removeMessage(id) {
    this.getValue('messages/' + id + '/page', function(page) {
      this.removeValue('pages/' + page.id + '/messages/' + page.index);

      var mes_ids = Object.keys(this.messages);
      var last_mes_id = mes_ids[mes_ids.length - 1];
      if (last_mes_id == id && mes_ids.length > 1) 
        mes_ids[mes_ids.length - 2];
      this.setValue(last_mes_id, 'last_message_id', true)
    }.bind(this))
  }

  loadLastMessage(cb) {
    var mes_id = this.getValue('last_message_id');
    if (mes_id !== -1) {
      if (!this.messages[mes_id]) {
        var mes = new ChatMessage(this, mes_id);
        mes.setReadyListener(function() {
          this.messages[mes_id] = mes;
          if (cb) 
            cb(mes)
        }.bind(this));
      }
    }
  }

  getLastMessage() {
    return this.messages[this.getValue('last_message_id')]
  }

  getCurrentPage(cb) {
    return this.getValue('current_page');
  }

  sendMessage(text) {
    if (text) {
      this.setTyping(false)
      var mes = {
        text: text,
        send_at: new Date().getTime() / 1000,
        sender: this.getUID(),
        receiver: this.getPartnerUserId()
      }

      console.log('sending chat message ...')
      functions().httpsCallable('sendChatMessage')({chat_id: this.getID(), message: mes}).then(response => {
        console.log(response.data);
      });
    }
  }
}
