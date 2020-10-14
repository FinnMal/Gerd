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

export default class File extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      download_progress: 0,
      downloaded: false,
      path: '',
      name: this.props.name,
      modal_visible: false,
      size: this.props.size
    };

    if (this.props.path) 
      this.state.path = this.props.path;
    
    if (this.state.size < 1000) {
      // Byte
      this.state.size = Math.round(this.state.size) + ' B';
    }
    if (this.state.size < 1000000) {
      // KB
      this.state.size = Math.round(this.state.size / 1000) + ' KB';
    } else if (this.props.size < 1000000000) {
      // MB
      this.state.size = Math.round(this.state.size / 1000000) + ' MB';
    } else if (this.props.size < 1000000000000) {
      // GB
      this.state.size = Math.round(this.state.size / 1000000000) + ' GB';
    }
  }

  _openFile() {
    FileViewer.open(
      Platform.OS === 'android'
        ? 'file://' + this.state.path
        : '' + this.state.path
    ).then(() => {}).catch(error => {});
  }

  _openFileOptions() {
    ActionSheetIOS.showActionSheetWithOptions({
      options: [
        'Abbrechen', 'Bearbeiten', 'Löschen'
      ],
      destructiveButtonIndex: 2,
      cancelButtonIndex: 0
    }, buttonIndex => {
      if (buttonIndex === 0) {
        // cancel action
      } else if (buttonIndex === 1) {
        // edit uploaded file
        this.state.name_before_edit = this.state.name;
        this.state.modal_visible = true;
        this.forceUpdate();
      } else if (buttonIndex === 2) {
        // delete uploaded file
        this.props.onDelete(this.props.pos);
      }
    });
  }

  _downloadFile(url) {
    RNFetchBlob.config({
      path: RNFetchBlob.fs.dirs.DocumentDir + '/' + this.props.name + '.' + this.props.type.split('/')[1],
      fileCache: true,
      appendExt: this.props.type.split('/')[1]
    }).fetch('GET', url, {'Cache-Control': 'no-store'}).progress({
      count: 1000
    }, (received, total) => {
      this.state.download_progress = received / total * 100;
      this.forceUpdate();
    }).then(res => {
      this.state.downloaded = true;
      this.state.path = res.path();
      this.forceUpdate();
    });
  }

  onChangeText(value) {
    this.state.name = value;
    this.forceUpdate();
  }

  editFile() {
    this.props.onEdit(this.props.pos, this.state.name, this.state.name_before_edit);
    this.state.modal_visible = false;
    this.forceUpdate();
  }

  render() {
    if (this.props.downloadable && !this.state.downloaded) 
      var icon = faArrowAltCircleDown;
    else 
      var icon = faFile;
    if (this.state.downloaded || !this.props.downloadable) {
      if (this.props.type == 'application/pdf') 
        icon = faFilePdf;
      if (this.props.type == 'application/msword') 
        icon = faFileWord;
      if (this.props.type == 'application/mspowerpoint') 
        icon = faFilePowerpoint;
      if (this.props.type == 'application/msexcel') 
        icon = faFileExcel;
      if (this.props.type == 'application/pdf') 
        icon = faFilePdf;
      if (this.props.type == 'application/zip') 
        icon = faFileArchive;
      if (this.props.type == 'text/comma-separated-values	') 
        icon = faFileCsv;
      
      if (!this.props.icon) {
        if (this.props.type.includes('audio')) 
          icon = faFileAudio;
        if (this.props.type.includes('video')) 
          icon = faFileVideo;
        if (this.props.type.includes('image')) 
          icon = faFileImage;
        if (this.props.type.includes('text')) 
          icon = faFileAlt;
        }
      }

    //var s = require('./style.js');
    return (
      <View style={{
          marginBottom: 30
        }}>
        {
          this.props.editable
            ? <Modal animationType="slide" presentationStyle="formSheet" visible={this.state.modal_visible}>
                <View style={{
                    padding: 20,
                    backgroundColor: '#121212',
                    height: '100%'
                  }}>
                  <View
                    style={{
                      marginBottom: 10,
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      flexDirection: 'row'
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Poppins-Bold',
                        color: 'white',
                        fontSize: 25,
                        width: '76%'
                      }}
                      numberOfLines={1}>
                      Datei bearbeiten
                    </Text>
                    <TouchableOpacity
                      style={{
                        height: 30,
                        borderRadius: 10,
                        marginLeft: 10,
                        width: 70,
                        padding: 5,
                        paddingLeft: 10,
                        backgroundColor: '#0DF5E3'
                      }}
                      onPress={text => this.editFile()}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontFamily: 'Poppins-Bold',
                          color: '#1e1e1e'
                        }}>FERTIG</Text>
                    </TouchableOpacity>
                  </View>

                  <View
                    style={{
                      marginLeft: -20,
                      height: 0.5,
                      marginBottom: 40,
                      backgroundColor: '#1e1e1e',
                      width: '140%'
                    }}/>

                  <View style={{
                      marginBottom: 20
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Poppins-SemiBold',
                        marginLeft: 10,
                        color: '#5C5768'
                      }}>NAME</Text>
                    <View style={{
                        borderRadius: 10,
                        backgroundColor: '#1e1e1e'
                      }}>
                      <TextInput
                        multiline={true}
                        autoCorrect={false}
                        keyboardType="default"
                        style={{
                          fontFamily: 'Poppins-Medium',
                          marginTop: 8,
                          padding: 15,
                          fontSize: 17,
                          color: '#D5D3D9'
                        }}
                        value={this.state.name}
                        onChangeText={text => this.onChangeText(text)}/>
                    </View>
                  </View>
                </View>
              </Modal>
            : void 0
        }

        <TouchableOpacity
          onPress={() => {
            if (this.props.downloadable && !this.state.downloaded) 
              this._downloadFile(this.props.download_url);
            else 
              this._openFile();
            }}>
          <View
            style={{
              marginTop: this.props.card_type != 'normal'
                ? 0
                : 20,
              marginRight: this.props.card_type != 'normal'
                ? 0
                : 55,

              justifyContent: 'flex-start',
              flexWrap: 'wrap',
              flexDirection: 'row',
              padding: 15,
              backgroundColor: this.props.card_type != 'normal'
                ? '#1e1e1e'
                : '#121212',
              marginBottom: 0,
              borderRadius: 13
            }}>
            <View style={{
                justifyContent: 'center',
                alignItems: 'center'
              }}>

              <FontAwesomeIcon
                style={{
                  zIndex: 0
                }}
                size={35}
                color={this.props.card_type != 'normal'
                  ? '#D1CFD5'
                  : '#ADA4A9'}
                icon={icon}/> {
                this.props.downloadable && !this.state.downloaded
                  ? <AnimatedCircularProgress
                      size={41}
                      width={2}
                      style={{
                        position: 'absolute',
                        marginTop: 13,
                        marginLeft: 12
                      }}
                      fill={this.state.download_progress}
                      tintColor="#0DF5E3"
                      backgroundColor="#121212"/>
                  : void 0
              }
            </View>

            <View
              style={{
                marginLeft: 20,
                width: this.props.card_type != 'normal'
                  ? 225
                  : 207
              }}>
              <Text
                style={{
                  fontSize: 19,
                  fontFamily: 'Poppins-SemiBold',
                  color: this.props.card_type != 'normal'
                    ? '#D1CFD5'
                    : '#ADA4A9'
                }}>
                {this.props.name}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: 'Poppins-SemiBold',
                  color: this.props.card_type != 'normal'
                    ? '#D1CFD5'
                    : '#ADA4A9'
                }}>
                {this.state.size}
              </Text>
            </View>
            {
              this.props.editable
                ? <View
                    style={{
                      padding: 1,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                    <TouchableOpacity onPress={() => this._openFileOptions()} style={{
                        zIndex: 0
                      }}>
                      <FontAwesomeIcon size={20} color="#D1CFD5" icon={faEllipsisV}/>
                    </TouchableOpacity>
                  </View>
                : void 0
            }
          </View>
          {
            this.props.uploading && this.props.editable
              ? <View style={{
                    marginLeft: 15,
                    marginRight: 15,
                    marginTop: -2
                  }}>
                  <View
                    style={{
                      borderRadius: 3,
                      shadowColor: '#0DF5E3',
                      shadowOffset: {
                        width: 6,
                        height: 6
                      },
                      shadowOpacity: 0.5,
                      shadowRadius: 20.00,
                      backgroundColor: '#0DF5E3',
                      height: 2,
                      width: '' + this.props.uploaded_percentage + '%',
                      maxWidth: 1000
                    }}/>
                </View>
              : void 0
          }
        </TouchableOpacity>
      </View>
    );
  }
}
