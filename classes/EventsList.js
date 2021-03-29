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
import Event from './Event.js';
import Club from './Club.js';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faInbox, faTimesCircle} from '@fortawesome/free-solid-svg-icons';

export class EventsList {
  limit = 20;
  events = {};
  refs = [];
  clubs = {};
  uid = "";
  event_added_cb = null;
  event_removed_cb = null;
  active = false;

  constructor(user) {
    this.user = user;
  }

  startEventsListener(added, removed) {
    this.active = true;
    this.event_added_cb = added;
    this.event_removed_cb = removed;
    this._updateEventList();
  }

  stopEventsListener() {
    this.active = false;
    this.refs.forEach((ref, i) => {
      ref.off();
    });

    for (var event_id in this.events) {
      this.events[event_id].stopAllListener();
    }
  }

  getLimit() {
    return this.limit;
  }

  _setLimit(increase) {
    var old_limit = this.limit;
    if (this.limit == Object.keys(this.events).length) {
      this.limit = old_limit + increase;
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

    this.user.getClubsList(function(clubs) {
      if (this.active) {
        console.log('in getClubsList 3')
        clubs.forEach(function(c) {
          var ref = database().ref('clubs/' + c.getID() + '/events').orderByChild('starts_at').limitToLast(this.limit);
          this.refs.push(ref);
          ref.on('child_added', function(snap) {
            if (!this.events[snap.key + c.getID()]) {
              var e = new Event(snap.key, c, this.user, snap.val(), ['name', 'logo']);
              e.setRenderListener(function() {
                console.log('after setRenderListener')
              })
              e.setReadyListener(function() {
                if (this.event_added_cb) 
                  this.event_added_cb(e);
                }
              .bind(this))
              this.events[snap.key + c.getID()] = e;
            }
          }.bind(this));
          ref.on('child_removed', function(snap) {
            if (this.events[snap.key + c.getID()]) {
              if (this.event_removed_cb) 
                this.event_removed_cb(this.events[snap.key + c.getID()]);
              }
            }.bind(this));
        }.bind(this));
      }
    }.bind(this))
  }

  refresh(cb) {
    Object.keys(this.state.events).map(event_id => {
      var e = this.state.events[event_id];
      if (e) {
        if (e.object) {
          this.state.events[event_id].refreshing = true;
          e.object.refresh((function() {
            this.state.events[event_id].refreshing = false;
          }).bind(this));
        }
      }
    });

    var total_refreshing = this.state.events.length;
    while (total_refreshing > 0) {
      Object.keys(this.state.events).map(event_id => {
        var e = this.state.events[event_id];
        if (e) {
          if (!e.refreshing) 
            total_refreshing--;
          }
        });
    }
    if (cb) 
      cb();
    }
  }
