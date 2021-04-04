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
  Dimensions,
  AsyncStorage,
  Keyboard
} from 'react-native';
import {Headlines} from './../app/constants.js';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faAngleRight, faAngleLeft} from '@fortawesome/free-solid-svg-icons';
import {NotificationCard} from './../app/components.js';
import database from '@react-native-firebase/database';
import {withNavigation} from 'react-navigation';
import auth from '@react-native-firebase/auth';
import {Theme} from './../app/index.js';
import Button from "./../components/Button.js";
import InputBox from "./../components/InputBox.js";
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import EncryptedStorage from 'react-native-encrypted-storage';
import KeyManager from './../classes/KeyManager.js';

class FirstStartScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_in_slider: true,
      slider_pos: 0
    };

    this.slider = [
      {
        "headline": "Gerd, der Messenger für Vereine.",
        "text": "Mit Gerd bleibst du als Vereinsmitglied immer informiert. Dein Verein kann Veranstaltungen planen, Mitteilungen senden, oder dir wichtige Dateien zukommen las" +
            "sen.",

        "img": require('./../assets/img/firststart_slider_1.png')
      }, {
        "headline": "Mitteilungen",
        "text": "Dein Verein kann dir Mitteilungen über aktuelle Vorhaben oder anstehende Termine senden. Durch Push-Mitteilungen bleibst du immer auf dem Laufendem.",
        "img": require('./../assets/img/firststart_slider_2.png')
      }
    ]
    this.key_manager = new KeyManager()
  }

  _createAccount() {
    if (this.username_box) {
      if (!this.username_box.hasError()) {
        this._registerProfile();
      }
    }
  }

  async _registerProfile() {
    const onDone = this.props.navigation.getParam('onDone', null);
    const uid = this.props.navigation.getParam('uid', null);
    this._saveUserID(uid);

    database().ref('users/' + uid + '/account_type').set('user');
    database().ref('users/' + uid + '/name').set(this.username);

    try {
      const value = await AsyncStorage.getItem('onesignal_id');
      if (value) {
        database().ref('users/' + uid + '/onesignal_id').set(value);
      }
    } catch (error) {
      console.log(error)
    }

    // generate and store private/public keys
    var keys = this.key_manager.generate();
    this.key_manager.saveKey('private_key', keys[1])
    database().ref('users/' + uid + '/public_key').set(JSON.parse(keys[0]));

    onDone()
  }

  async _saveUserID(id) {
    try {
      await AsyncStorage.setItem('user_id', id);
    } catch (e) {}
  }

  previousSlider() {
    if (this.state.slider_pos > 0) {
      this.state.is_in_slider = true
      this.state.slider_pos = this.state.slider_pos - 1
      this.forceUpdate()
    }
  }

  nextSlider() {
    if (this.state.slider_pos < 1) {
      this.state.is_in_slider = true
      this.state.slider_pos = this.state.slider_pos + 1
    } else 
      this.state.is_in_slider = false
    this.forceUpdate()
  }

  skip() {
    this.state.slider_pos = 1
    this.state.is_in_slider = false
    this.forceUpdate()
  }

  render() {
    var s = require('./../app/style.js');
    const s_width = Dimensions.get("window").width;
    const s_height = Dimensions.get("window").height;
    const slider = this.slider[this.state.slider_pos];
    const selected_pos = this.state.slider_pos;
    console.log('./../assets/' + slider.img)

    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80
    };
    return (
      <GestureRecognizer
        onSwipeLeft={() => this.nextSlider()}
        onSwipeRight={() => this.previousSlider()}
        config={config}
        style={{
          flex: 1,
          backgroundColor: this.state.backgroundColor
        }}>
        <Theme.BackgroundView
          style={{
            paddingLeft: 25,
            paddingRight: 25,
            height: s_height,
            width: s_width,
            paddingTop: 70
          }}>
          <View style={{
              marginTop: 175,
              height: s_height,
              flex: 1,
              justifyContent: 'center'
            }}>
            {
              this.state.is_in_slider
                ? <View>
                    <Theme.Text
                      style={{
                        fontSize: 45,
                        lineHeight: 60,
                        fontFamily: 'Poppins-SemiBold'
                      }}>{slider.headline}</Theme.Text>
                    <Image style={{
                        marginTop: 40
                      }} source={slider.img}/>
                    <Theme.Text
                      style={{
                        opacity: .50,
                        fontSize: 18,
                        marginTop: 20,
                        fontFamily: 'Poppins-Medium'
                      }}>{slider.text}</Theme.Text>
                  </View>
                : <View>
                    <Theme.Text
                      style={{
                        fontSize: 40,
                        lineHeight: 65,
                        fontFamily: 'Poppins-SemiBold'
                      }}>Benutzername</Theme.Text>
                    <Theme.Text
                      style={{
                        opacity: .50,
                        fontSize: 18,
                        marginTop: 10,
                        fontFamily: 'Poppins-Medium'
                      }}>Dein Benutzername ist nur für die Vereinsbetreiber und deine Chatpartner sichtbar.</Theme.Text>
                    <InputBox
                      ref={(input_box) => this.username_box = input_box}
                      returnKeyType="done"
                      onChange={(value) => {
                        this.username = value
                      }}
                      accept="string"
                      max_characters={50}
                      style={{
                        marginTop: 20,
                        marginBottom: 70
                      }}
                      placeholder={'Name'}></InputBox>
                  </View>
            }
          </View>
          <View style={{
              flex: 1,
              justifyContent: 'flex-end',
              marginBottom: 30
            }}>
            <View style={{
                marginLeft: -10,
                flexDirection: "row"
              }}>
              {
                this.state.is_in_slider
                  ? <Button opacity={.6} color="background_view" labelColor="primary" label="Überspringen" onPress={() => this.skip()}></Button>
                  : <Button opacity={.6} color="background_view" labelColor="primary" label="Zurück" onPress={() => this.previousSlider()}></Button>
              }

              {
                this.state.is_in_slider
                  ? <Button
                      style={{
                        marginLeft: 70
                      }}
                      icon={faAngleRight}
                      iconPos="right"
                      label="Weiter"
                      onPress={() => this.nextSlider()}></Button>
                  : <Button style={{
                        marginLeft: 155
                      }} label="Fertig" onPress={() => this._createAccount()}></Button>
              }

            </View>
          </View>

        </Theme.BackgroundView>
      </GestureRecognizer>
    );
  }
}

export default withNavigation(FirstStartScreen);
