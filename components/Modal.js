import React from "react";
import {
  Alert,
  TextInput,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  Modal
} from "react-native";
import GestureRecognizer, {swipeDirections} from "react-native-swipe-gestures";
import {Theme} from './../app/index.js';
import Button from "./../components/Button.js";

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
    return (
      <Modal
        hideModalContentWhileAnimating={true}
        useNativeDriver={true}
        isVisible={() => alert("is visible")}
        animationType="slide"
        presentationStyle="formSheet"
        visible={this.state.visible}
        onSwipe={() => console.log("onSwipe")}
        onShow={() => console.log("onShow")}
        onDismiss={() => console.log("onDismiss")}
        onRequestClose={() => console.log("onRequestClose")}
        onOrientationChange={() => console.log("onOrientationChange")}>
        <Theme.BackgroundView style={{
            padding: 20,
            height: "100%"
          }}>
          <View style={{
              justifyContent: "space-between",
              flexWrap: "wrap",
              flexDirection: "row"
            }}>
            <Theme.Text
              style={{
                height: 30,
                fontFamily: "Poppins-Bold",
                color: "white",
                fontSize: 25,
                width: "76%"
              }}
              numberOfLines={1}>
              {this.props.headline}
            </Theme.Text>
            <Button size={"small"} color={"primary"} label={this.state.done_text} onPress={() => this._onDone()}/>
          </View>
          <Theme.SelectedView
            style={{
              marginLeft: -20,
              height: 0.5,
              marginTop: 10,
              marginBottom: 0,
              width: "140%"
            }}/>
          <View>{this.props.children}</View>
        </Theme.BackgroundView>
      </Modal>
    );
  }
}
