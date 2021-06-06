import Event from './Event.js';
import File from './File.js';
import {AsyncStorage} from "react-native";
import database from "@react-native-firebase/database";
import DatabaseConnector from "./database/DatabaseConnector.js";
import { setReadable } from 'react-native-fs';


// MESSAGE class: manges a clubs message
export class Message extends DatabaseConnector {
  club = null;
  user = null;
  author_info = {};

  constructor(id = false, club = false, user = null, data = {}) {
    super('clubs/' + club.getID() + '/messages', id, [
      'author',
      'headline',
      'img',
      'long_text',
      'short_text',
      'send_at',
      'groups'
    ], data=data)
    this.id = id;
    this.user = user;
    this.club = club;
  }

  getClub() {
    return this.club;
  }

  getClubID() {
    return this.club.getID();
  }

  getUID() {
    return this.user.getID();
  }

  getUser(){
    return this.user
  }

  getSendAt() {
    return this.getValue('send_at')
  }

  setHeadline(value, store = false) {
    this.setValue(value, "headline", store);
  }

  setLongText(value, store = false) {
    this.setValue(value, "long_text", store);
  }

  setShortText(value, store = false) {
    this.setValue(value, "short_text", store);
  }

  getAuthor() {
    return this.getValue('author')
  }

  getAuthorInfo(cb) {
    if (this.author_info.name)
      return cb(this.author_info);
    else {
      database().ref('users/' + this.getAuthor() + '/name').once('value', (function (snap) {
        this.author_info.name = snap.val();
        database().ref('users/' + this.getAuthor() + '/img').once('value', (function (snap) {
          this.author_info.img = snap.val();
          cb(this.author_info);
        }).bind(this));
      }).bind(this));
    }
  }

  showAuthor() {
    return this.getValue('show_author') === true;
  }

  isOwnMessage() {
    return this.getAuthor() == this.getUID();
  }

  isViewable(cb){
    if (cb){
      this.getUser().getClubGroups(this.getClub(), function(user_groups){
        var viewable = false;
        if (user_groups){
          var mes_groups = this.getValue('groups')
          var mes_group_ids = Object.keys(mes_groups)
          for (let group_id of mes_group_ids) {
            var active = mes_groups[group_id]
            if (user_groups[group_id] === true){
              if (active === true) viewable = true
              else {
                viewable = true
                var links = this._getLinkedGroups(group_id)
                for (let l_group_id of links) {
                  if(user_groups[l_group_id] !== true) viewable = false
                }
              }
            }
          }
        }
        if (viewable) console.log('is viewable')
        else console.log('is not viewables')
        this.setValue(viewable, 'viewable')
        cb(viewable)
      }.bind(this))
    }
    else return this.getValue('viewable')
  }

  _getLinkedGroups(group_id){
    var info = this.getValue('groups/'+group_id+'/linked_to')

    var links = []
    for (let group_id of Object.keys(info)) {
      if(info[group_id] === true) links.push(group_id)
    }
    return links
  }

  getShortText() {
    return this.getValue('short_text')
  }

  getLongText() {
    return this.getValue('long_text')
  }

  getHeadline() {
    return this.getValue('headline');
  }

  getImage() {
    return this.getValue('img');
  }

  getReadingTime(){
    if (!this.hasValue('reading_time')) {
      // calculate reading time
      const words = (this.getHeadline()+' '+this.getLongText()+' '+this.getAuthor()).trim().split(/\s+/).length;
      const minutes = Math.ceil(words / 249);
      this.setValue(minutes, 'reading_time')
    }
    return this.getValue('reading_time')
  }


  async loadIsRead(cb){
    try {
      const r = await AsyncStorage.getItem(this.getID() + "_read") === "yes";
      this.setValue(r, 'read')
      cb(r)
    } catch (e) {
      cb(false)
    }
  }

  isRead(){
    return this.getValue('read') === true
  }

  async setRead(v=true){
    this.setValue(v, 'read')
    try {
      await AsyncStorage.setItem(this.getID() + "_read", v ? "yes" : "no");
    } catch (e) {}
  }

  hasEvents() {
    var has_events = false;
    if (this.getValue('events')) {
      Object.keys(this.getValue('events')).map(event_id => {
        if (this.getValue('events/' + event_id))
          has_events = true;
      }
      );
    }
    return has_events;
  }

  getEvents() {
    var events = [];
    if (this.getValue('events')) {
      Object.keys(this.getValue('events')).map(event_id => {
        if (this.getValue('events/' + event_id)) {
          if (!this.getValue('event_objects'))
            this.setValue({}, 'event_objects')
          if (!this.getValue('event_objects/' + event_id)) {
            var event = new Event(event_id, this.getClub(), this.getUID());
            this.setValue(event, 'event_objects/' + event_id);
          }
          events.push(this.getValue('event_objects/' + event_id))
        }
      });
    }
    return events;
  }

  hasFiles() {
    var has_files = false;
    if (this.getValue('files')) {
      Object.keys(this.getValue('files')).map(file_id => {
        if (this.getValue('files/' + file_id))
          has_files = true;
      }
      );
    }
    return has_files;
  }

  getFiles() {
    console.log('in getFiles')
    var files = [];
    if (this.getValue('files')) {
      Object.keys(this.getValue('files')).map(file_id => {
        if (this.getValue('files/' + file_id)) {
          if (!this.getValue('file_objects'))
            this.setValue({}, 'file_objects')
          if (!this.getValue('file_objects/' + file_id)) {
            var file = new File(file_id, this.getClubID(), this.user);
            this.setValue(file, 'file_objects/' + file_id);
          }
          files.push(this.getValue('file_objects/' + file_id))
        }
      });
    }
    return files;
  }
}