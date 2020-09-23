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
  Easing,
  Dimensions
} from 'react-native';

import {Headlines} from './../app/constants.js';
import database from '@react-native-firebase/database';
import {withNavigation} from 'react-navigation';
import HeaderScrollView from './../components/HeaderScrollView.js';
import User from "./../classes/User.js";

class MessagesScreen extends React.Component {
  constructor(props) {
    super(props);
    var utils = this.props.utilsObject;
    //var uid = utils.USER_ID;
    this.state = {
      moveTo: 'none',
      chats: {},
      uid: utils.getUserID(),
      utils: utils
    };
    this.margin = new Animated.Value(0);

    database().ref('users/' + this.state.uid + '/chats').on('value', (function(snapshot) {
      var chats = snapshot.val();
      this.state.chats = {};

      if (chats) {
        Object.keys(chats).map(chat_key => {
          database().ref('chats/' + chat_key).on('value', (function(snap) {
            var chat = snap.val();
            chat.id = chat_key;
            chat.unread_messages_count = 0;
            chat.last_message_send_at = 0;
            chat.last_message_id = null;

            // TODO: debug if chat is empty
            Object.keys(chat.messages).map(mes_key => {
              var message = chat.messages[mes_key];
              if (!message.read && message.receiver == this.state.uid) 
                chat.unread_messages_count++;
              
              if (chat.last_message_id) {
                if (chat.messages[chat.last_message_id]) {
                  if (message.send_at > chat.messages[chat.last_message_id].send_at) 
                    chat.last_message_id = mes_key;
                  }
                else 
                  chat.last_message_id = mes_key;
                }
              else 
                chat.last_message_id = mes_key;
              }
            );
            chat.last_message = chat.messages[chat.last_message_id];

            chat.last_message.ago_text = utils.getAgoText(chat.last_message.send_at, false, false, true);

            var list = Object.values(chat.messages);
            list.sort(function(a, b) {
              return parseInt(a.send_at) - parseInt(b.send_at);
            });
            chat.messages = list;

            chat.partner_user_id = chat.user_id_1 != this.state.uid
              ? chat.user_id_1
              : chat.user_id_2;
            this.state.chats[chat.id] = chat;
            this.forceUpdate();
            /*
            database().ref('users/' + reciver_user_id + '/img').once('value', (function(snap) {
              chat.user_img = snap.val();
              database().ref('users/' + reciver_user_id + '/name').once('value', (function(snap) {
                chat.user_name = snap.val();
                this.state.chats[chat.id] = chat;
                this.forceUpdate();
              }).bind(this));
            }).bind(this));
						*/
          }).bind(this));
        });
      }
    }).bind(this));
  }

  render() {
    var s = require('./../app/style.js');
    const marginLeft = this.margin.interpolate({
      inputRange: [
        0, 2000
      ],
      outputRange: [0, 2000]
    });

    var chatsElements = null;
    if (this.state.chats) {
      var first_key = Object.keys(this.state.chats)[0];
      var chats = Object.keys(this.state.chats);
      // var chats = Object.keys(this.state.chats).concat(Object.keys(this.state.chats)) chats = chats.concat(chats) chats = chats.concat(chats) chats =
      // chats.concat(chats)

      var k = 0;
      chatsElements = []
      chats.forEach((key, i) => {
        var chat = this.state.chats[key];
        console.log(k)
        chatsElements.push(
          <View key={i}>
            {
              false
                ? <View
                    style={{
                      marginTop: 0,
                      marginLeft: 90,
                      width: 300,
                      opacity: 0.5,
                      height: 0.3,
                      backgroundColor: "white"
                    }}/>
                : void 0
            }
            <ChatCard utils={this.state.utils} navigation={this.props.navigation} chat={chat}/>
          </View>
        );
      });
    }

    if (this.props.show) {
      return (
        <HeaderScrollView headline="Nachrichten" marginTop={80} headlineFontSize={47} backButton={false} showHeadline={false}>
          <View style={{
              marginLeft: -20
            }}>
            {chatsElements}
          </View>
        </HeaderScrollView>
      );
    }
    return null;
  }

  checkIfScrollViewIsNeeded(viewHeight) {
    if (viewHeight < Dimensions.get('window').height) {
      this.props.setScrollViewEnabled(false);
    } else {
      this.props.setScrollViewEnabled(true);
    }
  }

  animate() {
    this.animatedValue.setValue(0);
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: 2000,
      easing: Easing.linear
    }).start(() => this.animate());
  }
}

class ChatCard extends React.Component {
  ago_text = "";
  user = null;
  constructor(props) {
    super(props);
    var utils = this.props.utils;
    var chat = this.props.chat;
    this.user = new User(chat.partner_user_id);

    var cb = function() {
      this.forceUpdate();
    }.bind(this);
    this.user.startListener("name", cb);
    this.user.startListener("img", cb);

    if (utils.getAgoSec(chat.last_message.send_at) < 3600) {
      setInterval(function() {
        this.props.chat.last_message.ago_text = utils.getAgoText(chat.last_message.send_at, false, false, true);
        this.forceUpdate();

      }.bind(this), 1000);
    }
  }

  render() {
    const chat = this.props.chat;
    const s_width = Dimensions.get("window").width;
    return (
      <TouchableOpacity
        style={{
          marginTop: 13,
          marginBottom: 13,
          marginLeft: 20,
          marginRight: 20,
          flexWrap: 'wrap',
          flexDirection: 'row'
        }}
        onPress={() => {
          this.props.navigation.navigate('ChatScreen', {
            chat: chat,
            utils: this.props.utils,
            chat_partner: this.user
          });
        }}>
        <Image style={{
            borderRadius: 36
          }} width={50} height={50} source={{
            uri: this.user.getImage()
          }}/>
        <View style={{
            marginLeft: 20,
            justifyContent: 'center'
          }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'Poppins-SemiBold',
              fontSize: 18,
              width: s_width * 0.6,
              color: '#C2C1C7'
            }}>
            {this.user.getName()}
          </Text>
          <Text numberOfLines={1} style={{
              width: s_width * 0.6,
              fontFamily: 'Poppins-Regular',
              color: '#7B7784'
            }}>
            {chat.last_message.text}
          </Text>
        </View>
        <View
          style={{
            width: 100,
            height: 50,
            position: 'absolute',
            marginLeft: 300,
            alignSelf: 'flex-end'
          }}>
          <Text style={{
              marginTop: 0,
              fontFamily: 'Poppins-Regular',
              color: '#6F6B79'
            }}>
            {chat.last_message.ago_text}
          </Text>
          {
            chat.unread_messages_count
              ? <View
                  style={{
                    minWidth: 21,
                    minHeight: 20,
                    position: 'absolute',
                    marginTop: 22,
                    borderRadius: 40,
                    paddingTop: 2,
                    paddingBottom: 1,
                    paddingLeft: 6,
                    paddingRight: 6,
                    backgroundColor: '#0DF5E3',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                  <Text style={{
                      fontFamily: 'Poppins-SemiBold',
                      color: 'white'
                    }}>
                    {chat.unread_messages_count}
                  </Text>
                </View>
              : void 0
          }

        </View>
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

export default withNavigation(MessagesScreen);
