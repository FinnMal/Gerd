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

export class Message extends React.Component {
  utils: null;
  constructor(props) {
    super(props);

    const utils = this.props.utils;
    this.utils = utils;

    this.state = {
      read: null,
      utils: utils,
      user: utils.getUser(),
      uid: utils.getUserID(),
      nav: utils.getNavigation(),
      club_id: this.props.club_id,
      mes_id: this.props.mes_id,
      ref: database().ref("clubs/" + this.props.club_id + "/messages/" + this.props.mes_id),
      data: {},
      club: {}
    };

    this._startListener();
  }

  _startListener() {
    const utils = this.state.utils;
    database().ref("clubs/" + this.state.club_id + "/color").on("value", function(snap) {
      database().ref("colors/" + snap.val()).on("value", function(snap) {
        var color = snap.val();
        this.state.club.color = "#" + color.hex;
        this.state.club.text_color = "#" + color.font_hex;
        this.forceUpdate();
      }.bind(this));

      this.forceUpdate();
    }.bind(this));

    database().ref("clubs/" + this.state.club_id + "/logo").on("value", function(snap) {
      this.state.club.logo = snap.val();
      this.forceUpdate();
    }.bind(this));

    database().ref("clubs/" + this.state.club_id + "/name").on("value", function(snap) {
      this.state.club.name = snap.val();
      this.forceUpdate();
    }.bind(this));

    database().ref("users/" + this.state.uid + "/messages/" + this.state.mes_id + "/read").once("value", function(snap) {
      this.state.read = snap.val() === true;
      this.forceUpdate();
    }.bind(this));

    this.refresh();
  }

  _stopListener() {
    this.state.ref.off();
  }

  _onDataChange(message, cb) {
    const utils = this.state.utils;
    message.id = this.state.mes_id;

    message.ago = utils.getAgoText(message.send_at);
    message.ago_seconds = utils.getAgoSec(message.send_at);

    message.read = this.state.read;

    this.state.data = message;
    if (cb) 
      cb();
    this.forceUpdate();
  }

  delete(cb) {
    this.utils.showAlert("Mitteilung löschen?", "", [
      "Ja", "Nein"
    ], function(btn_id) {
      if (cb) 
        cb(btn_id == 0);
      if (btn_id == 0) {
        this.state.ref.child("visible").set(false);
      }
    }.bind(this), true, false);
  }

  set(values) {
    Object.keys(values).map(key => {
      this.state.ref.child(key).set(values[key]);
    });
  }

  setHeadline(value) {
    this.state.ref.child("headline").set(value);
  }

  setLongText(value) {
    this.state.ref.child("long_text").set(value);
  }

  setShortText(value) {
    this.state.ref.child("short_text").set(value);
  }

  setFileName(pos, name) {
    this.state.ref.child("files/" + pos + "/name").set(name);
  }

  _getDifference(o1, o2) {
    var diff = {};
    var tmp = null;
    if (JSON.stringify(o1) === JSON.stringify(o2)) 
      return;
    
    for (var k in o1) {
      if (Array.isArray(o1[k]) && Array.isArray(o2[k])) {
        tmp = o1[k].reduce(function(p, c, i) {
          var _t = this._getDifference(c, o2[k][i]);
          if (_t) 
            p.push(_t);
          return p;
        }, []);
        if (Object.keys(tmp).length > 0) 
          diff[k] = tmp;
        }
      else if (typeof o1[k] === "object" && typeof o2[k] === "object") {
        tmp = this._getDifference(o1[k], o2[k]);
        if (tmp && Object.keys(tmp) > 0) 
          diff[k] = tmp;
        }
      else if (o1[k] !== o2[k]) {
        diff[k] = o2[k];
      }
    }
    return diff;
  }

  refresh(cb) {
    this.state.ref.once("value", function(snap) {
      this._onDataChange(snap.val(), cb);
    }.bind(this));
  }

  render() {
    const club = this.state.club;
    const mes = this.state.data;
    const s_width = Dimensions.get("window").width;
    var s = require("./../app/style.js");
    this.props.onVisibilityChange(this.state.mes_id, false);
    if (this.state.read != null && mes.visible !== false) {
      mes.section = 2;
      if (!this.state.read) 
        mes.section = 0;
      else if (mes.ago_seconds / 60 / 60 < 24) 
        mes.section = 1;
      
      this.props.onVisibilityChange(this.state.mes_id, this.props.showIfSectionIs == mes.section);
      if (this.props.showIfSectionIs == mes.section) {
        if (mes) {
          if (mes.headline && mes.short_text && club.color && club.logo && club.name) {

            //groupCards
            var groupCards = [];
            if (this.state.user.getOption('show_groups')) {
              groupCards = Object.keys(mes.groups).map(key => {
                return <GroupCard key={key} club_id={this.state.club_id} group_id={key}/>
              });
            }

            return (
              <TouchableOpacity
                style={{
                  width: s_width * 0.875,
                  height: "auto",
                  backgroundColor: club.color,
                  alignSelf: "flex-start",
                  marginTop: 40,
                  marginLeft: 23,
                  marginRight: 23,

                  borderRadius: 10,

                  shadowColor: club.color,
                  shadowOffset: {
                    width: 0,
                    height: 0
                  },
                  shadowOpacity: 0.5,
                  shadowRadius: 14.0
                }}
                onPress={() => {
                  this.state.nav.navigate("MessageScreen", {
                    club: club,
                    mes: mes,
                    mesObj: this,
                    utils: this.state.utils
                  });
                }}>
                <View
                  style={{
                    marginTop: 20,
                    marginLeft: 15,
                    display: "flex",
                    flexDirection: "row"
                  }}>
                  <FontAwesomeIcon
                    style={{
                      marginTop: -3,
                      marginLeft: 270,
                      position: "absolute",
                      marginBottom: 7
                    }}
                    size={25}
                    color={club.text_color}
                    icon={faChevronCircleRight}/>
                  <Text
                    style={{
                      marginRight: 42,
                      alignSelf: "flex-start",
                      fontFamily: "Poppins-Bold",
                      fontSize: 30,
                      color: club.text_color,
                      lineHeight: 33
                    }}>
                    {mes.headline}
                  </Text>
                </View>
                <View style={{
                    marginTop: 5,
                    marginLeft: 15,
                    marginRight: 35
                  }}>
                  {
                    false
                      ? <AutoHeightImage
                          style={{
                            borderRadius: 10,
                            marginBottom: 10,

                            shadowColor: "#000000",
                            shadowOffset: {
                              width: 0,
                              height: 0
                            },
                            shadowOpacity: 1,
                            shadowRadius: 30.0
                          }}
                          width={s_width - 80}
                          source={{
                            uri: mes.img
                          }}/>
                      : void 0
                  }

                  <Text
                    style={{
                      textAlign: "justify",
                      fontSize: 20,
                      fontFamily: "Poppins-Regular",
                      color: club.text_color
                    }}>
                    {mes.short_text}
                  </Text>
                </View>

                {
                  groupCards.length > 0
                    ? <View
                        style={{
                          marginRight: 20,
                          marginLeft: 15,
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

                <View
                  style={{
                    marginTop: 20,
                    marginBottom: 20,
                    marginLeft: 15,
                    display: "flex",
                    flexDirection: "row"
                  }}>
                  <AutoHeightImage
                    style={{
                      borderRadius: 36
                    }}
                    width={36}
                    source={{
                      uri: club.logo
                    }}/>
                  <View style={{
                      marginLeft: 15
                    }}>
                    <Text
                      style={{
                        marginTop: 4,
                        fontSize: 13,
                        color: club.text_color
                      }}>
                      {mes.ago}
                    </Text>
                    <Text
                      style={{
                        marginTop: -2,
                        fontSize: 16,
                        fontFamily: "Poppins-SemiBold",
                        color: club.text_color
                      }}>
                      {club.name}
                    </Text>
                  </View>
                </View>
                {
                  mes.events
                    ? (
                      <View
                        style={{
                          width: "100%",
                          backgroundColor: "rgba(255, 255,255,0.25)",
                          opacity: 0.9,
                          borderBottomLeftRadius: 10,
                          borderBottomRightRadius: 10
                        }}>
                        <EventCard key={1} pos={1} color={club.text_color} card_type="preview" editable={false} date={mes.events[0].date} location={mes.events[0].location}/>
                      </View>
                    )
                    : (void 0)
                }
              </TouchableOpacity>
            );
          } else 
            console.log("Missing value");
          }
        else 
          console.log("mes is null");
        }
      }

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
          <Text style={{
              opacity: 0.7,
              fontFamily: 'Poppins-Bold',
              color: "black",
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
