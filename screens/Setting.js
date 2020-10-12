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
import {BlurView, VibrancyView} from "@react-native-community/blur";

import RNFetchBlob from "rn-fetch-blob";
import FileViewer from "react-native-file-viewer";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import CheckBox from "@react-native-community/checkbox";
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
import {Headlines} from "./../app/constants.js";
import {withNavigation} from "react-navigation";
import ClubCard from "./../components/ClubCard.js";
import InputBox from "./../components/InputBox.js";
import Button from "./../components/Button.js";
import {Theme} from './../app/index.js';
import Toast from "./../components/Toast.js";
import {default as Modal} from "./../components/Modal.js";
import HeaderScrollView from "./../components/HeaderScrollView.js";
import database from "@react-native-firebase/database";

export default class Setting extends React.Component {
  toast = null;
  child = null;
  constructor(props) {
    super(props);
    var headline = this.props.navigation.getParam("headline", null);
    var club = this.props.navigation.getParam("club", null);
    var utils = this.props.navigation.getParam("utils", null);
    var childs = this.props.navigation.getParam("childs", null);
    this.state = {
      headline: headline,
      club: club,
      utils: utils,
      childs: childs,
      show_action_button: false
    };
  }

  showActionButton(show) {
    this.state.show_action_button = show;
    this.forceUpdate();
  }

  navigateBack() {
    this.props.navigation.goBack();
  }

  showToast(text, icon = false, btn_text = false, cb) {
    this.toast.setText(text);
    this.toast.setButtonVisible(btn_text !== false)
    this.toast.setButtonText(btn_text)
    this.toast.setIcon(icon)
    this.toast.setButtonCallback(cb)
    this.toast.show();
  }

  onChildRef(ref) {
    this.child = ref;
  }

  render() {
    // pass the utils object to cilds
    const childrenWithProps = React.Children.map(this.state.childs, child => {
      const props = {
        setting_screen: this,
        utils: this.state.utils
      };
      if (React.isValidElement(child)) {
        return React.cloneElement(child, props);
      }
      return child;
    });

    return (
      <View>
        <Toast ref={(toast) => {
            this.toast = toast
          }}></Toast>
        <HeaderScrollView
          headline={this.state.headline}
          actionButtonIcon={this.state.show_action_button
            ? faPlusCircle
            : ''}
          actionButtonOnPress={() => {
            if (this.child) 
              this.child.actionButtonOnPress();
            }}>
          {childrenWithProps}
        </HeaderScrollView>
      </View>
    );
  }
}
