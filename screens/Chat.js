import React, {Component} from 'react';
import AutoHeightImage from 'react-native-auto-height-image';
import {
  Alert,
  TextInput,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Image,
  Button,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActionSheetIOS,
  Easing,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Vibration,
  FlatList
} from 'react-native';

import {Headlines} from './../app/constants.js';
import {withNavigation} from 'react-navigation';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import database from '@react-native-firebase/database';
import {faChevronCircleLeft, faChevronLeft, faChevronRight, faPaperPlane} from '@fortawesome/free-solid-svg-icons';
import HeaderScrollView from './../components/HeaderScrollView.js';
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import Chat from './../classes/Chat.js';
import InputBox from './../components/InputBox.js';
import {Theme} from './../app/index.js';

class ChatScreen extends React.Component {
  messageCards = null;

  constructor(props) {
    super(props);
    const utils = this.props.navigation.getParam('utils', null);
    const chat = this.props.navigation.getParam('chat', null);
    const focused = this.props.navigation.getParam('focused', null);

    this.state = {
      chat: chat,
      uid: utils.getUserID(),
      partner_name: chat.getPartnerUser().getName(),
      cur_message: '',
      last_typed: -1,
      typing: false,
      messages: [],
      keyboardVisibe: false,
      focused: focused === true,
      headerScrollView: null
    };

    setInterval(function() {
      var now = Date.now();
      var last = this.state.last_typed;
      if (now - last < 1000) {
        this.state.chat.setTyping(true);
      } else 
        this.state.chat.setTyping(false);
      }
    .bind(this), 3000)

    chat.startMessagesListener(function(mes) {
      mes.setReadyListener(function() {
        this.state.headerScrollView.addItemToFlatList(mes)
      }.bind(this))
      // add message if (this.state.messages.indexOf(mes) == -1) { this.state.messages.push(mes);

      /*
        this.state.messages.sort(
          (a, b) => (a.getSendAt() < b.getSendAt())
            ? 1
            : (
              (b.getSendAt() < a.getSendAt())
                ? -1
                : 0
            )
        );
        this.forceUpdate();
        */
      //}
    }.bind(this), function(mes) {
      //remove message
      this.state.headerScrollView.removeItemFromFlatList(mes)
    }.bind(this));

    chat.startListener('last_message_id', function() {
      chat.loadLastMessage(function(mes) {
        if (this.state.headerScrollView) {
          this.state.headerScrollView.addItemToFlatList(mes, false)
        }
      }.bind(this));
    }.bind(this));

  }

  _getChatInfos() {}

  componentDidMount() {}

  _onChangeText(value) {
    this.state.cur_message = value;
    this.state.last_typed = Date.now();
    this.forceUpdate();
  }

  _keyboardDidShow() {
    this.state.headerScrollView.keyboardDidShow()
  }

  _keyboardDidHide() {
    this.state.headerScrollView.keyboardDidHide()
  }

  render() {
    var s = require('./../app/style.js');
    const chat = this.state.chat;
    const utils = this.props.navigation.getParam('utils', null)

    const s_height = Dimensions.get("window").height;
    const s_width = Dimensions.get("window").width;
    var partner_user_name = null;
    var partner = chat.getPartnerUser();
    if (partner) 
      var partner_user_name = partner.getName();
    
    if (this.state.focused) {
      setTimeout(function() {
        this.textInput.focus();
      }.bind(this), 300)
    }
    return (
      <Theme.BackgroundView style={{
          flex: 1
        }}>
        <HeaderScrollView
          onRef={view => {
            if (view) {
              this.state.headerScrollView = view;
              chat.setTypingListener(function(typing) {
                if (typing) 
                  view.showSubheadline()
                else 
                  view.hideSubheadline()
              }.bind(this))
            }
          }}
          keyboardVisibleHeight={51}
          scrollToEnd={true}
          headline={this.state.partner_name}
          subheadline={"schreibt ..."}
          height={90}
          headlineFontSize={47}
          backButton={true}
          hasFlatList={true}
          onEndReached={() => {
            chat.setLimit(10)
          }}/>
        <View
          style={{
            flexWrap: 'wrap',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: s_width
          }}>
          <InputBox
            icon={faPaperPlane}
            showButton={true}
            onDone={(message) => {
              this.state.chat.sendMessage(message)
            }}
            onFocus={() => {
              setTimeout((function() {
                if (this.scrollView) 
                  this.scrollView.scrollToEnd({animated: true});
                }
              ).bind(this), 200);
              this._keyboardDidShow();
            }}
            onBlur={() => this._keyboardDidHide()}
            onChangeText={text => {
              this._onChangeText(text);
            }}
            width={s_width * .9}
            borderRadius={50}/>
        </View>
      </Theme.BackgroundView>
    );
  }
}

//Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  }
});

export default withNavigation(ChatScreen);
