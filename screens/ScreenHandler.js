import React from 'react';
import * as utils from './../utils.js';
import AutoHeightImage from 'react-native-auto-height-image';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
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
  RefreshControl
} from 'react-native';
import HomeScreen from './Home';
import EventsScreen from './Events';
import ManagmentScreen from './Managment';
import MessagesScreen from './Messages';
import SettingsScreen from './Settings';
import AddClubScreen from './AddClub';
import FirstStartScreen from './FirstStart';
import {ifIphoneX} from 'react-native-iphone-x-helper';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import {faHome, faUsers, faComment, faCog, faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import User from "./../classes/User.js";
import {useDarkMode} from 'react-native-dynamic'
import Toast from "./../components/Toast.js";
import {Theme} from './../app/index.js';
import ReactNativeHapticFeedback from "react-native-haptic-feedback"

function CStatusBar() {
  const isDarkMode = useDarkMode()
  return <StatusBar hidden={false} barStyle={isDarkMode
      ? "light-content"
      : "dark-content"}/>
}

function CView(props) {
  const isDarkMode = useDarkMode()
  return <View style={[
      {
        backgroundColor: isDarkMode
          ? "#121212"
          : "#C7C7CC"
      },
      props.style
    ]}>{props.children}</View>;
}

function CNavbar(props) {
  const isDarkMode = useDarkMode()
  return <View style={[
      {
        backgroundColor: isDarkMode
          ? "#3A3A3C"
          : "#F2F2F7"
      },
      props.style
    ]}>{props.children}</View>;
}

export default class ScreenHandler extends React.Component {
  navVisible: true;
  lastScrollPos: 0;
  AppContext = null;
  constructor() {
    super();
    this.animation_pos = 0;
    this.animation_end = 0;
    this.animation_up = true;
    this.animation_delay = 0;
    this.last_nav_id = -1;
    this.state = {
      refreshing: false,
      account_type: '',
      first_start_done: false,
      scrollViewEnabled: true,
      hole_margin: 0,
      nav: [
        {
          x: 0,
          active: true,
          moveTo: 'none'
        }, {
          x: 0,
          active: false,
          moveTo: 'none'
        }, {
          x: 0,
          active: false,
          moveTo: 'none'
        }, {
          x: 0,
          active: false,
          moveTo: 'none'
        }, {
          x: 0,
          active: false,
          moveTo: 'none'
        }
      ]
    };
    this.holeMargin = new Animated.Value(40);
    this.navbarMarginBottom = new Animated.Value(0);
    auth().onAuthStateChanged((function(user) {
      database().ref('users/' + user.uid + '/account_type').once('value', (function(snap) {
        if (!snap.val()) {
          // account does not exist
          console.log('account does not exist');
          this.props.navigation.navigate('FirstStartScreen', {
            utils: utils,
            uid: user.uid,
            onDone: this._onAuthDone.bind(this)
          });
        } else {
          // acount exists
          utils.setUser(new User(user.uid))
          utils.setUserID(user.uid);
          utils.setAccountType(snap.val());
          utils.setNavigation(this.props.navigation);
          this.AppContext = React.createContext(utils);
          this.state.nav[0].visible = true;
          this.state.first_start_done = true;
          this.state.account_type = snap.val();
          this.forceUpdate();
        }
      }).bind(this));
    }).bind(this));
  }

  _onAuthDone() {
    console.log('onDone');
    this.props.navigation.navigate('ScreenHandler');
    this.state.nav[0].visible = true;
    this.state.first_start_done = true;
    this.forceUpdate();
  }

  setScrollViewEnabled = data => {
    //_scrollView.setNativeProps({ scrollEnabled: data });
  };

  startNavbarAnimation = (pos, is_pos = true) => {
    var dir = '';
    if (is_pos && pos > 0) {
      if (this.lastScrollPos > pos) {
        dir = 'show';
      } else if (this.lastScrollPos < pos) {
        dir = 'hide';
      }
    } else 
      dir = pos;
    this.lastScrollPos = pos;

    if (dir == 'show' && !this.navVisible) {
      this.navbarMarginBottom.setValue(-100);
      Animated.timing(this.navbarMarginBottom, {
        useNativeDriver: false,
        toValue: 0,
        duration: 250,
        easing: Easing.ease
      }).start(() => {
        this.navVisible = true;
      });
    } else if (dir == 'hide' && this.navVisible) {
      this.navbarMarginBottom.setValue(0);
      Animated.timing(this.navbarMarginBottom, {
        useNativeDriver: false,
        toValue: -100,
        duration: 200,
        easing: Easing.ease
      }).start(() => {
        this.navVisible = false;
      });
    }
  };

  _onRefresh() {
    this.state.home_screen.doRefresh();
  }

  render() {
    var s = require('./../app/style');
    const numbers = [1, 2, 3, 4, 5];
    const {navigate} = this.props.navigation;
    const {goBack} = this.props.navigation;
    const navbarMarginBottom = this.navbarMarginBottom.interpolate({
      inputRange: [
        -100, 0
      ],
      outputRange: [-100, 0]
    });
    const marginLeft = this.holeMargin.interpolate({
      inputRange: [
        0, 2000
      ],
      outputRange: [0, 2000]
    });

    if (this.state.first_start_done) {
      return (
        <this.AppContext.Provider style={s.container}>
          <CStatusBar/>
          <Toast ref={(toast) => {
              utils.setToast(toast)
            }}/>
          <View style={{
              marginTop: 0
            }} showsHorizontalScrollIndicator={false} scrollEnabled={true}>
            <HomeScreen
              utilsObject={utils}
              startNavbarAnimation={this.startNavbarAnimation}
              setScrollViewEnabled={this.setScrollViewEnabled}
              moveTo={this.state.nav[0].moveTo}
              show={this.state.nav[0].active}/>
            <AddClubScreen utilsObject={utils} setScrollViewEnabled={this.setScrollViewEnabled} moveTo={this.state.nav[1].moveTo} show={this.state.nav[1].active}/>
            <ManagmentScreen utilsObject={utils} setScrollViewEnabled={this.setScrollViewEnabled} moveTo={this.state.nav[2].moveTo} show={this.state.nav[2].active}/>
            <MessagesScreen utilsObject={utils} setScrollViewEnabled={this.setScrollViewEnabled} moveTo={this.state.nav[3].moveTo} show={this.state.nav[3].active}/>
            <SettingsScreen utilsObject={utils} setScrollViewEnabled={this.setScrollViewEnabled} moveTo={this.state.nav[4].moveTo} show={this.state.nav[4].active}/>
          </View>

          <Theme.View style={[
              styles.navigationBar, {
                bottom: navbarMarginBottom
              }
            ]}>
            <View style={styles.navigationBarIcons}>
              <NavItem index={0} label="Home" icon={faHome} active={this.state.nav[0].active} navigate={this.navigate.bind(this)}/>
              <NavItem index={2} label="Clubs" icon={faUsers} active={this.state.nav[2].active} navigate={this.navigate.bind(this)}/>
              <NavItem index={3} label="Chats" icon={faComment} active={this.state.nav[3].active} navigate={this.navigate.bind(this)}/>
              <NavItem index={4} label="Settings" icon={faCog} active={this.state.nav[4].active} navigate={this.navigate.bind(this)}/>
            </View>
          </Theme.View>
        </this.AppContext.Provider>
      );
    } else {
      //<NavItem index={2} label="Hinzufügen" icon={faPlusCircle} active={this.state.nav[2].active} navigate={this.navigate.bind(this)}/>
      return null;
    }
  }

  navigate(id) {
    if (this.last_nav_id != id) {
      for (var i = 0; i < 5; i++) {
        if (id != i) {
          this.state.nav[i].active = false;
        } else {
          this.state.nav[i].active = true;
        }
        this.forceUpdate();
      }
      this.last_nav_id = id;
    }
  }

  navigateLeft() {
    if (this.last_nav_id < 3) 
      this.navigate(this.last_nav_id + 1);
    }
  
  navigateRight() {
    if (this.last_nav_id > 0) 
      this.navigate(this.last_nav_id - 1);
    }
  }

//Styles
const styles = StyleSheet.create({
  navigationBar: {
    ...ifIphoneX({
      height: 84
    }, {height: 60}),
    position: 'absolute',
    width: '100%',

    shadowColor: '#3A3A3C',
    shadowOffset: {
      width: 0,
      height: 9
    },
    shadowOpacity: 0.58,
    shadowRadius: 20.00,

    elevation: 30,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    position: 'absolute',
    width: '100%'
  },
  navigationBarIcons: {
    marginLeft: 15,
    flexDirection: 'row',
    width: '92%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  navigationBarIcon: {
    opacity: 0.90
  }
});

class NavItem extends React.Component {
  iconScale = new Animated.Value(1);
  animationDuration = 150;

  constructor(props) {
    super(props);

    this.state = {
      active: false,
      index: this.props.index,
      label_width: -1
    }
    this.color = "#0B84FF"
  }

  _getIconScale() {
    return this.iconScale.interpolate({
      inputRange: [
        1, 50, 100
      ],
      outputRange: [
        1, 0.9, 1
      ],
      extrapolate: 'clamp',
      useNativeDriver: true
    });
  }

  _navigate() {
    ReactNativeHapticFeedback.trigger("impactLight");
    this.iconScale.setValue(1);
    Animated.timing(this.iconScale, {
      useNativeDriver: false,
      toValue: 100,
      duration: 150,
      easing: Easing.ease
    }).start();
    this.props.navigate(this.state.index);
    this.props.active = true;
    this.forceUpdate();
  }

  render() {
    return (
      <TouchableOpacity
        onPress={() => this._navigate()}
        style={{
          height: 90,
          width: 80,
          paddingTop: 8,
          paddingBottom: 8,
          flexWrap: 'wrap',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <Animated.View style={{
            transform: [
              {
                scale: this._getIconScale()
              }
            ]
          }}>
          <Theme.Icon
            style={{
              marginTop: 11,
              alignSelf: 'flex-start',
              opacity: 1
            }}
            size={27}
            color={this.props.active
              ? 'primary'
              : 'inacitve'}
            icon={this.props.icon}/>
        </Animated.View>
      </TouchableOpacity>
    );
  }
}
