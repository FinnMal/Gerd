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
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import ReactNativeHapticFeedback from "react-native-haptic-feedback"

export default class Button extends React.Component {
  constructor(props) {
    super(props);

    sizes = {
      small: [
        5, 12, 17
      ],
      normal: [
        7, 20, 18
      ],
      big: [11, 25, 18]
    };

    this.state = {
      size: sizes["normal"]
    };

    //set default values
    this.props.label = this.props.label
      ? this.props.label
      : "Button";
    this.props.margin = this.props.margin
      ? this.props.margin
      : 0;
    this.props.marginTop = this.props.marginTop
      ? this.props.marginTop
      : 0;
    this.props.marginBottom = this.props.marginBottom
      ? this.props.marginBottom
      : 20;
    this.props.marginLeft = this.props.marginLeft
      ? this.props.marginLeft
      : 0;
    this.props.marginRight = this.props.marginRight
      ? this.props.marginRight
      : 20;

    this.state.iconSize = this.props.iconSize
      ? this.props.iconSize
      : -1;

    this.state.sizes = this.props.size && this.props.size != "large"
      ? sizes[this.props.size]
      : sizes["normal"];

    if (this.props.padding) {
      this.state.sizes[0] = this.props.padding
      this.state.sizes[1] = this.props.padding
    }

    this.state.text_color = "#1e1e1e"
    console.log(sizes);
  }

  isValidHex(hex) {
    return /^#([A-Fa-f0-9]{3,4}){1,2}$/.test(hex)
  }

  getChunksFromString(st, chunkSize) {
    return st.match(new RegExp(`.{${chunkSize}}`, "g"))
  }

  convertHexUnitTo256(hexStr) {
    return parseInt(hexStr.repeat(2 / hexStr.length), 16)
  }

  getAlphafloat(a, alpha) {
    if (typeof a !== "undefined") {
      return a / 255
    }
    if ((typeof alpha != "number") || alpha < 0 || alpha > 1) {
      return 1
    }
    return alpha
  }

  hexToRGBA(hex, alpha) {
    if (!this.isValidHex(hex)) {
      throw new Error("Invalid HEX")
    }
    const chunkSize = Math.floor((hex.length - 1) / 3)
    const hexArr = this.getChunksFromString(hex.slice(1), chunkSize)
    const [r, g, b, a] = hexArr.map(this.convertHexUnitTo256)
    return `rgba(${r}, ${g}, ${b}, ${this.getAlphafloat(a, alpha)})`
  }

  _onPress(value) {
    ReactNativeHapticFeedback.trigger("impactMedium");
    if (this.props.onPress) 
      this.props.onPress();
    }
  
  render() {
    this.state.background_color = this.props.color
      ? this.props.color
      : "#ffffff"
    if (this.props.color == "danger") {
      this.state.text_color = "white"
      this.state.background_color = "red"
    }

    return (
      <View
        style={[
          this.props.style, {
            flexWrap: "wrap",
            alignItems: "flex-start",
            flexDirection: "row",
            justifyContent: "flex-start"
          }
        ]}>
        <TouchableOpacity
          style={{
            paddingTop: this.state.sizes[0],
            paddingBottom: this.state.sizes[0],
            paddingLeft: this.props.label
              ? this.state.sizes[1]
              : this.state.sizes[0],
            paddingRight: this.props.label
              ? this.state.sizes[1]
              : this.state.sizes[0],
            borderRadius: this.props.label
              ? 10
              : 60,
            width: this.props.size == "large"
              ? "100%"
              : null,
            margin: this.props.margin,
            marginTop: this.props.marginTop,
            marginBottom: this.props.marginBottom,
            marginLeft: this.props.size == "large"
              ? 0
              : this.props.marginLeft,
            marginRight: this.props.size == "large"
              ? 0
              : this.props.marginRight,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: this.hexToRGBA(this.state.background_color, 0.2)
          }}
          onPress={text => this._onPress()}>
          <View style={{
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              flexDirection: 'row'
            }}>
            {
              this.props.icon
                ? <FontAwesomeIcon
                    style={{
                      marginRight: this.props.label
                        ? 15
                        : 0
                    }}
                    size={this.state.iconSize > -1
                      ? this.state.iconSize
                      : this.state.sizes[2]}
                    color={this.state.background_color}
                    icon={this.props.icon}/>
                : void 0
            }
            <Text
              style={{
                fontSize: this.state.sizes[2],
                fontFamily: "Poppins-Bold",
                color: this.state.background_color
              }}>
              {this.props.label}
            </Text>
          </View>

        </TouchableOpacity>
      </View>
    );
  }
}
