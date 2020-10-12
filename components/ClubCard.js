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
import {faChevronRight, faEllipsisV} from '@fortawesome/free-solid-svg-icons';
import {withNavigation} from 'react-navigation';
import {useNavigation} from '@react-navigation/native';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import CameraRoll from '@react-native-community/cameraroll';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {useDarkMode} from 'react-native-dynamic'
import {Theme} from './../app/index.js';

export default class ClubCard extends React.Component {
  onPress() {
    if (this.props.navigateable) 
      this.props.onNavigate();
    else 
      this.props.onPress();
    }
  
  render() {
    return (
      <Theme.TouchableOpacity
        style={{
          marginBottom: 20,
          borderRadius: 17,
          padding: 13,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          flexDirection: 'row',
          backgroundColor: "#" + this.props.club_color,
          shadowColor: "#" + this.props.club_color
        }}
        onPress={() => this.onPress()}>
        <AutoHeightImage style={{
            borderRadius: 45
          }} width={45} source={{
            uri: this.props.club_img
          }}/>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',

            height: 45,
            marginLeft: 15,
            alginSelf: 'center',
            justifySelf: 'center'
          }}>
          <View>
            <Theme.TextOnColor
              backgroundColor={"#" + this.props.club_color}
              style={{
                width: 210,
                fontSize: 18,
                fontFamily: 'Poppins-SemiBold'
              }}>
              {this.props.club_name}
            </Theme.TextOnColor>
            <Theme.TextOnColor
              backgroundColor={"#" + this.props.club_color}
              style={{
                marginTop: -1,
                fontSize: 13,
                fontFamily: 'Poppins-SemiBold'
              }}>
              {
                this.props.club_members > 0
                  ? this.props.club_members.toLocaleString() + " Mitglieder"
                  : this.props.club_groups.toLocaleString() + " Gruppen beigetreten"
              }
            </Theme.TextOnColor>
          </View>
          {
            this.props.navigateable
              ? <TouchableOpacity style={{
                    marginLeft: 15
                  }} onPress={() => this.onPress()}>
                  <Theme.IconOnColor backgroundColor={"#" + this.props.club_color} size={19} color="white" icon={faChevronRight}/>
                </TouchableOpacity>
              : void 0
          }

          {
            this.props.editable
              ? <TouchableOpacity style={{
                    marginLeft: 15
                  }} onPress={() => this.onPress()}>
                  <Theme.Icon size={19} color="white" icon={faEllipsisV}/>
                </TouchableOpacity>
              : void 0
          }
        </View>
      </Theme.TouchableOpacity>
    );
  }
}
