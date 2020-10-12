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
      <View
        style={[
          {
            borderRadius: 10,
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
              width: "88%",
              borderRadius: 10,
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
        </View>
      </View>
    );
  }
}
