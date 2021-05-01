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
import {Theme} from './../app/index.js';

// BUTTON class: modifyed react native button component
export default class Button extends React.Component {
  constructor(props) {
    super(props);

    const s_width = Dimensions.get("window").width;
    // default margins and text sizes
    sizes = {
      small: [
        5, 12, 17
      ],
      normal: [
        7, 20, 18
      ],
      big: [
        11, 25, 18
      ],
      extra_big: [
        15, 40, 23
      ],
      wide: [
        10, s_width * 0.35,
        18
      ]
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
  }

  _onPress(value) {
    if (this.props.onPress) {
      ReactNativeHapticFeedback.trigger("impactMedium");
      this.props.onPress();
    }
  }

  render() {
    var color = this.props.color;
    if (color == undefined) 
      color = "primary";
    
    return (
      <Animated.View
        style={[
          this.props.style, {
            flexWrap: "wrap",
            alignItems: "flex-start",
            flexDirection: "row",
            justifyContent: "flex-start"
          }
        ]}>
        <Theme.TouchableOpacity
          style={{
            opacity: this.props.opacity
              ? this.props.opacity
              : 1,
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
            alignItems: "center"
          }}
          onPress={text => this._onPress()}>
          <Theme.View
            colorOpacity={this.props.label
              ? 1
              : .2}
            color={color}
            style={{
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              flexDirection: 'row',
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
                : 60
            }}>
            {
              this.props.iconPos == "right" && this.props.label
                ? <Theme.Text
                    backgroundColor={color}
                    color={this.props.labelColor}
                    style={{
                      marginRight: this.props.icon
                        ? 15
                        : 0,
                      fontSize: this.state.sizes[2],
                      fontFamily: "Poppins-Bold"
                    }}>
                    {this.props.label}
                  </Theme.Text>
                : void 0
            }
            {
              this.props.icon && !this.props.label
                ? <FontAwesomeIcon
                    size={this.state.iconSize > -1
                      ? this.state.iconSize
                      : this.state.sizes[2]}
                    color={color}
                    icon={this.props.icon}/>
                : void 0
            }
            {
              this.props.icon && this.props.label
                ? <Theme.IconOnColor
                    backgroundColor={color}
                    size={this.state.iconSize > -1
                      ? this.state.iconSize
                      : this.state.sizes[2]}
                    style={{
                      marginTop: this.props.iconPos == "right"
                        ? 2
                        : 0
                    }}
                    icon={this.props.icon}/>
                : void 0
            }
            {
              this.props.iconPos != "right" && this.props.label
                ? <Theme.Text
                    backgroundColor={color}
                    color={this.props.labelColor}
                    style={{
                      color: 'blue',
                      marginRight: this.props.icon
                        ? 15
                        : 0,
                      fontSize: this.state.sizes[2],
                      fontFamily: "Poppins-Bold"
                    }}>
                    {this.props.label}
                  </Theme.Text>
                : void 0
            }

          </Theme.View>

        </Theme.TouchableOpacity>
      </Animated.View>
    );
  }
}
