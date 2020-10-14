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
  Dimensions,
  RefreshControl,
  FlatList
} from 'react-native';
import {Headlines} from './../app/constants.js';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faPlusCircle,
  faTrash,
  faEye,
  faUser,
  faUsers,
  faCog,
  faQrcode,
  faNewspaper,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import {NotificationCard} from './../app/components.js';
import database from '@react-native-firebase/database';
import {withNavigation} from 'react-navigation';
import {Message} from './../classes/Message.js';
import {MessagesList} from './../classes/MessagesList.js';
import {EventsList} from './../classes/EventsList.js';
import HeaderScrollView from './../components/HeaderScrollView.js';
import {useDarkMode} from 'react-native-dynamic'
import {Theme} from './../app/index.js';
import Swiper from './../components/Swiper.js'
import {default as Modal} from "./../components/Modal.js";
import Setting from "./../components/Setting.js";

function CText(props) {
  const isDarkMode = useDarkMode()
  return <Text style={[
      props.style, {
        color: isDarkMode && !props.focused
          ? "white"
          : "#121212"
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
          ? "#F5F5F5"
          : "#121212"
      }
    ]}
    icon={props.icon}>{props.children}</FontAwesomeIcon>;
}

AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
class HomeScreen extends React.Component {
  constructor(props) {
    super(props);

    var utils = this.props.utilsObject;

    this.state = {
      utils: utils,
      uid: utils.getUserID(),
      account_type: utils.getAccountType(),
      messages: [],
      events: [],
      scrollY: new Animated.Value(0)
    };
    this.state.messagesList = new MessagesList(this.props.utilsObject);
    this.state.eventsList = new EventsList(this.props.utilsObject);
    this.margin = new Animated.Value(0);

    this.state.messagesList.startMessagesListener(function(mes) {
      // message added
      if (this.state.messages.indexOf(mes) == -1) {
        const mes_index = this.state.messages.length;
        mes.setRenderListerner(function(new_mes) {
          this.state.messages[mes_index + 1] = new_mes;
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
      }
      this.forceUpdate();
    }.bind(this), function(mes) {
      //message removed
      var index = this.state.messages.indexOf(mes);
      this.state.messages.splice(index, 1);
      this.forceUpdate();
    }.bind(this));

    this.state.eventsList.startEventsListener(function(event) {
      // events added
      if (this.state.events.indexOf(event) == -1) {
        const event_index = this.state.events.length;

        event.setRenderListerner(function(new_event) {
          this.state.events[event_index] = new_event;
          this.forceUpdate();
        }.bind(this))
        this.state.events.push(event);
        this.state.events.sort(
          (a, b) => (a.getStartsAt() < b.getStartsAt())
            ? 1
            : (
              (b.getStartsAt() < a.getStartsAt())
                ? -1
                : 0
            )
        );
      }
      this.forceUpdate();
    }.bind(this), function(event) {
      //event removed
      var index = this.state.events.indexOf(event);
      this.state.events.splice(index, 1);
      this.forceUpdate();
    }.bind(this));
  }

  doRefresh() {
    this.state.refreshing = true;
    this.forceUpdate();
    this.refs.messagesList.refresh((function() {
      this.state.refreshing = false;
      this.forceUpdate();
    }).bind(this));
  }

  _getHeaderListView() {
    const s_width = Dimensions.get("window").width;
  }

  render() {
    const s_width = Dimensions.get("window").width;
    const s_height = Dimensions.get("window").height;
    var s = require('./../app/style.js');
    const marginLeft = this.margin.interpolate({
      inputRange: [
        0, 2000
      ],
      outputRange: [0, 2000]
    });

    const firstMessages = Object.keys(this.state.messages).map(key => {
      const mes = this.state.messages[key];
      return mes.getRender();
    });

    if (this.props.show) {
      return (
        <View>
          <Modal ref={m => {
              this.account_modal = m;
            }} headline={"Account"}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{
                paddingTop: 50,
                marginLeft: -20,
                marginRight: -20
              }}>
              <Setting label="Neue Mitteilung" icon={faNewspaper}/>
              <View style={{
                  marginTop: 40
                }}>
                <Setting label="Verein beitreten" icon={faQrcode}/>
                <Setting label="Verein erstellen" icon={faPlusCircle}/>
              </View>
            </ScrollView>
          </Modal>
          <HeaderScrollView
            onRef={view => {
              this.headerScrollView = view;
              if (view) {
                this._onFlatListScroll = view.getScrollCallback();
              }
            }}
            showHeader={false}
            backButton={false}
            scrollY={this.state.scrollY}
            setNavbarPos={pos => {
              this.props.startNavbarAnimation(pos);
            }}>
            <Theme.BackgroundView style={{
                backgroundColor: "white",
                paddingBottom: 15
              }}>
              <View
                style={{
                  flex: 1,
                  flexWrap: 'wrap',
                  flexDirection: 'row',
                  width: "100%",
                  marginLeft: 5,
                  marginRight: 5
                }}>
                <View>
                  <Theme.Text
                    color={"primary"}
                    style={{
                      opacity: .8,
                      textTransform: 'uppercase',
                      fontFamily: 'Poppins-SemiBold',
                      fontSize: 16
                    }}>{
                      new Date().toLocaleDateString('de-DE', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })
                    }</Theme.Text>
                  <Theme.Text
                    style={{
                      marginTop: -1,
                      opacity: 0.9,
                      fontFamily: 'Poppins-ExtraBold',
                      fontSize: 41
                    }}>Heute</Theme.Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    this.account_modal.open()
                  }}
                  style={{
                    marginLeft: "auto",
                    marginRight: 5,
                    alignSelf: 'flex-end',
                    borderRadius: 47,
                    height: 46,
                    width: 46,
                    marginBottom: 5
                  }}>
                  <Image
                    style={{
                      borderRadius: 47,
                      height: 46,
                      width: 46
                    }}
                    source={{
                      url: this.state.utils.getUser().getImage()
                    }}/>
                </TouchableOpacity>
              </View>
              <Swiper data={this.state.events} style={{
                  marginTop: 25
                }} autoplay={false}></Swiper>
              <View
                style={{
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                  flexDirection: 'row',
                  marginBottom: 10
                }}>
                <Theme.Text
                  style={{
                    marginTop: 60,
                    marginLeft: 5,
                    fontFamily: 'Poppins-Bold',
                    fontSize: 35
                  }}>Mitteilungen</Theme.Text>
                <Theme.Text
                  color={"primary"}
                  style={{
                    marginLeft: "auto",
                    alignSelf: 'flex-end',
                    opacity: .8,
                    marginBottom: 5,
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 16
                  }}>Alle anzeigen</Theme.Text>
              </View>
              <View>
                {firstMessages}
              </View>
            </Theme.BackgroundView>
          </HeaderScrollView>
        </View>
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

  openAddMessage() {
    this.props.navigation.navigate('NewMessageScreen', {utils: this.props.utilsObject});
  }
}

//Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  navText: {
    fontFamily: 'Poppins-ExtraBold',
    fontSize: 22,
    marginLeft: 0,
    color: 'white'
  },
  navTouch: {
    width: 70,
    marginTop: 0,
    marginRight: 45,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default withNavigation(HomeScreen);
