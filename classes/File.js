import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActionSheetIOS,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
  Image
} from "react-native";
import AutoHeightImage from "react-native-auto-height-image";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {
  faCalendar,
  faMapMarker,
  faChevronRight,
  faPlus,
  faClock,
  faChevronCircleRight,
  faArrowAltCircleDown,
  faQuoteRight,
  faPen,
  faTrash,
  faChevronCircleLeft,
  faChevronLeft,
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
} from "@fortawesome/free-solid-svg-icons";
import {withNavigation} from "react-navigation";
import {useNavigation} from "@react-navigation/native";
import {AnimatedCircularProgress} from "react-native-circular-progress";
import database from "@react-native-firebase/database";
import {useDarkMode} from 'react-native-dynamic'
import {default as Modal} from "./../components/Modal.js";
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';

function CTouchableOpacity(props) {
  const isDarkMode = useDarkMode()
  return <TouchableOpacity
    onPress={props.onPress}
    style={[
      props.style, {
        opacity: .7,
        borderRadius: 14,
        shadowOpacity: isDarkMode
          ? 0
          : 0.6,
        shadowColor: "black",
        shadowOffset: {
          width: 0,
          height: 0
        },
        shadowRadius: 10.0,
        shadowOpacity: isDarkMode
          ? 0
          : .1,
        backgroundColor: isDarkMode
          ? "#1C1C1E"
          : "#f7f2f2"
      }
    ]}>{props.children}</TouchableOpacity>;
}

function CView(props) {
  const isDarkMode = useDarkMode()
  return <View style={[props.style]}>{props.children}</View>;
}

function CText(props) {
  const isDarkMode = useDarkMode()
  return <Text style={[
      props.style, {
        color: isDarkMode
          ? "#f7f2f2"
          : "#1C1C1E"
      }
    ]}>{props.children}</Text>;
}

function CIcon(props) {
  const isDarkMode = useDarkMode()
  return <FontAwesomeIcon
    size={props.size}
    style={[
      props.style, {
        color: isDarkMode
          ? "#f7f2f2"
          : "#1C1C1E"
      }
    ]}
    icon={props.icon}>{props.children}</FontAwesomeIcon>;
}

function CAnimatedCircularProgress(props) {
  const isDarkMode = useDarkMode()
  return <AnimatedCircularProgress
    size={props.size}
    width={props.width}
    style={props.style}
    fill={props.fill}
    tintColor={isDarkMode
      ? 'red'
      : props.tintColor}
    onAnimationComplete={props.onAnimationComplete}
    backgroundColor={isDarkMode
      ? '#1C1C1E'
      : '#f7f2f2'}/>;
}

export class File {
  data = {};
  club = {};
  uid = null;
  listener = {};
  downloaded = false;
  download_progress = 0;
  uploaded_percentage = 0;

  constructor(file_id = false, club_id = false, uid = false, data = false) {
    if (!data && file_id && club_id) {
      this.uid = uid;
      database().ref("clubs/" + club_id + "/files/" + file_id).once("value", function(snap) {
        this.data = snap.val();
        if (!this.data) 
          return;
        console.log("FILE DATA:")
        console.log(this.data);
        this.data.id = file_id;
        this.data.club_id = club_id;
        if (this.readyListener) 
          this.readyListener();
        }
      .bind(this));
    } else {
      this.data = data;
      if (this.readyListener) 
        this.readyListener();
      }
    }

  getValue(path, cb = null) {
    var obj = this.data;
    if (obj) {
      path_arr = path.split("/");
      if (path_arr) {
        for (i = 0; i < path_arr.length - 1; i++) 
          obj = obj[path_arr[i]];
        
        if (obj && path_arr && path_arr[i]) 
          var value = obj[path_arr[i]];
        
        if (value) 
          return value;
        if (cb) 
          this.getDatabaseValue(path, cb);
        }
      }
  }

  setValue(value, path, store = false, cb = false) {
    path_arr = path.split("/");

    if (path_arr) {
      var obj = this.data;
      if (obj) {
        for (i = 0; i < path_arr.length - 1; i++) 
          obj = obj[path_arr[i]];
        obj[path_arr[i]] = value;

        if (store) {
          database().ref("clubs/" + this.data.club_id + "/files/" + this.data.id + '/' + path).set(value);
        } else 
          this._triggerCallbacks(path, value);
        }
      }
  }

  countUp(path) {
    this.getValue(path, function(v) {
      this.setValue(v + 1, path, true);
    }.bind(this))

  }

  getDatabaseValue(path, cb) {
    database().ref("clubs/" + this.data.club_id + "/files/" + this.data.id + '/' + path).once("value", function(snap) {
      this.setValue(snap.val(), path);
      cb(snap.val());
    }.bind(this));
  }

  startListener(path, cb) {
    if (!this.listener[path]) {
      this.listener[path] = {
        callbacks: [cb]
      };
      this.setValue(this.getValue(path), path)
    } else {
      this.listener[path].callbacks.push(cb);
    }
  }

  setReadyListener(cb) {
    if (!this.readyListener) 
      this.readyListener = cb;
    else 
      cb();
    }
  
  setRenderListerner(cb) {
    this.renderListerner = cb;
  }

  _triggerCallbacks(path, value = null) {
    if (this.listener[path]) {
      if (this.listener[path].callbacks) {
        this.listener[path].callbacks.forEach((cb, i) => {
          cb(
            value
              ? value
              : this.getValue(path)
          );
        });
      }
    }
  }

  getID() {
    return this.data.id;
  }

  getName() {
    return this.getValue('name');
  }
  setName(v, store = false) {
    this.setValue(v, 'name', store);
    this.forceUpdate();
  }

  getSize() {
    var size = this.data.size_bytes;
    if (size < 1000) {
      // Byte
      return Math.round(size) + ' B';
    }
    if (size < 1000000) {
      // KB
      return Math.round(size / 1000) + ' KB';
    } else if (size < 1000000000) {
      // MB
      return Math.round(size / 1000000) + ' MB';
    } else if (size < 1000000000000) {
      // GB
      return Math.round(size / 1000000000) + ' GB';
    }
    return '0';
  }

  getType() {
    return this.getValue('type');
  }

  getExtension() {
    return this.getValue('extension');
  }

  getIcon() {
    if (!this.downloaded) 
      var icon = faArrowAltCircleDown;
    else 
      var icon = faFile;
    if (this.downloaded) {
      if (this.getType() == 'application/pdf') 
        icon = faFilePdf;
      if (this.getType() == 'application/msword') 
        icon = faFileWord;
      if (this.getType() == 'application/mspowerpoint') 
        icon = faFilePowerpoint;
      if (this.getType() == 'application/msexcel') 
        icon = faFileExcel;
      if (this.getType() == 'application/pdf') 
        icon = faFilePdf;
      if (this.getType() == 'application/zip') 
        icon = faFileArchive;
      if (this.getType() == 'text/comma-separated-values	') 
        icon = faFileCsv;
      
      if (!icon) {
        if (this.getType().includes('audio')) 
          icon = faFileAudio;
        if (this.getType().includes('video')) 
          icon = faFileVideo;
        if (this.getType().includes('image')) 
          icon = faFileImage;
        if (this.getType().includes('text')) 
          icon = faFileAlt;
        }
      }
    return icon;
  }

  getDownloadUrl() {
    return this.getValue('download_url');
  }

  isOwnFile() {
    return false;
    // TODO: check "uploader" value from database return this.getValue('author') == this.uid;
  }

  openEditModal() {
    if (this.modal) 
      this.modal.open();
    }
  
  _open() {
    FileViewer.open(
      Platform.OS === 'android'
        ? 'file://' + this.path
        : '' + this.path
    ).then(() => {}).catch(error => {});
  }

  _openOptions() {
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

  _download() {
    if (this.download_progress == 0) {
      RNFetchBlob.config({
        path: RNFetchBlob.fs.dirs.DocumentDir + '/' + this.getName() + '.' + this.getExtension(),
        fileCache: true,
        appendExt: this.getType().split('/')[1]
      }).fetch('GET', this.getDownloadUrl(), {'Cache-Control': 'no-store'}).progress({
        count: 1000
      }, (received, total) => {
        this.download_progress = received / total * 100;
        this.renderListerner()
        console.log('progress: ' + received / total * 100 + '%');
      }).then(res => {
        this.downloaded = true;
        this.download_progress = 0;
        this.path = res.path();

        this.countUp('downloads');
        this.renderListerner()
      });
    } else 
      alert('Download läuft bereits')
  }

  onChangeText(value) {
    this.state.name = value;
    this.forceUpdate();
  }

  _edit() {
    alert('editFile');
    /*
    this.props.onEdit(this.props.pos, this.state.name, this.state.name_before_edit);
    this.state.modal_visible = false;
    this.forceUpdate();
		*/
  }

  getRender(type = "new_message") {
    if (!this.data) 
      return;
    const club = this.club;
    const s_width = Dimensions.get("window").width;
    var s = require("./../app/style.js");
    return (
      <View style={{
          marginBottom: 30
        }}>
        {
          this.isOwnFile()
            ? <Modal ref={m => {
                  this.modal = m;
                }} headline="Datei bearbeiten" onDone={() => alert('MODAL DONE')}>
                <ScrollView
                  style={{
                    marginLeft: -20,
                    marginBottom: 40,
                    backgroundColor: '#1e1e1e'
                  }}>
                  <InputBox label="Name" marginTop={20} value={this.getName()} onChange={v => this.setName(v, true)}/>
                </ScrollView>
              </Modal>
            : void 0
        }

        <CTouchableOpacity
          style={{
            padding: 15,
            marginBottom: 0,
            borderRadius: 13
          }}
          onPress={() => {
            if (!this.downloaded) 
              this._download();
            else 
              this._open();
            }}>
          <CView style={{
              justifyContent: 'flex-start',
              flexWrap: 'wrap',
              flexDirection: 'row'
            }}>
            <View style={{
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              <CIcon style={{
                  zIndex: 0
                }} size={35} icon={this.getIcon()}></CIcon>
              {
                this.download_progress > 0
                  ? <CAnimatedCircularProgress
                      size={41}
                      width={2}
                      style={{
                        position: 'absolute',
                        marginTop: 13,
                        marginLeft: 12
                      }}
                      fill={this.download_progress}
                      tintColor={"blue"}
                      onAnimationComplete={() => console.log('onAnimationComplete')}
                      backgroundColor="#121212"/>
                  : void 0
              }
            </View>

            <View style={{
                marginLeft: 20,
                width: type != 'normal'
                  ? 225
                  : 207
              }}>
              <CText
                style={{
                  fontSize: 19,
                  fontFamily: 'Poppins-SemiBold',
                  color: type != 'normal'
                    ? '#D1CFD5'
                    : '#ADA4A9'
                }}>
                {this.getName()}
              </CText>
              <CText
                style={{
                  fontSize: 15,
                  fontFamily: 'Poppins-SemiBold',
                  color: type != 'normal'
                    ? '#D1CFD5'
                    : '#ADA4A9'
                }}>
                {this.getSize()}
              </CText>
            </View>
            {
              this.isOwnFile()
                ? <View
                    style={{
                      padding: 1,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                    <TouchableOpacity onPress={() => this._openOptions()} style={{
                        zIndex: 0
                      }}>
                      <CIcon size={20} color="#D1CFD5" icon={faEllipsisV}/>
                    </TouchableOpacity>
                  </View>
                : void 0
            }
          </CView>
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
                      width: '' + this.uploaded_percentage + '%',
                      maxWidth: 1000
                    }}/>
                </View>
              : void 0
          }
        </CTouchableOpacity>
      </View>
    );
    return null;
  }
}
