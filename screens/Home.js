import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  FlatList
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faPlusCircle,
  faQrcode,
  faNewspaper,
} from '@fortawesome/free-solid-svg-icons';
import { withNavigation } from 'react-navigation';
import { MessagesList } from './../classes/MessagesList.js';
import { EventsList } from './../classes/EventsList.js';
import HeaderScrollView from './../components/HeaderScrollView.js';
import { useDarkMode } from 'react-native-dynamic'
import { Theme } from './../app/index.js';
import Swiper from './../components/Swiper.js'
import { default as Modal } from "./../components/Modal.js";
import Button from "./../components/Button.js";
import Setting from "./../components/Setting.js";
import Message from "./../components/Message.js";
import { ModalCard } from '../app/components.js';
import { TouchablePreview } from 'react-native-navigation/lib/dist/adapters/TouchablePreview';

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
      load_messages: {},
      events: [],
      swiper_autoplay: true,
      scrollY: new Animated.Value(0)
    };
    this.state.messagesList = new MessagesList(this.props.utilsObject);
    this.state.eventsList = new EventsList(this.state.utils.getUser());
    this.margin = new Animated.Value(0);

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

    // listener for clubs events
    this.state.eventsList.startEventsListener(function (event) {
      // events added
      if (this.state.events.indexOf(event) == -1) {
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

        const event_index = this.state.events.indexOf(event)
        event.setReadyListener(function (new_event) {
          console.log('in event render listener')
          console.log('lenght: ' + this.state.events.length)
          this.state.events[event_index] = new_event;
          this.forceUpdate();
        }.bind(this))
        event.setRenderListener(function () {
          this.state.swiper_autoplay = false;
          console.log('[HOME.JS] in event render listener')
          this.forceUpdate()
        }.bind(this))
      }
      this.forceUpdate();
    }.bind(this), function (event) {
      //event removed
      var index = this.state.events.indexOf(event);
      this.state.events.splice(index, 1);
      this.forceUpdate();
    }.bind(this));
  }

  doRefresh() {
    this.state.refreshing = true;
    this.forceUpdate();
    this.refs.messagesList.refresh((function () {
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
    const marginLeft = this.margin.interpolate({
      inputRange: [
        0, 2000
      ],
      outputRange: [0, 2000]
    });

    const firstMessages = Object.keys(this.state.messages).map(key => {
      const mes = this.state.messages[key];
      return <Message key={mes.getID()} message={mes} club={mes.getClub()} utils={this.state.utils} />
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
              <Setting onPress={() => this.openAddMessage()} label="Neue Mitteilung" icon={faNewspaper} />
              <View style={{
                marginTop: 40
              }}>
                <Setting label="Verein beitreten" icon={faQrcode} />
                <Setting label="Verein erstellen" icon={faPlusCircle} />
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
                    height: 45,
                    width: 45,
                    marginBottom: 5
                  }}>
                  <Image
                    style={{
                      borderRadius: 47,
                      height: '100%',
                      width: '100%'
                    }}
                    source={{
                      cache: 'force-cache',
                      url: this.state.utils.getUser().getImage()
                    }} />
                </TouchableOpacity>
              </View>
              <Swiper data={this.state.events} style={{
                marginTop: 25
              }} autoplay={this.state.swiper_autoplay}></Swiper>
              {
                this.state.messages.length > 0
                  ? <View
                    style={{
                      flexWrap: 'wrap',
                      alignItems: 'flex-start',
                      flexDirection: 'row',
                      marginBottom: 25,
                      marginTop: 20
                    }}>
                    <Theme.Text
                      style={{
                        marginTop: 60,
                        marginLeft: 5,
                        fontFamily: 'Poppins-ExtraBold',
                        fontSize: 35
                      }}>Mitteilungen</Theme.Text>
                    <TouchableOpacity
                      style={{
                          marginLeft: "auto",
                          alignSelf: 'flex-end',
                          marginBottom: 5,
                      }}
                      onPress={() => {
                        this.props.navigation.push('AllMessagesScreen', {
                          utils: this.props.utilsObject
                        })
                      }}>
                        <Theme.Text
                        color={"primary"}
                        style={{
                          
                          fontFamily: 'Poppins-SemiBold',
                          fontSize: 17
                        }}>Alle anzeigen</Theme.Text>
                    </TouchableOpacity>
                  </View>
                  : <View
                    style={{
                      paddingLeft: 15,
                      paddingRight: 15,
                      paddingTop: 70,
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                    <Image
                      style={{
                        marginTop: 40,
                        width: 250,
                        height: 200
                      }}
                      source={require('./../assets/img/messages_illustration.png')} />
                    <Theme.Text
                      style={{
                        marginTop: 40,
                        fontFamily: 'Poppins-ExtraBold',
                        fontSize: 30,
                        opacity: .5
                      }}>Keine Mitteilungen</Theme.Text>
                    <Theme.Text
                      style={{
                        textAlign: 'center',
                        marginTop: 20,
                        fontFamily: 'Poppins-Medium',
                        fontSize: 20,
                        opacity: .5
                      }}>Trete einem Verein bei, um Mitteilungen und Events anzuzeigen.</Theme.Text>
                    <Button style={{
                      marginTop: 20
                    }} color="selected_view" label="Verein beitreten" />
                  </View>
              }
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
    this.account_modal.close();
    this.props.navigation.navigate('NewMessageScreen', { utils: this.props.utilsObject });
  }

  componentWillUnmount() {
    if (this.state.eventsList)
      this.state.eventsList.stopEventsListener();
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
