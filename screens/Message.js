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
  ActionSheetIOS,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  Modal,
  ImageBackground,
  RefreshControl
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {Headlines} from './../app/constants.js';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faChevronCircleLeft,
  faClock,
  faArrowAltCircleDown,
  faEllipsisV,
  faTimes,
  faEnvelope,
  faPhoneAlt
} from '@fortawesome/free-solid-svg-icons';
import {NotificationCard} from './../app/components.js';
import database from '@react-native-firebase/database';
import {SafeAreaView} from 'react-navigation';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import Toast from './../components/Toast.js';
import File from './../components/File.js';
import EventCard from './../components/EventCard.js';
import cloneDeep from 'lodash/cloneDeep';
import {SharedElement} from 'react-navigation-shared-element';
import {useDarkMode} from 'react-native-dynamic'
import Button from './../components/Button.js';
import {Theme} from './../app/index.js';

export default class MessageScreen extends React.Component {
  constructor(props) {
    super(props);

    var headlineHeight = 0;
    const mes = this.props.navigation.getParam('mes', null);
    const club = this.props.navigation.getParam('club', null);
    const utils = this.props.navigation.getParam('utils', null);

    this.state = {
      mes: mes,
      mes_before_edit: null,
      club: club,
      scrollY: new Animated.Value(0),
      cardMarginTop: new Animated.Value(0),
      headlineHeight: -1,
      backBtnY: 0,
      cardY: 0,
      inputRange: [
        0, 160, 210
      ],
      shortInputRange: [
        0, 160
      ],
      ago: mes.ago,
      send_at: mes.send_at,
      ago_seconds: mes.ago_seconds,
      agoTextInterval: null,
      modal_visible: false,
      uid: utils.getUserID(),
      toast: {
        pressed: false,
        visible: false,
        text: '',
        action: ''
      },
      author_info: {}
    };

    mes.setRenderListerner(this.render);

    //utils.setMessageRead(mes.id);
    database().ref('users/' + utils.getUserID() + '/messages/' + mes.id + '/read').set(true);

    //render event cards
    this.eventCards = null;
    if (mes.getEvents().length > 0) {
      this.eventCards = [];
      mes.getEvents().forEach((event, i) => {
        event.setReadyListener(function() {
          this.eventCards.push(event.getRender())
          this.forceUpdate();
        }.bind(this))
      });
    }

    this.files = [];
    if (mes.getFiles().length > 0) {
      mes.getFiles().forEach((file, i) => {
        file.setReadyListener(function() {
          this.files.push(file)
          this.forceUpdate();
        }.bind(this))
      });
    }

    // load author info
    if (mes.showAuthor()) {
      mes.getAuthorInfo(function(info) {
        this.state.author_info = info;
        this.forceUpdate();
      }.bind(this))
    }
  }

  _getHeadlineMarginTop = () => {
    const {scrollY, inputRange} = this.state;
    return scrollY.interpolate({
      inputRange: inputRange,
      outputRange: [
        165, 86, 0
      ],
      extrapolate: 'clamp',
      useNativeDriver: true
    });
  };

  _getHeadlineLines = () => {
    const {scrollY, inputRange} = this.state;
    return scrollY.interpolate({
      inputRange: inputRange,
      outputRange: [
        10, 1.4, 1
      ],
      useNativeDriver: true
    });
  };

  _getHeadlineMarginLeft = () => {
    const {scrollY, shortInputRange} = this.state;
    return scrollY.interpolate({
      inputRange: shortInputRange,
      outputRange: [
        20, 22
      ],
      extrapolate: 'clamp',
      useNativeDriver: true
    });
  };

  _getHeadlineFontScale = () => {
    const {scrollY, shortInputRange} = this.state;
    return scrollY.interpolate({
      inputRange: shortInputRange,
      outputRange: [
        1, 0.64
      ],
      extrapolate: 'clamp',
      useNativeDriver: true
    });
  };

  _getBackButtonMarginLeft = () => {
    const {scrollY, inputRange} = this.state;

    return scrollY.interpolate({
      inputRange: inputRange,
      outputRange: [
        20, 20, 20
      ],
      extrapolate: 'clamp',
      useNativeDriver: true
    });
  };

  _getBackButtonMarginTop = () => {
    const {scrollY, inputRange} = this.state;

    return scrollY.interpolate({
      inputRange: inputRange,
      outputRange: [
        55, 42, -24
      ],
      extrapolate: 'clamp',
      useNativeDriver: true
    });
  };

  _getImageScale = () => {
    const {scrollY, shortInputRange} = this.state;

    return scrollY.interpolate({
      inputRange: shortInputRange,
      outputRange: [
        1, 1.5
      ],
      extrapolate: 'clamp',
      useNativeDriver: true
    });
  };

  _getImageOpacity = () => {
    const {scrollY, shortInputRange} = this.state;

    return scrollY.interpolate({
      inputRange: shortInputRange,
      outputRange: [
        0.80, 0.7
      ],
      extrapolate: 'clamp',
      useNativeDriver: true
    });
  };

  _getBlurHeaderOpacity = () => {
    const {scrollY, inputRange} = this.state;

    return scrollY.interpolate({
      inputRange: inputRange,
      outputRange: [
        0, 0, 1
      ],
      extrapolate: 'clamp',
      useNativeDriver: true
    });
  };

  _getCardMarginTop = () => {
    return this.state.cardMarginTop.interpolate({
      inputRange: [
        0, 1000
      ],
      outputRange: [
        0, 1000
      ],
      extrapolate: 'clamp',
      useNativeDriver: true
    });
  }

  _openMessageModal() {
    const mes = this.state.mes;
    if (mes.isOwnMessage()) {
      const utils = this.props.navigation.getParam('utils', null);
      const club = this.state.club;

      var options = ['Abbrechen', 'Bearbeiten', 'Löschen'];
      ActionSheetIOS.showActionSheetWithOptions({
        options: options,
        destructiveButtonIndex: 2,
        cancelButtonIndex: 0
      }, buttonIndex => {
        if (buttonIndex === 0) {
          // cancel
        } else if (buttonIndex === 1) {
          this.state.mes_before_edit = cloneDeep(this.state.mes);
          this._openModal();
        } else if (buttonIndex === 2) {
          this._deleteMessage();
        }
      });
    }
  }

  startChat() {
    const mes = this.state.mes;
    const utils = this.props.navigation.getParam('utils', null);
    utils.getUser().startChat(mes.getAuthor(), utils);
  }

  _openModal() {
    if (this.state.modal_visible) {
      this.state.modal_visible = false;
      this.forceUpdate();
      setTimeout((function() {
        this.state.modal_visible = true;
        this.forceUpdate();
      }).bind(this), 0);
    } else {
      this.state.modal_visible = true;
      this.forceUpdate();
    }
  }

  _closeModal() {
    this.state.modal_visible = false;
    this.forceUpdate();
  }

  _deleteMessage() {
    const message = this.state.mes;
    message.delete((function(deleted) {
      if (deleted) 
        this.props.navigation.navigate('ScreenHandler');
      }
    ).bind(this));
    //database().ref('messages/list/' + this.state.mes.id + '/invisible').set(true);
  }

  _editMessage() {
    const mes = this.state.mes;
    const message = this.state.mes;
    this.state.headlineHeight = -1;

    setTimeout((function() {
      this.state.toast.visible = true;
      this.forceUpdate();
    }).bind(this), 500);

    this.state.toast.pressed = false;
    this.state.toast.text = 'Beitrag bearbeitet';
    this.state.toast.action = 'Rückgängig';
    this.state.toast.callback = (function() {
      const message = this.state.mes;
      const mbe = this.state.mes_before_edit;
      message.set({headline: mbe.headline, short_text: mbe.short_text, long_text: mbe.long_text});
      this.state.headlineHeight = -1;
      this.state.mes = mbe;
      this.forceUpdate();
    }).bind(this);

    message.set({headline: mes.headline, short_text: mes.short_text, long_text: mes.long_text});

    this._closeModal();
    this.forceUpdate();
  }

  _onChangeText(name, value) {
    this.state.mes[name] = value;
    this.forceUpdate();
  }

  _editEvent(key, name, date, location) {
    const mes_id = this.state.mes.id;
    const event = this.state.mes.events[key];
    event.name = name;
    event.date = date;
    event.location = location;
    this.state.mes.events[key] = event;
    this.forceUpdate();
    database().ref('messages/list/' + mes_id + '/events/' + key + '/name').set(name);
    database().ref('messages/list/' + mes_id + '/events/' + key + '/date').set(date);
    database().ref('messages/list/' + mes_id + '/events/' + key + '/location').set(location);
  }

  _deleteEvent(key) {
    const utils = this.props.navigation.getParam('utils', null);
    utils.showAlert('Event löschen?', '', [
      'Ja', 'Nein'
    ], (function(btn_id) {
      if (btn_id == 0) {
        // delete event
        const mes_id = this.state.mes.id;
        var events = [...this.state.mes.events];
        events.splice(key, 1);
        this.state.mes.events = events;
        this.forceUpdate();
        database().ref('messages/list/' + mes_id + '/events').set(this.state.mes.events);
      }
    }).bind(this), true, false);
  }

  _editFile(pos, name, old_name) {
    const file = this.state.mes.files[pos];
    const message = this.state.mes;

    file.name = name;

    setTimeout((function() {
      this.state.toast.visible = true;
      this.forceUpdate();
    }).bind(this), 500);

    this.state.toast.pressed = false;
    this.state.toast.text = 'Datei bearbeitet';
    this.state.toast.action = 'Rückgängig';
    this.state.toast.callback = (function() {
      const message = this.state.mes;

      message.setFileName(pos, old_name);
      this.state.mes.files[pos].name = old_name;
      this.forceUpdate();
    }).bind(this);

    message.setFileName(pos, name);

    this._closeModal();
    this.forceUpdate();
  }

  renderCards(cards) {
    return cards.map(function(card) {
      return card;
    });
  }

  render() {
    const s_width = Dimensions.get('window').width;
    const s_height = Dimensions.get('window').height;

    const mes = this.state.mes;
    const club = this.state.club;

    const blurHeaderOpacity = this._getBlurHeaderOpacity();
    const headlineFontScale = this._getHeadlineFontScale();
    const headlineMarginTop = this._getHeadlineMarginTop();
    const headlineMarginLeft = this._getHeadlineMarginLeft();
    const backButtonMarginLeft = this._getBackButtonMarginLeft();
    const backButtonMarginTop = this._getBackButtonMarginTop();
    const imageScale = this._getImageScale();
    const imageOpacity = this._getImageOpacity();

    const cardMarginTop = this._getCardMarginTop();
    var s = require('./../app/style.js');

    /*
    var downloadsElements = null;
    if (mes.files) {
      downloadsElements = Object.keys(mes.files).map(key => {
        var file = mes.files[key];
        return (
          <File
            key={key}
            pos={key}
            card_type="normal"
            editable={mes.author == this.state.uid}
            downloadable={true}
            name={file.name}
            type={file.type}
            size={file.size}
            download_url={file.download_url}
            onEdit={(pos, name, old_value) => this._editFile(pos, name, old_value)}
            onDelete={pos => this._deleteFile(pos)}/>
        );
      });
    }
    */

    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80
    };

    const fileCards = this.files.map(function(file) {
      return <File file={file} downloadable={true}/>
    });

    return (
      <Theme.View>
        <Toast
          visible={this.state.toast.visible}
          text={this.state.toast.text}
          action={this.state.toast.action}
          callback={(function(action) {
            if (action == 'button_pressed') 
              this.state.toast.pressed = true;
            else if (action == 'toast_invisible') {
              if (this.state.toast.pressed) 
                this.state.toast.callback();
              this.state.toast.visible = false;
              this.forceUpdate();
            }
          }).bind(this)}/>
        <Modal animationType="slide" presentationStyle="formSheet" visible={this.state.modal_visible}>
          <View style={{
              padding: 20,
              backgroundColor: '#121212',
              height: '100%'
            }}>
            <View
              style={{
                marginBottom: 10,
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                flexDirection: 'row'
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Bold',
                  color: 'white',
                  fontSize: 25,
                  width: '76%'
                }}
                numberOfLines={1}>
                {
                  this.state.mes.headline
                    ? this.state.mes.headline
                    : 'Mitteilung bearbeiten'
                }
              </Text>
              <TouchableOpacity
                style={{
                  height: 30,
                  borderRadius: 10,
                  marginLeft: 10,
                  width: 70,
                  padding: 5,
                  paddingLeft: 10,
                  backgroundColor: '#0DF5E3'
                }}
                onPress={text => this._editMessage()}>
                <Text style={{
                    fontSize: 18,
                    fontFamily: 'Poppins-Bold',
                    color: '#1e1e1e'
                  }}>FERTIG</Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                marginLeft: -20,
                height: 0.5,
                marginBottom: 40,
                backgroundColor: '#1e1e1e',
                width: '140%'
              }}/>

            <ScrollView>
              <View style={{
                  marginBottom: 20
                }}>
                <Text
                  style={{
                    fontFamily: 'Poppins-SemiBold',
                    marginLeft: 10,
                    color: '#5C5768'
                  }}>Überschrift</Text>
                <Theme.View style={{
                    borderRadius: 20
                  }}>
                  <TextInput
                    multiline={true}
                    autoCorrect={false}
                    keyboardType="default"
                    style={{
                      fontFamily: 'Poppins-Medium',
                      marginTop: 8,
                      padding: 15,
                      fontSize: 17,
                      color: '#D5D3D9'
                    }}
                    value={this.state.mes.headline}
                    onChangeText={text => this._onChangeText('headline', text)}/>
                </Theme.View>
              </View>
              <View style={{
                  marginBottom: 20
                }}>
                <Text
                  style={{
                    fontFamily: 'Poppins-SemiBold',
                    marginLeft: 10,
                    color: '#5C5768'
                  }}>Subtext</Text>
                <View style={{
                    borderRadius: 10,
                    backgroundColor: '#1e1e1e'
                  }}>
                  <TextInput
                    multiline={true}
                    autoCorrect={false}
                    keyboardType="default"
                    style={{
                      fontFamily: 'Poppins-Medium',
                      marginTop: 8,
                      padding: 15,
                      fontSize: 17,
                      color: '#D5D3D9'
                    }}
                    value={this.state.mes.short_text}
                    onChangeText={text => this._onChangeText('short_text', text)}/>
                </View>
              </View>
              <View style={{
                  marginBottom: 20
                }}>
                <Text
                  style={{
                    fontFamily: 'Poppins-SemiBold',
                    marginLeft: 10,
                    color: '#5C5768'
                  }}>Text</Text>
                <View style={{
                    borderRadius: 10,
                    backgroundColor: '#1e1e1e'
                  }}>
                  <TextInput
                    multiline={true}
                    autoCorrect={false}
                    keyboardType="default"
                    style={{
                      fontFamily: 'Poppins-Medium',
                      marginTop: 8,
                      padding: 15,
                      fontSize: 17,
                      color: '#D5D3D9'
                    }}
                    value={this.state.mes.long_text}
                    onChangeText={text => this._onChangeText('text', text)}/>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
        <View style={{
            position: 'absolute'
          }}>
          <Theme.BackgroundView
            color={'background_view'}
            invertedColor={true}
            style={{
              width: 400,
              marginLeft: 0,
              marginTop: -50,
              position: 'absolute'
            }}>
            <View style={{
                position: 'absolute'
              }}>
              <Animated.View
                style={{
                  marginRight: 30,
                  marginLeft: headlineMarginLeft,
                  marginTop: headlineMarginTop,
                  transform: [
                    {
                      scale: headlineFontScale
                    }
                  ]
                }}
                onLayout={event => {
                  var {
                    x,
                    y,
                    width,
                    height
                  } = event.nativeEvent.layout;
                  if (this.state.headlineHeight == -1) {
                    this.setState({headlineHeight: height});
                    this.setState({
                      inputRange: [
                        0, 82 + height,
                        145 + height
                      ]
                    });
                    this.setState({
                      shortInputRange: [
                        0, 82 + height
                      ]
                    });
                    this.state.cardMarginTop.setValue(900 + height - 90);
                    Animated.timing(this.state.cardMarginTop, {
                      useNativeDriver: false,
                      toValue: 240 + height - 80,
                      duration: 250,
                      easing: Easing.ease
                    }).start();
                  }
                }}>
                <Theme.Text
                  color={"view"}
                  numberOfLines={this._getHeadlineLines()}
                  style={{
                    color: 'white',
                    lineHeight: 50,
                    fontFamily: 'Poppins-Bold',
                    fontSize: 40
                  }}>{mes.getHeadline()}</Theme.Text>
              </Animated.View>
              <View
                style={{
                  opacity: 0.8,
                  width: 500,
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                  flexDirection: 'row',
                  marginTop: 260 + this.state.headlineHeight - 85,
                  position: 'absolute',
                  marginLeft: 20
                }}>
                <Theme.Icon size={13} color="view" icon={faClock}/>
                <Theme.Text
                  color="view"
                  style={{
                    fontFamily: 'Poppins-SemiBold',
                    marginTop: -2,
                    fontSize: 15,
                    marginLeft: 10
                  }}>
                  Lesezeit: 30 Sec.
                </Theme.Text>
              </View>
            </View>
            <Animated.View
              style={{
                flex: 1,
                zIndex: -1,
                height: 370 + this.state.headlineHeight,
                resizeMode: 'cover',
                marginTop: 0,
                opacity: imageOpacity,
                transform: [
                  {
                    scale: imageScale
                  }
                ]
              }}>
              <ImageBackground
                blurRadius={10}
                style={{
                  flex: 1,
                  zIndex: -1,
                  height: 370 + this.state.headlineHeight,
                  resizeMode: 'cover'
                }}
                source={{
                  url: mes.getImage()
                }}></ImageBackground>
            </Animated.View>
          </Theme.BackgroundView>
        </View>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          alwaysBounceHorizontal={false}
          alwaysBounceVertical={false}
          bounces={true}
          scrollEventThrottle={1}
          overScrollMode={'never'}
          style={{
            zIndex: 10,
            marginBottom: -35
          }}
          onScroll={Animated.event([
            {
              nativeEvent: {
                contentOffset: {
                  y: this.state.scrollY
                }
              }
            }
          ], {useNativeDriver: false})}>
          <Theme.View
            style={{
              zIndex: 10,
              minHeight: s_height + this.state.headlineHeight - 100,
              marginTop: cardMarginTop,
              borderTopLeftRadius: 35,
              borderTopRightRadius: 35,
              shadowColor: "black",
              shadowOpacity: 0.3,
              shadowOffset: {
                width: 0,
                height: 0
              },
              shadowRadius: 10.0
            }}>
            <View style={{
                marginTop: 20,
                marginLeft: 25,
                marginRight: 25
              }}>
              <View
                style={{
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                  flexDirection: 'row',
                  width: s_width * 0.86
                }}>
                <Image
                  style={{
                    borderRadius: 47,
                    height: 47,
                    width: 47
                  }}
                  source={{
                    uri: this.state.author_info.img
                      ? this.state.author_info.img
                      : club.logo
                  }}/>
                <View
                  style={{
                    marginTop: 5,
                    opacity: 1,
                    marginLeft: 15,
                    justifyContent: 'center'
                  }}>
                  <Theme.Text style={{
                      fontFamily: "Poppins-SemiBold",
                      fontSize: 18
                    }}>{
                      this.state.author_info.name
                        ? this.state.author_info.name
                        : club.name
                    }</Theme.Text>
                  <Theme.Text
                    style={{
                      opacity: 0.6,
                      fontFamily: "Poppins-Medium",
                      fontSize: 14
                    }}>{
                      this.state.author_info.name
                        ? 'Für ' + club.name
                        : mes.getAgoText()
                    }</Theme.Text>
                </View>
                {
                  !mes.isOwnMessage()
                    ? <Button
                        style={{
                          top: 5,
                          position: 'absolute',
                          right: 0
                        }}
                        color={club.color}
                        padding={9}
                        onPress={this.startChat.bind(this)}
                        icon={faEnvelope}/>
                    : void 0
                }

              </View>
              <Theme.Text
                style={{
                  opacity: 0.7,
                  marginTop: 30,
                  textAlign: 'justify',
                  fontFamily: 'Poppins-Regular',
                  fontSize: 19,
                  color: 'white',
                  marginBottom: 30
                }}>
                {mes.getLongText()}
              </Theme.Text>
            </View>
            {
              mes.hasFiles() || mes.hasEvents()
                ? <Theme.View
                    style={{
                      height: "100%",
                      paddingTop: 20,
                      paddingBottom: 40,
                      paddingLeft: 30,
                      borderTopLeftRadius: 30,
                      marginLeft: 0,
                      marginTop: 0
                    }}>
                    {
                      mes.hasFiles()
                        ? <View>
                            <Theme.Text
                              style={{
                                opacity: 0.3,
                                fontFamily: 'Poppins-ExtraBold',
                                marginTop: 20,
                                fontSize: 40
                              }}>Dateien</Theme.Text>
                            <View style={{
                                marginTop: 20,
                                marginRight: 20
                              }}>
                              {fileCards}
                            </View>
                          </View>
                        : void 0
                    }

                    {
                      mes.hasEvents()
                        ? <View>
                            <Theme.Text
                              style={{
                                opacity: 0.3,
                                fontFamily: 'Poppins-ExtraBold',
                                marginTop: 20,
                                fontSize: 40
                              }}>
                              Events
                            </Theme.Text>
                            <View style={{
                                marginTop: 20,
                                marginRight: 20
                              }}>
                              {this.renderCards(this.eventCards)}
                            </View>
                          </View>
                        : void 0
                    }
                  </Theme.View>
                : void 0
            }
          </Theme.View>
        </Animated.ScrollView>

        <Animated.View style={{
            position: 'absolute',
            opacity: blurHeaderOpacity,
            zIndex: 200
          }}>
          <Theme.BlurView style={{
              width: s_width,
              height: s_width * 0.1
            }}/>
        </Animated.View>
        <Animated.View
          style={([s.headlineIcon], {
            zIndex: 20,
            position: 'absolute',
            marginTop: backButtonMarginTop,
            marginLeft: backButtonMarginLeft,
            justifyContent: 'flex-start',
            flexWrap: 'wrap',
            flexDirection: 'row'
          })}
          onLayout={event => {
            var {
              x,
              y,
              width,
              height
            } = event.nativeEvent.layout;
            this.setState({backBtnY: y});
          }}>
          <TouchableOpacity
            style={{}}
            onPress={() => {
              this.state.cardMarginTop.setValue(240 + this.state.headlineHeight - 90);
              Animated.timing(this.state.cardMarginTop, {
                useNativeDriver: false,
                toValue: 1000 + this.state.headlineHeight - 90,
                duration: 210,
                easing: Easing.ease
              }).start(() => {});
              this.props.navigation.navigate('ScreenHandler')
            }}>
            <Theme.Icon color="view" style={{
                zIndex: 0
              }} size={25} icon={faChevronCircleLeft}/>
          </TouchableOpacity>
          {
            mes.isOwnMessage()
              ? <TouchableOpacity style={{
                    zIndex: 0,
                    marginLeft: 290
                  }} onPress={() => this._openMessageModal()}>
                  <Theme.Icon size={22} color="view" icon={faEllipsisV}/>
                </TouchableOpacity>
              : void 0
          }

        </Animated.View>
      </Theme.View>
    );
  }
}

/*
MessageScreen.sharedElements = (navigation) => {
  const mes_id = navigation.getParam('mes', null).id;
  return ["headline_" + mes_id];
};
*/
