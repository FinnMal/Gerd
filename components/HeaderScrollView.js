import React from "react";
import AutoHeightImage from "react-native-auto-height-image";
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
  ActionSheetIOS,
  Switch,
  ActivityIndicator,
  ImageBackground
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

class HeaderScrollView extends React.Component {
  lastScrollTick: 0;
  constructor(props) {
    super(props);

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
      scrollY: new Animated.Value(0)
    };
  }

  _getHeadlineMarginTop = () => {
    const {scrollY, marginTop} = this.state;
    if (this.props.showHeadline !== false) {
      return scrollY.interpolate({
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
      return scrollY.interpolate({
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
      return scrollY.interpolate({
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
      return scrollY.interpolate({
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
      return scrollY.interpolate({
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
      return scrollY.interpolate({
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
    return scrollY.interpolate({
      inputRange: [
        -200, 20, 70
      ],
      outputRange: [
        1, 1, 0.5
      ],
      extrapolate: "clamp",
      useNativeDriver: true
    });
  };

  _getNavHeadlineOpacity = () => {
    const {scrollY, marginTop} = this.state;
    return scrollY.interpolate({
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
  };

  _getActionButtonMarginLeft = () => {
    const {scrollY, marginTop} = this.state;
    return scrollY.interpolate({
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
    return scrollY.interpolate({
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
    return scrollY.interpolate({
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

    return (
      <View>
        <Animated.ScrollView
          ref={component => (_scrollView = component)}
          refreshControl={this.props.refreshControl}
          showsVerticalScrollIndicator={false}
          style={[{
              marginTop: 0,
              height: s_height * (this.state.height / 100),
              backgroundColor: "#121212"
            }
          ]}
          onLayout={event => {
            var {
              x,
              y,
              width,
              height
            } = event.nativeEvent.layout;
          }}
          onScroll={Animated.event([
            {
              nativeEvent: {
                contentOffset: {
                  y: this.state.scrollY
                }
              }
            }
          ], {
            useNativeDriver: false,
            listener: event => {
              if (this.props.setNavbarPos) {
                var curTime = new Date().getTime();
                if (curTime > this.state.lastScrollTick + 300) {
                  this.state.lastScrollTick = curTime;
                  this.props.setNavbarPos(event.nativeEvent.contentOffset.y);
                }
              }
            }
          })}>
          <View
            style={{
              marginBottom: 60,
              marginTop: this.state.marginTop,
              marginBottom: this.state.marginBottom,
              marginLeft: 20,
              marginRight: 20
            }}>
            {
              this.props.showHeadline !== false
                ? (
                  <View
                    style={{
                      flexWrap: "wrap",
                      alignItems: "flex-start",
                      flexDirection: "row"
                    }}>
                    <Animated.Text
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
                      {this.props.headline}
                    </Animated.Text>

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
                if (_scrollView) {
                  var enabled = height + y + 100 > Dimensions.get("window").height;
                  //if (!enabled) _scrollView.scrollTo({ x: 0, y: -200, animated: true });
                  _scrollView.setNativeProps({scrollEnabled: enabled});
                }
              }}>
              {this.props.children}
            </View>
          </View>
        </Animated.ScrollView>
        <Animated.View style={{
            flex: 1,
            opacity: 1,
            position: "absolute",
            width: s_width
          }}>
          <BlurView
            blurType="dark"
            blurAmount={1}
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

          <Animated.View
            style={{
              position: "absolute",
              opacity: backgroundColorOpacity,
              backgroundColor: "#121212",
              width: s_width,
              height: s_width * 0.235,
              paddingTop: s_width * 0.115,
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
                <Animated.Text
                  style={{
                    marginTop: 2,
                    fontSize: 22,
                    fontFamily: "Poppins-Bold",
                    color: "white",
                    opacity: navHeadlineOpacity
                  }}>
                  {this.props.headline}
                </Animated.Text>
              )
              : (
                <View
                  style={{
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                    flexDirection: "row"
                  }}>
                  <Animated.Text
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
                  </Animated.Text>

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
          this.state.backButton
            ? (
              <TouchableOpacity
                style={{
                  opacity: 0.9,
                  position: "absolute",
                  zIndex: 100,
                  marginTop: s_width * 0.12,
                  marginLeft: 20
                }}
                onPress={() => this.props.navigation.goBack()}>
                <FontAwesomeIcon size={27} color="white" icon={faChevronCircleLeft}/>
              </TouchableOpacity>
            )
            : (void 0)
        }
      </View>
    );
  }
}

export default withNavigation(HeaderScrollView);
