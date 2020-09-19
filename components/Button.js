import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions
} from "react-native";

export default class InputBox extends React.Component {
  constructor(props) {
    super(props);

    sizes = {
      small: [5, 12, 18],
      normal: [7, 20, 18],
      big: [11, 25, 18]
    };

    this.state = {
      size: sizes["normal"]
    };

    //set default values
    this.props.label = this.props.label ? this.props.label : "Button";
    this.props.margin = this.props.margin ? this.props.margin : 0;
    this.props.marginTop = this.props.marginTop ? this.props.marginTop : 0;
    this.props.marginBottom = this.props.marginBottom
      ? this.props.marginBottom
      : 20;
    this.props.marginLeft = this.props.marginLeft ? this.props.marginLeft : 0;
    this.props.marginRight = this.props.marginRight
      ? this.props.marginRight
      : 20;

    this.state.sizes = this.props.size
      ? sizes[this.props.size]
      : sizes["normal"];
    console.log(sizes);
  }

  _onPress(value) {
    if (this.props.onPress) this.props.onPress();
  }

  render() {
    return (
      <View
        style={{
          flexWrap: "wrap",
          alignItems: "flex-start",
          flexDirection: "row",
          justifyContent: "flex-start"
        }}
      >
        <TouchableOpacity
          style={{
            paddingTop: this.state.sizes[0],
            paddingBottom: this.state.sizes[0],
            paddingLeft: this.state.sizes[1],
            paddingRight: this.state.sizes[1],
            borderRadius: 10,
            margin: this.props.margin,
            marginTop: this.props.marginTop,
            marginBottom: this.props.marginBottom,
            marginLeft: this.props.marginLeft,
            marginRight: this.props.marginRight,
            backgroundColor: "#0DF5E3",
            justifyContent: "center",
            alignItems: "center"
          }}
          onPress={text => this._onPress()}
        >
          <Text
            style={{
              fontSize: this.state.sizes[2],
              fontFamily: "Poppins-Bold",
              color: "#38304C"
            }}
          >
            {this.props.label}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}
