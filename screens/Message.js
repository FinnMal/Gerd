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

function CView(props) {
  const isDarkMode = useDarkMode()
  return <View style={[
      {
        backgroundColor: isDarkMode
          ? "#1C1C1E"
          : "#f7f2f2"
      },
      props.style
    ]}>{props.children}</View>;
}

function CDarkView(props) {
  const isDarkMode = useDarkMode()
  return <View style={[
      {
        backgroundColor: isDarkMode
          ? "#2C2C2E"
          : "#AEAEB2"
      },
      props.style
    ]}>{props.children}</View>;
}

function AnimatedCView(props) {
  const isDarkMode = useDarkMode()
  return <Animated.View style={[
      {
        backgroundColor: isDarkMode
          ? "#1C1C1E"
          : "#f7f2f2"
      },
      props.style
    ]}>{props.children}</Animated.View>;
}

function CBlurView(props) {
  const s_width = Dimensions.get("window").width;
  const isDarkMode = useDarkMode()
  return (<BlurView blurType={isDarkMode
      ? "dark"
      : "regular"} blurAmount={10} reducedTransparencyFallbackColor="#121212" style={[props.style]}/>);
}

function CText(props) {
  const isDarkMode = useDarkMode()
  return <Text style={[
      props.style, {
        color: isDarkMode
          ? "#f7f2f2"
          : "#1C1C1E"
      }
    ]}>{props.children}</Text>;
}

function CIcon(props) {
  const isDarkMode = useDarkMode()
  return <FontAwesomeIcon
    size={props.size}
    style={[
      props.style, {
        color: isDarkMode
          ? "#f7f2f2"
          : "#1C1C1E"
      }
    ]}
    icon={props.icon}>{props.children}</FontAwesomeIcon>;
}

function CBackgroundView(props) {
  const isDarkMode = useDarkMode()
  return <View style={[
      {
        backgroundColor: isDarkMode
          ? "black"
          : "black"
      },
      props.style
    ]}>{props.children}</View>;
}

export default class MessageScreen extends React.Component {
  constructor(props) {
    super(props);

    var headlineHeight = 0;
    const mes = this.props.navigation.getParam('mes', null);
    const club = this.props.navigation.getParam('club', null);
    const utils = this.props.navigation.getParam('utils', null);
    const mesObj = this.props.navigation.getParam('mesObj', null);

    this.state = {
      mesObj: mesObj,
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

    if (mes.ago_seconds < 3600) {
      this.state.agoTextInterval = setInterval((function() {
        this._updateAgoText();
      }).bind(this), 1000);
    }
    //utils.setMessageRead(mes.id);
    database().ref('users/' + utils.getUserID() + '/messages/' + mes.id + '/read').set(true);

    //render event event cards
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

    this.fileCards = null;
    if (mes.getFiles().length > 0) {
      this.fileCards = [];
      mes.getFiles().forEach((file, i) => {
        file.setReadyListener(function() {
          var index = this.fileCards.length;
          file.setRenderListerner(function() {
            this.fileCards[index] = file.getRender()
            this.forceUpdate();
          }.bind(this))

          this.fileCards.push(file.getRender())
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

  componentWillUnmount() {
    clearInterval(this.state.agoTextInterval);
  }

  _updateAgoText() {
    if (this.state.ago_seconds < 3600) {
      this.state.ago_seconds++;
      this.state.ago = this.props.navigation.getParam('utils', null).getAgoText(this.state.send_at);
      this.forceUpdate();
    } else 
      clearInterval(this.state.agoTextInterval);
    }
  
  _getHeadlineMarginTop = () => {
    // 160
    const {scrollY, shortInputRange, inputRange, headlineHeight} = this.state;
    return scrollY.interpolate({
      inputRange: inputRange,
      outputRange: [
        165, headlineHeight + 42,
        headlineHeight - 40
      ],
      extrapolate: 'clamp',
      useNativeDriver: true
    });
  };

  _getHeadlineLines = () => {
    // 160
    const {scrollY, shortInputRange, inputRange, headlineHeight} = this.state;
    return scrollY.interpolate({
      inputRange: inputRange,
      outputRange: [
        10, 10, 10
      ],
      useNativeDriver: true
    });
  };

  _getHeadlineMaxWidth = () => {
    // 160
    const {scrollY, shortInputRange, inputRange, headlineHeight} = this.state;
    return scrollY.interpolate({
      inputRange: inputRange,
      outputRange: [
        380, 380, 700
      ],
      useNativeDriver: true
    });
  };

  _getHeadlineMarginLeft = () => {
    const {scrollY, shortInputRange, inputRange, headlineHeight} = this.state;
    return scrollY.interpolate({
      inputRange: shortInputRange,
      outputRange: [
        20, 30
      ],
      extrapolate: 'clamp',
      useNativeDriver: true
    });
  };

  _getHeadlineFontScale = () => {
    const {scrollY, shortInputRange, inputRange, headlineHeight} = this.state;
    return scrollY.interpolate({
      inputRange: shortInputRange,
      outputRange: [
        1, 0.65
      ],
      extrapolate: 'clamp',
      useNativeDriver: true
    });
  };

  _getBackButtonMarginLeft = () => {
    const {scrollY, shortInputRange, inputRange, headlineHeight} = this.state;

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
    const {scrollY, shortInputRange, inputRange, headlineHeight} = this.state;

    return scrollY.interpolate({
      inputRange: inputRange,
      outputRange: [
        55, 40, -29
      ],
      extrapolate: 'clamp',
      useNativeDriver: true
    });
  };

  _getImageScale = () => {
    const {scrollY, shortInputRange, inputRange, headlineHeight} = this.state;

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
    const {scrollY, shortInputRange, inputRange, headlineHeight} = this.state;

    return scrollY.interpolate({
      inputRange: shortInputRange,
      outputRange: [
        1, 1
        //'rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.3)'
      ],
      //outputRange: [ 'rgba(0, 0, 0, 0.3)', 'rgba(32, 26, 48, 1)' ],
      extrapolate: 'clamp',
      useNativeDriver: true
    });
  };
  _getBlurHeaderOpacity = () => {
    const {scrollY, shortInputRange, inputRange, headlineHeight} = this.state;

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
    const {cardMarginTop} = this.state;

    return cardMarginTop.interpolate({
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
    const club = this.state.club;
    const utils = this.props.navigation.getParam('utils', null);

    database().ref('users/' + mes.author + '/name').once('value', (function(snapshot) {
      if (mes.isOwnMessage()) 
        var options = ['Abbrechen', 'Bearbeiten', 'Löschen'];
      else 
        var options = [
          'Abbrechen', 'Nachricht an ' + snapshot.val()
        ];
      ActionSheetIOS.showActionSheetWithOptions({
        options: options,
        destructiveButtonIndex: 2,
        cancelButtonIndex: 0
      }, buttonIndex => {
        if (buttonIndex === 0) {
          // cancel
        } else if (buttonIndex === 1) {
          if (mes.isOwnMessage()) {
            this.state.mes_before_edit = cloneDeep(this.state.mes);
            this._openModal();
          } else 
            utils.startChat(mes.author, this.props.navigation);
          }
        else if (buttonIndex === 2) {
          if (mes.author == this.state.uid) 
            this._deleteMessage();
          }
        });
    }).bind(this));
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
    const message = this.state.mesObj;
    message.delete((function(deleted) {
      if (deleted) 
        this.props.navigation.navigate('ScreenHandler');
      }
    ).bind(this));
    //database().ref('messages/list/' + this.state.mes.id + '/invisible').set(true);
  }

  _editMessage() {
    const mes = this.state.mes;
    const message = this.state.mesObj;
    this.state.headlineHeight = -1;

    setTimeout((function() {
      this.state.toast.visible = true;
      this.forceUpdate();
    }).bind(this), 500);

    this.state.toast.pressed = false;
    this.state.toast.text = 'Beitrag bearbeitet';
    this.state.toast.action = 'Rückgängig';
    this.state.toast.callback = (function() {
      const message = this.state.mesObj;
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
    const message = this.state.mesObj;

    file.name = name;

    setTimeout((function() {
      this.state.toast.visible = true;
      this.forceUpdate();
    }).bind(this), 500);

    this.state.toast.pressed = false;
    this.state.toast.text = 'Datei bearbeitet';
    this.state.toast.action = 'Rückgängig';
    this.state.toast.callback = (function() {
      const message = this.state.mesObj;

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
    const headlineMaxWidth = this._getHeadlineMaxWidth();
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

    return (
      <CView>
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
                <CView style={{
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
                </CView>
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
          <CBackgroundView
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
                  marginRight: 20,
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
                        0, 70 + height,
                        120 + height
                      ]
                    });
                    this.setState({
                      shortInputRange: [
                        0, 70 + height
                      ]
                    });
                    this.state.cardMarginTop.setValue(900 + height - 90);
                    Animated.timing(this.state.cardMarginTop, {
                      useNativeDriver: false,
                      toValue: 240 + height - 90,
                      duration: 250,
                      easing: Easing.ease
                    }).start();
                  }
                }}>
                <Text
                  style={{
                    color: 'white',
                    lineHeight: 50,
                    fontFamily: 'Poppins-Bold',
                    fontSize: 40
                  }}>{mes.getHeadline()}</Text>
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
                <FontAwesomeIcon size={13} color="#F5F5F5" icon={faClock}/>
                <Text
                  style={{
                    fontFamily: 'Poppins-Medium',
                    marginTop: -2,
                    fontSize: 13,
                    marginLeft: 10,
                    color: 'white'
                  }}>
                  Lesezeit: 30 Sec.
                </Text>

                <Image
                  style={{
                    opacity: 0.9,
                    borderRadius: 14,
                    marginLeft: 20,
                    height: 13,
                    width: 13
                  }}
                  source={{
                    uri: club.logo
                  }}/>
                <Text
                  style={{
                    fontFamily: 'Poppins-Medium',
                    marginTop: -1,
                    fontSize: 13,
                    marginLeft: 10,
                    color: 'white'
                  }}>
                  {club.name}
                </Text>
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
          </CBackgroundView>
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
          <AnimatedCView
            style={{
              zIndex: 10,
              minHeight: s_height + this.state.headlineHeight - 100,
              marginTop: cardMarginTop,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
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
                  <CText style={{
                      fontFamily: "Poppins-SemiBold",
                      fontSize: 18
                    }}>{
                      this.state.author_info.name
                        ? this.state.author_info.name
                        : club.name
                    }</CText>
                  <CText
                    style={{
                      opacity: 0.6,
                      fontFamily: "Poppins-Medium",
                      fontSize: 14
                    }}>{
                      this.state.author_info.name
                        ? 'Für ' + club.name
                        : "Vor 3 Min."
                    }</CText>
                </View>
                {
                  mes.showAuthor()
                    ? <Button
                        style={{
                          top: 5,
                          position: 'absolute',
                          right: 45
                        }}
                        color={club.color}
                        padding={9}
                        icon={faEnvelope}/>
                    : void 0
                }

                <Button
                  style={{
                    top: 5,
                    position: 'absolute',
                    right: 0
                  }}
                  color={club.color}
                  padding={9}
                  icon={faPhoneAlt}/>

              </View>
              <CText
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
              </CText>
            </View>
            {
              mes.hasFiles() || mes.hasEvents()
                ? <CDarkView
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
                            <CText
                              style={{
                                opacity: 0.3,
                                fontFamily: 'Poppins-ExtraBold',
                                marginTop: 20,
                                fontSize: 40
                              }}>Dateien</CText>
                            <View style={{
                                marginTop: 20,
                                marginRight: 20
                              }}>
                              {this.renderCards(this.fileCards)}
                            </View>
                          </View>
                        : void 0
                    }

                    {
                      mes.hasEvents()
                        ? <View>
                            <CText
                              style={{
                                opacity: 0.3,
                                fontFamily: 'Poppins-ExtraBold',
                                marginTop: 20,
                                fontSize: 40
                              }}>
                              Events
                            </CText>
                            <View style={{
                                marginTop: 20,
                                marginRight: 20
                              }}>
                              {this.renderCards(this.eventCards)}
                            </View>
                          </View>
                        : void 0
                    }
                  </CDarkView>
                : void 0
            }
          </AnimatedCView>
        </Animated.ScrollView>

        <Animated.View style={{
            position: 'absolute',
            opacity: blurHeaderOpacity,
            zIndex: 200
          }}>
          <CBlurView style={{
              width: s_width,
              height: s_width * 0.123
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
            <FontAwesomeIcon style={{
                zIndex: 0
              }} size={27} color="#F5F5F5" icon={faChevronCircleLeft}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this._openMessageModal()}>
            <FontAwesomeIcon style={{
                zIndex: 0,
                marginLeft: 285
              }} size={24} color="#F5F5F5" icon={faEllipsisV}/>
          </TouchableOpacity>
        </Animated.View>
      </CView>
    );
  }
}

/*
MessageScreen.sharedElements = (navigation) => {
  const mes_id = navigation.getParam('mes', null).id;
  return ["headline_" + mes_id];
};
*/
