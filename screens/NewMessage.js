import React from 'react';
import AutoHeightImage from 'react-native-auto-height-image';
import {
  Alert,
  TextInput,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Image,
  TouchableOpacity,
  ActionSheetIOS,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Pressable
} from 'react-native';

import InputScrollView from 'react-native-input-scroll-view';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
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
  faLink
} from '@fortawesome/free-solid-svg-icons';
import InputBox from './../components/InputBox.js';
import database from '@react-native-firebase/database';
import {SafeAreaView} from 'react-navigation'; //added this import
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from "react-native-image-crop-picker";
import CheckBox from '@react-native-community/checkbox';
import {Theme} from './../app/index.js';
import {default as Modal} from "./../components/Modal.js";
import DatePicker from './../components/DatePicker.js'
import SelectBox from './../components/SelectBox.js'
import {default as EventCard} from '../components/Event.js'
import {default as FileCard} from '../components/File.js'
import Event from '../classes/Event.js'
import File from '../classes/File.js'
import Switch from "./../components/Switch.js";

import storage from '@react-native-firebase/storage';
import Club from '../classes/Club.js';

// NewMessageScreen class: screen to send a new message to members
export default class NewMessageScreen extends React.Component {
  constructor(props) {
    super(props);
    const utils = this.props.navigation.getParam('utils', null);
    this.utils = utils;
    const user = this.props.navigation.getParam('user', null)

    this.state = {
      curPageIndex: 0,
      clubsList: [],
      event_modal_visible: false,
      events: {},
      files: {},
      picture: {},
      group_serach: '',
      uid: utils.getUserID(),
      long_text_input_has_focus: false,
      link_modal: {
        club_key: '',
        group_key: ''
      },
      modal: {
        event: {
          full_day:false,
          title:"",
          location:"",
          starts_at: new Date(),
          ends_at:new Date()
        },
        file: {
          download_url:"",
          downloads:0,
          extension:"mp3",
          name: "",
          size_bytes:0,
          storage_path:"",
          type:"",
          uploaded_at:0,
          uploaded_percentage:0,
          uploading:false
        }
      },
      headlineInputValue: 'Lorem ipsum dolor sit',
      shortTextInputValue: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At' +
          ' vero eos et accusam et',
      textInputValue: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At' +
          ' vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor si' +
          't amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam' +
          ' et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur s' +
          'adipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolore' +
          's et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum iriure dolor in hendrerit in vulputate ve' +
          'lit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril ' +
          'delenit augue duis dolore te feugait nulla facilisi. ipsum dolor sit amet,'
    };
    // -> default text values for debugging

    this.headlineMarginLeft = new Animated.Value(40);
    this.nextHeadlineMarginLeft = new Animated.Value(40);

    database().ref('users/' + this.state.uid + '/clubs').once('value', (function(snap) {
      var clubs = snap.val();
      var i = 0;
      Object.keys(clubs).map(key => {
        var club = clubs[key];
        if (club) {
          if (club.role == 'admin') {
            database().ref('clubs/' + club.club_id).once('value', (function(snap) {
              var info = snap.val();
              club.selected = false;
              club.name = info.name;
              club.logo = info.logo;
              club.members = info.members;
              club.color = info.color;
              club.selected = false;
              club.groups = info.groups;

              this.state.clubsList[i] = club;
              this.forceUpdate();
              i++;
            }).bind(this));
          }
        }
      });
    }).bind(this));
  }

  async openUploadFileModal() {
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
          this.addFile(res);
        }
      } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  }

  openUploadPictureModal() {
    const options = {
      title: 'Bild auswählen',
      customButtons: [],
      storageOptions: {
        skipBackup: true,
        path: 'images'
      }
    };

    ImagePicker.openPicker({
      cropperToolbarTitle: "Bild zuschneiden",
      width: 1800,
      height: 1000,
      cropping: true,
      avoidEmptySpaceAroundImage: true,
      mediaType: "photo",
      cropperChooseText: "Fertig",
      cropperCancelText: "Abbrechen"
    }).then(image => {
      var response = {
        path: image.path,
        name: "image_" + new Date().getTime() + ".jpg",
        data: `data:image/jpg;base64,${image.data}`
      };
      this.setPicture(response);
    });
  }

  async setPicture(res) {
    this.state.picture = res
    var clubID = this._getSelectedClubs()[0].club_id
    var club = new Club(clubID, this.utils.getUser())
    club.uploadThumbnail(res, function(status, param) {
      console.log('[NEWMESSAGE SCREEN] NEW STATUS: '+status)
      if (status == 'uploaded_percentage') {
        this.state.picture.uploading = true
        this.state.picture.uploaded_percentage = param
      }
      if (status == 'download_url'){
        this.state.picture.uploading = false
        this.state.picture.download_url = param
        this.state.picture.thumbnail_download_url = param
        this.state.picture.uploaded_percentage = 0
      }
      this.forceUpdate()

      if (status == 'error') 
        alert('Error while uploading file')
    }.bind(this))

    
  }

  async addFile(res) {
    var clubID = this._getSelectedClubs()[0].club_id
    var club = new Club(clubID, this.utils.getUser())
    club.uploadFile(res, function(status, file) {
      console.log('[NEWMESSAGE SCREEN] NEW STATUS: '+status)
      if (status == 'file_created') {
        this.state.files[file.getID()] = file;
        this.forceUpdate()
      }
      if (status == 'done' || status == 'uploaded_percentage'){
        this.forceUpdate()
      } 
      if (status == 'error') 
        alert('error while uploading file')
    }.bind(this))
  }

  _openCreateEventModal(){
    this.state.modal.event = {
      full_day:false,
      title:"",
      location:"",
      starts_at: new Date(),
      ends_at:new Date()
    }
    this.forceUpdate()
    this.event_modal.open()
  }

  createEvent() {
    var event = this.state.modal.event;
    event.repeat = 'never';
    event.created_by = this.state.uid;
    event.image_name = 'pipes.png';
    event.starts_at = event.starts_at.getTime() / 1000;
    event.ends_at = event.ends_at.getTime() / 1000;
    var clubID = this._getSelectedClubs()[0].club_id
    var eventID = database().ref('clubs/' + clubID + '/events').push(event).key
    this.state.events[eventID] = new Event(eventID, new Club(clubID, this.utils.getUser()), this.utils.getUser());
    this.state.events[eventID].setReadyListener(function(){
      this.forceUpdate()
    }.bind(this))
  }

  deleteEvent(eventID) {
    alert('in deleteEvent')
    this.state.events[eventID].stopAllListeners()
    this.state.events[eventID] = null;
    this.forceUpdate()
  }

  selectClub(key) {
    this.state.clubsList[key].selected = !this.state.clubsList[key].selected;
    this.forceUpdate();
  }

  addGroup(key, g_key) {
    this.state.clubsList[key].groups[g_key].selected = !this.state.clubsList[key].groups[g_key].selected;
    this.forceUpdate();
  }

  linkGroup(key, g_key, state = 2, with_group = false, isLinked = true) {
    if (state == 0) {
      this.state.link_modal.club_key = key;
      this.state.link_modal.group_key = g_key;
      this._openModal();
    } else if (state == 1) {
      if (with_group) {
        var group = this.state.clubsList[key].groups[g_key];
        if (!group.linked_to) 
          group.linked_to = {};
        group.linked_to[with_group] = isLinked;
        this.state.clubsList[key].groups[g_key] = group;

        group = this.state.clubsList[key].groups[with_group];
        if (!group.linked_to) 
          group.linked_to = {};
        group.linked_to[g_key] = isLinked;
        this.state.clubsList[key].groups[with_group] = group;
        this.forceUpdate();
      } else 
        alert('with_group is null');
      }
    else {
      this.link_modal.open()
      this.forceUpdate();
    }
  }

  _openModal() {
    if (this.link_modal.isOpen()) {
      this.link_modal.close()
      this.forceUpdate();
      setTimeout((function() {
        this.link_modal.open()
        this.forceUpdate();
      }).bind(this), 0);
    } else {
      this.link_modal.open()
      this.forceUpdate();
    }
  }

  nextPage() {
    this.headlineMarginLeft.setValue(100);
    Animated.timing(this.headlineMarginLeft, {
      useNativeDriver: false,
      toValue: 0,
      duration: 520,
      easing: Easing.ease
    }).start();

    this.nextHeadlineMarginLeft.setValue(0);
    Animated.timing(this.nextHeadlineMarginLeft, {
      useNativeDriver: false,
      toValue: 100,
      duration: 520,
      easing: Easing.ease
    }).start();
    this.state.curPageIndex = this.state.curPageIndex + 1;
    this.forceUpdate();
  }

  previousPage() {
    if (this.state.curPageIndex > 0) {
      this.headlineMarginLeft.setValue(0);
      Animated.timing(this.headlineMarginLeft, {
        useNativeDriver: false,
        toValue: 100,
        duration: 520,
        easing: Easing.ease
      }).start();

      this.nextHeadlineMarginLeft.setValue(0);
      Animated.timing(this.nextHeadlineMarginLeft, {
        useNativeDriver: false,
        toValue: 100,
        duration: 520,
        easing: Easing.ease
      }).start();
      this.state.curPageIndex = this.state.curPageIndex - 1;
      this.forceUpdate();
    }
  }

  _showError(msg, page) {
    const utils = this.props.navigation.getParam('utils', null);
    return utils.showAlert(msg, '', ['Ok'], (function() {
      this.state.curPageIndex = page;
      this.forceUpdate();
    }).bind(this));
  }

  _getSelectedClubs(){
    var selected_clubs = [];
    this.state.clubsList.forEach((club, i) => {
      if (club.selected) {
        selected_clubs.push(club)
      }
    });
    return selected_clubs
  }

  sendMessage() {
    // Check clubs and groups
    var send_at_groups = {};

    var selected_clubs,
      selected_groups = 0;
    this.state.clubsList.forEach((club, i) => {
      if (club.selected) {
        selected_clubs++;
        return Object.keys(club.groups).map(key => {
          if (club.groups[key].selected) {
            selected_groups++;

            if (club.groups[key].linked_to) {
              send_at_groups[key] = {
                linked_to: club.groups[key].linked_to
              };
            } else 
              send_at_groups[key] = true;
            }
          });
      }
    });
    if (selected_clubs == 0) 
      return this._showError('Kein Verein ausgewählt', 0);
    if (selected_groups == 0) 
      return this._showError('Keine Gruppe ausgewählt', 5);
    
    // Check texts
    if (!this.state.headlineInputValue) 
      return this._showError('Überschrift fehlt', 1);
    if (!this.state.shortTextInputValue) 
      return this._showError('Subtext fehlt', 1);
    if (!this.state.textInputValue) 
      return this._showError('Text fehlt', 1);

    //Check files
    var events_check = Object.keys(this.state.events).map(eventID => {
      const event = this.state.events[eventID]
      if (!event.getTitle()){
        this._showError('Name des Events fehlt', 2);
        return false
      }
      if (!event.getLocation()){
        this._showError('Location des Events fehlt', 2);
        return false
      }
      if (!event.getValue('starts_at')){
        this._showError('Datum des Events fehlt', 2);
        return false
      }
      return true
    });
    var events_ok = !events_check.includes(false)

    //Check files
    var files_check = Object.keys(this.state.files).map(fileID => {
      const file = this.state.files[fileID]
      if (file.isUploading()){
        this._showError('Datei-Upload noch nicht abgeschlossen', 3);
        return false
      }
      if (!file.getDownloadURL()){
        this._showError('Fehler beim Datei-Upload. Bitte erneut versuchen', 2);
        return false
      }
      return true
    });
    var files_ok = !files_check.includes(false)

    if (events_ok && files_ok){
      this.state.clubsList.forEach((club, i) => {
        if (club.selected) {
          var files = {};
          Object.keys(this.state.files).forEach(function (fileID) {
            files[fileID] = true;
          })

          var events = {};
          Object.keys(this.state.events).forEach(function (eventID) {
            events[eventID] = true;
          })

          var mes = {
            show_author: true,
            author: this.state.uid,
            headline: this.state.headlineInputValue,
            short_text: this.state.shortTextInputValue,
            long_text: this.state.textInputValue,
            send_at: new Date().getTime() / 1000,
            img: this.state.picture.download_url,
            img_thumbnail: this.state.picture.thumbnail_download_url,
            files: files,
            events: events,
            groups: send_at_groups
          };

          database().ref('clubs/' + club.club_id + '/messages').push(mes).then(() => this.props.navigation.navigate('ScreenHandler').bind(this));
        }
      });
    }
  }

  onChangeText(type, value) {
    if (type == 'headline') 
      this.state.headlineInputValue = value;
    else if (type == 'text') 
      this.state.textInputValue = value;
    else if (type == 'new_event_name') 
      this.state.new_event_name = value;
    else if (type == 'new_event_location') 
      this.state.new_event_location = value;
    else if (type == 'new_event_date') 
      this.state.new_event_date = value;
    else if (type == 'group_serach') 
      this.state.group_serach = value;
    else if (type == 'shortText') {
      if (!this.state.textInputValue || this.state.textInputValue == this.state.shortTextInputValue) 
        this.state.textInputValue = value;
      this.state.shortTextInputValue = value;
    }
    this.forceUpdate();
  }

  render() {
    const s_width = Dimensions.get("window").width;
    const headlineMarginLeft = this.headlineMarginLeft.interpolate({
      inputRange: [
        0, 50, 100
      ],
      outputRange: [40, -80, 40]
    });

    const nextHeadlineMarginLeft = this.nextHeadlineMarginLeft.interpolate({
      inputRange: [
        0, 25, 50, 75, 100
      ],
      outputRange: [400, 20, -400, 0, 0]
    });

    var pageHeadline = '';
    var pageContent = '';
    if (this.state.curPageIndex == 0) {
      pageHeadline = 'Empfänger auswählen';
      pageContent = Object.keys(this.state.clubsList).map(key => {
        var club = this.state.clubsList[key];
        return (
          <ClubCard key={key} selected={club.selected} club_name={club.name} club_members={club.members} club_img={club.logo} onPress={() => this.selectClub(key)}/>
        );
      });
    } else if (this.state.curPageIndex == 1) {
      pageHeadline = 'Mitteilung eingeben';
      pageContent = (
        <View style={{
            height: 600
          }}>

          <InputScrollView topOffset={120} style={{
              zIndex: 100
            }}>
            <InputBox
              width={350}
              label="Überschrift"
              multiline={true}
              onBlur={() => Keyboard.dismiss()}
              value={this.state.headlineInputValue}
              onChange={text => this.onChangeText('headline', text)}/>

            <InputBox
              marginTop={20}
              width={350}
              label="Anreißer"
              multiline={true}
              onBlur={() => Keyboard.dismiss()}
              value={this.state.shortTextInputValue}
              onChange={text => this.onChangeText('shortText', text)}/>

            <InputBox
              marginTop={20}
              width={350}
              label="Text"
              multiline={true}
              onBlur={() => {
                Keyboard.dismiss();
                this.state.long_text_input_has_focus = false;
              }}
              onFocus={() => {
                //this.scrollView.scrollToEnd({ animated: true });
                this.state.long_text_input_has_focus = true;
              }}
              value={this.state.textInputValue}
              onChange={text => this.onChangeText('text', text)}/>

          </InputScrollView>
        </View>
      );
    } else if (this.state.curPageIndex == 2) {
      pageHeadline = 'Events hinzufügen';
      if (Object.keys(this.state.events).length > 0) {
        pageContent = Object.keys(this.state.events).map(eventID => {
          const eventObj = this.state.events[eventID];
          return (
            <EventCard
              key={eventID}
              card_type="new_message"
              editable={true}
              event={eventObj}/>
          );
        });
      } else 
        pageContent = (
          <View
            style={{
              paddingLeft: 15,
              paddingRight: 15,
              alignItems: 'center',
              justifyContent: 'center',
              height: 560
            }}>
            <Image style={{
                width: 320,
                height: 250
              }} source={require('./../assets/img/event_illustration.png')}/>
            <Theme.Text
              style={{
                marginTop: 40,
                fontFamily: 'Poppins-ExtraBold',
                fontSize: 30,
                opacity: .5
              }}>Keine Events</Theme.Text>
          </View>
        );
      }
    else if (this.state.curPageIndex == 3) {
      pageHeadline = 'Dateien hinzufügen';
      if (Object.keys(this.state.files).length > 0) {
        pageContent = Object.keys(this.state.files).map(key => {
          var file = this.state.files[key];
          return (
            <FileCard
              key={key}
              card_size={'small'}
              editable={true}
              downloadable={false}
              file={file}/>
          );
        });
      } else 
        pageContent = (
          <View
            style={{
              paddingLeft: 15,
              paddingRight: 15,
              alignItems: 'center',
              justifyContent: 'center',
              height: 560
            }}>
            <Image style={{
                width: 300,
                height: 260
              }} source={require('./../assets/img/files_illustration.png')}/>
            <Theme.Text
              style={{
                marginTop: 40,
                fontFamily: 'Poppins-ExtraBold',
                fontSize: 30,
                opacity: .5
              }}>Keine Dateien</Theme.Text>
          </View>
        );
      }
    else if (this.state.curPageIndex == 4) {
      pageHeadline = 'Beitragsbild hinzufügen';

      if (this.state.picture.path) {
        pageContent = (
          <View>
            {
              this.state.picture.uploading
                ? <Theme.Text
                    style={{
                      fontFamily: 'Poppins-Bold',
                      fontSize: 18
                    }}>
                    Hochgeladen: {Math.round(this.state.picture.uploaded_percentage)}
                    %
                  </Theme.Text>
                : void 0
            }

            <AutoHeightImage width={335} source={{
                uri: this.state.picture.path
              }}/>
          </View>
        );
      } else 
        pageContent = (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '85%'
            }}>
            <Text
              style={{
                fontFamily: 'Poppins-ExtraBold',
                color: '#514D5D',
                fontSize: 30,
                alignSelf: 'center'
              }}>KEIN BILD</Text>
          </View>
        );
      }
    else if (this.state.curPageIndex == 5) {
      pageHeadline = 'Gruppen auswählen';
      var groupsList = Object.keys(this.state.clubsList).map(key => {
        var club = this.state.clubsList[key];
        if (club.selected) {
          return Object.keys(club.groups).map(g_key => {
            var group = club.groups[g_key];
            if (group.name.includes(this.state.group_serach)) {

              var iconColor = group.selected
                ? club.color
                : '#ADA4A9';
              var icon = group.selected
                ? faTimesCircle
                : faPlusCircle;

              return (
                <Theme.TouchableOpacity
                  color={group.selected
                    ? 'selected_view'
                    : 'view'}
                  onPress={() => this.addGroup(key, g_key)}
                  key={g_key}
                  style={{
                    borderRadius: 5,
                    paddingTop: 5,
                    paddingBottom: 5,
                    marginTop: 5,
                    marginBottom: 5,
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    flexDirection: 'row'
                  }}>
                  <View
                    style={{
                      marginLeft: 8,
                      marginTop: 5,
                      zIndex: 100,
                      height: 30,
                      width: 30,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                    <Theme.CheckBox
                      lineWidth={2}
                      checked={group.selected}
                      onChange={() => this.addGroup(key, g_key)}
                      style={{
                        marginTop: -25,
                        height: 20,
                        width: 20
                      }}/>
                  </View>
                  <View style={{
                      marginLeft: 18
                    }}>
                    <Theme.Text
                      style={{
                        fontSize: 18,
                        fontFamily: 'Poppins-SemiBold',
                        color: 'white',
                        opacity: 0.85
                      }}>
                      {group.name}
                    </Theme.Text>
                    <Theme.Text
                      style={{
                        fontSize: 15,
                        fontFamily: 'Poppins-SemiBold',
                        color: 'white',
                        opacity: 0.6
                      }}>
                      {group.members.toLocaleString() + " "} Mitglieder
                    </Theme.Text>
                  </View>
                  {
                    group.selected
                      ? <TouchableOpacity
                          style={{
                            opacity: 0.6,
                            position: 'absolute',
                            marginTop: 15,
                            marginLeft: 275
                          }}
                          onPress={() => this.linkGroup(key, g_key, 0)}>
                          <Theme.Icon size={20} icon={faLink}/>
                        </TouchableOpacity>
                      : void 0
                  }
                </Theme.TouchableOpacity>
              );
            }
          });
        }
      });

      const modal_club_key = this.state.link_modal.club_key;
      const modal_group_key = this.state.link_modal.group_key;

      var linkingGroupsList = null;
      const club = this.state.clubsList[modal_club_key];

      if (modal_club_key && modal_group_key) {
        linkingGroupsList = Object.keys(club.groups).map(g_key => {
          if (g_key != modal_group_key) {
            var group = club.groups[g_key];

            var is_linked = false;
            if (group.linked_to) {
              if (group.linked_to[modal_group_key]) 
                is_linked = true;
              }
            var iconColor = is_linked
              ? club.color
              : '#ADA4A9';
            var icon = is_linked
              ? faTimesCircle
              : faPlusCircle;

            return (
              <Theme.TouchableOpacity
                color={is_linked
                  ? 'selected_view'
                  : 'view'}
                onPress={() => this.linkGroup(modal_club_key, modal_group_key, 1, g_key, !is_linked)}
                key={g_key}
                style={{
                  borderRadius: 5,
                  paddingTop: 5,
                  paddingBottom: 5,
                  marginTop: 5,
                  marginBottom: 5,
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                  flexDirection: 'row'
                }}>
                <View
                  style={{
                    marginLeft: 8,
                    marginTop: 5,
                    zIndex: 100,
                    height: 30,
                    width: 30,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                  <Theme.CheckBox
                    lineWidth={2}
                    animationDuration={0.15}
                    checked={is_linked}
                    onChange={() => this.linkGroup(modal_club_key, modal_group_key, 1, g_key, !is_linked)}
                    style={{
                      marginTop: -25,
                      height: 20,
                      width: 20
                    }}/>
                </View>
                <View style={{
                    marginLeft: 18
                  }}>
                  <Theme.Text
                    style={{
                      fontSize: 18,
                      fontFamily: 'Poppins-SemiBold',
                      opacity: 0.85
                    }}>
                    {group.name}
                  </Theme.Text>
                  <Theme.Text
                    style={{
                      fontSize: 15,
                      fontFamily: 'Poppins-SemiBold',
                      opacity: 0.6
                    }}>
                    {group.members.toLocaleString()}
                    Mitglieder
                  </Theme.Text>
                </View>
              </Theme.TouchableOpacity>
            );
          }
        });
      }
      /*
      groupsList = (
        <Text style={{
            color: '#665F75',
            fontFamily: 'Poppins-Bold'
          }}>
          {
            this.state.clubsList
              ? 'Kein Vereins ausgewählt'
              : 'Keine Gruppen gefunden'
          }
        </Text>
      );
      */

      pageContent = (
        <View style={{
            marginBottom: 20
          }}>
          <Modal ref={m => {
              this.link_modal = m;
            }} headline={'Gruppe verlinken'}>
            <ScrollView style={{
                paddingRight: 20
              }}>
              <Theme.Text
                style={{
                  opacity: 0.6,
                  color: 'white',
                  fontFamily: 'Poppins-Medium',
                  fontSize: 18,
                  marginTop: 20,
                  marginBottom: 30
                }}>
                In verlinkten Gruppen erhalten nur die Mitglieder eine Mitteilung, die sich in jeder verlinkten Gruppen befinden. Verlinkungen werden nur für diese Mitteilung
                übernommen.
              </Theme.Text>
              {linkingGroupsList}
            </ScrollView>
          </Modal>
          <Theme.View style={{
              borderRadius: 10,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0
            }}>
            <Theme.TextInput
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
              value={this.state.group_serach}
              placeholderTextColor="#665F75"
              placeholder="Gruppe suchen ..."
              onChangeText={text => this.onChangeText('group_serach', text)}/>
          </Theme.View>
          <Theme.View color={'selected_view'} style={{
              height: 0.5,
              width: '100%'
            }}/>
          <Theme.View
            style={{
              marginTop: 0,
              padding: 20,
              paddingLeft: 10,
              borderRadius: 10,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              maxHeight: 550
            }}>
            <ScrollView showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
              {groupsList}
            </ScrollView>
          </Theme.View>

        </View>
      );
    }

    return (
      <Theme.View color={'background_view'} style={{
          flex: 1
        }} keyboardShouldPersistTaps="always">

        <Modal ref={m => {
            this.event_modal = m;
          }} headline={'Event erstellen'} onDone={() => this.createEvent()}>
          <ScrollView>
            <InputBox label="Name" width={s_width * .95} marginTop={20} value={this.state.modal.event.title} onChange={v => (this.state.modal.event.title = v)}/>
            <InputBox label="Ort" width={s_width * .95} marginTop={20} value={this.state.modal.event.location} onChange={v => (this.state.modal.event.location = v)}/>

            <Switch
              onValueChange={() => {
                this.state.modal.event.full_day = !this.state.modal.event.full_day;
                this.forceUpdate();
              }}
              value={this.state.modal.event.full_day}
              label="Ganztägig"/>
            <DatePicker
              label={!this.state.modal.event.full_day
                ? 'Beginn'
                : 'Datum'}
              mode={!this.state.modal.event.full_day
                ? 'datetime'
                : 'date'}
              value={this.state.modal.event.starts_at}
              onChange={v => {
                this.state.modal.event.starts_at = v;
                this.forceUpdate()
              }}
              width={s_width * .95}></DatePicker>
            {
              !this.state.modal.event.full_day
                ? <View>
                    <DatePicker
                      label='Ende'
                      mode={'datetime'}
                      marginTop={20}
                      value={this.state.modal.event.ends_at}
                      onChange={v => {
                        this.state.modal.event.ends_at = v;
                        this.forceUpdate()
                      }}
                      width={s_width * .95}/></View>
                : void 0
            }

            <SelectBox
              marginTop={20}
              width={s_width * .95}
              picker_width={170}
              label="Wiederholen"
              sheet_headline="Intervall auswählen"
              elements={[
                'Nie',
                'Täglich',
                'Wöchentlich',
                'Alle 2 Wochen',
                'Monatlich',
                'Jährlich'
              ]}
              value={this.state.modal.event.repeat}
              onChange={(value, index) => {
                console.log(value)
                this.state.modal.event.repeat = value
                this.forceUpdate()
              }}/>

          </ScrollView>
        </Modal>

        {
          pageHeadline != ''
            ? <View
                style={{
                  zIndex: 10,
                  marginTop: 50,
                  width: '100%',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row'
                }}>
                <Theme.Text style={{
                    color: 'white',
                    fontFamily: 'Poppins-Bold',
                    fontSize: 27
                  }}>
                  {pageHeadline}
                </Theme.Text>
              </View>
            : void 0
        }

        {
          pageContent != ''
            ? <View style={{
                  marginTop: 30,
                  marginLeft: 20,
                  marginRight: 20
                }}>
                {pageContent}
              </View>
            : void 0
        }

        {
          this.state.curPageIndex == 0
            ? <TouchableOpacity
                style={{
                  zIndex: 20,
                  marginTop: 56,
                  marginLeft: 20,
                  position: 'absolute'
                }}
                onPress={() => this.props.navigation.navigate('ScreenHandler')}>
                <Theme.Icon style={{
                    zIndex: 0
                  }} size={22} icon={faChevronCircleLeft}/>
              </TouchableOpacity>
            : void 0
        }

        <View
          style={{
            marginTop: 720,
            width: '89.2%',
            position: 'absolute',
            marginLeft: 20,
            marginRight: 20,
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            flexDirection: 'row'
          }}>

          {
            this.state.curPageIndex > 0
              ? <Theme.TouchableOpacity
                  color={'selected_view'}
                  style={{
                    justifyContent: 'center',
                    alignSelf: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 40,
                    justifyContent: 'center'
                  }}
                  onPress={() => this.previousPage()}>
                  <Theme.Icon
                    style={{
                      marginRight: 4,
                      alignSelf: 'center',
                      textAlign: 'center',
                      zIndex: 0
                    }}
                    size={17}
                    icon={faChevronLeft}/>
                </Theme.TouchableOpacity>
              : <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignSelf: 'center',
                    width: 47,
                    height: 47
                  }}/>
          }

          {
            this.state.curPageIndex == 2 || this.state.curPageIndex == 3 || this.state.curPageIndex == 4
              ? <Theme.TouchableOpacity
                  color={'view'}
                  style={{
                    justifyContent: 'center',
                    alignSelf: 'center',
                    width: 65,
                    height: 65,
                    marginLeft: 138,
                    borderRadius: 40,
                    position: 'absolute',
                    justifyContent: 'center'
                  }}
                  onPress={() => {
                    if (this.state.curPageIndex == 2) 
                      this._openCreateEventModal()
                    else if (this.state.curPageIndex == 3) 
                      this.openUploadFileModal();
                    else 
                      this.openUploadPictureModal();
                    }}>
                  <Theme.Icon
                    style={{
                      alignSelf: 'center',
                      textAlign: 'center',
                      zIndex: 0
                    }}
                    size={30}
                    color="#1e1e1e"
                    icon={this.state.curPageIndex == 2
                      ? faPlus
                      : faUpload}/>
                </Theme.TouchableOpacity>
              : void 0
          }

          {
            this.state.curPageIndex < 5
              ? <Theme.TouchableOpacity
                  color={'selected_view'}
                  style={{
                    justifyContent: 'center',
                    alignSelf: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 40,
                    justifyContent: 'center'
                  }}
                  onPress={() => this.nextPage()}>
                  <Theme.Icon
                    style={{
                      marginLeft: 4,
                      alignSelf: 'center',
                      textAlign: 'center',
                      zIndex: 0
                    }}
                    size={17}
                    icon={faChevronRight}/>
                </Theme.TouchableOpacity>
              : void 0
          }

          {
            this.state.curPageIndex == 5
              ? <Theme.TouchableOpacity
                  color={'selected_view'}
                  style={{
                    alignSelf: 'center',
                    width: 40,
                    height: 40,
                    marginLeft: 280,
                    borderRadius: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                    padding: 5,
                    position: 'absolute'
                  }}
                  onPress={() => this.sendMessage()}>
                  <Theme.Icon
                    style={{
                      marginRight: 5,
                      alignSelf: 'center',
                      textAlign: 'center',
                      zIndex: 0
                    }}
                    size={17}
                    icon={faPaperPlane}/>
                </Theme.TouchableOpacity>
              : void 0
          }
        </View>
      </Theme.View>
    );
  }
}
class ClubCard extends React.Component {
  render() {
    return (
      <Pressable onPress={() => this.props.onPress()}>
        <Theme.View
          color={this.props.selected
            ? "selected_view"
            : "view"}
          style={{
            marginBottom: 20,
            borderRadius: 13,
            padding: 13,
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            flexDirection: 'row'
          }}>
          <AutoHeightImage style={{
              borderRadius: 50
            }} width={50} source={{
              uri: this.props.club_img
            }}/>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',

              height: 50,
              marginLeft: 20,
              alginSelf: 'center',
              justifySelf: 'center'
            }}>
            <View>
              <Theme.Text style={{
                  fontSize: 18,
                  fontFamily: 'Poppins-SemiBold'
                }}>{this.props.club_name}</Theme.Text>
              <Theme.Text style={{
                  fontSize: 13,
                  fontFamily: 'Poppins-SemiBold',
                  opacity: 0.4
                }}>
                {this.props.club_members.toLocaleString() + ' Mitglieder'}
              </Theme.Text>
            </View>
          </View>
        </Theme.View>
      </Pressable>
    );
  }
}
