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
  Button,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Dimensions
} from 'react-native';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import {Headlines} from './../app/constants.js';
import {withNavigation} from 'react-navigation';
import ClubCard from './../components/ClubCard.js';
import database from '@react-native-firebase/database';
import HeaderScrollView from './../components/HeaderScrollView.js';
import {Theme} from './../app/index.js';
import Club from './../classes/Club.js';

class ManagmentScreen extends React.Component {
  uid: null;
  constructor(props) {
    super(props);
    var utils = this.props.utilsObject;
    this.uid = utils.getUserID();
    this.state = {
      clubs: {},
      moveTo: 'none'
    };
    this.margin = new Animated.Value(0);

    database().ref('users/' + this.uid + '/clubs').once('value', (function(snap) {
      var clubs = snap.val();
      var i = 0;
      Object.keys(clubs).map(key => {
        var club_info = clubs[key];
        if (club_info) {
          if (club_info.role == 'admin') {
            var club = new Club(club_info.club_id);
            club.setReadyListener(function(club) {
              // club is ready and infos are loaded
              this.state.clubs[club.getID()] = club;
              this.forceUpdate();
            }.bind(this))
          }
        }
      });
    }).bind(this));
  }

  _openAddClub() {
    this.props.navigation.navigate('AddClubScreen', {
      utils: this.props.utilsObject,
      show: true
    });
  }

  render() {
    const s_width = Dimensions.get('window').width;

    var s = require('./../app/style.js');
    const marginLeft = this.margin.interpolate({
      inputRange: [
        0, 2000
      ],
      outputRange: [0, 2000]
    });

    const clubCards = Object.keys(this.state.clubs).map(club_id => {
      var club = this.state.clubs[club_id];
      return (
        <ClubCard
          key={club_id}
          navigateable={true}
          club_color={club.getColor()}
          club_name={club.getName()}
          club_members={club.getMembersCount()}
          club_img={club.getImage()}
          color="#1e1e1e"
          onNavigate={() => this.props.navigation.navigate('ClubSettingsScreen', {
            club: club,
            utils: this.props.utilsObject
          })}/>
      );
    });

    if (this.props.show) {
      return (
        <HeaderScrollView
          headline="Verwaltung"
          headlineFontSize={46}
          backButton={false}
          showHeader={false}
          actionButtonIcon={faPlusCircle}
          actionButtonOnPress={() => this._openAddClub()}>
          {clubCards}
          {clubCards}
          {clubCards}
          {clubCards}
          {clubCards}
          {clubCards}
          {clubCards}
          {clubCards}
        </HeaderScrollView>
      );
    }
    return null;
  }

  checkIfScrollViewIsNeeded(viewHeight) {
    if (viewHeight < Dimensions.get('window').height) {
      this.props.setScrollViewEnabled(false);
    } else {
      this.props.setScrollViewEnabled(true);
    }
  }
}

//Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  }
});

export default withNavigation(ManagmentScreen);
