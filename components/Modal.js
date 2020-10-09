import React from "react";
import {
  Alert,
  TextInput,
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  Modal
} from "react-native";
import GestureRecognizer, {swipeDirections} from "react-native-swipe-gestures";

export default class GerdModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      done_text: this.props.done_text
        ? this.props.done_text
        : "Fertig"
    };
  }

  isOpen() {
    return this.state.visible;
  }

  open() {
    if (this.state.visible) {
      this.state.visible = false;
      this.forceUpdate();
      setTimeout(function() {
        this.state.visible = true;
        this.forceUpdate();
      }.bind(this), 0);
    } else {
      this.state.visible = true;
      this.forceUpdate();
    }
  }

  close() {
    this.state.visible = false;
    this.forceUpdate();
  }

  _onDone() {
    this.close();
    if (this.props.onDone) 
      this.props.onDone();
    }
  
  render() {
    console.log(this.props.children)
    return (
      <Modal
        hideModalContentWhileAnimating={true}
        useNativeDriver={true}
        isVisible={() => alert("is visible")}
        animationType="slide"
        presentationStyle="formSheet"
        visible={this.state.visible}
        onShow={() => console.log("onShow")}
        onDismiss={() => console.log("onDismiss")}
        onRequestClose={() => console.log("onRequestClose")}
        onOrientationChange={() => console.log("onOrientationChange")}>
        <View style={{
            padding: 20,
            backgroundColor: "#121212",
            height: "100%"
          }}>
          <View
            style={{
              marginBottom: 10,
              justifyContent: "space-between",
              flexWrap: "wrap",
              flexDirection: "row"
            }}>
            <Text
              style={{
                height: 30,
                fontFamily: "Poppins-Bold",
                color: "white",
                fontSize: 25,
                width: "76%"
              }}
              numberOfLines={1}>
              {this.props.headline}
            </Text>
            <TouchableOpacity
              style={{
                height: 30,
                borderRadius: 10,
                marginLeft: 10,
                width: 70,
                padding: 5,
                paddingLeft: 10,
                backgroundColor: "#0DF5E3"
              }}
              onPress={() => this._onDone()}>
              <Text
                style={{
                  textTransform: "uppercase",
                  fontSize: 18,
                  fontFamily: "Poppins-Bold",
                  color: "#1e1e1e"
                }}>
                {this.state.done_text}
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              marginLeft: -20,
              height: 0.5,
              marginBottom: 40,
              backgroundColor: "#1e1e1e",
              width: "140%"
            }}/>
          <View>{this.props.children}</View>
        </View>
      </Modal>
    );
  }
}
