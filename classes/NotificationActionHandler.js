import React from "react";
import {Alert} from "react-native";
import * as utils from "./../utils.js";
import database from '@react-native-firebase/database';
import EncryptedStorage from 'react-native-encrypted-storage';
import KeyManager from './KeyManager.js'

export default class NotificationActionHandler {
  constructor(notification) {
    this.data = notification.notification.payload.additionalData
    this.is_active = notification.notification.isAppInFocus
    this.message = notification.notification.payload.body
    this.notification = notification

    this.key_manager = new KeyManager()
  }

  handle() {
    console.log(this.data)
    if (this.data.type == 'group_queue') {
      utils.showAlert('Anfrage', this.data.user + " möchte der Gruppe " + this.data.group + ' beitreten.', [
        'Ok', 'Abbrechen'
      ], function(button_index) {
        if (button_index == 0) {
          // get private key of group
          this.key_manager.getKey(this.data.club + '_' + this.data.group + '_private_key', function(private_group_key) {
            console.log('private_group_key: ' + JSON.stringify(private_group_key))
            //private_group_key = JSON.parse(private_group_key)['n'] private_group_key = private_group_key['n'] get public key of user
            database().ref('users/' + this.data.user + '/public_key').once("value", function(snap) {
              const public_user_key = JSON.stringify(snap.val())
              console.log('public_user_key: ' + public_user_key)
              console.log('private_group_key: ' + private_group_key)
              var encrypted_private_group_key = this.key_manager.encrypt(private_group_key, public_user_key)
              database().ref('clubs/' + this.data.club + '/groups/' + this.data.group + '/queue/' + this.data.user).set(encrypted_private_group_key)
            }.bind(this));
          }.bind(this))

        }
        if (button_index == 1) 
          console.log('nicht erlaubt')
      }.bind(this))
    } else if (this.data.type == "group_queue_accepted") {
      utils.showAlert('Bestätigung', 'Du bist nun Mitglied von ' + this.data.group_id, ['Ok'], function() {
        //store group key
        var keyRef = database().ref('clubs/' + this.data.club_id + '/groups/' + this.data.group_id + '/queue/' + this.data.user_id)
        keyRef.once("value", async function(snap) {
          var private_group_key = snap.val()
          const decrypted_private_group_key = await this.key_manager.decryptWithPrivate(private_group_key)
          this.key_manager.saveKey(this.data.club_id + '_' + this.data.group_id + '_private_key', decrypted_private_group_key)
          keyRef.remove()
        }.bind(this))
      }.bind(this))
    }
  }
}
