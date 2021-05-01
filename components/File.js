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

// FILE class: component for club files
export default class File extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      download_progress: 0,
      downloaded: false,
      path: '',
      name: this.props.name,
      modal_visible: false,
      size: this.props.file.getSize()
    };

    if (this.props.path) 
      this.state.path = this.props.path;

    }
  
  _getFormattedSize() {
    const size = this.props.file.getSize()
    if (size < 1000) 
      return Math.round(this.state.size) + ' B';
    else if (size < 1000000) 
      return Math.round(this.state.size / 1000) + ' KB';
    else if (size < 1000000000) 
      return Math.round(this.state.size / 1000000) + ' MB';
    else if (size < 1000000000000) 
      return Math.round(this.state.size / 1000000000) + ' GB';
    else 
      return Math.round(this.state.size / 1000000000000) + ' TB';
    }
  
  _getIcon() {
    const file = this.props.file;
    if (file.getType()) {
      if (this.props.downloadable && !file.isDownloaded()) 
        return faArrowAltCircleDown;
      
      if (file.isDownloaded() || !this.props.downloadable) {
        if (file.getType() == 'application/pdf') 
          return faFilePdf;
        if (file.getType() == 'application/msword') 
          return faFileWord;
        if (file.getType() == 'application/mspowerpoint') 
          return faFilePowerpoint;
        if (file.getType() == 'application/msexcel') 
          return faFileExcel;
        if (file.getType() == 'application/pdf') 
          return faFilePdf;
        if (file.getType() == 'application/zip') 
          return faFileArchive;
        if (file.getType() == 'text/comma-separated-values	') 
          return faFileCsv;
        
        if (!this.props.icon) {
          if (file.getType().includes('audio')) 
            return faFileAudio;
          if (file.getType().includes('video')) 
            return faFileVideo;
          if (file.getType().includes('image')) 
            return faFileImage;
          if (file.getType().includes('text')) 
            return faFileAlt;
          }
        }
    }

    return faFile;
  }

  _open() {
    const file = this.props.file
    FileViewer.open(
      Platform.OS === 'android'
        ? 'file://' + file.getLocalPath()
        : '' + file.getLocalPath()
    ).then(() => {}).catch(error => {});
  }

  _showOptions() {
    var options = ['Abbrechen', 'Herunterladen', 'Teilen', 'Bearbeiten', 'Löschen']
    this.props.file.getLocalPath(function(path) {
      if (path) 
        options[1] = 'Öffnen'
      ActionSheetIOS.showActionSheetWithOptions({
        options: options,
        destructiveButtonIndex: 4,
        cancelButtonIndex: 0
      }, buttonIndex => {
        if (buttonIndex === 0) {
          // cancel action
        } else if (buttonIndex === 1) {
          this._onPress()
        } else if (buttonIndex === 2) {
          // TODO: share file
        } else if (buttonIndex === 3) {
          // edit file
          this.modal.open()
          this.forceUpdate();
        } else if (buttonIndex === 4) {
          this._delete();
        }
      });
    }.bind(this))
  }

  _onPress() {
    this.props.file.getLocalPath(function(path) {
      if (path) 
        this._open()
      else 
        this._download()
    }.bind(this))
  }

  _download() {
    const file = this.props.file
    file.download(function(percentage, downloading) {
      this.forceUpdate()
      if (percentage == 100) {
        FileViewer.open(
          Platform.OS === 'android'
            ? 'file://' + file.getLocalPath()
            : '' + file.getLocalPath()
        ).then(() => {}).catch(error => {});
      }
    }.bind(this))
  }

  onChangeText(value) {
    this.state.name = value;
    this.forceUpdate();
  }

  _saveEdit() {
    const file = this.props.file;
    file.setName(file.getName(), true);
    this.forceUpdate();
  }

  _delete() {
    var btns = [];
    ['Nein', 'Ja'].forEach((text, i) => {
      var btn = {
        text: text,
        onPress: () => {
          if (i == 1) {
            this.props.file.delete();
            this.forceUpdate();
          }
        },
        style: i == 0
          ? 'cancel'
          : ''
      };
      btns.push(btn);
    });
    Alert.alert('Datei löschen?', 'Die Datei wird nur vom Server gelöscht, auf deinem Gerät bleibt sie jedoch erhalten.', btns, {cancelable: true});
  }

  render() {
    const file = this.props.file;
    if (file.getType()) {
      const modalView = (
        <Modal ref={m => {
            this.modal = m;
          }} headline={file.getName() + '.' + file.getExtension()} onDone={() => this._saveEdit()}>
          <View>
            <InputBox
              boxColor={'light'}
              label="Name"
              marginTop={20}
              value={file.getName()}
              onChange={v => {
                file.setName(v)
                this.forceUpdate()
              }}/>
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
                  {file.getName() + '.' + file.getExtension()}
                </Theme.Text>
                <Theme.Text
                  style={{
                    fontFamily: "Poppins-SemiBold",
                    fontSize: 15,
                    opacity: 0.7
                  }}>
                  {this._getFormattedSize()}
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
            {
              file.isUploading() || file.isDownloading()
                ? <View><Theme.View
                    color={'primary'}
                    style={{
                      height: 25,
                      width: file.isUploading()
                        ? file.getUploadedPercentage() + "%"
                        : file.getDownloadedPercentage() + "%",
                      paddingLeft: 20,
                      borderBottomLeftRadius: 13,
                      borderTopRightRadius: 13,
                      borderBottomRightRadius: 13
                    }}/>
                    <View
                      style={{
                        marginTop: -25,
                        padding: 0,
                        paddingLeft: 20,
                        borderBottomLeftRadius: 13,
                        borderBottomRightRadius: 13,
                        flexWrap: "wrap",
                        flexDirection: "row"
                      }}>
                      <Theme.Icon
                        style={{
                          opacity: 0.85
                        }}
                        size={24}
                        icon={file.isUploading()
                          ? faCloudUploadAlt
                          : faCloudDownloadAlt}
                        backgroundColor={'primary'}/>
                      <Theme.Text
                        style={{
                          opacity: 0.85,
                          fontFamily: 'Poppins-Bold',
                          fontSize: 18,
                          marginLeft: 25
                        }}
                        backgroundColor={'primary'}>{
                          file.isUploading()
                            ? file.getUploadedPercentage() + "%"
                            : file.getDownloadedPercentage() + "%"
                        }</Theme.Text>
                    </View>
                  </View>
                : void 0
            }

          </Theme.View>
        );
      } else {
        return (
          <View style={{
              marginBottom: 30
            }}>
            {
              file.isOwn()
                ? <Modal ref={m => {
                      this.modal = m;
                    }} headline="Datei bearbeiten" onDone={() => alert('MODAL DONE')}>
                    <ScrollView
                      style={{
                        marginLeft: -20,
                        marginBottom: 40,
                        backgroundColor: '#1e1e1e'
                      }}>
                      <InputBox label="Name" marginTop={20} value={file.getName()} onChange={v => file.setName(v, true)}/>
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
                    }} size={35} icon={this._getIcon()}></Theme.Icon>
                  {
                    file.isDownloading()
                      ? <Theme.AnimatedCircularProgress
                          size={41}
                          width={2}
                          style={{
                            position: 'absolute',
                            marginTop: 13,
                            marginLeft: 12
                          }}
                          fill={file.getDownloadedPercentage()}
                          tintColor={"blue"}
                          backgroundColor="#121212"/>
                      : void 0
                  }
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
                    {file.getName()}
                  </Theme.Text>
                  <Theme.Text
                    style={{
                      fontSize: 15,
                      fontFamily: 'Poppins-SemiBold',
                      color: this.props.card_size != 'normal'
                        ? '#D1CFD5'
                        : '#ADA4A9'
                    }}>
                    {this._getFormattedSize()}
                  </Theme.Text>
                </View>
                {
                  file.isOwn()
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
              {
                false
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
                          width: '' + file.getUploadedPercentage() + '%',
                          maxWidth: 1000
                        }}/>
                    </View>
                  : void 0
              }
            </Theme.TouchableOpacity>
          </View>
        );
      }
    }
    return null;
  }
}
