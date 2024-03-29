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

import {withNavigation} from 'react-navigation';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import database from '@react-native-firebase/database';
import {faChevronCircleLeft, faChevronLeft, faChevronRight, faPaperPlane} from '@fortawesome/free-solid-svg-icons';
import HeaderScrollView from './../components/HeaderScrollView.js';
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import Chat from './../classes/Chat.js';
import InputBox from './../components/InputBox.js';
import {Theme} from './../app/index.js';

// CHAT class: screen for end-to-end-encrypted chat
class ChatScreen extends React.Component {
  typingInverval = null;
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
      headerScrollView: null,
      flatListData: [],
      sending: false
    };

    // TODO: terminate typingInverval if screen gets closed
    this.typingInverval = setInterval(function() {
      var now = Date.now();
      var last = this.state.last_typed;
      if (now - last < 1000) {
        this.state.chat.setTyping(true);
      } else 
        this.state.chat.setTyping(false);
      }
    .bind(this), 3000)

    chat.startMessagesListener(function(messages, addToStart = true) {
      messages.forEach((mes, i) => {
        if (addToStart) 
          this.state.flatListData.push(mes);
        else 
          this.state.flatListData.unshift(mes);
        }
      );
      this.forceUpdate();
    }.bind(this), function(mes) {
      this.state.headerScrollView.removeItemFromFlatList(mes)
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
    const chat = this.state.chat;
    const utils = this.props.navigation.getParam('utils', null)

    const s_height = Dimensions.get("window").height;
    const s_width = Dimensions.get("window").width;
    var partner_user_name = "";
    var partner = chat.getPartnerUser();
    if (partner) 
      partner_user_name = partner.getName();
    
    // show keyboard on start
    if (this.state.focused) {
      this.state.focused = false
      setTimeout(function() {
        if (this.textInput) 
          this.textInput.focus();
        this.forceUpdate()
      }.bind(this), 300)

    }
    return (
      <Theme.BackgroundView style={{
          height: s_height
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
          headline={partner_user_name}
          subheadline={"schreibt ..."}
          height={90}
          headlineFontSize={47}
          backButton={true}
          hasFlatList={true}
          flatListData={this.state.flatListData}
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
          {
            !this.state.sending
              ? <InputBox
                  onRef={(ref) => {
                    if (!this.textInput) {
                      this.textInput = ref;
                      this.forceUpdate()
                    }
                  }}
                  multiline={true}
                  showBigBackgroundColor={true}
                  inputMarginLeft={15}
                  returnKeyType={"send"}
                  icon={faPaperPlane}
                  showButton={true}
                  clearOnDone={true}
                  onDone={(message) => {
                    console.log('onDone')
                    //this.state.sending = false; this.forceUpdate();

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
              : void 0
          }
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
