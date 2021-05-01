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
  Animated,
  Easing
} from "react-native";
import AutoHeightImage from "react-native-auto-height-image";
import FileViewer from "react-native-file-viewer";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import {withNavigation} from "react-navigation";
import {useNavigation} from "@react-navigation/native";
import RNFetchBlob from "rn-fetch-blob";
import Share from "react-native-share";
import RNFS from "react-native-fs";
import CameraRoll from "@react-native-community/cameraroll";
import {AnimatedCircularProgress} from "react-native-circular-progress";
import {Theme} from './../app/index.js';
import ReactNativeHapticFeedback from "react-native-haptic-feedback"

/* TOAST class: component to make changes visible at the bottom of the screen
the change can be undone by pressing the button on the toast
*/

export default class Toast extends React.Component {
  visible = false;
  constructor(props) {
    super(props);

    this.state = {
      pressed: false,
      text: this.props.text,
      btn_visible: true,
      btn_text: '',
      icon: this.props.icon
    };

    this.type = this.props.type
      ? this.props.type
      : "timeout";
    this.visible = false;
    this.marginTop = new Animated.Value(725);
    this.reamingBarWidth = new Animated.Value(100);

    if (this.props.ref) 
      this.props.ref(this);
    
    this.hide(false);
  }

  show() {
    ReactNativeHapticFeedback.trigger("notificationWarning");
    if (this.type == "timeout") {
      this.reamingBarWidth.setValue(100);
      Animated.timing(this.reamingBarWidth, {
        useNativeDriver: false,
        toValue: 0,
        duration: 4000,
        easing: Easing.linear
      }).start(() => {
        this.hide();
      });
    }

    this.marginTop.setValue(850);
    Animated.timing(this.marginTop, {
      useNativeDriver: false,
      toValue: 725,
      duration: 350,
      easing: Easing.ease
    }).start(() => {
      this.visible = true;
    });
  }

  hide(animated = true) {
    if (animated) 
      ReactNativeHapticFeedback.trigger("notificationSuccess");
    this.reamingBarWidth.setValue(0);

    this.marginTop.setValue(725);
    Animated.timing(this.marginTop, {
      useNativeDriver: false,
      toValue: 850,
      duration: animated
        ? 250
        : 0,
      easing: Easing.ease
    }).start(() => {
      this.visible = false;
      setTimeout(function() {
        if (this.state.pressed) {
          this.state.pressed = false;
          this._onAction();
        }
        this._onHide();
      }.bind(this), 200);
    });
  }

  _btnClick() {
    this.state.pressed = true;
    this.hide();
  }

  _onHide() {
    if (this.props.onHide) 
      this.props.onHide();
    }
  
  _onAction() {
    ReactNativeHapticFeedback.trigger("impactHeavy");
    if (this.buttonCallback) 
      this.buttonCallback();
    }
  
  _callback(action) {
    if (this.props.callback) 
      this.props.callback(action);
    }
  
  isVisible() {
    return this.visible;
  }

  setText(text) {
    this.state.text = text;
    this.forceUpdate();
  }

  setButtonVisible(visible) {
    this.state.btn_visible = visible;
    this.forceUpdate();
  }

  setButtonText(text) {
    this.state.btn_text = text;
    this.forceUpdate();
  }

  setIcon(icon) {
    this.state.icon = icon;
    this.forceUpdate();
  }

  setButtonCallback(cb) {
    this.buttonCallback = cb;
  }

  render() {
    if (this.type == "progress") 
      this.reamingBarWidth.setValue(this.props.progress);
    
    const barWidth = this.reamingBarWidth.interpolate({
      inputRange: [
        0, 100
      ],
      outputRange: ["0%", "100%"]
    });

    const marginTop = this.marginTop.interpolate({
      inputRange: [
        0, 2000
      ],
      outputRange: [0, 2000]
    });

    return (
      <Theme.View
        style={{
          borderRadius: 15,
          zIndex: 100,
          position: "absolute",
          marginTop: marginTop,
          marginLeft: 10,
          height: 65,
          width: 355,

          shadowColor: "black",
          shadowOffset: {
            width: 0,
            height: 0
          },
          shadowOpacity: 0.5,
          shadowRadius: 14.0
        }}>
        <View style={{
            height: 65,
            justifyContent: "center",
            alignItems: "center"
          }}>
          <View
            style={{
              flexWrap: "wrap",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center"
            }}>
            <Theme.Icon
              style={{
                opacity: 0.9
              }}
              size={23}
              color="white"
              icon={this.state.icon
                ? this.state.icon
                : faInfoCircle}/>
            <Theme.Text
              style={{
                marginTop: 5,
                marginLeft: 20,
                fontSize: 20,
                fontFamily: "Poppins-Bold",
                opacity: 0.8
              }}>
              {this.state.text}
            </Theme.Text>
            {
              this.state.btn_visible
                ? <TouchableOpacity
                    style={{
                      borderRadius: 7,
                      backgroundColor: "#1e1e1e",
                      paddingTop: 7,
                      paddingBottom: 7,
                      paddingLeft: 9,
                      paddingRight: 9,
                      marginTop: -2,
                      marginLeft: 20,
                      fontSize: 20
                    }}
                    onPress={() => this._btnClick()}>
                    <Theme.Text
                      style={{
                        textTransform: "uppercase",
                        fontSize: 17,
                        fontFamily: "Poppins-ExtraBold",
                        color: "white",
                        opacity: 0.77
                      }}>
                      {this.state.btn_text}
                    </Theme.Text>
                  </TouchableOpacity>
                : void 0
            }
          </View>
        </View>
        <View style={{
            width: 334,
            position: "absolute",
            marginLeft: 10,
            marginTop: 61
          }}>
          <Theme.LightView style={{
              height: 4,
              borderRadius: 4,
              width: barWidth
            }}/>
        </View>
      </Theme.View>
    );
    return null;
  }
}
