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
import {faPlusCircle} from '@fortawesome/free-solid-svg-icons';
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

    /*
    database().ref('clubs/1/messages').push({
      author: "AhSvoMpELzZZwAi3qpycJuBkoU23",
      groups: {
        z_jugend: true
      },
      headline: "Lorem ipsum dolor sit",
      img: "https://firebasestorage.googleapis.com/v0/b/gerd-eu.appspot.com/o/userfiles%2FAhSvoMpELzZZwAi3qpycJuBkoU23%2Fimage_1601306147185.jpg?alt=media&token=443ed659-" +
          "a99b-4c16-9dac-ac1162ec5d12",
      img_thumbnail: "https://firebasestorage.googleapis.com/v0/b/gerd-eu.appspot.com/o/userfiles%2FAhSvoMpELzZZwAi3qpycJuBkoU23%2Fimage_1601306147185.jpg?alt=media&token=443ed659-" +
          "a99b-4c16-9dac-ac1162ec5d12",
      long_text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At" +
          " vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor si" +
          "t amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam" +
          " et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur s" +
          "adipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolore" +
          "s et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum iriure dolor in hendrerit in vulputate ve" +
          "lit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril " +
          "delenit augue duis dolore te feugait nulla facilisi. ipsum dolor sit amet,",
      send_at: new Date().getTime() / 1000,
      short_text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At" +
          " vero eos et accusam et"
    });
    */

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
          console.log('event changed')
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
    return (
      <Theme.BackgroundView
        style={{
          backgroundColor: "white",
          //borderTopRightRadius: 55, borderBottomRightRadius: 55,
          paddingBottom: 15
        }}>
        <View style={{
            flex: 1,
            flexWrap: 'wrap',
            flexDirection: 'row',
            width: "100%"
          }}>
          <View >
            <Theme.Text
              color={"primary"}
              style={{
                marginTop: 20,
                opacity: .8,
                marginLeft: 20,
                textTransform: 'uppercase',
                fontFamily: 'Poppins-SemiBold',
                fontSize: 17
              }}>Sonntag, 23. Mai</Theme.Text>
            <Theme.Text
              style={{
                marginTop: -3,
                opacity: 0.9,
                marginLeft: 20,
                fontFamily: 'Poppins-ExtraBold',
                fontSize: 41
              }}>Heute</Theme.Text>
          </View>
          <Image
            source={{
              url: this.state.utils.getUser().getImage()
            }}
            style={{
              marginLeft: "auto",
              alignSelf: 'flex-end',
              borderRadius: 47,
              height: 47,
              width: 47,
              marginRight: 20,
              marginBottom: 5
            }}/>
        </View>
        <Swiper data={this.state.events} style={{
            marginTop: 25
          }} autoplay={false}></Swiper>
        <View style={{
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            flexDirection: 'row',
            marginBottom: 10
          }}>
          <Theme.Text
            style={{
              marginTop: 60,
              marginLeft: 20,
              fontFamily: 'Poppins-Bold',
              fontSize: 33
            }}>Mitteilungen</Theme.Text>
          <Theme.Text
            color={"primary"}
            style={{
              marginLeft: "auto",
              alignSelf: 'flex-end',
              opacity: .8,
              marginRight: 20,
              marginBottom: 5,
              fontFamily: 'Poppins-SemiBold',
              fontSize: 16
            }}>Alle anzeigen</Theme.Text>
        </View>
      </Theme.BackgroundView>
    )
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

    if (this.props.show) {
      return (
        <View style={{
            height: s_height
          }}>
          <HeaderScrollView
            onRef={view => {
              this.headerScrollView = view;
              if (view) {
                this._onFlatListScroll = view.getScrollCallback();
              }
            }}
            marginTop={90}
            showHeader={false}
            height={100}
            scrollY={this.state.scrollY}
            setNavbarPos={pos => {
              this.props.startNavbarAnimation(pos);
            }}
            refreshControl={<RefreshControl refreshing = {
              this.state.refreshing
            }
            onRefresh = {
              this.doRefresh.bind(this)
            } />
}
            flatList={<AnimatedFlatList
            ListHeaderComponent = {
              this._getHeaderListView()
            }
            scrollEventThrottle = {
              16
            }
            onScroll = {
              Animated.event([
                {
                  nativeEvent: {
                    contentOffset: {
                      y: this.state.scrollY
                    }
                  }
                }
              ], {
                useNativeDriver: false,
                listener: event => this.headerScrollView._onScroll(event.nativeEvent.contentOffset.y)
              })
            }
            onEndReached = {
              () => {
                this.state.messagesList._setLimit(10);
              }
            }
            onEndReachedThreshold = {
              100
            }
            initialNumToRender = {
              10
            }
            data = {
              this.state.messages
            }
            renderItem = {
              ({item}) => {
                return item.getRender();
              }
            }
            keyExtractor = {
              (item, index) => index.toString()
            }
            />
            }
          /></View>
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
