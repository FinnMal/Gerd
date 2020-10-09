import React, {Component} from 'react';

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
import {Event} from './Event.js';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faInbox, faTimesCircle} from '@fortawesome/free-solid-svg-icons';

export class EventsList {
  limit = 20;
  events = {};
  utils = null;
  refs = [];
  clubs = {};
  uid = "";
  event_added_cb = null;
  event_removed_cb = null;

  constructor(utils) {
    this.utils = utils;

    this.state = {
      utils: utils,
      uid: utils.getUserID()
    };
    this.uid = utils.getUserID();
  }

  startEventsListener(added, removed) {
    this.event_added_cb = added;
    this.event_removed_cb = removed;
    this._updateEventList();
  }

  getLimit() {
    return this.limit;
  }

  _setLimit(increase) {
    console.log("_setLimit")
    var old_limit = this.limit;
    if (this.limit == Object.keys(this.events).length) {
      this.limit = old_limit + increase;
      console.log('NEW LIMIT: ' + this.limit);
      this._updateEventList();
    }
  }

  _updateEventList() {
    if (this.refs) {
      // cancel old listener
      this.refs.forEach((ref, i) => {
        ref.off();
      });
      this.refs = [];
    }
    database().ref('users/' + this.uid + '/clubs').once("value", function(snap) {
      this.clubs = snap.val();
      Object.keys(this.clubs).map(key => {
        const club = this.clubs[key];
        if (club) {
          var ref = database().ref('clubs/' + club.club_id + '/events').orderByChild('starts_at').limitToLast(this.limit);
          this.refs.push(ref);
          ref.on('child_added', function(snap) {
            if (!this.events[snap.key + club.club_id]) {
              var data = snap.val();
              data.id = snap.key;
              data.club_id = club.club_id;
              data.uid = this.uid;
              data.utils = this.state.utils;
              var event = new Event(false, false, false, data);
              event.setReadyListener(function() {

                if (this.event_added_cb) 
                  this.event_added_cb(event);
                }
              .bind(this))
              this.events[snap.key + club.club_id] = event;
            }
          }.bind(this));
          ref.on('child_removed', function(snap) {
            if (this.events[snap.key + club.club_id]) {
              if (this.event_removed_cb) 
                this.event_removed_cb(this.events[snap.key + club.club_id]);
              }
            }.bind(this));
        }
      });
    }.bind(this))
  }

  refresh(cb) {
    Object.keys(this.state.events).map(event_id => {
      var event = this.state.events[event_id];
      if (event) {
        if (event.object) {
          this.state.events[event_id].refreshing = true;
          event.object.refresh((function() {
            this.state.events[event_id].refreshing = false;
          }).bind(this));
        }
      }
    });

    var total_refreshing = this.state.events.length;
    while (total_refreshing > 0) {
      Object.keys(this.state.events).map(event_id => {
        var event = this.state.events[event_id];
        if (event) {
          if (!event.refreshing) 
            total_refreshing--;
          }
        });
    }
    if (cb) 
      cb();
    }
  }
