import React, { Component } from 'react';

import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Button,
  TouchableHighlight
} from 'react-native';
import database from '@react-native-firebase/database';
import { Message } from './Message.js';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faInbox, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

// MESSAGESLIST class: manages a list of clubs messsages. similar to DataList.js
export class MessagesList {
  limit = 5;
  messages = {};
  utils = null;
  refs = [];
  clubs = {};
  uid = "";
  message_added_cb = null;
  message_removed_cb = null;
  ready_messages = {}

  constructor(utils) {
    this.utils = utils;

    this.state = {
      utils: utils,
      uid: utils.getUserID()
    };
    this.uid = utils.getUserID();
  }

  startMessagesListener(added, removed) {
    this.message_added_cb = added;
    this.message_removed_cb = removed;
    this._updateMessageList();
  }

  getLimit() {
    return this.limit;
  }

  _setLimit(increase) {
    var old_limit = this.limit;
    this.limit = old_limit + increase;
    this._updateMessageList();
  }

  _updateMessageList() {
    if (this.refs) {
      // cancel old listener
      this.refs.forEach((ref, i) => {
        ref.off();
      });
      this.refs = [];
    }
    this.utils.getUser().getClubsList(function (clubs) {
      if (clubs) {
        clubs.map((club) => {
          if (club) {
            var ref = database().ref('clubs/' + club.getID() + '/messages').orderByChild('send_at');
            this.refs.push(ref);
            ref.on('child_added', function (snap) {
              if (!this.messages[snap.key]) {
                var data = snap.val();
                var mes = new Message(snap.key, club, this.utils.getUser(), data);
                mes.setReadyListener(function () {
                  //mes.loadIsRead(function(){
                  //if (!mes.isRead() && this.message_added_cb)
                  if (this.message_added_cb)
                      this.message_added_cb(mes);
                  //}.bind(this))
                }.bind(this))
                this.messages[snap.key] = mes;
              }
            }.bind(this));
            ref.on('child_removed', function (snap) {
              if (this.messages[snap.key]) {
                if (this.message_removed_cb)
                  this.message_removed_cb(this.messages[snap.key]);
              }
            }.bind(this));
          }
        });
      }
    }.bind(this), false, ['logo', 'color', 'name'])
  }

  refresh(cb) {
    Object.keys(this.state.messages).map(mes_id => {
      var mes = this.state.messages[mes_id];
      if (mes) {
        if (mes.object) {
          this.state.messages[mes_id].refreshing = true;
          mes.object.refresh((function () {
            this.state.messages[mes_id].refreshing = false;
          }).bind(this));
        }
      }
    });

    var total_refreshing = this.state.messages.length;
    while (total_refreshing > 0) {
      Object.keys(this.state.messages).map(mes_id => {
        var mes = this.state.messages[mes_id];
        if (mes) {
          if (!mes.refreshing)
            total_refreshing--;
        }
      });
    }
    if (cb)
      cb();
  }
}
