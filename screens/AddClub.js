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
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  AsyncStorage,
  Linking,
  ActivityIndicator
} from 'react-native';
import {Headlines} from './../app/constants.js';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faUserCircle,
  faUserShield,
  faPlusCircle,
  faCamera,
  faSearch,
  faCheckCircle,
  faChevronCircleRight,
  faExclamationCircle,
  faTimesCircle,
  faChevronCircleLeft
} from '@fortawesome/free-solid-svg-icons';
import {NotificationCard} from './../app/components.js';
import database from '@react-native-firebase/database';
import {withNavigation} from 'react-navigation';
import auth from '@react-native-firebase/auth';
import functions from '@react-native-firebase/functions';
import CheckBox from '@react-native-community/checkbox';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import Group from "./../components/Group.js";
import {Theme} from './../app/index.js';
import HeaderScrollView from './../components/HeaderScrollView.js';
import InputBox from "./../components/InputBox.js";
import {default as Modal} from "./../components/Modal.js";
import Button from "./../components/Button.js";

class AddClubScreen extends React.Component {
  constructor(props) {
    super(props);

    const utils = this.props.utilsObject || this.props.navigation.getParam('utils', null);

    this.state = {
      utils: utils,
      selected_club_id: -1,
      search_value: '',
      clubs: [],
      joinable_groups: [],
      search_results: [],
      text_input_focused: false,
      modal_visible: [
        false, false
      ],
      qr_code_result: null,
      account_type: utils.getAccountType(),
      loading: false
    };

    this.margin = new Animated.Value(-20);
  }

  /*searchClub(str, open_result = -1) {
    if (str && str != '' && str != ' ') {
      this.state.loading = true;
      this.forceUpdate();
      functions().httpsCallable('searchClub')({search: str}).then(response => {
        console.log(response.data);
        this.state.loading = false;
        this.forceUpdate();
        if (open_result > -1) {
          //fetch club name
          database().ref('clubs/' + response.data[open_result].id + '/name').once('value', (function(snap) {
            response.data[open_result].name = snap.val();
            if (this.state.qr_code_result == null)
              this.animateQrCodeResult('in', response.data[open_result]);
            else
              this.animateQrCodeResult('out', response.data[open_result], (function() {
                this.animateQrCodeResult('in', response.data[open_result]);
              }).bind(this));
            }
          ).bind(this));
        } else
          this.state.search_results = response.data;
        this.forceUpdate();
      });
    }
  }*/

  searchClubByCode(code, cb) {
    code = code.toUpperCase()
    database().ref('clubs/keys').once('value', function(snap) {
      const keys = snap.val();
      Object.keys(keys).forEach(function(club_id) {
        database().ref('clubs/' + club_id + '/invite_codes/' + code + '/groups').once('value', function(snap) {
          const groups = snap.val();
          if (groups) {
            return cb([
              {
                code: code,
                id: club_id,
                groups: groups
              }
            ]);
          }
        });
      });
    });
  }

  searchClub(str, open_result = -1) {
    if (str && str != '' && str != ' ') {
      this.state.loading = true;
      this.forceUpdate();

      console.log('>' + str + '<')
      this.searchClubByCode(str, function(res) {
        console.log(res)
        this.state.loading = false;
        this.forceUpdate();
        if (open_result > -1) {
          //fetch club name
          database().ref('clubs/' + res[0].id + '/name').once('value', (function(snap) {
            res[0].name = snap.val();
            if (this.state.qr_code_result == null) 
              this.animateQrCodeResult('in', res[0]);
            else 
              this.animateQrCodeResult('out', res[0], (function() {
                this.animateQrCodeResult('in', res[0]);
              }).bind(this));
            }
          ).bind(this));
        } else 
          this.state.search_results = res;
        this.forceUpdate();
      }.bind(this))
    }
  }

  animateQrCodeResult(dir, res, cb) {
    if (!res) 
      this.state.qr_code_result = {
        ok: false,
        name: 'Verein nicht gefunden'
      };
    else {
      res.ok = true;
      this.state.qr_code_result = res;
      this.state.qr_code_result.name = this.state.qr_code_result.name + " beitreten"
    }
    this.forceUpdate();
    if (dir == 'in') 
      var param = [630, 430, 250];
    else 
      var param = [430, 630, 100];
    this.margin.setValue(param[0]);
    Animated.timing(this.margin, {
      useNativeDriver: false,
      toValue: param[1],
      duration: param[2],
      easing: Easing.ease
    }).start(() => {
      if (cb) 
        cb();
      }
    );
  }

  showJoinClubModal(club_id, preselected_groups = {}) {
    this.state.selected_club_id = club_id;

    // hide result button
    this.animateQrCodeResult('out');

    // close qr code modal
    this.scan_qr_code_modal.close();
    // show the modal
    this.select_groups_modal.open();
    this.forceUpdate();

    // load all groups of club
    database().ref('clubs/' + club_id + '/groups').once('value', (function(snapshot) {
      var groups = snapshot.val();

      // load already joined groups by user
      database().ref('users/' + this.state.utils.getUserID() + '/clubs/' + club_id + '/groups').once('value', (function(snap) {
        var joined_groups = snap.val();
        if (!joined_groups) 
          joined_groups = {};
        
        // merge joined groups and preselected groups
        var joinable_groups = [];
        Object.keys(groups).map(key => {
          var group = groups[key];
          var preselected = preselected_groups[key] || joined_groups[key];
          if (group.public !== false || preselected) {
            group.key = key;
            group.preselected = preselected;
            group.selected = preselected;
            joinable_groups.push(group);
          }
        });
        this.state.joinable_groups = joinable_groups;
        this.forceUpdate();
      }).bind(this));
    }).bind(this));
  }

  joinClub(club_id, groups) {
    const utils = this.state.utils;

    // close the modal
    this.select_groups_modal.close();

    var selected_groups = [];
    groups.forEach((group, i) => {
      if (group.selected) 
        selected_groups.push(group)
    });
    database().ref('clubs/' + club_id + '/name').once('value', (function(snapshot) {
      var club_name = snapshot.val();

      database().ref('clubs/' + club_id + '/members').once('value', (function(snapshot) {
        const uid = utils.getUserID();
        var club_members = snapshot.val();

        database().ref('clubs/' + club_id + '/members').set(club_members + 1);

        var user_club = {
          club_id: club_id,
          notifications: true,
          groups: {}
        }

        var is_admin = false;
        selected_groups.forEach((group, i) => {
          if (group.has_admin_rights) 
            is_admin = true;
          database().ref('clubs/' + club_id + '/groups/' + group.key + '/members').set(group.members + 1);
          user_club.groups[group.key] = true;
        });

        user_club.role = is_admin
          ? 'admin'
          : 'subscriber'

        if (selected_groups.length > 0) {
          database().ref('users/' + uid + '/clubs/' + club_id).set(user_club);
          utils.showAlert('Du bist jetzt ' + (
            is_admin
              ? 'Administrator'
              : 'Mitglied'
          ) + ' von ' + club_name, '', ['Ok'], false, false);
        } else {
          database().ref('users/' + uid + '/clubs/' + club_id).remove();
          utils.showAlert('Du bist jetzt kein Mitglied mehr von ' + club_name, '', ['Ok'], false, false);
        }

      }).bind(this));
    }).bind(this));
  }

  _selectGroup(key, selected) {
    this.state.joinable_groups[key].selected = selected;
  }

  _openModal(modal_id) {
    this.state.qr_code_result = null;
    if (this.state.modal_visible[modal_id]) {
      this.state.modal_visible[modal_id] = false;
      this.forceUpdate();
      setTimeout((function() {
        this.state.modal_visible[modal_id] = true;
        this.forceUpdate();
      }).bind(this), 0);
    } else {
      this.state.modal_visible[modal_id] = true;
      this.forceUpdate();
    }
  }

  _qrCodeScanned(e) {
    this.searchClub(e.data, 0);
    this.forceUpdate();
  }

  checkIfScrollViewIsNeeded(viewHeight) {
    if (this.props.setScrollViewEnabled) {
      if (viewHeight < Dimensions.get('window').height) {
        this.props.setScrollViewEnabled(false);
      } else {
        this.props.setScrollViewEnabled(true);
      }
    }
  }

  render() {
    const s_width = Dimensions.get('window').width;
    const margin = this.margin.interpolate({
      inputRange: [
        0, 2000
      ],
      outputRange: [0, 2000]
    });

    const ps0 = this.state.profile_0_selected;

    var searchResults = Object.keys(this.state.search_results).map(key => {
      var result = this.state.search_results[key];
      if (result) {
        return (<SearchResult key={key} club_id={result.id} onPress={() => this.showJoinClubModal(result.id, result.groups)}/>);
      }
    });
    // filter null results
    searchResults = searchResults.filter(function(e) {
      return e !== undefined;
    });

    // groups list for select groups modal
    const groupsList = Object.keys(this.state.joinable_groups).map(key => {
      var group = this.state.joinable_groups[key];
      if (!group.preselected) {
        return (<Group key={key} id={key} name={group.name} onSelect={(key, selected) => this._selectGroup(key, selected)} selected={group.selected}/>);
      }
    });

    // all groups that are preselected, by (QR-)Code
    var preSelectedGroupsList = Object.keys(this.state.joinable_groups).map(key => {
      var group = this.state.joinable_groups[key];
      if (group.preselected) {
        return (<Group key={key} id={key} name={group.name} onSelect={(key, selected) => this._selectGroup(key, selected)} selected={group.selected}/>);
      }
    });

    preSelectedGroupsList = preSelectedGroupsList.filter(function(e) {
      return e !== undefined;
    });

    var s = require('./../app/style.js');

    const qrc_r = this.state.qr_code_result;
    if (this.props.show || this.props.navigation.getParam('show', null)) {
      return (
        <View>
          <Modal ref={m => {
              this.scan_qr_code_modal = m;
            }} headline={"QR-Code scannen"}>
            <Theme.Text
              style={{
                marginTop: 20,
                opacity: 0.8,
                color: 'white',
                fontFamily: 'Poppins-Medium',
                fontSize: 19
              }}>
              Du kannst einem Verein per QR-Code beitreten. Halte dazu deine Kamera auf den QR-Code des Vereins.
            </Theme.Text>
            <View style={{
                marginTop: 20,
                marginLeft: -20
              }}>
              <QRCodeScanner reactivate={true} reactivateTimeout={1700} onRead={this._qrCodeScanned.bind(this)}></QRCodeScanner>
            </View>
            {
              qrc_r
                ? <Button
                    size={"extra_big"}
                    label={qrc_r.name}
                    iconPos={"right"}
                    icon={!qrc_r.ok
                      ? faExclamationCircle
                      : faChevronCircleRight}
                    color={qrc_r.ok
                      ? 'primary'
                      : 'danger'}
                    style={{
                      marginTop: margin,
                      borderRadius: 13,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                    onPress={() => {
                      if (qrc_r.ok) {
                        this.showJoinClubModal(qrc_r.id, qrc_r.groups);
                      }
                    }}></Button>
                : void 0
            }
          </Modal>
          <Modal
            ref={m => {
              this.select_groups_modal = m;
            }}
            headline={"Rollen auswählen"}
            onDone={() => this.joinClub(this.state.selected_club_id, this.state.joinable_groups)}>
            <ScrollView showsVerticalScrollIndicator={false} style={{
                paddingTop: 30
              }}>
              {
                preSelectedGroupsList.length > 0
                  ? <View style={{
                        marginBottom: 30
                      }}>{preSelectedGroupsList}</View>
                  : void 0
              }
              <View style={{
                  marginBottom: 80
                }}>
                {groupsList}
              </View>
            </ScrollView>
          </Modal>
          <HeaderScrollView
            headline="Beitreten"
            headlineFontSize={46}
            backButton={true}
            actionButtonIcon={faCamera}
            actionButtonOnPress={() => {
              this.scan_qr_code_modal.open()
            }}>
            <Theme.Text style={{
                opacity: .8,
                fontFamily: 'Poppins-Medium',
                fontSize: 19
              }}>
              Du kannst nach öffentlichen Vereinen suchen, oder einen Einladungcode eingeben.
            </Theme.Text>

            <Theme.View style={{
                marginTop: 30,
                borderRadius: 10,
                backgroundColor: '#1e1e1e'
              }}>
              <InputBox icon={faSearch} placeholder={"Name oder Code"} onChange={(v) => this.searchClub(v)}/>
              <Theme.ActivityIndicator
                visible={this.state.loading}
                style={{
                  marginTop: 10,
                  marginBottom: 10
                }}
                scale={1}/>
            </Theme.View>
            {
              searchResults.length > 0
                ? <Theme.View
                    style={{
                      paddingBottom: 20,
                      marginBottom: 20,
                      marginTop: 0,
                      borderBottomLeftRadius: 10,
                      borderBottomRightRadius: 10,
                      backgroundColor: '#1e1e1e'
                    }}>
                    {searchResults}
                  </Theme.View>
                : void 0
            }
          </HeaderScrollView>

        </View>
      );
    } else 
      this.state.modal_visible[0] = false;
    this.state.modal_visible[1] = false;
    return null;
  }
}

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777'
  },
  textBold: {
    fontWeight: '500',
    color: '#000'
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)'
  },
  buttonTouchable: {
    padding: 16
  }
});

class SearchResult extends React.Component {
  name = "";
  img = "";
  constructor(props) {
    super(props);

    database().ref('clubs/' + props.club_id + '/logo').once('value', (function(snap) {
      this.img = snap.val();
      this.forceUpdate();
    }).bind(this));

    database().ref('clubs/' + props.club_id + '/name').once('value', (function(snap) {
      this.name = snap.val();
      this.forceUpdate();
    }).bind(this));
  }

  render() {
    if (this.name) 
      return (
        <TouchableOpacity
          style={{
            marginTop: 15,
            marginLeft: 13,
            marginRight: 20,
            width: '80%',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            flexDirection: 'row'
          }}
          onPress={() => this.props.onPress(this.props.club_id)}>
          <AutoHeightImage style={{
              borderRadius: 40
            }} width={40} source={{
              uri: this.img
            }}/>
          <View
            style={{
              height: 40,
              paddingLeft: 15,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            <Text style={{
                fontFamily: 'Poppins-SemiBold',
                color: '#C5C3CB',
                fontSize: 16
              }}>{this.name}</Text>
          </View>
        </TouchableOpacity>
      );
    return null;
  }
}

export default withNavigation(AddClubScreen);
