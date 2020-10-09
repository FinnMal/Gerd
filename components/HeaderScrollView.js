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

function CView(props) {
  const isDarkMode = useDarkMode()
  return <View style={{
      backgroundColor: isDarkMode
        ? "#1C1C1E"
        : "#f7f2f2"
    }}>{props.children}</View>;
}

function CAnimatedView(props) {
  const isDarkMode = useDarkMode()
  return <Animated.View style={[
      props.style, {
        backgroundColor: isDarkMode
          ? "#1C1C1E"
          : "#f7f2f2"
      }
    ]}>{props.children}</Animated.View>;
}

function CText(props) {
  const isDarkMode = useDarkMode()
  return <Theme.Text style={[
      props.style, {
        color: isDarkMode
          ? "#f7f2f2"
          : "#1C1C1E"
      }
    ]}>{props.children}</Theme.Text>;
}

function CBlurView(props) {
  const s_width = Dimensions.get("window").width;
  const isDarkMode = useDarkMode()
  return (
    <BlurView
      blurType={isDarkMode
        ? "dark"
        : "regular"}
      blurAmount={10}
      reducedTransparencyFallbackColor="#121212"
      style={{
        width: s_width,
        height: s_width * 0.235,
        paddingTop: s_width * 0.115,
        flexWrap: "wrap",
        alignItems: "flex-start",
        flexDirection: "row",
        paddingBottom: 10
      }}/>
  );
}

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
        : new Animated.Value(0)
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

  _getHeadlineMarginTop = () => {
    const {scrollY, marginTop} = this.state;
    if (this.props.showHeadline !== false) {
      return this.state.scrollY.interpolate({
        inputRange: [
          -20, -20 + marginTop
        ],
        outputRange: [
          0, -15
        ],
        extrapolate: "clamp",
        useNativeDriver: true
      });
    } else {
      return this.state.scrollY.interpolate({
        inputRange: [
          -50, -80 + marginTop
        ],
        outputRange: [
          0, -15
        ],
        extrapolate: "clamp",
        useNativeDriver: true
      });
    }
  };

  _getHeadlineScale = () => {
    const {scrollY, headlineFontSize, marginTop} = this.state;
    if (this.props.showHeadline !== false) {
      return this.state.scrollY.interpolate({
        inputRange: [
          -140, -50
        ],
        outputRange: [
          1.25, 1
        ],
        extrapolate: "clamp",
        useNativeDriver: true
      });
    } else {
      return this.state.scrollY.interpolate({
        inputRange: [
          -50, -80 + marginTop
        ],
        outputRange: [
          1, headlineFontSize / 81
        ],
        extrapolate: "clamp",
        useNativeDriver: true
      });
    }
  };

  _getHeadlineMarginLeft = () => {
    const {scrollY, marginTop} = this.state;
    if (this.props.showHeadline !== false) {
      return this.state.scrollY.interpolate({
        inputRange: [
          -140, -50
        ],
        outputRange: [
          35, 0
        ],
        extrapolate: "clamp",
        useNativeDriver: true
      });
    } else {
      return this.state.scrollY.interpolate({
        inputRange: [
          -50, -80 + marginTop
        ],
        outputRange: [
          0, -50
        ],
        extrapolate: "clamp",
        useNativeDriver: true
      });
    }
  };

  _getBackgroundColorOpacity = () => {
    const {scrollY} = this.state;
    return this.state.scrollY.interpolate({
      inputRange: [
        -200, 20, 70
      ],
      outputRange: [
        //1, 1, 0.5
        1,
        1,
        1
      ],
      extrapolate: "clamp",
      useNativeDriver: true
    });
  };

  _getNavHeadlineOpacity = () => {
    const {scrollY, marginTop} = this.state;
    if (!this.state.showHeadlineJustInHeader) {
      return this.state.scrollY.interpolate({
        inputRange: [
          -50 + marginTop,
          -20 + marginTop
        ],
        outputRange: [
          0, 0.85
        ],
        extrapolate: "clamp",
        useNativeDriver: true
      });
    } else {
      return this.state.scrollY.interpolate({
        inputRange: [
          0, 1
        ],
        outputRange: [
          0.85, 0.85
        ],
        extrapolate: "clamp",
        useNativeDriver: true
      });
    }
  };

  _getActionButtonMarginLeft = () => {
    const {scrollY, marginTop} = this.state;
    return this.state.scrollY.interpolate({
      inputRange: [
        -50, -80 + marginTop
      ],
      outputRange: [
        40, 100
      ],
      extrapolate: "clamp",
      useNativeDriver: true
    });
  };

  _getActionButtonMarginTop = () => {
    const {scrollY, marginTop} = this.state;
    return this.state.scrollY.interpolate({
      inputRange: [
        -50, -80 + marginTop
      ],
      outputRange: [
        15, 0
      ],
      extrapolate: "clamp",
      useNativeDriver: true
    });
  };

  _getActionButtonScale = () => {
    const {scrollY, marginTop} = this.state;
    return this.state.scrollY.interpolate({
      inputRange: [
        -50, -80 + marginTop
      ],
      outputRange: [
        1, 0.8
      ],
      extrapolate: "clamp",
      useNativeDriver: true
    });
  };

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

  render() {
    const s_width = Dimensions.get("window").width;
    const s_height = Dimensions.get("window").height;

    const headlineScale = this._getHeadlineScale();
    const headlineMarginLeft = this._getHeadlineMarginLeft();
    const backgroundColorOpacity = this._getBackgroundColorOpacity();
    const headlineMarginTop = this._getHeadlineMarginTop();
    const navHeadlineOpacity = this._getNavHeadlineOpacity();

    const actionButtonMarginLeft = this._getActionButtonMarginLeft();
    const actionButtonMarginTop = this._getActionButtonMarginTop();
    const actionButtonScale = this._getActionButtonScale();

    const viewHeight = this._getViewHeight();
    return (
      <Theme.BackgroundView>
        {
          !this.state.hasFlatList
            ? <Animated.ScrollView
                ref={component => {
                  this._scrollView = component;
                  if (this.props.scrollToEnd && this._scrollView) 
                    this._scrollView.scrollToEnd({animated: true});
                  }}
                refreshControl={this.props.refreshControl}
                showsVerticalScrollIndicator={false}
                style={[{
                    marginTop: 0,
                    height: s_height * (this.state.height / 100),
                    //backgroundColor:
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
                  }}y >
                <View
                  style={{
                    marginBottom: 60,
                    marginTop: this.state.marginTop,
                    marginBottom: this.state.marginBottom,
                    marginLeft: 20,
                    marginRight: 20
                  }}>
                  {
                    this.props.showHeadline !== false && this.state.showHeadlineJustInHeader !== true
                      ? (
                        <View
                          style={{
                            flexWrap: "wrap",
                            alignItems: "flex-start",
                            flexDirection: "row"
                          }}>
                          <Theme.Text
                            style={{
                              transform: [
                                {
                                  scale: headlineScale
                                }
                              ],
                              marginBottom: 35,
                              marginLeft: headlineMarginLeft,
                              fontSize: this.state.headlineFontSize,
                              fontFamily: "Poppins-Bold",
                              color: "white",
                              opacity: 0.9
                            }}>
                            <Theme.Text>{this.props.headline}</Theme.Text>
                          </Theme.Text>

                          <View
                            style={{
                              zIndex: 2000,
                              position: "absolute",
                              marginTop: 1 - this.state.marginTop + 10,
                              marginLeft: s_width * 0.8
                            }}>
                            {
                              this.props.actionButton
                                ? this.props.actionButton
                                : void 0
                            }
                          </View>
                        </View>
                      )
                      : (void 0)
                  }
                  <View
                    onLayout={event => {
                      var {
                        x,
                        y,
                        width,
                        height
                      } = event.nativeEvent.layout;
                      if (this._scrollView) {
                        var enabled = height + y + 100 > Dimensions.get("window").height;
                        //if (!enabled) _scrollView.scrollTo({ x: 0, y: -200, animated: true });
                        this._scrollView.setNativeProps({scrollEnabled: enabled});
                      }
                    }}>
                    {this.props.children}
                  </View>
                </View>
              </Animated.ScrollView>
            : <CAnimatedView
                style={{
                  zIndex: -10,
                  marginTop: this.state.marginTop / 2,
                  height: viewHeight
                }}>
                {this.props.flatList}
              </CAnimatedView>
        }

        {
          this.state.showHeader
            ? <Animated.View
                style={{
                  flex: 1,
                  opacity: 1,
                  position: "absolute",
                  width: s_width
                }}>
                {
                  false
                    ? <CBlurView/>
                    : void 0
                }
                <CAnimatedView
                  style={{
                    position: "absolute",
                    opacity: backgroundColorOpacity,
                    width: s_width,
                    height: s_width * 0.235,
                    paddingTop: s_width * 0.115,
                    backgroundColor: "#F2F2F7",
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                    flexDirection: "row",
                    paddingBottom: 10
                  }}/>
                <View
                  style={{
                    position: "absolute",
                    width: s_width,
                    paddingTop: s_width * 0.115,
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                    flexDirection: "row",
                    paddingBottom: 10
                  }}/>
              </Animated.View>
            : void 0
        }
        <View
          style={{
            overflow: "hidden",
            marginTop: s_width * 0.115,
            position: "absolute",
            marginLeft: this.props.showHeadline === false
              ? 20
              : 0,
            justifyContent: this.props.showHeadline !== false
              ? "center"
              : "",
            alignItems: this.props.showHeadline !== false
              ? "center"
              : "",
            width: s_width
          }}>
          {
            this.props.showHeadline !== false
              ? (
                <Theme.Text
                  style={{
                    marginTop: 2,
                    fontSize: 22,
                    fontFamily: "Poppins-Bold",
                    color: "white",
                    opacity: navHeadlineOpacity
                  }}>
                  {this.props.headline}
                </Theme.Text>
              )
              : (
                <View
                  style={{
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                    flexDirection: "row"
                  }}>
                  <Theme.Text
                    style={{
                      marginTop: headlineMarginTop,
                      transform: [
                        {
                          scale: headlineScale
                        }
                      ],
                      marginBottom: 0,
                      marginLeft: headlineMarginLeft,
                      fontSize: this.state.headlineFontSize,
                      fontFamily: "Poppins-Bold",
                      color: "white",
                      opacity: 0.9
                    }}>
                    {this.props.headline}
                  </Theme.Text>

                  <Animated.View
                    style={{
                      zIndex: 100,
                      transform: [
                        {
                          scale: actionButtonScale
                        }
                      ],
                      marginTop: actionButtonMarginTop,
                      marginLeft: actionButtonMarginLeft
                    }}>
                    {
                      this.props.actionButton
                        ? this.props.actionButton
                        : void 0
                    }
                  </Animated.View>
                </View>
              )
          }
        </View>
        {
          this.state.backButton && this.state.showHeader
            ? (
              <TouchableOpacity
                style={{
                  opacity: 0.9,
                  position: "absolute",
                  zIndex: 100,
                  marginTop: s_width * 0.13,
                  marginLeft: 20
                }}
                onPress={() => this.props.navigation.goBack()}>
                <Theme.Icon size={27} color="white" icon={faChevronCircleLeft}/>
              </TouchableOpacity>
            )
            : (void 0)
        }
      </Theme.BackgroundView>
    );
  }
}

export default withNavigation(HeaderScrollView);
