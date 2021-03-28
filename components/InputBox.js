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

    this.props.inputMarginLeft = this.props.inputMarginLeft
      ? this.props.inputMarginLeft
      : 0;

    this.showBigBackgroundColor = this.props.showBigBackgroundColor === true;
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
      <Theme.View
        hasColor={this.showBigBackgroundColor}
        style={[
          {
            width: this.props.width
              ? this.props.width
              : s_width * 0.8,
            marginBottom: this.props.marginBottom,
            marginTop: this.props.marginTop,
            borderRadius: this.props.borderRadius
              ? this.props.borderRadius
              : 10
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

        <View
          style={{
            flexWrap: 'wrap',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <Theme.TextInput
            onRef={this.props.onRef}
            hasBackgroundColor={!this.showBigBackgroundColor}
            multiline={this.props.multiline === true}
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
            numberOfLines={2}
            keyboardType={this.props.keyboardType}
            returnKeyType={this.props.returnKeyType}
            placeholderTextColor="#665F75"
            placeholder={this.props.placeholder}
            textContentType={this.props.type
              ? this.props.type
              : "none"}
            secureTextEntry={this.state.secure}
            onEndEditing={this.props.onEndEditing}
            style={{
              marginLeft: this.props.inputMarginLeft,
              minHeight: 30,
              flex: 1,
              fontFamily: "Poppins-Medium",
              marginRight: this.props.showButton
                ? 0
                : 15,
              fontSize: 17,
              borderRadius: this.props.borderRadius
                ? this.props.borderRadius
                : 10,
              paddingTop: this.props.padding
                ? this.props.padding
                : 11,
              padding: this.props.padding
                ? this.props.padding
                : 11
            }}
            color={'selected_view'}
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
                    marginTop: 5,
                    marginBottom: 5,
                    marginLeft: 'auto',
                    borderRadius: 50,
                    marginRight: 4,
                    width: 43,
                    height: 43,
                    padding: 5,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                  <TouchableOpacity
                    style={{
                      marginLeft: -2,
                      borderRadius: 50,
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
      </Theme.View>
    );
  }
}
