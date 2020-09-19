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

export default class GerdModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      done_text: this.props.done_text ? this.props.done_text : "Fertig"
    };
  }

  isOpen() {
    return this.state.visible;
  }

  open() {
    if (this.state.visible) {
      this.state.visible = false;
      this.forceUpdate();
      setTimeout(
        function() {
          this.state.visible = true;
          this.forceUpdate();
        }.bind(this),
        0
      );
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
    this.props.onDone();
  }

  render() {
    return (
      <Modal
        animationType="slide"
        presentationStyle="formSheet"
        visible={this.state.visible}
        onDismiss={() => console.log("onDismiss")}
        onRequestClose={() => console.log("onRequestClose")}
      >
        <View
          style={{
            padding: 20,
            backgroundColor: "#201A30",
            height: "100%"
          }}
        >
          <View
            style={{
              marginBottom: 10,
              justifyContent: "space-between",
              flexWrap: "wrap",
              flexDirection: "row"
            }}
          >
            <Text
              style={{
                height: 30,
                fontFamily: "Poppins-Bold",
                color: "white",
                fontSize: 25,
                width: "76%"
              }}
              numberOfLines={1}
            >
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
              onPress={() => this._onDone()}
            >
              <Text
                style={{
                  textTransform: "uppercase",
                  fontSize: 18,
                  fontFamily: "Poppins-Bold",
                  color: "#38304C"
                }}
              >
                {this.state.done_text}
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              marginLeft: -20,
              height: 0.5,
              marginBottom: 40,
              backgroundColor: "#38304C",
              width: "140%"
            }}
          />
          {this.props.children}
        </View>
      </Modal>
    );
  }
}
