import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActionSheetIOS,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import AutoHeightImage from 'react-native-auto-height-image';
import FileViewer from 'react-native-file-viewer';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faChevronCircleRight,
  faArrowAltCircleDown,
  faQuoteRight,
  faCalendar,
  faCalendarMinus,
  faMapMarker,
  faPen,
  faTrash,
  faChevronCircleLeft,
  faChevronLeft,
  faChevronRight,
  faPlus,
  faPlusCircle,
  faUpload,
  faCloudUploadAlt,
  faFile,
  faEllipsisV,
  faFileWord,
  faFilePowerpoint,
  faFileExcel,
  faFileArchive,
  faFileCsv,
  faFileAudio,
  faFileVideo,
  faFileImage,
  faFileAlt,
  faTimesCircle,
  faCheck,
  faPaperPlane,
  faFilePdf,
  faCloudDownloadAlt
} from '@fortawesome/free-solid-svg-icons';
import {withNavigation} from 'react-navigation';
import {useNavigation} from '@react-navigation/native';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import CameraRoll from '@react-native-community/cameraroll';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {Theme} from './../app/index.js';
import {default as Modal} from "./../components/Modal.js";
import {default as InputBox} from "./../components/InputBox.js";

// EVENT class: component for club events
export default class Event extends React.Component {
  constructor(props) {
    super(props);
  }

  _showOptions() {
    var options = ['Abbrechen', 'Teilen', 'Bearbeiten', 'Löschen']
    ActionSheetIOS.showActionSheetWithOptions({
      options: options,
      destructiveButtonIndex: 3,
      cancelButtonIndex: 0
    }, buttonIndex => {
      if (buttonIndex === 0) {
        // cancel action
      } else if (buttonIndex === 1) {
        // TODO: share event
      } else if (buttonIndex === 2) {
        // edit event
        this.modal.open()
        this.forceUpdate();
      } else if (buttonIndex === 3) {
        //this._delete();
      }
    });
  }

  onChangeText(value) {
    this.state.name = value;
    this.forceUpdate();
  }

  _saveEdit() {
    const event = this.props.event;
    event.setTitle(event.getTitle(), true);
    this.forceUpdate();
  }

  _delete() {
    var btns = [];
    ['Nein', 'Ja'].forEach((text, i) => {
      var btn = {
        text: text,
        onPress: () => {
          if (i == 1) {
            this.props.event.delete();
            this.forceUpdate();
          }
        },
        style: i == 0
          ? 'cancel'
          : ''
      };
      btns.push(btn);
    });
    Alert.alert('Event löschen?', 'Das Event wird gelöscht', btns, {cancelable: true});
  }

  _getIcon() {
    const event = this.props.event;
    if (event.isVisible()) 
      return faCalendar;
    else 
      return faCalendarMinus;
    }
  
  render() {
    const event = this.props.event;
    const modalView = (
      <Modal ref={m => {
          this.modal = m;
        }} headline={'Event bearbeiten'} onDone={() => this._saveEdit()}>
        <View>
          <InputBox
            boxColor={'light'}
            label="Titel"
            marginTop={20}
            value={event.getTitle()}
            onChange={v => {
              event.setTitle(v)
              this.forceUpdate()
            }}/>
          <View
            style={{
              marginTop: 30,
              marginBottom: 30,
              flexWrap: "wrap",
              alignItems: "flex-start",
              flexDirection: "row",
              alignItems: "center"
            }}>
            <Theme.Text
              style={{
                marginLeft: 5,
                marginRight: 20,
                opacity: 0.8,
                fontSize: 20,
                fontFamily: "Poppins-SemiBold"
              }}>
              Sichtbar
            </Theme.Text>
            <Theme.Switch
              onValueChange={(v) => {
                event.setVisible(!event.isVisible())
                this.forceUpdate();
              }}
              value={event.isVisible()}/>
          </View>
        </View>
      </Modal>
    )

    if (this.props.card_size == 'small') {
      return (
        <Theme.View style={{
            borderRadius: 13,
            marginBottom: 20
          }}>
          {modalView}
          <Theme.TouchableOpacity
            style={{
              padding: 10,
              paddingLeft: 12,
              flexWrap: "wrap",
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: "row"
            }}
            onPress={() => this._showOptions()}>
            <Theme.Icon size={35} color={'primary'} icon={this._getIcon()}/>
            <View style={{
                marginLeft: 20,
                maxWidth: 220,
                justifyContent: "center"
              }}>
              <Theme.Text style={{
                  fontFamily: "Poppins-SemiBold",
                  fontSize: 20
                }}>
                {event.getTitle()}
              </Theme.Text>
              <Theme.Text style={{
                  fontFamily: "Poppins-SemiBold",
                  fontSize: 15,
                  opacity: 0.7
                }}>
                {event.getDate()}
              </Theme.Text>
            </View>
            <Theme.TouchableOpacity
              style={{
                padding: 11,
                opacity: 0.7,
                marginLeft: 'auto',
                alignSelf: 'flex-end'
              }}
              onPress={() => this._showOptions()}>
              <Theme.Icon size={20} icon={faEllipsisV}/>
            </Theme.TouchableOpacity>
          </Theme.TouchableOpacity>
        </Theme.View>
      );
    } else {
      return (
        <View style={{
            marginBottom: 30
          }}>
          {
            event.isOwn()
              ? <Modal ref={m => {
                    this.modal = m;
                  }} headline="Event bearbeiten" onDone={() => alert('MODAL DONE')}>
                  <ScrollView
                    style={{
                      marginLeft: -20,
                      marginBottom: 40,
                      backgroundColor: '#1e1e1e'
                    }}>
                    <InputBox label="Name" marginTop={20} value={event.getTitle()} onChange={v => event.setTitle(v, true)}/>
                  </ScrollView>
                </Modal>
              : void 0
          }

          <Theme.TouchableOpacity
            color={'selected_view'}
            style={{
              padding: 15,
              marginBottom: 0,
              borderRadius: 13
            }}
            onPress={() => this._onPress()}>
            <Theme.View
              color={'selected_view'}
              style={{
                justifyContent: 'flex-start',
                flexWrap: 'wrap',
                flexDirection: 'row'
              }}>
              <View style={{
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                <Theme.Icon style={{
                    zIndex: 0
                  }} size={35} icon={faCalendar}></Theme.Icon>
              </View>

              <View
                style={{
                  marginLeft: 20,
                  width: this.props.card_size != 'normal'
                    ? 225
                    : 207
                }}>
                <Theme.Text
                  style={{
                    fontSize: 19,
                    fontFamily: 'Poppins-SemiBold',
                    color: this.props.card_size != 'normal'
                      ? '#D1CFD5'
                      : '#ADA4A9'
                  }}>
                  {event.getTitle()}
                </Theme.Text>
                <Theme.Text
                  style={{
                    fontSize: 15,
                    fontFamily: 'Poppins-SemiBold',
                    color: this.props.card_size != 'normal'
                      ? '#D1CFD5'
                      : '#ADA4A9'
                  }}>
                  {event.getDate() + event.getID()}
                </Theme.Text>
              </View>
              {
                event.isOwn()
                  ? <View
                      style={{
                        padding: 1,
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                      <TouchableOpacity onPress={() => this._openOptions()} style={{
                          zIndex: 0
                        }}>
                        <Theme.Icon size={20} color="#D1CFD5" icon={faEllipsisV}/>
                      </TouchableOpacity>
                    </View>
                  : void 0
              }
            </Theme.View>
          </Theme.TouchableOpacity>
        </View>
      );
    }
  }
}
