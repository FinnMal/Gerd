import React from 'react';
import {
  View,
  TouchableOpacity,
  ActionSheetIOS,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  faCalendar,
  faCalendarMinus,
  faEllipsisV
} from '@fortawesome/free-solid-svg-icons';
import {Theme} from './../app/index.js';
import {default as Modal} from "./../components/Modal.js";
import {default as InputBox} from "./../components/InputBox.js";
import DatePicker from './../components/DatePicker.js'
import SelectBox from './../components/SelectBox.js'
import Switch from "./../components/Switch.js";

// EVENT class: component for club events
export default class Event extends React.Component {
  constructor(props) {
    super(props);
    this.props.event.setReadyListener(function(){
      this.forceUpdate()
    }.bind(this))
  }

  _onPress(){
    if(this.props.event.isOwn()) this._showOptions()
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

        // load event
        this.props.event.getValue('full_day', function(){
          this.props.event.getValue('ends_at', function(){
            this.props.event.getValue('location', function(){
              this.props.event.getValue('visible', function(){
                  this.modal.open()
                  this.forceUpdate();
              }.bind(this))
            }.bind(this))
          }.bind(this))
        }.bind(this))
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
    event.storeValue('full_day')
    event.storeValue('title')
    event.storeValue('location')
    event.storeValue('full_day')
    event.storeValue('starts_at')
    event.storeValue('ends_at')
    event.storeValue('repeat')
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
    // props.card_size === none -> Message Screen

    const event = this.props.event;
    const s_width = Dimensions.get("window").width;
    const modalView = (
      <Modal ref={m => {
          this.modal = m;
        }} headline={'Event bearbeiten'} onDone={() => this._saveEdit()}>
        <ScrollView>
            <InputBox label="Name" width={s_width * .95} marginTop={20} value={event.getTitle()} onChange={v => (event.setTitle(v))}/>
            <InputBox label="Ort" width={s_width * .95} marginTop={20} value={event.getLocation()} onChange={v => (event.setLocation(v))}/>

            <Switch
              onValueChange={() => {
                event.setValue(!event.getValue('full_day'), 'full_day')
                this.forceUpdate();
              }}
              value={event.getValue('full_day')}
              label="Ganztägig"/>
            <DatePicker
              label={!event.getValue('full_day')
                ? 'Beginn'
                : 'Datum'}
              mode={!event.getValue('full_day')
                ? 'datetime'
                : 'date'}
              value={new Date(event.getValue('starts_at')*1000)}
              onChange={v => {
                event.setValue(v.getTime()/1000, 'starts_at')
                this.forceUpdate()
              }}
              width={s_width * .95}></DatePicker>
            {
              !event.getValue('full_day')
                ? <View>
                    <DatePicker
                      label='Ende'
                      mode={'datetime'}
                      marginTop={20}
                      value={new Date(event.getValue('ends_at')*1000)}
                      onChange={v => {
                        event.setValue(v.getTime()/1000, 'ends_at')
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
              value={event.getValue('repeat')}
              onChange={(value, index) => {
                event.setValue(value, 'repeat')
                this.forceUpdate()
              }}/>

          </ScrollView>
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
      // for message screen
      return (
        <View style={{
            marginBottom: 30
          }}>
          
          {modalView}

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
                opacity:0.8,
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
                  }} size={28} icon={faCalendar}></Theme.Icon>
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
                    fontFamily: 'Poppins-Medium',
                    opacity:0.7,
                  }}>
                  {event.getDate()}
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
                      <TouchableOpacity onPress={() => this._showOptions()} style={{
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
