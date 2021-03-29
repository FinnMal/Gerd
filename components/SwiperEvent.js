import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActionSheetIOS,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Platform
} from 'react-native';
import AutoHeightImage from 'react-native-auto-height-image';
import FileViewer from 'react-native-file-viewer';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
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
} from '@fortawesome/free-solid-svg-icons';
import {withNavigation} from 'react-navigation';
import {useNavigation} from '@react-navigation/native';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import CameraRoll from '@react-native-community/cameraroll';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {ModalCard} from './../app/components.js';

export default class SwiperEvent extends React.Component {
  event = null;
  imageScale = new Animated.Value(1);
  textOpacity = new Animated.Value(0);
  textMarginLeft = new Animated.Value(15);
  buttonMarginBottom = new Animated.Value(-30);
  animationDuration = 30000;

  constructor(props) {
    super(props);
    this.event = props.event;
  }

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

  render() {
    const event = this.event;
    const club = this.event.getClub();
    const user = this.event.getUser();
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
          color={club.getColor()}
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
              icon={user.hasEventSubscribed(club.getID(), event.getID())
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
              }}>{event.getDate()}</Text>
            <View
              style={{
                opacity: .8,
                marginTop: 5,
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                flexDirection: 'row'
              }}>
              <FontAwesomeIcon color={event.} size={15} icon={faMapMarkerAlt}/>
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
}
