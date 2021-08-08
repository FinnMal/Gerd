import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActionSheetIOS,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Platform
} from 'react-native';
import AutoHeightImage from 'react-native-auto-height-image';
import FileViewer from 'react-native-file-viewer';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faChevronCircleRight,
  faArrowAltCircleDown,
  faQuoteRight,
  faCalendar,
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
  faFilePdf
} from '@fortawesome/free-solid-svg-icons';
import {withNavigation} from 'react-navigation';
import {useNavigation} from '@react-navigation/native';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import CameraRoll from '@react-native-community/cameraroll';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {ModalCard} from './../app/components.js';

// EVENTCARD class: card component for club events
export default class EventCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modal_visible: false
    };
  }

  editEvent() {
    if (this.state.modal_visible) {
      this.state.modal_visible = false;
      this.forceUpdate();
      setTimeout((function() {
        this.state.modal_visible = true;
        this.forceUpdate();
      }).bind(this), 0);
    } else {
      this.state.modal_visible = true;
      this.forceUpdate();
    }
  }

  onChange(key, name, date, location) {
    this.state.modal_visible = false;
    this.forceUpdate();
    this.props.onChange(key, name, date, location);
  }

  render() {
    //var s = require('./style.js');

    var backgroundColor = '#121212';
    if (this.props.card_type == 'new_message') 
      backgroundColor = '#1e1e1e';
    else if (this.props.card_type == 'preview') 
      backgroundColor = '';
    
    var fontColor = '#BBB0B5';
    if (this.props.card_type == 'preview') 
      fontColor = this.props.color;
    return (
      <View style={{
          marginBottom: 0
        }}>
        {
          this.props.editable
            ? <ModalCard
                visible={this.state.modal_visible}
                name={this.props.name}
                date={this.props.date}
                location={this.props.location}
                onDone={(name, date, location) => this.onChange(this.props.pos, name, date, location)}/>
            : void 0
        }

        <View style={{
            backgroundColor: backgroundColor,
            padding: 25,
            borderRadius: 15
          }}>
          {
            this.props.card_type != 'preview'
              ? <View style={{
                    marginBottom: 25,
                    flexWrap: 'wrap',
                    flexDirection: 'row'
                  }}>
                  <FontAwesomeIcon size={25} color={fontColor} icon={faQuoteRight}/>
                  <Text
                    style={{
                      marginLeft: 20,
                      marginTop: 4,
                      fontSize: 20,
                      textTransform: 'uppercase',
                      fontFamily: 'Poppins-ExtraBold',
                      color: fontColor
                    }}>
                    {this.props.name}
                  </Text>
                </View>
              : void 0
          }
          <View style={{
              marginBottom: 0,
              flexWrap: 'wrap',
              flexDirection: 'row'
            }}>
            <FontAwesomeIcon size={25} color={fontColor} icon={faCalendar}/>
            <Text
              style={{
                marginLeft: 20,
                marginTop: 4,
                fontSize: 20,
                textTransform: 'uppercase',
                fontFamily: 'Poppins-ExtraBold',
                color: fontColor
              }}>
              {this.props.date}
            </Text>
          </View>
          <View style={{
              marginTop: 25,
              flexWrap: 'wrap',
              flexDirection: 'row'
            }}>
            <FontAwesomeIcon size={25} color={fontColor} icon={faMapMarker}/>
            <Text
              style={{
                marginLeft: 20,
                marginTop: 4,
                fontSize: 20,
                textTransform: 'uppercase',
                fontFamily: 'Poppins-ExtraBold',
                color: fontColor
              }}>
              {this.props.location}
            </Text>
          </View>

          {
            this.props.card_type == 'message'
              ? <TouchableOpacity
                  style={{
                    backgroundColor: '#1e1e1e',
                    borderRadius: 25,
                    marginTop: 30,
                    marginLeft: 20,
                    marginRight: 20,
                    padding: 12,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-SemiBold',
                      fontSize: 17,
                      color: '#D8CDCD'
                    }}>
                    In Kalender speichern
                  </Text>
                </TouchableOpacity>
              : void 0
          }

        </View>
        {
          this.props.editable
            ? <View
                style={{
                  marginTop: -15,
                  marginLeft: 245,
                  width: 500,
                  justifyContent: 'flex-start',
                  flexWrap: 'wrap',
                  flexDirection: 'row'
                }}>
                <TouchableOpacity
                  onPress={() => this.editEvent()}
                  style={{
                    borderRadius: 30,
                    width: 30,
                    height: 30,
                    zIndex: 0,
                    backgroundColor: '#0DF5E3',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                  <FontAwesomeIcon size={17} color="#1e1e1e" icon={faPen}/>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.props.onDelete(this.props.pos)}
                  style={{
                    borderRadius: 30,
                    width: 30,
                    height: 30,
                    zIndex: 0,
                    marginLeft: 10,
                    backgroundColor: '#0DF5E3',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                  <FontAwesomeIcon size={17} color="#1e1e1e" icon={faTrash}/>
                </TouchableOpacity>
              </View>
            : void 0
        }
      </View>
    );
  }
}
