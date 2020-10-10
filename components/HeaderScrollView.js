import React from "react";
import AutoHeightImage from "react-native-auto-height-image";
import {
  Alert,
  TextInput,
  StyleSheet,
  Text,
  StatusBar,
  Image,
  Button,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  ActionSheetIOS,
  Switch,
  ActivityIndicator,
  ImageBackground,
  View
} from "react-native";
import {BlurView} from "@react-native-community/blur";
import {withNavigation} from "react-navigation";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {
  faPlus,
  faChevronCircleLeft,
  faLayerGroup,
  faLock,
  faEllipsisV,
  faExclamationCircle,
  faQrcode,
  faTimesCircle,
  faPlusCircle,
  faInfoCircle,
  faCheck,
  faChevronLeft
} from "@fortawesome/free-solid-svg-icons";
import {useDarkMode} from 'react-native-dynamic'
import {Theme} from './../app/index.js';

class HeaderScrollView extends React.Component {
  lastScrollTick: 0;
  isDarkMode: false;

  viewHeight = null;
  constructor(props) {
    super(props);

    //this.isDarkMode =
    this.viewHeight = new Animated.Value(
      this.props.height
        ? this.props.height
        : 100
    );
    this.state = {
      lastScrollTick: 0,
      headlineFontSize: this.props.headlineFontSize > 0
        ? this.props.headlineFontSize
        : 40,
      marginTop: this.props.marginTop != undefined
        ? this.props.marginTop
        : 50,
      marginBottom: this.props.marginBottom != undefined
        ? this.props.marginBottom
        : 0,
      backButton: this.props.backButton !== false,
      height: this.props.height
        ? this.props.height
        : 100,
      showHeadlineJustInHeader: this.props.showHeadlineJustInHeader === true,
      showHeader: this.props.showHeader === false
        ? false
        : true,
      hasFlatList: this.props.flatList != null,
      flatList: this.props.flatList,
      keyboardVisibleHeight: this.props.keyboardVisibleHeight
        ? this.props.keyboardVisibleHeight
        : 0,
      scrollY: this.props.scrollY
        ? this.props.scrollY
        : new Animated.Value(0),
      blur_view_height: 20
    };
  }

  getScrollCallback() {
    return Animated.event([
      {
        nativeEvent: {
          contentOffset: {
            y: this.state.scrollY
          }
        }
      }
    ], {
      useNativeDriver: false,
      listener: event => this._onScroll(event.nativeEvent.contentOffset.y)
    }).bind(this);
  }

  componentDidMount() {
    if (this.props.onRef != null) {
      this.props.onRef(this)
    }
  }

  _getViewHeight = () => {
    const s_height = Dimensions.get("window").height;
    const {height, marginTop} = this.state;
    return this.viewHeight.interpolate({
      inputRange: [
        0, 100
      ],
      outputRange: [
        0, s_height
      ],
      extrapolate: "clamp",
      useNativeDriver: true
    });

  }

  keyboardDidShow() {
    this.viewHeight.setValue(this.state.height);
    Animated.timing(this.viewHeight, {
      useNativeDriver: false,
      toValue: this.state.keyboardVisibleHeight,
      duration: 150,
      easing: Easing.ease
    }).start(() => {});
  }

  keyboardDidHide() {
    this.viewHeight.setValue(this.state.keyboardVisibleHeight);
    Animated.timing(this.viewHeight, {
      useNativeDriver: false,
      toValue: this.state.height,
      duration: 150,
      easing: Easing.ease
    }).start(() => {});
  }

  _onScroll(y) {
    console.log(y);
    this.forceUpdate();
    if (this.props.setNavbarPos || this.props.loadItems) {
      var curTime = new Date().getTime();
      if (curTime > this.state.lastScrollTick + (
        this.props.callbackTick
          ? this.props.callbackTick
          : 300
      )) {
        this.state.lastScrollTick = curTime;
        if (this.props.setNavbarPos) 
          this.props.setNavbarPos(y);
        if (this.props.loadItems) 
          this.props.loadItems();
        }
      }
  }

  _getHeaderHeadlineOpacity = () => {
    const {scrollY, marginTop} = this.state;
    return this.state.scrollY.interpolate({
      inputRange: [
        0, 40
      ],
      outputRange: [
        0, 0.9
      ],
      extrapolate: "clamp",
      useNativeDriver: true
    });
  };

  render() {
    const s_width = Dimensions.get("window").width;
    const s_height = Dimensions.get("window").height;

    const viewHeight = this._getViewHeight();
    return (
      <Theme.BackgroundView>

        <Animated.ScrollView
          ref={component => {
            this._scrollView = component;
            if (this.props.scrollToEnd && this._scrollView) 
              this._scrollView.scrollToEnd({animated: true});
            }}
          refreshControl={this.props.refreshControl}
          showsVerticalScrollIndicator={false}
          style={[{
              paddingLeft: 15,
              paddingRight: 15,
              height: s_height * (this.state.height / 100)
            }
          ]}
          onLayout={event => {
            var {
              x,
              y,
              width,
              height
            } = event.nativeEvent.layout;
            console.log("HEIGHT: " + height)
          }}
          onScroll={this.getScrollCallback()}
          onContentSizeChange={() => {
            if (this._scrollView && this.props.scrollToEnd) 
              this._scrollView.scrollToEnd({animated: true});
            }}>
          {
            this.state.showHeader
              ? <View
                  style={{
                    zIndex: 100,
                    marginTop: this.state.blur_view_height / 1.2,
                    marginBottom: 30,
                    flexWrap: "wrap",
                    flexDirection: "row"
                  }}>
                  <Theme.Text
                    style={{
                      marginRight: 'auto',
                      alignSelf: 'flex-start',
                      fontSize: this.state.headlineFontSize,
                      fontFamily: "Poppins-ExtraBold",
                      opacity: 0.87
                    }}>
                    {this.props.headline}
                  </Theme.Text>
                  {
                    this.props.actionButton
                      ? this.props.actionButton
                      : void 0
                  }
                </View>
              : void 0
          }

          <Theme.BackgroundView
            style={{
              marginTop: !this.props.showHeader
                ? 10
                : this.state.blur_view_height
            }}
            onLayout={event => {
              var {
                x,
                y,
                width,
                height
              } = event.nativeEvent.layout;
              if (this._scrollView) {
                var enabled = height + y + 100 > Dimensions.get("window").height;
                this._scrollView.setNativeProps({scrollEnabled: enabled});
              }
            }}>
            {this.props.children}
          </Theme.BackgroundView>
        </Animated.ScrollView>

        <Theme.BlurView
          style={{
            minHeight: 40,
            position: "absolute",
            width: s_width
          }}
          onLayout={event => {
            var {
              x,
              y,
              width,
              height
            } = event.nativeEvent.layout;
            console.log("BLURVIEW HEIGHT: " + height);
            this.state.blur_view_height = height;
            this.forceUpdate();
          }}>
          {
            this.state.backButton
              ? <View
                  style={{
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    flexDirection: 'row',
                    marginTop: 40,
                    marginLeft: 20,
                    paddingTop: 5,
                    paddingBottom: 13
                  }}>
                  <TouchableOpacity style={{
                      zIndex: 100
                    }} onPress={() => this.props.navigation.goBack()}>
                    <Theme.Icon style={{
                        opacity: .96
                      }} icon={faChevronCircleLeft} size={25}/>
                  </TouchableOpacity>
                  <View
                    style={{
                      flex: 1,
                      marginTop: 4,
                      position: "absolute",
                      justifyContent: 'center',
                      width: s_width * .89,
                      alignItems: 'center'
                    }}>
                    <Theme.Text
                      style={{
                        fontSize: 23,
                        fontFamily: 'Poppins-Bold',
                        opacity: this._getHeaderHeadlineOpacity()
                      }}>{this.props.headline}</Theme.Text>
                  </View>
                </View>

              : void 0
          }</Theme.BlurView>
      </Theme.BackgroundView>
    );
  }
}

export default withNavigation(HeaderScrollView);
