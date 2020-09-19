import React from "react";
import {
  TextInput,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions
} from "react-native";

export default class InputBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      secure: this.props.secure === true,
      value: this.props.value
    };

    //set default values
    this.props.marginTop = this.props.marginTop ? this.props.marginTop : 0;
    this.props.marginBottom = this.props.marginBottom
      ? this.props.marginBottom
      : 20;
  }

  _onChange(value) {
    if (this.props.onChange) this.props.onChange(value);
    this.state.value = value;
    this.forceUpdate();
  }

  render() {
    return (
      <View
        style={{
          marginBottom: this.props.marginBottom,
          marginTop: this.props.marginTop
        }}
      >
        <Text
          style={{
            fontFamily: "Poppins-SemiBold",
            marginLeft: 10,
            color: "#5C5768"
          }}
        >
          {this.props.label}
        </Text>
        <View
          style={{
            borderRadius: 10,
            backgroundColor: this.props.color == "dark" ? "#201A30" : "#38304C"
          }}
        >
          <TextInput
            multiline
            secureTextEntry={true}
            style={{
              maxHeight: 70,
              fontFamily: "Poppins-Medium",
              marginTop: 8,
              padding: 15,
              fontSize: 17,
              color: "#D5D3D9"
            }}
            value={this.state.value}
            onChangeText={v => this._onChange(v)}
          />
        </View>
      </View>
    );
  }
}
