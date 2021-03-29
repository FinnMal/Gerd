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
import {
  faChevronCircleRight,
  faArrowAltCircleDown,
  faQuoteRight,
  faCalendar,
  faMapMarker,
  faPen,
  faTrash,
  faChevronCircleLeft,
  faChevronLeft,
  faChevronRight,
  faPlus,
  faPlusCircle,
  faUpload,
  faCloudUploadAlt,
  faFile,
  faEllipsisV,
  faFileWord,
  faFilePowerpoint,
  faFileExcel,
  faFileArchive,
  faFileCsv,
  faFileAudio,
  faFileVideo,
  faFileImage,
  faFileAlt,
  faTimesCircle,
  faCheck,
  faPaperPlane,
  faFilePdf
} from "@fortawesome/free-solid-svg-icons";
import {withNavigation} from "react-navigation";
import {useNavigation} from "@react-navigation/native";
import RNFetchBlob from "rn-fetch-blob";
import Share from "react-native-share";
import RNFS from "react-native-fs";
import CameraRoll from "@react-native-community/cameraroll";
import {AnimatedCircularProgress} from "react-native-circular-progress";
import database from "@react-native-firebase/database";
import EventCard from "./../components/EventCard.js";
import {SharedElement} from 'react-navigation-shared-element';
import {useDarkMode} from 'react-native-dynamic'
import Event from './Event.js';
import File from './File.js';

function CView(props) {
  const isDarkMode = useDarkMode()
  return <View style={[
      props.style, {
        shadowOpacity: isDarkMode
          ? 0
          : 0.6
      }
    ]}>{props.children}</View>;
}

export class Message {
  data = {};
  club = {};
  user = null;
  listener = {};
  author_info = {};

  constructor(data) {
    this.data = data;
    this.user = data.utils.getUser();

    // set ago text
    this.data.ago = this.data.utils.getAgoText(this.data.send_at);
    this.data.ago_sec = this.data.utils.getAgoSec(this.data.send_at);

    if (this.data.ago_sec < 3600) 
      this.startAgoCounter();
    
    this._loadClub();
  }

  getValue(path, cb = null) {
    var obj = this.data;
    if (obj) {
      path_arr = path.split("/");
      if (path_arr) {
        for (i = 0; i < path_arr.length - 1; i++) 
          obj = obj[path_arr[i]];
        
        if (obj && path_arr && path_arr[i]) 
          var value = obj[path_arr[i]];
        
        if (value) 
          return value;
        if (cb) 
          this.getDatabaseValue(path, cb);
        }
      }
  }

  setValue(value, path, store = false) {
    path_arr = path.split("/");

    if (path_arr) {
      var obj = this.data;
      if (obj) {
        for (i = 0; i < path_arr.length - 1; i++) 
          obj = obj[path_arr[i]];
        obj[path_arr[i]] = value;

        if (store) {
          database().ref("clubs/" + this.data.club_id + "/messages/" + this.data.id + '/' + path).set(value);
        } else 
          this._triggerCallbacks(path, value);
        }
      }
  }

  hasValue(path, cb) {
    if (!cb) 
      return this.getValue(path) !== null && this.getValue(path) !== "";
    else {
      this.getValue(path, cb);
    }
  }

  getDatabaseValue(path, cb) {
    database().ref("clubs/" + this.data.club_id + "/messages/" + this.data.id + '/' + path).once("value", function(snap) {
      this.setValue(snap.val(), path);
      cb(snap.val());
    }.bind(this));
  }

  startListener(path, cb) {
    if (!this.listener[path]) {
      this.listener[path] = {
        callbacks: [cb]
      };
      this.setValue(this.getValue(path), path)
    } else {
      this.listener[path].callbacks.push(cb);
    }
  }

  setReadyListener(cb) {
    this.readyListener = cb;
  }

  _triggerCallbacks(path, value = null) {
    if (this.listener[path]) {
      if (this.listener[path].callbacks) {
        this.listener[path].callbacks.forEach((cb, i) => {
          cb(
            value
              ? value
              : this.getValue(path)
          );
        });
      }
    }
  }

  _isReady() {
    return this.data.headline && this.data.short_text && this.club.color && this.club.logo && this.club.name;
  }

  _loadClub() {
    this.club = {}
    database().ref("clubs/" + this.data.club_id + "/color").on("value", function(snap) {
      database().ref("colors/" + snap.val()).on("value", function(snap) {
        var color = snap.val();
        this.club.color = "#" + color.hex;
        this.club.text_color = "#" + color.font_hex;
        if (this._isReady() && this.readyListener) 
          this.readyListener();
        }
      .bind(this));
    }.bind(this));

    database().ref("clubs/" + this.data.club_id + "/logo").on("value", function(snap) {
      this.club.logo = snap.val();
      if (this._isReady() && this.readyListener) 
        this.readyListener();
      }
    .bind(this));

    database().ref("clubs/" + this.data.club_id + "/name").on("value", function(snap) {
      this.club.name = snap.val();
      if (this._isReady() && this.readyListener) 
        this.readyListener();
      }
    .bind(this));
  }

  delete(cb) {
    this.utils.showAlert("Mitteilung löschen?", "", [
      "Ja", "Nein"
    ], function(btn_id) {
      if (cb) 
        cb(btn_id == 0);
      if (btn_id == 0) {
        this.setValue(false, "visible", true)
      }
    }.bind(this), true, false);
  }

  getID() {
    return this.data.id;
  }

  getClubID() {
    return this.data.club_id;
  }

  getUID() {
    return this.data.uid;
  }

  getSendAt() {
    return this.data.send_at;
  }

  setHeadline(value) {
    setValue(value, "headline", true);
  }

  setLongText(value) {
    setValue(value, "long_text", true);
  }

  setShortText(value) {
    setValue(value, "short_text", true);
  }

  startAgoCounter(delay = 1000) {
    if (this.data.ago_sec < 3600) {
      setTimeout(function() {
        this.data.ago_sec = this.data.ago_sec + delay / 1000;
        if (this.data.ago_sec > 60) 
          delay = 60000;
        this.data.ago = this.data.utils.getAgoText(this.data.send_at);
        if (this.renderListener) 
          this.renderListener(this);
        this.startAgoCounter(delay);
      }.bind(this), delay)
    }
  }

  setRenderListener(cb) {
    this.renderListener = cb;
  }

  getAgoText() {
    return this.data.ago;
  }

  getAuthor() {
    return this.getValue('author')
  }

  getAuthorInfo(cb) {
    if (this.author_info.name) 
      return cb(this.author_info);
    else {
      database().ref('users/' + this.getAuthor() + '/name').once('value', (function(snap) {
        this.author_info.name = snap.val();
        database().ref('users/' + this.getAuthor() + '/img').once('value', (function(snap) {
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

  getLongText() {
    return this.getValue('long_text')
  }

  getHeadline() {
    return this.getValue('headline');
  }

  getImage() {
    return this.getValue('img');
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
            var event = new Event(event_id, this.getClubID(), this.getUID());
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

  getRender() {
    const mes = this.data;
    const club = this.club;
    const s_width = Dimensions.get("window").width;
    var s = require("./../app/style.js");
    if (mes) {
      if (mes.headline && mes.short_text && club.color && club.logo && club.name) {

        //groupCards
        var groupCards = [];
        if (this.user.getOption('show_groups')) {
          groupCards = Object.keys(mes.groups).map(key => {
            return <GroupCard textColor={club.text_color} key={key} club_id={this.data.club_id} group_id={key}/>
          });
        }

        return (
          <CView
            style={{
              width: s_width * 0.92,
              height: "auto",
              backgroundColor: club.color,
              marginBottom: 40,
              shadowColor: club.color,
              shadowOffset: {
                width: 0,
                height: 0
              },
              shadowRadius: 20.0,
              padding: 15,
              paddingTop: 22,
              borderRadius: 22
            }}>
            <TouchableOpacity
              style={{
                zIndex: 100,
                borderRadius: 17,
                backgroundColor: "rgba(0, 0,0,0)"
              }}
              onPress={() => {
                this.data.utils.getNavigation().push('MessageScreen', {
                  club: club,
                  mes: this,
                  utils: this.data.utils
                })
              }}>

              <View style={{
                  display: "flex",
                  flexDirection: "row"
                }}>
                <FontAwesomeIcon
                  style={{
                    top: 0,
                    right: 0,
                    position: "absolute",
                    marginBottom: 7,
                    opacity: 0.93
                  }}
                  size={25}
                  color={club.text_color}
                  icon={faChevronCircleRight}/>

                <View>
                  <SharedElement id={"headline_" + this.getID()}>
                    <Text
                      style={{
                        marginTop: -5,
                        alignSelf: "flex-start",
                        fontFamily: "Poppins-Bold",
                        color: club.text_color,
                        lineHeight: 40,
                        fontSize: 31
                      }}>
                      {this.getHeadline()}
                    </Text>
                  </SharedElement>
                </View>
              </View>
              <View style={{
                  marginTop: 5
                }}>
                <Text
                  style={{
                    textAlign: "justify",
                    fontSize: 20,
                    fontFamily: "Poppins-Regular",
                    color: club.text_color,
                    opacity: 0.8
                  }}>
                  {mes.short_text}
                </Text>
              </View>

              {
                groupCards.length > 0
                  ? <View
                      style={{
                        marginRight: 20,
                        marginTop: 10,
                        marginBottom: 10,
                        flexWrap: 'wrap',
                        alignItems: 'flex-start',
                        flexDirection: 'row'
                      }}>
                      {groupCards}
                    </View>
                  : void 0
              }

              <View style={{
                  marginTop: 20,
                  display: "flex",
                  flexDirection: "row"
                }}>
                <AutoHeightImage
                  style={{
                    borderRadius: 36
                  }}
                  width={40}
                  source={{
                    uri: club.logo
                  }}/>
                <View style={{
                    marginLeft: 15
                  }}>
                  <Text
                    style={{
                      marginTop: 3,
                      fontSize: 16,
                      fontFamily: "Poppins-SemiBold",
                      color: club.text_color,

                      opacity: 0.8
                    }}>
                    {club.name}
                  </Text>
                  <Text
                    style={{
                      marginTop: -2,
                      fontSize: 13,
                      color: club.text_color,
                      opacity: 0.7
                    }}>
                    {mes.ago}
                  </Text>
                </View>
              </View>
              {
                false
                  ? (
                    <View
                      style={{
                        width: "100%",
                        backgroundColor: "rgba(255, 255,255,0.25)",
                        opacity: 0.85,
                        borderBottomLeftRadius: 10,
                        borderBottomRightRadius: 10
                      }}>
                      <EventCard key={1} pos={1} color={club.text_color} card_type="preview" editable={false} date={mes.events[0].date} location={mes.events[0].location}/>
                    </View>
                  )
                  : (void 0)
              }
            </TouchableOpacity>
          </CView>
        );
      } else {
        mes.headline && mes.short_text && club.color && club.logo && club.name
        if (!mes.headline) 
          console.log('headline is null')
        if (!mes.short_text) 
          console.log('short_text is null')
        if (!club.color) 
          console.log('club.color is null')
        if (!club.logo) 
          console.log('club.logo is null')
        if (!club.name) 
          console.log('club.name is null')
      }
    } else 
      console.log('ERROR: MES IS NULL')
    return null;
  }
}
class GroupCard extends React.Component {
  name = "";
  name_fetched = false;
  constructor(props) {
    super(props);

    database().ref('clubs/' + this.props.club_id + '/groups/' + this.props.group_id + '/name').once('value', (function(snap) {
      this.name = snap.val();
      this.name_fetched = true;
      this.forceUpdate();
    }).bind(this));
  }

  render() {
    if (this.name) {
      return (
        <View
          style={{
            marginTop: 7,
            borderRadius: 10,
            padding: 5,
            paddingLeft: 8,
            paddingRight: 8,
            marginRight: 15,
            backgroundColor: "rgba(255, 255,255,0.25)"
          }}>
          <Text
            style={{
              opacity: 0.8,
              fontFamily: 'Poppins-Bold',
              color: this.props.textColor,
              fontSize: 17
            }}>{this.name}</Text>
        </View>
      )
    } else if (!this.name_fetched) {
      return <ActivityIndicator style={{
          transform: [
            {
              scale: 0.9
            }
          ]
        }} size="small" color="#1e1e1e"/>;
    } else 
      return <View/>
  }
}
