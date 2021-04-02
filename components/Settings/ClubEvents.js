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
  ActivityIndicator,
  ImageBackground,
  Picker,
  Keyboard
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
  faTrash,
  faUpload,
  faCalendarMinus
} from "@fortawesome/free-solid-svg-icons";
import ClubCard from "./../../components/ClubCard.js";
import InputBox from "./../../components/InputBox.js";
import Switch from "./../../components/Switch.js";
import Button from "./../../components/Button.js";
import {default as File} from './../../classes/File.js';
import {default as EventCard} from './../../components/Event.js';
import {default as Modal} from "./../../components/Modal.js";
import DatePicker from './../../components/DatePicker.js'
import SelectBox from './../../components/SelectBox.js'

export default class ClubEvents extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      events: {},
      modal: {
        event: {},
        headline: "Event bearbeiten"
      }
    };

    this.props.setting_screen.showActionButton(true);

    this.props.club.getEvents(function(events) {
      events.forEach((event, i) => {
        event.setReadyListener(function() {
          if (!this.state.events[event.getID()]) 
            this.state.events[event.getID()] = event;
          this.forceUpdate()
        }.bind(this))
      });
    }.bind(this), true);
  }

  componentDidMount() {
    this.props.setting_screen.onChildRef(this);
  }

  actionButtonOnPress() {
    this.state.modal.headline = "Event erstellen";
    this.state.modal.event = {
      id: "NEW",
      ends_at: new Date(),
      full_day: false,
      groups: {},
      img: "",
      locaiton: "",
      repeat: "",
      starts_at: new Date(),
      title: "",
      visible: true
    };
    this.forceUpdate();
    this.modal.open();
    //this.starts_at_modal.open();
  }

  _editEvent() {
    this.modal.close();
    /*
    const club = this.props.club;
    var group = this.state.modal.group;
    if (group.id != "NEW") {
      club.updateGroupName(group.id, group.name);
      club.updateGroupPublic(group.id, group.public);
      club.updateGroupAdminRights(group.id, group.has_admin_rights);
      this.forceUpdate();
    } else {
      // create new group
      club.createGroup(this.state.modal.group);
      this.forceUpdate();
    }
    */
  }

  dateToString(date) {
    if (date) {
      console.log('DATETOSTIRNG: ' + date.toLocaleString())
      return date.toLocaleDateString("de-DE", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return ''
  }

  render() {
    const s_width = Dimensions.get("window").width;
    const s_height = Dimensions.get("window").height;

    const club = this.props.club;

    const pageContent = Object.keys(this.state.events).reverse().map(event_id => {
      const event = this.state.events[event_id];
      if (event) {
        return <EventCard card_size={'small'} event={event}/>;
      }
    });
    return (
      <View>
        <Modal ref={m => {
            this.modal = m;
          }} headline={this.state.modal.headline} onDone={() => this._editEvent()}>
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

        <Theme.ActivityIndicator
          style={{
            alignSelf: 'flex-start',
            marginRight: 'auto',
            marginLeft: 20,
            marginBottom: 50
          }}
          scale={1.2}
          visible={false}></Theme.ActivityIndicator>
        {
          club.hasEvents()
            ? pageContent
            : <View style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                <Image
                  style={{
                    marginTop: 10,
                    width: 302,
                    height: 261
                  }}
                  source={require('./../../assets/img/event_illustration.png')}/>
                <Theme.Text
                  style={{
                    marginTop: 40,
                    fontFamily: 'Poppins-ExtraBold',
                    fontSize: 30,
                    opacity: .5
                  }}>Keine Events</Theme.Text>
                <Theme.Text
                  style={{
                    textAlign: 'center',
                    marginTop: 20,
                    fontFamily: 'Poppins-Medium',
                    fontSize: 20,
                    opacity: .5
                  }}>Lade eine Datei für deinen Club hoch, um sie nachher mit einer Mitteilung zu verknüpfen.</Theme.Text>
                <Button
                  style={{
                    marginTop: 20
                  }}
                  color="selected_view"
                  label="Event erstellen"
                  onPress={() => this.actionButtonOnPress()}/>
              </View>
        }
      </View>
    );
  }
}
