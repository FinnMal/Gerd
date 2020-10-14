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
    if (this.props.onChangeText) 
      this.props.onChangeText(value)
    this.state.value = value;
    this.forceUpdate();
  }

  _onDone() {
    if (this.props.onDone) 
      this.props.onDone(this.state.value);
    this.state.value = '';
    this.forceUpdate();
  }

  _onBlur() {}

  render() {
    const s_width = Dimensions.get("window").width;
    return (
      <View
        style={[
          {
            height: 52,
            width: this.props.width
              ? this.props.width
              : s_width * 0.8,
            marginBottom: this.props.marginBottom,
            marginTop: this.props.marginTop
          },
          this.props.style
        ]}>
        {
          this.props.label
            ? <Theme.Text style={{
                  opacity: .5,
                  fontFamily: "Poppins-SemiBold",
                  marginLeft: 10
                }}>
                {this.props.label}
              </Theme.Text>
            : void 0
        }

        <View style={{
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            flexDirection: 'row'
          }}>
          <Theme.TextInput
            onFocus={() => {
              this.has_focus = true;
              if (this.props.onFocus) 
                this.props.onFocus();
              this.forceUpdate()
            }}
            onBlur={() => {
              this.has_focus = false;
              if (this.props.onBlur) 
                this.props.onBlur();
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
            onEndEditing={this.props.onEndEditing}
            style={{
              position: "absolute",
              width: this.props.width
                ? this.props.width
                : s_width * 0.8,
              borderRadius: this.props.borderRadius
                ? this.props.borderRadius
                : 10,
              maxHeight: 70,
              fontFamily: "Poppins-Medium",
              padding: 15,
              fontSize: 17
            }}
            value={this.state.value}
            onChangeText={v => this._onChange(v)}></Theme.TextInput>
          {
            this.props.icon && this.props.showButton !== true
              ? <TouchableOpacity
                  onPress={() => this._onDone()}
                  style={{
                    alignSelf: 'flex-end',
                    marginLeft: 'auto',
                    marginBottom: 16,
                    marginRight: 20
                  }}>
                  <Theme.Icon
                    size={20}
                    style={{
                      opacity: this.has_focus
                        ? 1
                        : .8
                    }}
                    icon={this.props.icon}/>
                </TouchableOpacity>
              : void 0
          }
          {
            this.props.icon && this.props.showButton
              ? <Theme.View
                  color={"primary"}
                  style={{
                    alignSelf: 'flex-end',
                    marginLeft: 'auto',
                    borderRadius: 50,
                    marginTop: 4,
                    marginRight: 4,
                    width: 43,
                    height: 43,
                    padding: 5,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                  <TouchableOpacity
                    style={{
                      marginTop: 4,
                      marginLeft: 287,
                      position: 'absolute',
                      borderRadius: 50,
                      width: 43,
                      height: 43,
                      padding: 5,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                    onPress={() => this._onDone()}>
                    <FontAwesomeIcon style={{
                        zIndex: 0
                      }} size={20} color="#F5F5F5" icon={this.props.icon}/>
                  </TouchableOpacity>
                </Theme.View>
              : void 0
          }
        </View>
      </View>
    );
  }
}
