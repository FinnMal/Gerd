import React, {Component} from "react";
import PropTypes from "prop-types";
import {
  View,
  KeyboardAvoidingView,
  Modal,
  TouchableOpacity,
  Animated,
  PanResponder,
  Platform
} from "react-native";
import Button from './Button.js'
import {Theme} from './../app/index.js';

const SUPPORTED_ORIENTATIONS = ["portrait", "portrait-upside-down", "landscape", "landscape-left", "landscape-right"];

/* BOTTOMSHEET class: component for bottom sheet
modifyed for this project, based on:
https://github.com/nysamnang/react-native-raw-bottom-sheet
*/
class BottomSheet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      animatedHeight: new Animated.Value(-400),
      animatedOpacity: new Animated.Value(0),
      pan: new Animated.ValueXY()
    };

    this.createPanResponder(props);
  }

  setModalVisible(visible, props) {
    const {
      height,
      minClosingHeight,
      openDuration,
      closeDuration,
      onClose,
      onOpen
    } = this.props;
    const {animatedHeight, animatedOpacity, pan} = this.state;
    if (visible) {
      this.setState({modalVisible: visible});
      if (typeof onOpen === "function") 
        onOpen(props);
      Animated.timing(animatedHeight, {
        useNativeDriver: false,
        toValue: 0,
        duration: openDuration
      }).start();
      Animated.timing(animatedOpacity, {
        useNativeDriver: false,
        toValue: 1,
        duration: 75
      }).start();
    } else {
      Animated.timing(animatedOpacity, {
        useNativeDriver: false,
        toValue: 0,
        duration: closeDuration
      }).start();
      Animated.timing(animatedHeight, {
        useNativeDriver: false,
        toValue: 0 - this.props.height,
        duration: closeDuration
      }).start(() => {
        pan.setValue({x: 0, y: 0});
        this.setState({modalVisible: visible, animatedHeight: new Animated.Value(-400), animatedOpacity: new Animated.Value(0)});

        if (typeof onClose === "function") 
          onClose(props);
        }
      );
    }
  }

  createPanResponder(props) {
    const {closeOnDragDown, height} = props;
    const {pan} = this.state;
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => closeOnDragDown,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy > 0) {
          Animated.event([
            null, {
              dy: pan.y
            }
          ], {useNativeDriver: false})(e, gestureState);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (height / 4 - gestureState.dy < 0) {
          this.setModalVisible(false);
        } else {
          Animated.spring(pan, {
            toValue: {
              x: 0,
              y: 0
            },
            useNativeDriver: false
          }).start();
        }
      }
    });
  }

  // show sheet
  open(props) {
    this.setModalVisible(true, props);
  }

  // hide sheet
  close(props) {
    this.setModalVisible(false, props);
  }

  // done button callback
  _onDone() {
    this.close()
    if (this.props.onDone) 
      this.props.onDone()
  }

  render() {
    const {
      animationType,
      closeOnDragDown,
      dragFromTopOnly,
      closeOnPressMask,
      closeOnPressBack,
      children,
      customStyles,
      keyboardAvoidingViewEnabled
    } = this.props;
    const {animatedHeight, animatedOpacity, pan, modalVisible} = this.state;
    const panStyle = {
      transform: pan.getTranslateTransform()
    };

    const AnimatedKeyboardAvoidingView = Animated.createAnimatedComponent(KeyboardAvoidingView)

    return (
      <Modal
        transparent="transparent"
        visible={modalVisible}
        supportedOrientations={SUPPORTED_ORIENTATIONS}
        onRequestClose={() => {
          if (closeOnPressBack) 
            this.setModalVisible(false);
          }}>

        <AnimatedKeyboardAvoidingView
          enabled={keyboardAvoidingViewEnabled}
          behavior="padding"
          style={[
            {
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            },
            customStyles.wrapper, {
              opacity: animatedOpacity
            }
          ]}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "transparent"
            }}
            activeOpacity={1}
            onPress={() => (
              closeOnPressMask
                ? this.close()
                : null
            )}/>
        </AnimatedKeyboardAvoidingView>
        <Theme.View
          color={'view'}
          {...(!dragFromTopOnly && this.panResponder.panHandlers)}
          style={[
            panStyle, {
              height: this.props.height - 20,
              marginTop: -20,
              marginBottom: animatedHeight,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 20,
              width: "100%",
              overflow: "hidden"
            }
          ]}>
          {
            closeOnDragDown && (
              <View
                {...(dragFromTopOnly && this.panResponder.panHandlers)}
                style={{
                  width: "100%",
                  alignItems: "center",
                  backgroundColor: "transparent"
                }}>
                <View
                  style={[
                    {
                      width: 35,
                      height: 5,
                      borderRadius: 5,
                      margin: 10,
                      backgroundColor: "#ccc"
                    },
                    customStyles.draggableIcon
                  ]}/>
              </View>
            )
          }
          {
            this.props.label
              ? <Theme.Text
                  style={{
                    marginTop: -17,
                    fontFamily: 'Poppins-Bold',
                    fontSize: 19,
                    opacity: 0.85
                  }}>{this.props.label}</Theme.Text>
              : void 0
          }

          {children}
          <Button label="Fertig" size={'wide'} onPress={() => this._onDone()}/>
        </Theme.View>
      </Modal>
    );
  }
}

BottomSheet.propTypes = {
  animationType: PropTypes.oneOf(["none", "slide", "fade"]),
  height: PropTypes.number,
  minClosingHeight: PropTypes.number,
  openDuration: PropTypes.number,
  closeDuration: PropTypes.number,
  closeOnDragDown: PropTypes.bool,
  closeOnPressMask: PropTypes.bool,
  dragFromTopOnly: PropTypes.bool,
  closeOnPressBack: PropTypes.bool,
  keyboardAvoidingViewEnabled: PropTypes.bool,
  customStyles: PropTypes.objectOf(PropTypes.object),
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
  children: PropTypes.node
};

BottomSheet.defaultProps = {
  animationType: "slide",
  height: 300,
  minClosingHeight: 0,
  openDuration: 300,
  closeDuration: 175,
  closeOnDragDown: false,
  dragFromTopOnly: false,
  closeOnPressMask: true,
  closeOnPressBack: true,
  keyboardAvoidingViewEnabled: Platform.OS === "ios",
  customStyles: {},
  onClose: null,
  onOpen: null,
  children: <View/>
};

export default BottomSheet;
