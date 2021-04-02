import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActionSheetIOS,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
  Image,
  Animated,
  Easing
} from "react-native";
import AutoHeightImage from "react-native-auto-height-image";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {
  faCalendar,
  faMapMarker,
  faChevronRight,
  faPlus,
  faClock,
  faQuoteRight,
  faMapMarkerAlt,
  faRedoAlt,
  faStar,
  faCheck,
  faShareAlt,
  faBellSlash,
  faBell,
  faEllipsisV
} from "@fortawesome/free-solid-svg-icons";
import {withNavigation} from "react-navigation";
import {useNavigation} from "@react-navigation/native";
import {AnimatedCircularProgress} from "react-native-circular-progress";
import database from "@react-native-firebase/database";
import functions from '@react-native-firebase/functions';
import {useDarkMode} from 'react-native-dynamic'
import {default as Modal} from "./../components/Modal.js";
import {Theme} from './../app/index.js';
import Button from './../components/Button.js';
import storage from "@react-native-firebase/storage";
import {getColorFromURL} from 'rn-dominant-color';
import DatabaseConnector from "./database/DatabaseConnector";

export default class Event extends DatabaseConnector {
  text_color = "#000000";
  imageScale = new Animated.Value(1);
  textOpacity = new Animated.Value(0);
  textMarginLeft = new Animated.Value(15);
  buttonMarginBottom = new Animated.Value(-30);
  animationDuration = 30000;
  ready_to_render = false;

  constructor(id, club, user = null, data = false) {
    super('clubs/' + club.getID() + '/events', id, [
      'title', 'visible', 'starts_at'
    ], data);
    this.id = id;
    this.club = club;
    this.user = user;
    this.setReadyListener(function() {
      this._loadClubData();
      this.downloadStorageImage()
    }.bind(this))
  }

  async downloadStorageImage(cb) {
    if (this.getValue("image_name")) {
      const url = await storage().ref('fallback_images/' + this.getValue("image_name")).getDownloadURL();
      this.setImage(url);
      if (cb) 
        cb();
      }
    else if (cb) 
      cb();
    }
  
  _loadClubData() {
    /*console.log('in _loadClubData')
      club.setReadyListener(funciton() {
      database().ref("colors/" + snap.val()).on("value", function(snap) {
        var color = snap.val();
        club.setColor("#" + color.hex)
        club.setTextColor("#" + color.font_hex);
        this.user.getDatabaseValue("events/" + this.getClubID() + "_" + this.getID(), function(value) {
          this.calculateTextColor(function() {
            this.ready_to_render = true;
            if (this.renderListener)
              this.renderListener(this)
          }.bind(this))
        }.bind(this));

      }.bind(this));
    }.bind(this)
  )*/
  }

  setRenderListener(cb) {
    if (this.ready_to_render) 
      return cb();
    else 
      this.renderListener = cb;
    }
  
  calculateTextColor(cb) {
    getColorFromURL(this.getImage()).then(colors => {
      var rgb = this.hexToRGBA(colors.background)

      const brightness = Math.round(((parseInt(rgb[0]) * 299) + (parseInt(rgb[1]) * 587) + (parseInt(rgb[2]) * 114)) / 1000);
      this.text_color = (brightness > 125)
        ? 'black'
        : 'white';
      cb();
    })
  }

  hexToRGBA(hex, alpha) {
    if (!/^#([A-Fa-f0-9]{3,4}){1,2}$/.test(hex)) {
      throw new Error("Invalid HEX")
    }
    const hexArr = hex.slice(1).match(new RegExp(`.{${Math.floor((hex.length - 1) / 3)}}`, "g"))
    return hexArr.map(this.convertHexUnitTo256)
  }

  convertHexUnitTo256(hexStr) {
    return parseInt(hexStr.repeat(2 / hexStr.length), 16)
  }

  getClubID() {
    return this.club.getID();
  }

  getClub() {
    return this.club;
  }

  getUser() {
    return this.user;
  }

  getStartsAt() {
    return this.getValue('starts_at');
  }

  getTitle() {
    return this.getValue('title');
  }

  setTitle(v, store = false) {
    this.setValue(v, 'title', store);
  }

  isVisible() {
    return this.getValue('visible') === true;
  }

  setVisible(v, store = false) {
    this.setValue(v, 'visible', store)
  }

  isFullDay() {
    return this.getValue('full_day') === true;
  }

  getDate() {
    var date = new Date(this.getStartsAt() * 1000);
    if (!this.hasRepeat()) {
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      };
      return date.toLocaleTimeString('de-DE', options)
    } else if (this.getRepeat() == "daily") {
      const options = {
        hour: '2-digit',
        minute: '2-digit'
      };
      return "Jeden Tag, " + date.toLocaleTimeString('de-DE', options)
    } else if (this.getRepeat() == "weekly") {
      const options = {
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
      };
      return "Jeden " + date.toLocaleTimeString('de-DE', options)
    } else if (this.getRepeat() == "every_two_weeks") {
      const options = {
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
      };
      return "Jeden zweiten " + date.toLocaleTimeString('de-DE', options)
    } else if (this.getRepeat() == "monthly") {
      const options = {
        hour: '2-digit',
        minute: '2-digit'
      };
      return this._getWeekOfMonth(date) + " " + date.toLocaleDateString('de-DE', {weekday: 'long'}) + " im Monat, " + date.toLocaleTimeString('de-DE', options)
    } else if (this.getRepeat() == "yearly") {
      const options = {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      };
      return "Jählich am " + date.toLocaleTimeString('de-DE', options);
    }
  }

  setDate(v, store = false) {
    this.setValue(v, 'date', store);
  }

  getDuration() {
    if (!this.isFullDay()) {
      var diff = this.getValue('ends_at') - this.getValue('starts_at');
      if (diff < 60) 
        return Math.round(diff) + " Sek"
      else if (diff < 3600) 
        return Math.round((diff / 60) * 10) / 10 + " Min"
      else if (diff < 86400) 
        return Math.round((diff / 3600) * 10) / 10 + " Std"
      else 
        return Math.round((diff / 86400) * 10) / 10 + (
          Math.round((diff / 86400) * 10) / 10
            ? " Tage"
            : " Tag"
        )
    }
    return false;
  }

  getLocation() {
    return this.getValue('location');
  }

  setLocation(v, store = false) {
    this.setValue(v, 'location', store);
  }

  isOwnEvent() {
    return this.getValue('author') == this.uid;
  }

  hasRepeat() {
    return this.getValue('repeat') !== 'never';
  }

  getRepeat() {
    return this.getValue('repeat');
  }

  getImage() {
    return this.getValue('img');
  }

  setImage(url) {
    this.setValue(url, 'img');
  }

  saveToCalendar() {
    alert('function not available')
  }

  openEditModal() {
    if (this.modal) 
      this.modal.open();
    }
  
  _getWeekOfMonth(date) {
    var strings = ["Erster", "Zweiter", "Dritter", "Vierter"];
    var firstWeekday = new Date(date.getFullYear(), date.getMonth(), 1).getDay() - 1;
    if (firstWeekday < 0) 
      firstWeekday = 6;
    var offsetDate = date.getDate() + firstWeekday - 1;
    return strings[Math.floor(offsetDate / 7) - 1];
  }

  renderMembersList() {
    return (
      <View
        style={{
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          flexDirection: 'row',
          marginTop: 15,
          opacity: .7
        }}>
        <Image
          source={{
            url: this.getImage()
          }}
          style={{
            borderWidth: 1,
            borderColor: '#F1F1F1',
            borderRadius: 30,
            height: 30,
            width: 30
          }}/>
        <Image
          source={{
            url: this.getImage()
          }}
          style={{
            marginLeft: -12,
            borderWidth: 1,
            borderColor: '#F1F1F1',
            borderRadius: 30,
            height: 30,
            width: 30
          }}/>
        <Image
          source={{
            url: this.getImage()
          }}
          style={{
            marginLeft: -12,
            borderWidth: 1,
            borderColor: '#F1F1F1',
            borderRadius: 30,
            height: 30,
            width: 30
          }}/></View>
    );
  }

  /*
  onShow(direction) {
    this.visible = true;
    Animated.timing(this.textOpacity, {
      useNativeDriver: false,
      toValue: 1,
      duration: 600,
      easing: Easing.ease
    }).start();
    this.textMarginLeft.setValue(
      direction == "left"
        ? 120
        : -120
    );
    Animated.timing(this.textMarginLeft, {
      useNativeDriver: false,
      toValue: 15,
      duration: 300,
      easing: Easing.ease
    }).start();

    Animated.timing(this.buttonMarginBottom, {
      useNativeDriver: false,
      toValue: 15,
      duration: 300,
      easing: Easing.ease
    }).start();

    setTimeout(function() {
      if (this.visible) {
        Animated.timing(this.imageScale, {
          useNativeDriver: false,
          toValue: 1.7,
          duration: this.animationDuration,
          easing: Easing.linear
        }).start();
      }
    }.bind(this), 500)
  }

  onHide() {
    this.visible = false;
    Animated.timing(this.textOpacity, {
      useNativeDriver: false,
      toValue: 0,
      duration: 200,
      easing: Easing.ease
    }).start();

    Animated.timing(this.imageScale, {
      useNativeDriver: false,
      toValue: 1,
      duration: 200,
      easing: Easing.ease
    }).start();

    Animated.timing(this.textMarginLeft, {
      useNativeDriver: false,
      toValue: 15,
      duration: 100,
      easing: Easing.ease
    }).start();

    Animated.timing(this.buttonMarginBottom, {
      useNativeDriver: false,
      toValue: -30,
      duration: 300,
      easing: Easing.ease
    }).start();
  }

  onClickBell() {
    const user = this.data.utils.getUser();
    user.toggleEventNotification(this.getClubID(), this.getID(), function(subscribed) {
      if (this.renderListener)
        this.renderListener(this);
      }
    .bind(this))
  }
  */

  /*
  getRenderForPreview(width = -1) {
    const event = this.data;
    const club = this.club;
    const user = this.data.utils.getUser();
    const s_width = Dimensions.get("window").width;
    var s = require("./../app/style.js");

    const textOpacity = this.textOpacity.interpolate({
      inputRange: [
        0, 1
      ],
      outputRange: [0, 1]
    });

    const textMarginLeft = this.textMarginLeft.interpolate({
      inputRange: [
        0, 1000
      ],
      outputRange: [0, 1000]
    });

    const imageScale = this.imageScale.interpolate({
      inputRange: [
        0, 2
      ],
      outputRange: [0, 2]
    });

    const buttonMarginBottom = this.buttonMarginBottom.interpolate({
      inputRange: [
        0, 1000
      ],
      outputRange: [0, 1000]
    });

    if (event) {
      return <View style={{
          flex: 1,
          height: "100%",
          width: width
        }}>
        <View
          style={{
            backgroundColor: this.text_color == "white"
              ? "black"
              : "white",
            position: "absolute",
            width: "100%",
            height: "100%"
          }}/>
        <Animated.Image
          style={{
            transform: [
              {
                scale: imageScale
              }
            ],
            opacity: 0.77,
            position: "absolute",
            width: "100%",
            height: "100%"
          }}
          source={{
            cache: 'force-cache',
            url: this.getImage()
          }}/>
        <Theme.LinearGradient
          color={club.color}
          style={{
            zIndex: 100,
            height: "100%"
          }}
          start={{
            x: 0,
            y: 0
          }}
          end={{
            x: 0,
            y: 0.9
          }}>
          <View style={{
              position: "absolute",
              bottom: 15,
              right: 15
            }}>
            <Button
              onPress={() => this.onClickBell()}
              padding={9}
              iconSize={20}
              color={this.text_color == "white"
                ? "#ffffff"
                : "#000000"}
              icon={user.hasEventSubscribed(this.getClubID(), this.getID())
                ? faBell
                : faBellSlash}/>
          </View>
          <Animated.View
            style={{
              position: "absolute",
              bottom: 15,
              marginLeft: textMarginLeft,
              width: s_width * 0.68,
              opacity: textOpacity
            }}>
            <Text
              style={{
                opacity: .8,
                textTransform: 'uppercase',
                fontFamily: "Poppins-SemiBold",
                fontSize: 15,
                color: this.text_color
              }}>{this.getDate()}</Text>
            <View
              style={{
                opacity: .8,
                marginTop: 5,
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                flexDirection: 'row'
              }}>
              <FontAwesomeIcon color={this.text_color} size={15} icon={faMapMarkerAlt}/>
              <Text
                style={{
                  marginLeft: 7,
                  fontSize: 15,
                  fontFamily: "Poppins-SemiBold",
                  color: this.text_color
                }}>{this.getLocation()}</Text>
            </View>
            <Animated.Text
              style={{
                fontSize: 26,
                marginTop: 5,
                fontFamily: "Poppins-Bold",
                color: this.text_color,
                opacity: 0.9
              }}>{event.title}</Animated.Text>
          </Animated.View>
        </Theme.LinearGradient>
      </View>;
    }
    return null;
  }
  */

  getRenderForFlatList() {
    const event = this.data;
    const club = this.club;
    const s_width = Dimensions.get("window").width;
    var s = require("./../app/style.js");
    if (event) {
      return <View
        style={{
          marginTop: 10,
          marginBottom: 25,
          shadowColor: "black",
          shadowOffset: {
            width: 0,
            height: 0
          },
          shadowOpacity: 0.1,
          shadowRadius: 10.0,
          marginLeft: 20,
          padding: 15,
          paddingTop: 10,
          paddingBottom: 10,
          borderRadius: 20,
          marginRight: 5,
          width: s_width * 0.66,
          backgroundColor: club.color
        }}>
        <Theme.TouchableOpacity style={{
            flex: 1
          }}>
          <View style={{
              marginLeft: 5,
              marginTop: 10,
              marginBottom: 10
            }}>
            <View
              style={{
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                flexDirection: 'row',
                marginTop: 5,
                opacity: .7
              }}>
              <Theme.Icon color={"primary"} size={17} icon={faClock}/>
              <Theme.Text
                color={"primary"}
                style={{
                  marginLeft: 6,
                  textTransform: 'uppercase',
                  fontFamily: "Poppins-SemiBold",
                  fontSize: 15
                }}>{this.getDate()}</Theme.Text>
            </View>
            <Theme.Text
              numberOfLines={2}
              style={{
                marginTop: 20,
                opacity: .85,
                fontSize: 25,
                fontFamily: "Poppins-Bold",
                color: "#FF2C55"
              }}>{event.title}</Theme.Text>
            <View
              style={{
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                flexDirection: 'row',
                marginTop: 20,
                opacity: .7
              }}>
              <Theme.Icon size={17} icon={faMapMarkerAlt}/>
              <Theme.Text
                style={{
                  marginLeft: 15,
                  marginTop: -1,
                  fontSize: 17,
                  fontFamily: "Poppins-Medium"
                }}>{event.location}</Theme.Text>
            </View>
            <View
              style={{
                marginTop: 25,
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                flexDirection: 'row'
              }}>
              <Button label={"Teilnehmen"} color={club.color} padding={9} icon={faPlus}/>
            </View>
          </View>
        </Theme.TouchableOpacity>
      </View>;
    }
    return null;
  }

  getRender(type = "new_message") {
    const event = this.data;
    const club = this.club;
    const s_width = Dimensions.get("window").width;
    var s = require("./../app/style.js");

    if (event) {
      var backgroundColor = '#121212';
      if (type == 'new_message') 
        backgroundColor = '#1e1e1e';
      else if (type == 'preview') 
        backgroundColor = '';
      
      var fontColor = '#BBB0B5';
      if (type == 'preview') 
        fontColor = "white";
      
      return <View style={{
          opacity: .9,
          marginBottom: 30
        }}>
        {
          this.isOwnEvent()
            ? <Modal ref={m => {
                  this.modal = m;
                }} headline={this.getTitle()} onDone={() => this._editInviteCode()}>
                <ScrollView
                  style={{
                    marginLeft: -20,
                    marginBottom: 40,
                    backgroundColor: '#1e1e1e'
                  }}>

                  <InputBox marginTop={20} value={this.getTitle()} onChange={v => this.setTitle(v, true)}/>
                  <InputBox marginTop={20} value={this.getDate()} onChange={v => this.setDate(v, true)}/>
                  <InputBox marginTop={20} value={this.getLocation()} onChange={v => this.setLocation(v, true)}/>
                </ScrollView>
              </Modal>
            : void 0
        }

        <Theme.View style={{
            opacity: 0.75,
            padding: 25,
            borderRadius: 15
          }}>
          {
            type != 'preview'
              ? <View style={{
                    marginBottom: 25,
                    flexWrap: 'wrap',
                    flexDirection: 'row'
                  }}>
                  <Theme.Icon size={28} color={fontColor} icon={faQuoteRight}/>
                  <Theme.Text
                    style={{
                      marginLeft: 20,
                      marginTop: 4,
                      fontSize: 20,
                      textTransform: 'uppercase',
                      fontFamily: 'Poppins-ExtraBold',
                      color: fontColor
                    }}>
                    {this.getTitle()}
                  </Theme.Text>
                </View>
              : void 0
          }
          <View style={{
              marginBottom: 0,
              flexWrap: 'wrap',
              flexDirection: 'row'
            }}>
            <Theme.Icon size={28} color={fontColor} icon={faCalendar}/>
            <Theme.Text
              style={{
                marginLeft: 20,
                marginTop: 4,
                fontSize: 20,
                textTransform: 'uppercase',
                fontFamily: 'Poppins-ExtraBold',
                color: fontColor
              }}>
              {this.getDate()}
            </Theme.Text>
          </View>
          {
            !this.isFullDay()
              ? <View style={{
                    marginTop: 25,
                    flexWrap: 'wrap',
                    flexDirection: 'row'
                  }}>
                  <Theme.Icon size={28} color={fontColor} icon={faClock}/>
                  <Theme.Text
                    style={{
                      marginLeft: 20,
                      marginTop: 4,
                      fontSize: 20,
                      textTransform: 'uppercase',
                      fontFamily: 'Poppins-ExtraBold',
                      color: fontColor
                    }}>
                    {this.getDuration()}
                  </Theme.Text>
                </View>
              : void 0
          }

          <View style={{
              marginTop: 25,
              flexWrap: 'wrap',
              flexDirection: 'row'
            }}>
            <Theme.Icon size={28} color={fontColor} icon={faMapMarkerAlt}/>
            <Theme.Text
              style={{
                marginLeft: 20,
                marginTop: 4,
                fontSize: 20,
                textTransform: 'uppercase',
                fontFamily: 'Poppins-ExtraBold',
                color: fontColor
              }}>
              {this.getLocation()}
            </Theme.Text>
          </View>

          {
            type == 'message'
              ? <TouchableOpacity
                  style={{
                    backgroundColor: '#1e1e1e',
                    borderRadius: 25,
                    marginTop: 30,
                    marginLeft: 20,
                    marginRight: 20,
                    padding: 12,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onPress={() => this.saveToCalendar()}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-SemiBold',
                      fontSize: 17,
                      color: '#D8CDCD'
                    }}>
                    In Kalender speichern
                  </Text>
                </TouchableOpacity>
              : void 0
          }

        </Theme.View>
        {
          this.isOwnEvent()
            ? <View
                style={{
                  marginTop: -15,
                  marginLeft: 245,
                  width: 500,
                  justifyContent: 'flex-start',
                  flexWrap: 'wrap',
                  flexDirection: 'row'
                }}>
                <TouchableOpacity
                  onPress={() => this.openEditModal()}
                  style={{
                    borderRadius: 30,
                    width: 30,
                    height: 30,
                    zIndex: 0,
                    backgroundColor: '#0DF5E3',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                  <FontAwesomeIcon size={17} color="#1e1e1e" icon={faPen}/>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.delete()}
                  style={{
                    borderRadius: 30,
                    width: 30,
                    height: 30,
                    zIndex: 0,
                    marginLeft: 10,
                    backgroundColor: '#0DF5E3',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                  <FontAwesomeIcon size={17} color="#1e1e1e" icon={faTrash}/>
                </TouchableOpacity>
              </View>
            : void 0
        }
      </View>
    } else 
      alert("ERROR: event is null")
    return null;
  }
}
