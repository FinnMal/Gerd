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
import {Theme} from './../app/index.js';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';

export default class InputBox extends React.Component {
  has_focus = false;
  constructor(props) {
    super(props);

    this.state = {
      secure: this.props.secure === true,
      value: this.props.value
    };

    //set default values
    this.props.marginTop = this.props.marginTop
      ? this.props.marginTop
      : 0;
    this.props.marginBottom = this.props.marginBottom
      ? this.props.marginBottom
      : 20;
  }

  _onChange(value) {
    if (this.props.onChange) 
      this.props.onChange(value);
    this.state.value = value;
    this.forceUpdate();
  }

  _onDone() {
    if (this.props.onDone) 
      this.props.onDone(this.state.value);
    }
  
  render() {
    return (
      <View style={{
          marginBottom: this.props.marginBottom,
          marginTop: this.props.marginTop
        }}>
        <Text style={{
            fontFamily: "Poppins-SemiBold",
            marginLeft: 10,
            color: "#5C5768"
          }}>
          {this.props.label}
        </Text>
        <View
          style={{
            borderRadius: 10,
            backgroundColor: this.props.color == "dark"
              ? "#121212"
              : "#1e1e1e"
          }}>
          <Theme.TextInput
            onFocus={() => {
              this.has_focus = true;
              this.forceUpdate()
            }}
            onBlur={() => {
              this.has_focus = false;
              this.forceUpdate()
            }}
            keyboardType={this.props.keyboardType
              ? this.props.keyboardType
              : "default"
}
            returnKeyType={this.props.returnKeyType
              ? this.props.returnKeyType
              : ""
}
            placeholderTextColor="#665F75"
            placeholder={this.props.placeholder}
            textContentType={this.props.type
              ? this.props.type
              : "none"}
            secureTextEntry={this.state.secure}
            style={{
              maxHeight: 70,
              fontFamily: "Poppins-Medium",
              padding: 15,
              fontSize: 17
            }}
            value={this.state.value}
            onChangeText={v => this._onChange(v)}></Theme.TextInput>
          {
            this.props.icon
              ? <TouchableOpacity
                  onPress={() => this._onDone()}
                  style={{
                    position: 'absolute',
                    marginTop: 12,
                    marginLeft: 290
                  }}>
                  <Theme.Icon
                    size={23}
                    style={{
                      opacity: this.has_focus
                        ? 1
                        : .8
                    }}
                    icon={this.props.icon}/>
                </TouchableOpacity>
              : void 0
          }
        </View>
      </View>
    );
  }
}
