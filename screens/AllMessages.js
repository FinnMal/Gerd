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
import { BackgroundView } from '../app/theme.js';
import { MessagesList } from './../classes/MessagesList.js';
import Message from "./../components/Message.js";

// AllMessagesScreen class: screen where all read messages are visible
class AllMessagesScreen extends React.Component {
  constructor(props) {
    super(props);
    this.utils = this.props.navigation.getParam('utils', null)
    this.state = {
        messages: []
    }
    this.state.messagesList = new MessagesList(this.utils);

    // listener for clubs messages
    this.state.messagesList.startMessagesListener(function (mes) {
        mes.setReadyListener(function (m) {
          this.forceUpdate();
        }.bind(this))
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
      }.bind(this), function (mes) {
        //message removed
        var index = this.state.messages.indexOf(mes);
        this.state.messages.splice(index, 1);
        this.forceUpdate();
      }.bind(this));
  }

  render() {
    const s_width = Dimensions.get('window').width;
    const s_height = Dimensions.get('window').height;

    const allMessages = Object.keys(this.state.messages).map(key => {
        const mes = this.state.messages[key];
        return <Message key={mes.getID()} message={mes} club={mes.getClub()} utils={this.utils} showRead={true} />
      });

    return (
           <HeaderScrollView
            headline="Alle Mitteilungen"
            backButton={true}
            backButtonIcon={faChevronCircleLeft}>
                {allMessages}
            </HeaderScrollView>
    )
  }
}

export default withNavigation(AllMessagesScreen);
