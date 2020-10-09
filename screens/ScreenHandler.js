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
          moveTo: 'none',
          iconColor: 'white'
        }, {
          x: 0,
          active: false,
          moveTo: 'none',
          iconColor: 'white'
        }, {
          x: 0,
          active: false,
          moveTo: 'none',
          iconColor: 'white'
        }, {
          x: 0,
          active: false,
          moveTo: 'none',
          iconColor: 'white'
        }, {
          x: 0,
          active: false,
          moveTo: 'none',
          iconColor: 'white'
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
            <ManagmentScreen utilsObject={utils} setScrollViewEnabled={this.setScrollViewEnabled} moveTo={this.state.nav[1].moveTo} show={this.state.nav[1].active}/>
            <AddClubScreen utilsObject={utils} setScrollViewEnabled={this.setScrollViewEnabled} moveTo={this.state.nav[2].moveTo} show={this.state.nav[2].active}/>
            <MessagesScreen utilsObject={utils} setScrollViewEnabled={this.setScrollViewEnabled} moveTo={this.state.nav[3].moveTo} show={this.state.nav[3].active}/>
            <SettingsScreen utilsObject={utils} setScrollViewEnabled={this.setScrollViewEnabled} moveTo={this.state.nav[4].moveTo} show={this.state.nav[4].active}/>
          </View>

          <Animated.View style={[
              styles.navigationBar, {
                bottom: navbarMarginBottom
              }
            ]}>
            <CNavbar style={styles.navigationBarWhiteBackground}/>

            <Animated.View style={{
                marginLeft
              }}>
              <View style={styles.navigatonBarMarker}/>
            </Animated.View>
            <View style={styles.navigationBarIcons}>
              <NavItem index={0} label="Home" icon={faHome} active={this.state.nav[0].active} navigate={this.navigate.bind(this)}/>
              <NavItem index={1} label="Clubs" icon={faUsers} active={this.state.nav[1].active} navigate={this.navigate.bind(this)}/>
              <NavItem index={3} label="Chats" icon={faComment} active={this.state.nav[3].active} navigate={this.navigate.bind(this)}/>
              <NavItem index={4} label="Settings" icon={faCog} active={this.state.nav[4].active} navigate={this.navigate.bind(this)}/>
            </View>
          </Animated.View>
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
          this.state.nav[i].iconColor = '#B4B7CB';
          this.state.nav[i].active = false;
        } else {
          this.state.nav[i].iconColor = '#474E80';
          this.state.nav[i].active = true;
        }
      }

      this.forceUpdate();
      /*
      this.holeMargin.setValue(this.state.hole_margin);
      Animated.timing(this.holeMargin, {
        useNativeDriver: false,
        toValue: this.state.nav[id].x + 47.5,
        duration: 120,
        easing: Easing.ease
      }).start(() => {
        /*for (var i = 0; i < 5; i++) {
          if (id != i) {
            this.state.nav[i].iconColor = '#B4B7CB';
          } else {
            this.state.nav[i].iconColor = '#474E80';
          }
        }
        */

      // this.forceUpdate(); }); if(this.last_nav_id > id) this.state.nav[id].moveTo = "left" else this.state.nav[id].moveTo = "right" this.state.hole_margin =
      // this.state.nav[id].x + 47.5; this.forceUpdate();
    }
    this.last_nav_id = id;
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
      height: 105
    }, {height: 94}),
    position: 'absolute',
    width: '100%',

    shadowColor: '#3A3A3C',
    shadowOffset: {
      width: 0,
      height: 9
    },
    shadowOpacity: 0.58,
    shadowRadius: 20.00,

    elevation: 30
  },
  navigatonBarMarker: {
    marginTop: 71,
    //marginTop: 33,
    opacity: 0.5,
    backgroundColor: 'white',
    width: 30,
    height: 0,
    borderRadius: 22
  },
  navigationBarWhiteBackground: {
    borderRadius: 0,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    position: 'absolute',
    marginTop: 25,
    height: 80,
    width: '100%'
  },
  navigationBarIcons: {
    marginLeft: 15,
    flexDirection: 'row',
    width: '92%',
    marginTop: 35,
    position: 'absolute'
  },
  navigationBarIcon: {
    opacity: 0.90
  }
});

class NavItem extends React.Component {
  textOpacity = new Animated.Value(0);
  marginLeft = new Animated.Value(35);
  marginRight = new Animated.Value(0);
  touchableWidth = new Animated.Value(50);

  animationDuration = 150;

  constructor(props) {
    super(props);

    this.state = {
      active: false,
      index: this.props.index,
      label_width: -1
    }

    this.color = "#8ac926";
    if (this.state.index == 0) 
      this.color = "#8ac926";
    else if (this.state.index == 1) 
      this.color = "#ff595e";
    else if (this.state.index == 2) 
      this.color = "#ff595e";
    else if (this.state.index == 3) 
      this.color = "#6a4c93";
    else if (this.state.index == 4) 
      this.color = "#1982c4";
    else if (this.state.index == 5) 
      this.color = "#1982c4";
    
    this._startHideAnimation();
  }

  _navigate() {
    this.props.navigate(this.state.index)
  }

  _startShowAnimation() {
    this.state.active = true;
    this.forceUpdate();
    this.textOpacity.setValue(0);
    Animated.timing(this.textOpacity, {
      useNativeDriver: false,
      toValue: 1,
      duration: this.animationDuration + this.animationDuration * 0.2,
      easing: Easing.ease
    }).start();

    this.marginLeft.setValue(25);
    Animated.timing(this.marginLeft, {
      useNativeDriver: false,
      toValue: 5,
      duration: this.animationDuration,
      easing: Easing.ease
    }).start();

    this.marginRight.setValue(0);
    Animated.timing(this.marginRight, {
      useNativeDriver: false,
      toValue: -20,
      duration: this.animationDuration,
      easing: Easing.ease
    }).start();

    this.touchableWidth.setValue(50);
    Animated.timing(this.touchableWidth, {
      useNativeDriver: false,
      toValue: 60 + this.state.label_width,
      duration: this.animationDuration,
      easing: Easing.ease
    }).start();
  }

  _startHideAnimation() {
    this.state.active = false;
    this.forceUpdate();
    this.textOpacity.setValue(1);
    Animated.timing(this.textOpacity, {
      useNativeDriver: false,
      toValue: 0,
      duration: this.animationDuration - this.animationDuration * 0.2,
      easing: Easing.ease
    }).start();

    this.marginLeft.setValue(5);
    Animated.timing(this.marginLeft, {
      useNativeDriver: false,
      toValue: 25,
      duration: this.animationDuration,
      easing: Easing.ease
    }).start();

    this.marginRight.setValue(-20);
    Animated.timing(this.marginRight, {
      useNativeDriver: false,
      toValue: 0,
      duration: this.animationDuration,
      easing: Easing.ease
    }).start();

    this.touchableWidth.setValue(60 + this.state.label_width);
    Animated.timing(this.touchableWidth, {
      useNativeDriver: false,
      toValue: 50,
      duration: this.animationDuration,
      easing: Easing.ease
    }).start();
  }

  render() {
    if (this.state.active != this.props.active) {
      if (this.props.active) 
        this._startShowAnimation();
      else 
        this._startHideAnimation();
      }
    
    const textOpacity = this.textOpacity.interpolate({
      inputRange: [
        0, 1
      ],
      outputRange: [0, 1]
    });

    const backgroundOpacity = this.textOpacity.interpolate({
      inputRange: [
        0, 1
      ],
      outputRange: [0, .24]
    });

    const touchableWidth = this.touchableWidth.interpolate({
      inputRange: [
        0, 100
      ],
      outputRange: [0, 100]
    });

    const marginLeft = this.marginLeft.interpolate({
      inputRange: [
        0, 100
      ],
      outputRange: [0, 100]
    });

    const marginRight = this.marginRight.interpolate({
      inputRange: [
        0, 100
      ],
      outputRange: [0, 100]
    });
    return (
      <View>
        <Animated.View
          style={{
            width: 50,
            //width: touchableWidth,
            marginLeft: 20,
            marginRight: 0
            //marginLeft: marginLeft, marginRight: marginRight
          }}>
          <TouchableOpacity
            onPress={() => this._navigate()}
            style={{
              paddingTop: 8,
              paddingBottom: 8,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              flexDirection: 'row'
            }}>
            <Animated.View
              style={{
                height: 43,
                width: 50,
                //width: touchableWidth,
                borderRadius: 30,
                marginLeft: 0,
                position: "absolute",
                //backgroundColor: this.color,
                opacity: backgroundOpacity
              }}/>
            <Animated.View style={{
                marginLeft: 10,
                alignSelf: 'flex-start'
              }}>
              <FontAwesomeIcon
                style={{
                  opacity: 1
                }}
                size={27}
                color={this.props.active
                  ? this.color
                  : "#B4B7CB"}
                icon={this.props.icon}/>
            </Animated.View>
            {
              false
                ? <Animated.Text
                    style={{
                      position: "absolute",
                      opacity: textOpacity,
                      fontSize: 17,
                      marginTop: 12,
                      marginLeft: 45,
                      fontFamily: "Poppins-Medium",
                      color: this.color
                    }}
                    onLayout={(event) => {
                      if (this.state.label_width == -1) {
                        this.state.label_width = event.nativeEvent.layout.width;
                        if (this.state.active) 
                          this._startShowAnimation()
                        this.forceUpdate();
                      }
                    }}>{this.props.label}</Animated.Text>
                : void 0
            }

          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }
}
