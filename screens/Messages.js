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
import Chat from "./../classes/Chat.js";

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
          database().ref('chats/' + chat_key + '/messages').orderByChild('send_at').limitToLast(1).on('value', (function(snap) {
            var chat = new Chat(chat_key, this.state.uid);
            chat.startUnreadMessageCountListener(function(count) {
              if (this) 
                if (this.forceUpdate) 
                  this.forceUpdate();
                }
              .bind(this))
            this.state.chats[chat.getID()] = chat;
            this.forceUpdate();
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
      var chats = Object.keys(this.state.chats);

      chatsElements = []
      chats.forEach((key, i) => {
        var chat = this.state.chats[key];
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
    chat.getPartnerUser(function(user) {
      this.user = user;
      var cb = function() {
        this.forceUpdate();
      }.bind(this);
      this.user.startListener("name", cb);
      this.user.startListener("img", cb);
      this.forceUpdate();
    }.bind(this));

  }

  render() {
    const chat = this.props.chat;
    const s_width = Dimensions.get("window").width;
    if (this.user) {

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
              chat_id: chat.id,
              utils: this.props.utils,
              partner_name: this.user.getName()
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
            <Text
              numberOfLines={1}
              style={{
                width: s_width * 0.6,
                fontFamily: 'Poppins-Regular',
                color: '#7B7784'
              }}>
              {chat.getLastMessage().text}
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
              {chat.getLastMessage().ago_text}
            </Text>
            {
              chat.getUnreadMessageCount()
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
                        color: 'black'
                      }}>
                      {chat.getUnreadMessageCount()}
                    </Text>
                  </View>
                : void 0
            }

          </View>
        </TouchableOpacity>
      );
    }
    return null;
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
