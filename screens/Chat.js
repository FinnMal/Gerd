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
import {Theme} from './../app/index.js';

class ChatScreen extends React.Component {
  messageCards = null;

  constructor(props) {
    super(props);
    const utils = this.props.navigation.getParam('utils', null);
    const chat_id = this.props.navigation.getParam('chat_id', null);
    const partner_name = this.props.navigation.getParam('partner_name', null);
    const focused = this.props.navigation.getParam('focused', null);

    var chat = new Chat(chat_id, utils.getUserID());
    this.state = {
      chat: chat,
      uid: utils.getUserID(),
      partner_name: partner_name,
      cur_message: '',
      messages: [],
      keyboardVisibe: false,
      focused: focused === true
    };
    chat.startMessagesListener(function(mes) {
      // add message
      if (this.state.messages.indexOf(mes) == -1) {
        this.state.messages.push(mes);
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
      }
    }.bind(this), function(mes) {
      //remove message
      var index = this.state.messages.indexOf(mes);
      this.state.messages.splice(index, 1);
      this.forceUpdate();
    }.bind(this));
  }

  _getChatInfos() {}

  componentDidMount() {}

  _onChangeText(value) {
    this.state.cur_message = value;
    this.forceUpdate();
  }

  /*componentDidMount() {
    // this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this)); this.keyboardDidHideListener =
    // Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
  }*/

  /*componentWillUnmount() {
    //this.keyboardDidShowListener.remove(); this.keyboardDidHideListener.remove();
  }*/

  _keyboardDidShow() {
    this.headerScrollView.keyboardDidShow()
    /*
    this.scrollViewHeight.setValue(90);
    Animated.timing(this.scrollViewHeight, {
      useNativeDriver: false,
      toValue: 51,
      duration: 150,
      easing: Easing.ease
    }).start(() => {});
    */
  }

  _keyboardDidHide() {
    this.headerScrollView.keyboardDidHide()
    /*
    this.scrollViewHeight.setValue(51);
    Animated.timing(this.scrollViewHeight, {
      useNativeDriver: false,
      toValue: 90,
      duration: 150,
      easing: Easing.ease
    }).start(() => {});
    */
  }

  render() {
    var s = require('./../app/style.js');
    const chat = this.state.chat;
    const utils = this.props.navigation.getParam('utils', null)

    const s_height = Dimensions.get("window").height;
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
            this.headerScrollView = view;
            if (view) {
              this._onFlatListScroll = view.getScrollCallback();
            }
          }}
          keyboardVisibleHeight={47}
          showHeadlineJustInHeader={true}
          scrollToEnd={true}
          headline={this.state.partner_name}
          marginTop={50}
          height={86}
          headlineFontSize={47}
          backButton={true}
          flatList={<Animated.FlatList
          onScroll = {
            this._onFlatListScroll
          }
          onEndReached = {
            () => {
              this.state.chat._setLimit(10);
            }
          }
          onEndReachedThreshold = {
            10
          }
          inverted = {
            true
          }
          initialNumToRender = {
            10
          }
          style = {{
                zIndex: -20,
                marginLeft: 20,
                paddingRight: 20,
                marginTop: 40
              }}
          data = {
            this.state.messages
          }
          renderItem = {
            ({item}) => {
              return item.getRender();
            }
          }
          keyExtractor = {
            (item, index) => index.toString()
          } />
}/>
        <View
          style={{
            marginTop: 10,
            marginLeft: 20,
            marginRight: 20,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <View style={{
              borderRadius: 40,
              backgroundColor: '#1e1e1e',
              width: '100%',
              padding: 15
            }}>
            <TouchableOpacity
              style={{
                marginTop: 4,
                marginLeft: 287,
                position: 'absolute',
                borderRadius: 50,
                width: 43,
                height: 43,
                backgroundColor: '#121212',
                padding: 5,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={() => {
                this.state.chat.sendMessage(this.state.cur_message)
                this.state.cur_message = '';
                this.forceUpdate();
              }}>
              <FontAwesomeIcon style={{
                  zIndex: 0
                }} size={20} color="#F5F5F5" icon={faPaperPlane}/>
            </TouchableOpacity>
            <TextInput
              ref={(input) => {
                this.textInput = input;
              }}
              multiline="multiline"
              style={{
                marginRight: 40,
                maxHeight: 25,
                fontFamily: 'Poppins-Medium',
                paddingTop: -2,
                paddingLeft: 5,
                fontSize: 17,
                color: '#D5D3D9'
              }}
              placeholderTextColor="#665F75"
              placeholder="Nachricht schreiben ..."
              value={this.state.cur_message}
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
              }}/>
          </View>
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
