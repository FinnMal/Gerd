import Chat from './Chat.js';
import Club from './Club.js';
import auth from '@react-native-firebase/auth';
import database from "@react-native-firebase/database";
import DatabaseConnector from "./database/DatabaseConnector";

// USER class: manages a user object in firebase database
export default class User extends DatabaseConnector {
  uid = null;

  constructor(uid, start_values = ['name', 'account_type']) {
    super('users', uid, start_values)
    this.uid = uid;
  }

  getUID() {
    return this.uid;
  }

  getName() {
    return this.getValue("name");
  }

  setName(v) {
    this.setValue(v, "name");
  }

  updateName(v) {
    this.setValue(v, "name", true);
  }

  getMail() {
    return this.getValue("email");
  }

  setMail(v) {
    this.setValue(v, "email");
  }

  updateMail(v) {
    this.setValue(v, "email", true);
  }

  getPassword() {
    return this.getValue("password");
  }

  setPassword(v) {
    this.setValue(v, "password");
  }

  updatePassword(v) {
    this.setValue(v, "password", true);
  }

  getOption(name) {
    return this.getValue("options/" + name);
  }

  setOption(name, v) {
    this.setValue(v, "options/" + name);
  }

  updateOption(name, v) {
    this.setValue(v, "options/" + name, true);
  }

  toggleOption(name) {
    var v = this.getOption(name);
    this.updateOption(name, !v);
  }

  getImage() {
    var img = this.getValue("img");
    return img
      ? img
      : "https://finnmalkus.de/wp-content/themes/finnmalkus/assets/patrick.jpg";
  }

  setImage(url) {
    this.setValue(url, 'img', true);
  }

  isManager() {
    return this.getValue('account_type') === 'manager'
  }

  hasEventSubscribed(club_id, event_id) {
    if (!this.getValue('events')) 
      this.setValue({}, 'events')
    if (!this.getValue('events/' + club_id + "_" + event_id)) {
      this.setValue({
        notification_subscribed: true
      }, 'events/' + club_id + "_" + event_id)
      return true;
    }
    return this.getValue('events/' + club_id + "_" + event_id + '/notification_subscribed') === true
  }

  toggleEventNotification(club_id, event_id, cb = false) {
    var has_notif = this.hasEventSubscribed(club_id, event_id);
    this.setValue(!has_notif, 'events/' + club_id + "_" + event_id + '/notification_subscribed', true)

    // notification before event starts
    /*
    OneSignal.sendTag(
      club_id + "_" + event_id + "_before",
      !has_notif
        ? "yes"
        : "no"
    );
    */

    // notification when event starts
    /*
    OneSignal.sendTag(
      club_id + "_" + event_id + "_start",
      !has_notif
        ? "yes"
        : "no"
    );
    */

    if (cb) 
      cb(!has_notif);
    }
  
  getChats(cb) {
    database().ref("users/" + this.uid + "/chats").once("value", function(snap) {
      var chats = [];
      var chat_ids = snap.val();
      var d = 0;
      if (chat_ids) {
        Object.keys(chat_ids).forEach((chat_id, i) => {
          var chat = new Chat(chat_id, this);
          chat.setReadyListener(function() {
            chats.push(chat);
            if (d == Object.keys(chat_ids).length - 1) 
              cb(chats);
            d++;
          })
        })
      } else 
        cb([null]);
      }
    .bind(this));
  }

  getChatsList(cb, startListener = false, start_values = null) {
    if (!startListener) {
      this.getValue('chats', function(chats) {
        this._chatToObjects(chats, cb, start_values);
      }.bind(this))
    } else {
      this.startListener('chats', function(chats) {
        this._chatToObjects(chats, cb, start_values);
      }.bind(this))
    }
  }

  _chatToObjects(chats, cb, start_values = null) {
    var chats_list = []
    if (chats){
      if (Object.keys(chats).length > 0){
        for(let chat_id in chats){
          const chat = new Chat(chat_id, this);
          chat.setReadyListener(function() {
            chats_list.push(chat);
            var chat_ids = Object.keys(chats)
            if (chat_id == chat_ids[chat_ids.length-1])
              cb(chats_list);
          }.bind(this))
        }
      }
      else cb(false)
    }
    else cb(false)
  }

  getClubsList(cb, startListener = false, start_values = null) {
    if (!startListener) {
      this.getValue('clubs', function(club_infos) {
        this._clubInfosToObjects(club_infos, cb, start_values);
      }.bind(this))
    } else {
      this.startListener('clubs', function(club_infos) {
        this._clubInfosToObjects(club_infos, cb, start_values);
      }.bind(this))
    }
  }

  _clubInfosToObjects(club_infos, cb, start_values = null) {
    var clubs_list = [];
    if (club_infos) {
      Object.keys(club_infos).forEach((key, i) => {
        const club_info = club_infos[key];
        if (club_info) {
          var club = new Club(club_info.club_id, this, start_values);
          clubs_list.push(club);
          if (i == Object.keys(club_infos).length - 1) {
            cb(clubs_list);
          }
        }
      });
    } else 
      cb([]);
    }
  
  getClubRoles(cb) {
    if (cb) {
      this.getDatabaseValue('clubs', function(clubs) {
        var roles = {}
        if (clubs) {
          Object.keys(clubs).forEach((club_id, i) => {
            if (clubs[club_id]) 
              roles[club_id] = clubs[club_id].role
          });
        }
        cb(roles)
      }.bind(this))
    } else 
      return this.getValue('club_roles')
  }

  getClubGroups(club, cb=null){
    if(cb){
      this.getDatabaseValue('clubs/'+club.getID()+'/groups', function(groups){
        this.setValue(groups, club.getID()+'_roles')
        if(groups) cb(groups)
        else cb(false)
      }.bind(this))
    }
    else return this.getValue(club.getID()+'_roles')
  }

  updateAccountType() {
    this.getClubRoles(function(roles) {
      var has_admin_role = false
      if (roles) {
        has_admin_role = Object.keys(roles).some(function(id) {
          return roles[id] == 'admin';
        });
      }
      this.setValue(
        has_admin_role
          ? 'manager'
          : 'user',
        'account_type',
        true
      );
    }.bind(this))
  }

  getPublicKey(cb = null) {
    if (cb) {
      this.getValue('public_key', function(public_key) {
        if (public_key) 
          cb(JSON.stringify(public_key))
        else 
          cb(false)
      }.bind(this))
    } else 
      return JSON.stringify(this.getValue('public_key'))
  }

  /*
  Starts a new chat, from user to partner_uid
  @param partner_uid ID of the chat partner
  */
  startChat(partner_uid, utils) {
    var partner = new User(partner_uid)
    partner.getValue('name', function(name) {
      // check if any chat with parner exists
      this.getChats(function(chats) {
        var chat_found = false;
        chats.forEach((chat, i) => {
          if (chat) {
            if (chat.getPartnerUserId() == partner.getUID()) {
              chat_found = true;
              utils.getNavigation().navigate('ChatScreen', {
                focused: true,
                chat: chat,
                utils: utils,
                partner_name: name
              });
            }
          }

          if (i == chats.length - 1 && !chat_found) {
            // create chat if no one was found
            var new_chat = {
              user_id_1: this.getUID(),
              user_id_2: partner.getUID()
            };

            var chatRef = database().ref("chats").push(new_chat);
            database().ref("chats/" + chatRef.key + "/id").set(chatRef.key);
            database().ref("users/" + this.getUID() + "/chats/" + chatRef.key).set(true);
            database().ref("users/" + partner.getUID() + "/chats/" + chatRef.key).set(true);
            utils.getNavigation().navigate('ChatScreen', {
              focused: true,
              chat: new Chat(chatRef.key, this),
              utils: utils,
              partner_name: name
            });
          }
        });
      }.bind(this));
    }.bind(this))
  }

  delete(cb){
    console.log('++++++ DELETING ACCOUNT +++')
    this.stopAllListener()

    // log off from all groups
    this.getClubsList(function(clubs){
      console.log(clubs)
      for (let i in clubs){
        const club = clubs[i]
        this.getClubGroups(club, function(groups){
          for(let group_id in groups){
            database().ref('clubs/'+club.getID()+'/groups/'+group_id+'/member_ids/'+this.getID()).remove();

            var ids = Object.keys(groups)
            if (group_id == ids[ids.length-1] && i == clubs.length-1){
              // groups done

              // leave all chats
              this.getChatsList(function(chats){
                if(chats){
                  chats.forEach((chat, i) => {
                    chat.leave()
                    if (i == chats.length-1){
                      // chats done
                      database().ref("users/" + this.getID()).remove()
                      cb(true)
                    }
                  });
                }
                else {
                  database().ref("users/" + this.getID()).remove()
                  cb(true)
                }
              }.bind(this))
            }
          }
        }.bind(this))
      }
      if (clubs.length < 1) {
        database().ref("users/" + this.getID()).remove()
        cb(true)
      }
    }.bind(this), false, [])
  }

  logout(cb){
    auth().signOut().then(() => {
      cb(true)
    }).catch((error) => {
      cb(false, error)
    });
  }
}
