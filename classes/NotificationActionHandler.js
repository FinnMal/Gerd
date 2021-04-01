import React from "react";
import {Alert} from "react-native";
import * as utils from "./../utils.js";
import database from '@react-native-firebase/database';
import EncryptedStorage from 'react-native-encrypted-storage';

export default class NotificationActionHandler {
  constructor(notification) {
    this.data = notification.notification.payload.additionalData
    this.is_active = notification.notification.isAppInFocus
    this.message = notification.notification.payload.body
    this.notification = notification

    var RSAKey = require('react-native-rsa');
    this.rsa = new RSAKey();
  }

  async readFromEncryptedStorage(name, cb) {
    try {
      const session = await EncryptedStorage.getItem(name);
      cb(session)
    } catch (error) {
      console.log(error)
      cb(false)
    }
  }

  encryptString(str, key) {
    var str_parts = str.match(/.{1,70}/g);
    var result = []
    this.rsa.setPublicString(key);
    str_parts.forEach((str, i) => {
      result.push(this.rsa.encrypt(str))
    });
    return result
  }

  decryptMessage(message, key) {
    this.rsa.setPrivateString(key);
    return this.rsa.decrypt(message);
  }

  handle() {
    console.log(this.data)
    //if (this.data.type == 'group_queue') {
    utils.showAlert('Anfrage', this.data.user + " möchte der Gruppe " + this.data.group + ' beitreten.', [
      'Ok', 'Abbrechen'
    ], function(button_index) {
      if (button_index == 0) {
        // get private key of group
        this.readFromEncryptedStorage('1_admin_private_key', function(private_group_key) {
          private_group_key = JSON.parse(private_group_key)['n']
          // get public key of user
          console.log('users/' + this.data.user + '/public_key')
          database().ref('users/' + this.data.user + '/public_key').once("value", function(snap) {
            const public_user_key = JSON.stringify(snap.val())
            console.log('private_group_key: ' + private_group_key)
            console.log('public_user_key: ' + public_user_key)
            var encrypted_private_group_key = this.encryptString(private_group_key, public_user_key)
            database().ref('clubs/' + this.data.club + '/groups/' + this.data.group + '/queue/' + this.data.user).set(encrypted_private_group_key)
          }.bind(this));
        }.bind(this))
      }
      if (button_index == 1) 
        console.log('nicht erlaubt')
    }.bind(this))
  }
  //}
}