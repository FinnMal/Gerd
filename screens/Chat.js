import React from 'react';
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
  Vibration
} from 'react-native';

import {Headlines} from './../app/constants.js';
import {withNavigation} from 'react-navigation';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import database from '@react-native-firebase/database';
import {faChevronCircleLeft, faChevronLeft, faChevronRight, faPaperPlane} from '@fortawesome/free-solid-svg-icons';
import HeaderScrollView from './../components/HeaderScrollView.js';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

class ChatScreen extends React.Component {
  constructor(props) {
    super(props);
    const utils = this.props.navigation.getParam('utils', null);
    const chat = this.props.navigation.getParam('chat', null);

    this.state = {
      chat: '',
      uid: utils.getUserID(),
      chat_partner: this.props.navigation.getParam('chat_partner', null),
      cur_message: ''
    };

    this.lastViewHeight = new Animated.Value(630);
    database().ref('chats/' + chat.id).on('value', (function(snapshot) {
      this.state.chat = snapshot.val();
      this.state.chat.user_name = chat.user_name;

      Object.keys(this.state.chat.messages).map(mes_key => {
        var message = this.state.chat.messages[mes_key];
        message.id = mes_key;
        if (!message.read && message.receiver == this.state.uid) 
          database().ref('chats/' + chat.id + '/messages/' + mes_key + '/read').set(true);
        }
      );

      var list = Object.values(this.state.chat.messages);
      list.sort(function(a, b) {
        return parseInt(a.send_at) - parseInt(b.send_at);
      });

      this.state.chat.messages = list;
      if (this.state.chat.messages) 
        this.forceUpdate();
      }
    ).bind(this));
  }

  _onChangeText(value) {
    this.state.cur_message = value;
    this.forceUpdate();
  }

  _sendMessage() {
    const chat = this.state.chat;

    var mes = {
      text: this.state.cur_message,
      send_at: new Date().getTime() / 1000,
      read: false,
      sender: chat.user_id_1 != this.state.uid
        ? chat.user_id_2
        : chat.user_id_1,
      receiver: chat.user_id_1 != this.state.uid
        ? chat.user_id_1
        : chat.user_id_2
    };

    this.state.cur_message = '';
    this.forceUpdate();

    database().ref('chats/' + chat.id + '/messages').push(mes);
  }

  componentDidMount() {
    // this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this)); this.keyboardDidHideListener =
    // Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
  }

  componentWillUnmount() {
    //this.keyboardDidShowListener.remove(); this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow() {
    this.lastViewHeight.setValue(630);
    Animated.timing(this.lastViewHeight, {
      useNativeDriver: false,
      toValue: 320,
      duration: 150,
      easing: Easing.ease
    }).start(() => {});
  }

  _keyboardDidHide() {
    this.lastViewHeight.setValue(320);
    Animated.timing(this.lastViewHeight, {
      useNativeDriver: false,
      toValue: 630,
      duration: 150,
      easing: Easing.ease
    }).start(() => {});
  }

  render() {
    var s = require('./../app/style.js');
    const chat = this.state.chat;

    var messageCards = <Text>No messages</Text>;
    if (chat.messages) {
      messageCards = Object.keys(chat.messages).map(key => {
        var mes = chat.messages[key];
        mes.chat_id = this.state.chat.id;
        return <MessageCard uid={this.state.uid} message={mes} key={key}/>;
      });
    }

    const last_view_height = this.lastViewHeight.interpolate({
      inputRange: [
        0, 70
      ],
      outputRange: [0, 70]
    });
    /*
    <View style={{
        paddingLeft: 20,
        paddingRight: 20,
        marginTop: 45
      }}>
      <TouchableOpacity
        style={{
          zIndex: 20,
          marginTop: 4,
          marginLeft: 20,
          position: 'absolute'
        }}
        onPress={() => this.props.navigation.navigate('ScreenHandler')}>
        <FontAwesomeIcon style={{
            zIndex: 0
          }} size={29} color="#F5F5F5" icon={faChevronCircleLeft}/>
      </TouchableOpacity>
      <View style={{
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
        <Text style={{
            fontFamily: 'Poppins-Bold',
            fontSize: 25,
            color: 'white'
          }}>
          {this.state.chat_partner.getName()}
        </Text>
      </View>
    <Animated.ScrollView
      showsVerticalScrollIndicator={false}
      ref={ref => {
        this.scrollView = ref;
        if (this.scrollView)
          this.scrollView.scrollToEnd({animated: true});
        }}
      onContentSizeChange={() => {
        if (this.scrollView)
          this.scrollView.scrollToEnd({animated: true});
        }}
      style={{
        marginTop: 10,
        height: last_view_height
      }}>
      {messageCards}
    </Animated.ScrollView>*/

    return (
      <View style={{
          flex: 1,
          backgroundColor: '#121212'
        }}>

        <HeaderScrollView headline={this.state.chat_partner.getName()} marginTop={50} height={90} headlineFontSize={47} backButton={true} showHeadline={true}>
          <View style={{
              marginLeft: -20
            }}>
            {messageCards}
          </View>
        </HeaderScrollView>
        <View style={{
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
              onPress={() => this._sendMessage()}>
              <FontAwesomeIcon style={{
                  zIndex: 0
                }} size={20} color="#F5F5F5" icon={faPaperPlane}/>
            </TouchableOpacity>
            <TextInput
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
      </View>
    );
  }
}

class MessageCard extends React.Component {
  constructor(props) {
    super(props);
  }

  _showActionSheet() {
    ReactNativeHapticFeedback.trigger("impactMedium")
    ActionSheetIOS.showActionSheetWithOptions({
      options: [
        'Abbrechen', 'Nachricht zurückziehen'
      ],
      destructiveButtonIndex: 1,
      cancelButtonIndex: 0
    }, buttonIndex => {
      if (buttonIndex === 0) {
        // cancel
      } else if (buttonIndex === 1) {
        // delete message
        var mes = this.props.message;
        database().ref('chats/' + mes.chat_id + '/messages/' + mes.id).remove();
      }
    });
  }

  render() {
    const uid = this.props.uid;
    const mes = this.props.message;

    return (
      <TouchableOpacity
        onLongPress={() => this._showActionSheet()}
        style={{
          marginBottom: 30,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderBottomLeftRadius: mes.sender == uid
            ? 20
            : 0,
          borderBottomRightRadius: mes.sender == uid
            ? 0
            : 20,
          padding: 10,
          paddingLeft: 20,
          minWidth: 100,
          maxWidth: 270,
          marginLeft: mes.sender == uid
            ? 100
            : 20,
          backgroundColor: mes.sender == uid
            ? '#1e1e1e'
            : '#3D384B'
        }}>
        <Text style={{
            color: 'white',
            fontFamily: 'Poppins-Medium',
            fontSize: 16
          }}>{mes.text}</Text>
      </TouchableOpacity>
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
