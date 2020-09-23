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

export default class Toast extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pressed: false
    };

    this.type = this.props.type ? this.props.type : "timeout";
    this.visible = false;
    this.marginTop = new Animated.Value(725);
    this.reamingBarWidth = new Animated.Value(100);
  }

  show() {
    if (this.type == "timeout") {
      this.reamingBarWidth.setValue(100);
      Animated.timing(this.reamingBarWidth, {
        useNativeDriver: false,
        toValue: 0,
        duration: 5000,
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
    }).start(() => {});
  }

  hide() {
    this.reamingBarWidth.setValue(0);

    this.marginTop.setValue(725);
    Animated.timing(this.marginTop, {
      useNativeDriver: false,
      toValue: 850,
      duration: 250,
      easing: Easing.ease
    }).start(() => {
      setTimeout(
        function() {
          if (this.state.pressed) {
            this.state.pressed = false;
            this._onAction();
          }
          this._onHide();
        }.bind(this),
        200
      );
    });
  }

  _btnClick() {
    this.state.pressed = true;
    this.hide();
  }

  _onHide() {
    if (this.props.onHide) this.props.onHide();
  }

  _onAction() {
    if (this.props.onAction) this.props.onAction();
  }

  _callback(action) {
    if (this.props.callback) this.props.callback(action);
  }

  render() {
    if (this.type == "progress")
      this.reamingBarWidth.setValue(this.props.progress);

    if (this.props.visible) {
      if (!this.visible) {
        this.visible = true;
        this.show();
      }
      const barWidth = this.reamingBarWidth.interpolate({
        inputRange: [0, 100],
        outputRange: ["0%", "100%"]
      });

      const marginTop = this.marginTop.interpolate({
        inputRange: [0, 2000],
        outputRange: [0, 2000]
      });

      return (
        <Animated.View
          style={{
            borderRadius: 15,
            zIndex: 100,
            position: "absolute",
            marginTop: marginTop,
            marginLeft: 10,
            height: 65,
            width: 355,
            backgroundColor: "#8471B2",

            shadowColor: "#8471B2",
            shadowOffset: {
              width: 0,
              height: 0
            },
            shadowOpacity: 0.5,
            shadowRadius: 14.0
          }}
        >
          <View
            style={{
              height: 65,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <View
              style={{
                flexWrap: "wrap",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <FontAwesomeIcon
                style={{
                  opacity: 0.9
                }}
                size={25}
                color="white"
                icon={this.props.icon ? this.props.icon : faInfoCircle}
              />
              <Text
                style={{
                  marginTop: 5,
                  marginLeft: 20,
                  fontSize: 20,
                  fontFamily: "Poppins-SemiBold",
                  color: "white",
                  opacity: 0.9
                }}
              >
                {this.props.text}
              </Text>
              <TouchableOpacity
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
                onPress={() => this._btnClick()}
              >
                <Text
                  style={{
                    textTransform: "uppercase",
                    fontSize: 17,
                    fontFamily: "Poppins-ExtraBold",
                    color: "white",
                    opacity: 0.77
                  }}
                >
                  {this.props.action}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              width: 334,
              position: "absolute",
              marginLeft: 10,
              marginTop: 60
            }}
          >
            <Animated.View
              style={{
                height: 5,
                borderRadius: 2.5,
                backgroundColor: "white",
                opacity: 0.7,
                width: barWidth
              }}
            />
          </View>
        </Animated.View>
      );
    } else {
      this.visible = false;
      console.log("TOAST: not visible");
    }
    return null;
  }
}
