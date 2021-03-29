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
import {Theme} from './../app/index.js';
import DatabaseConnector from "./database/DatabaseConnector";
import storage from '@react-native-firebase/storage';

export default class File extends DatabaseConnector {
  id = null;
  club_id = null;
  club = {};
  user = null;
  downloaded = false;
  download_progress = 0;
  uploaded_percentage = 0;

  constructor(id = false, club_id = false, user = false) {
    super('clubs/' + club_id + '/files', id, [
      'size_bytes',
      'type',
      'download_url',
      'downloads',
      'name',
      'type',
      'extension'
    ])
    this.id = id;
    this.user = user;
    this.club_id = club_id;

    this.setReadyListener(function() {
      this.getLocalPath();
    }.bind(this))
  }

  getClubID() {
    return this.club_id;
  }

  getName() {
    return this.getValue('name');
  }

  setName(new_name, store = false) {
    if (store) {
      this.getDatabaseValue('name', function(old_name) {
        this.getLocalPath(function(path) {
          const new_path = path.replaceAll(old_name, new_name);
          this.editLocalPath(new_path, function(ok) {
            if (ok) 
              this.setValue(new_name, 'name', true);
            }
          .bind(this));
        }.bind(this))
      }.bind(this))
    } else 
      this.setValue(new_name, 'name');
    }
  
  getSize() {
    return this.getValue('size_bytes')
    /*
    var size = this.getValue('size_bytes');
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
    */
  }

  getType() {
    console.log('in file get type')
    console.log(this.getValue('type'))
    return this.getValue('type', null, true);
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

  getDownloadURL(cb) {
    return this.getValue('download_url');
  }

  getStoragePath(cb) {
    return this.getValue('storage_path', cb)
  }

  getDownloads() {
    return this.getValue('downloads')
  }

  isOwnFile() {
    return false;
    // TODO: check "uploader" value from database return this.getValue('author') == this.uid;
  }

  isOwn() {
    return false;
  }

  delete() {
    this.remove();
  }

  hasLocalPath(cb) {
    this.executeSQL('SELECT * FROM local_files WHERE ID="' + this.getID() + '"', [], function(tx, results) {
      const res = results.rows.raw()
      console.log(res)
      this.data.has_local_path = res.length > 0
      cb(this.data.has_local_path)
    }.bind(this))
  }

  getLocalPath(cb) {
    const path = this.getValue('local_path')
    if (path) {
      if (cb) 
        cb(path)
      return path
    }
    this.executeSQL('SELECT * FROM local_files WHERE ID="' + this.getID() + '"', [], function(tx, results) {
      const res = results.rows.raw()
      if (res.length > 0) {
        this.setValue(res[0].local_path, 'local_path')
        cb(res[0].local_path)
      } else 
        cb(null)
    }.bind(this))
  }

  isDownloaded() {
    return this.getValue('local_path')
  }

  setLocalPath(v) {
    this.data.local_path = v;
  }

  saveLocalPath(v, cb) {
    this.data.local_path = v;
    this.hasLocalPath(function(has_path) {
      if (!has_path) {
        this.setValue(v, 'local_path')
        this.executeSQL('INSERT INTO local_files VALUES (?, ?, ?)', [
          this.getID(), this.getClubID(), v
        ], function(tx, results) {
          if (cb) 
            cb(true)
        }.bind(this))
      } else if (cb) 
        cb(false)
    }.bind(this))
  }

  editLocalPath(new_path, cb) {
    this.getLocalPath(function(old_path) {
      if (new_path != old_path) {
        RNFS.moveFile(old_path, new_path).then(() => {
          console.log('FILE MOVED');
          this.setValue(new_path, 'local_path')
          if (old_path) {
            // update old path
            this.executeSQL('UPDATE local_files SET local_path = ? WHERE ID = ? ', [
              new_path, this.getID()
            ], function(tx, results) {
              if (cb) 
                cb(true)
            }.bind(this))
          } else 
            this.saveLocalPath(new_path, cb)
        }).catch((err) => {
          alert('Fehler: Datei konnte nicht umbenannt werden. Eine Datei mit diesem Namen existiert bereits.')
          cb(false)
        });
      } else 
        cb(true)
    }.bind(this))
  }

  download(cb) {
    this.getStoragePath(async function(storage_path) {
      const download_url = await storage().ref(storage_path).getDownloadURL();
      RNFetchBlob.config({
        path: RNFetchBlob.fs.dirs.DocumentDir + '/' + this.getName() + '.' + this.getExtension(),
        fileCache: true,
        appendExt: this.getExtension()
      }).fetch('GET', download_url, {'Cache-Control': 'no-store'}).progress({
        count: 1000
      }, (received, total) => {
        this.setDownloadedPercentage(received / total * 100)
        cb(received / total * 100, true)
      }).then(res => {
        this.saveLocalPath(res.path(), function(saved) {
          this.setDownloading(false)
          this.setDownloadedPercentage(100)
          setTimeout(function() {
            cb(100, false);
          }, 100);

        }.bind(this));
      });
    }.bind(this))
  }

  isDownloading() {
    return this.getValue('downloading') === true
  }

  setDownloading(v) {
    this.setValue(v, 'downloading')
  }

  setDownloadedPercentage(v) {
    if (v < 100) 
      this.setDownloading(true)
    this.setValue(v, 'downloaded_percentage')
  }

  getDownloadedPercentage() {
    return Math.round(this.getValue('downloaded_percentage'))
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

        <Theme.TouchableOpacity
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
          <Theme.View style={{
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
                }} size={35} icon={this.getIcon()}></Theme.Icon>
              {
                this.download_progress > 0
                  ? <Theme.AnimatedCircularProgress
                      size={41}
                      width={2}
                      style={{
                        position: 'absolute',
                        marginTop: 13,
                        marginLeft: 12
                      }}
                      fill={this.download_progress}
                      tintColor={"blue"}
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
              <Theme.Text
                style={{
                  fontSize: 19,
                  fontFamily: 'Poppins-SemiBold',
                  color: type != 'normal'
                    ? '#D1CFD5'
                    : '#ADA4A9'
                }}>
                {this.getName()}
              </Theme.Text>
              <Theme.Text
                style={{
                  fontSize: 15,
                  fontFamily: 'Poppins-SemiBold',
                  color: type != 'normal'
                    ? '#D1CFD5'
                    : '#ADA4A9'
                }}>
                {this.getSize()}
              </Theme.Text>
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
                      width: '' + this.uploaded_percentage + '%',
                      maxWidth: 1000
                    }}/>
                </View>
              : void 0
          }
        </Theme.TouchableOpacity>
      </View>
    );
    return null;
  }

  isUploading() {
    return this.getValue('uploading')
  }

  setUploading(v) {
    this.setValue(v, 'uploading', true)
  }

  setUploadedPercentage(v) {
    if (v < 100) {
      this.setUploading(true)
      this.setValue(Math.round(v), 'uploaded_percentage', true)
    }
  }

  getUploadedPercentage() {
    const p = this.getValue('uploaded_percentage')
    if (!p) 
      return 0
    return p
  }

  setDownloadUrl(v) {
    this.setValue(v, 'download_url', true)
  }
}
