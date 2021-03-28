import React from "react";
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
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import {Theme} from './../../app/index.js';
import AutoHeightImage from "react-native-auto-height-image";
import RNFetchBlob from "rn-fetch-blob";
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
  faChevronLeft,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import ClubCard from "./../../components/ClubCard.js";
import InputBox from "./../../components/InputBox.js";
import Button from "./../../components/Button.js";
import {default as File} from './../../classes/File.js';
import {default as FileCard} from './../../components/File.js';
import {default as Modal} from "./../../components/Modal.js";
import DocumentPicker from 'react-native-document-picker';

export default class ClubFiles extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      files: {},
      modal: {
        group: {},
        headline: "Gruppe bearbeiten"
      }
    };

    this.props.setting_screen.showActionButton(true);

    this.props.club.getFiles(function(files) {
      files.forEach((file, i) => {
        file.setReadyListener(function() {
          if (!this.state.files[file.getID()]) 
            this.state.files[file.getID()] = file;
          this.forceUpdate()
        }.bind(this))
      });

    }.bind(this), true);
  }

  componentDidMount() {
    this.props.setting_screen.onChildRef(this);
  }

  async actionButtonOnPress() {
    try {
      const results = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.allFiles]
      });
      for (const res of results) {
        if (!res.type) 
          alert('Fehler: Unbekanntes Dateiformat');
        else if (res.size > 3000000000) 
          alert('Fehler: Datei größer als 3GB');
        else 
          this._uploadFile(res);
        }
      } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  }

  _uploadFile(file) {
    const club = this.props.club;
    club.uploadFile(file, function(status, file) {
      if (status == 'file_created') {
        this.state.files[file.getID()] = file;
        this.forceUpdate()
      }
      if (status == 'done') 
        this.forceUpdate()
      if (status == 'error') 
        alert('error while uploading file')
    }.bind(this))
  }

  render() {
    const s_width = Dimensions.get("window").width;
    const s_height = Dimensions.get("window").height;

    const club = this.props.club;

    const pageContent = Object.keys(this.state.files).reverse().map(file_id => {
      const file = this.state.files[file_id];
      if (file) {
        return <FileCard card_size={'small'} file={file}/>;
      }
    });
    return (
      <View>
        <Theme.ActivityIndicator
          style={{
            alignSelf: 'flex-start',
            marginRight: 'auto',
            marginLeft: 20,
            marginBottom: 50
          }}
          scale={1.2}
          visible={!club.hasFiles()}></Theme.ActivityIndicator>
        {pageContent}
      </View>
    );
  }
}
