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
import {withNavigation} from 'react-navigation';;
import {EventsList} from './../classes/EventsList.js';
import HeaderScrollView from './../components/HeaderScrollView.js';
import {useDarkMode} from 'react-native-dynamic'

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
class EventsScreen extends React.Component {
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
    this.state.eventsList = new EventsList(this.props.utilsObject);
    this.margin = new Animated.Value(0);

    this.state.eventsList.startEventsListener(function(event) {
      // events added
      if (this.state.events.indexOf(event) == -1) {
        const event_index = this.state.events.length;

        event.setRenderListerner(function(new_event) {
          console.log('event changed')
          this.state.events[event_index + 1] = new_event;
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
            marginTop={150}
            headlineFontSize={47}
            backButton={false}
            showHeadline={false}
            height={100}
            scrollY={this.state.scrollY}
            headline="Events"
            setNavbarPos={pos => {
              this.props.startNavbarAnimation(pos);
            }}
            ItemSeparatorComponent={Platform.OS !== 'android' && (({highlighted}) => (<View style={{
                backgroundColor: 'red',
                width: "100%",
                height: 5
              }}/>))}
            actionButton={this.state.account_type == 'manager'
              ? <TouchableOpacity onPress={() => this.openAddMessage()}>
                  <CIcon size={29} color="#F5F5F5" icon={faPlusCircle}/>
                </TouchableOpacity>
              : void 0}
            refreshControl={<RefreshControl refreshing = {
              this.state.refreshing
            } />
}
            flatList={<AnimatedFlatList
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
                this.state.eventsList._setLimit(10);
              }
            }
            onEndReachedThreshold = {
              100
            }
            initialNumToRender = {
              10
            }
            data = {
              this.state.events
            }
            renderItem = {
              ({item}) => {
                return item.getRenderForFlatList();
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

export default withNavigation(EventsScreen);
