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
        : "Fertig",
      contentHeight: Dimensions.get("window").height
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
  
  _onRequestClose() {
    this.close();
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  getScrollViewEnabled() {
    const s_height = Dimensions.get("window").height;
    return this.state.contentHeight > s_height * 0.82
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
        onRequestClose={() => this._onRequestClose()}
        onOrientationChange={() => console.log("onOrientationChange")}>
        <Theme.View color={'background_view'}>
          <View
            style={{
              padding: 20,
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
          <Theme.SelectedView style={{
              height: 0.5,
              marginTop: -5
            }}/>
          <ScrollView scrollEnabled={this.getScrollViewEnabled()} style={{
              height: "92%",
              paddingLeft: 15
            }}>
            <View onLayout={(event) => {
                const {height} = event.nativeEvent.layout;
                this.setState({contentHeight: height})
              }}>{this.props.children}</View>
          </ScrollView>
        </Theme.View>
      </Modal>
    );
  }
}
