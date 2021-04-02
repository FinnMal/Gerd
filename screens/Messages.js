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
import Button from './../components/Button.js';
import User from "./../classes/User.js";
import Chat from "./../classes/Chat.js";
import {Theme} from './../app/index.js';

class MessagesScreen extends React.Component {
  chats = [];
  constructor(props) {
    super(props);
    var utils = this.props.utilsObject;
    this.state = {
      moveTo: 'none',
      uid: utils.getUserID(),
      utils: utils
    };

    // get all active chats of user
    utils.getUser().getChats(function(c) {
      c.forEach((chat, i) => {
        if (chat) 
          this.chats.push(chat)
      });
    }.bind(this))
  }

  render() {
    var chatsElements = null;
    if (this.chats) {
      chatsElements = []
      this.chats.forEach((chat, i) => {
        chatsElements.push(<View key={i}>
          <ChatCard utils={this.state.utils} navigation={this.props.navigation} chat={chat}/>
        </View>);
      });
    }

    if (this.props.show) {
      console.log(this.chats)
      return (
        <HeaderScrollView headline="Chats" headlineFontSize={47} backButton={false}>
          <View style={{
              marginLeft: -20
            }}>
            {
              this.chats.length > 0
                ? chatsElements
                : <View
                    style={{
                      marginLeft: 20,
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                    <Image
                      style={{
                        marginTop: 40,
                        width: 320,
                        height: 261
                      }}
                      source={require('./../assets/img/chat_illustration.png')}/>
                    <Theme.Text
                      style={{
                        marginTop: 40,
                        fontFamily: 'Poppins-ExtraBold',
                        fontSize: 30,
                        opacity: .5
                      }}>Keine Chats</Theme.Text>
                    <Theme.Text
                      style={{
                        textAlign: 'center',
                        marginTop: 20,
                        fontFamily: 'Poppins-Medium',
                        fontSize: 20,
                        opacity: .5
                      }}>Beginne einen Chat, indem du auf den Autoren einer Mitteilung clickst.</Theme.Text>
                    <Button style={{
                        marginTop: 20
                      }} color="selected_view" label="Verein beitreten"/>
                  </View>
            }
          </View>
        </HeaderScrollView>
      );
    }
    return null;
  }
}

class ChatCard extends React.Component {
  ago_text = "";
  user = null;

  constructor(props) {
    super(props);
    var utils = this.props.utils;
    var chat = this.props.chat;

    if (chat) {
      chat.getPartnerUser(function(user) {
        this.user = user;
        var cb = function() {
          this.forceUpdate();
        }.bind(this);
        this.user.startListener("name", cb);
        this.user.startListener("img", cb);
        this.forceUpdate();
      }.bind(this));
      chat.startUnreadMessagesCountListener(function(count) {
        this.forceUpdate();
      }.bind(this))

      chat.startLastMessageListener(function(mes) {
        this.forceUpdate();
      }.bind(this));

      chat.setTypingListener(function(typing) {
        this.forceUpdate()
      }.bind(this))
    }

    /*
    const last_message = chat.getLastMessage()
    if (last_message) {

      if (last_message.getAgoSec() < 3600) {
        var delay = 1;
        setInterval(function() {
          if (last_message.getAgoSec() < 60)
            delay = 1;
          else
            delay = 60;
          this.forceUpdate();
        }.bind(this), delay * 1000)
      }
    }
    */
  }

  render() {
    const chat = this.props.chat;
    const s_width = Dimensions.get("window").width;

    if (!this.user || !chat) 
      return null

    const last_message = chat.getLastMessage();

    return (
      <TouchableOpacity
        style={{
          maxHeight: 55,
          width: s_width * 0.92,
          marginTop: 13,
          marginBottom: 13,
          marginLeft: 20,
          flexWrap: 'wrap',
          flexDirection: 'row'
        }}
        onPress={() => {
          this.props.navigation.navigate('ChatScreen', {
            chat: chat,
            utils: this.props.utils
          });
        }}>
        <Image
          style={{
            flex: 0,
            borderRadius: 36
          }}
          width={50}
          height={50}
          source={{
            uri: this.user.getImage()
          }}/>
        <View style={{
            flex: 1,
            marginLeft: 20,
            justifyContent: 'center'
          }}>
          <Theme.Text numberOfLines={1} style={{
              fontFamily: 'Poppins-SemiBold',
              fontSize: 18
            }}>
            {this.user.getName()}
          </Theme.Text>
          {
            !chat.isTyping()
              ? <Theme.Text
                  numberOfLines={2}
                  style={{
                    fontFamily: 'Poppins-Regular',
                    fontSize: 17,
                    fontStyle: last_message
                      ? ''
                      : 'italic'
                  }}>
                  {
                    last_message && last_message != {}
                      ? last_message.isOwn()
                        ? 'Du: ' + last_message.getText()
                        : last_message.getText()
                      : "Keine Nachrichten"
                  }
                </Theme.Text>
              : <Theme.Text
                  numberOfLines={1}
                  color={"primary"}
                  style={{
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 17
                  }}>schreibt ...</Theme.Text>
          }
        </View>
        {
          last_message
            ? <View style={{
                  height: "100%",
                  marginLeft: 'auto',
                  alignSelf: 'flex-end'
                }}>
                <Theme.Text
                  style={{
                    marginTop: 0,
                    fontSize: 15,
                    fontFamily: 'Poppins-Regular',
                    alignSelf: 'flex-end'
                  }}>{last_message.getAgoText()}
                </Theme.Text>
                {
                  chat.getUnreadMessagesCount() > 0
                    ? <Theme.View
                        color={"primary"}
                        style={{
                          marginBottom: 7,
                          borderRadius: 10,
                          paddingTop: 2,
                          paddingBottom: 2,
                          paddingLeft: 8,
                          paddingRight: 8,
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignSelf: 'flex-end',
                          marginTop: 'auto'
                        }}>
                        <Theme.Text backgroundColor={"primary"} style={{
                            fontFamily: 'Poppins-SemiBold'
                          }}>
                          {chat.getUnreadMessagesCount()}
                        </Theme.Text>
                      </Theme.View>
                    : void 0
                }
              </View>
            : void 0
        }

      </TouchableOpacity>
    );
  }
}

export default withNavigation(MessagesScreen);
