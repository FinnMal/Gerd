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
          borderRadius: 14,
          padding: 11,
          backgroundColor: "#" + this.props.club_color,
          shadowColor: "#" + this.props.club_color,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onPress={() => this.onPress()}>
        <AutoHeightImage style={{
            borderRadius: 45
          }} width={45} source={{
            uri: this.props.club_img
          }}/>
        <View style={{
            flex: 1,
            marginLeft: 15
          }}>
          <Theme.TextOnColor
            backgroundColor={"#" + this.props.club_color}
            style={{
              fontSize: 18,
              fontFamily: 'Poppins-SemiBold'
            }}>
            {this.props.club_name}
          </Theme.TextOnColor>
          <Theme.TextOnColor
            backgroundColor={"#" + this.props.club_color}
            style={{
              opacity: 0.7,
              marginTop: -1,
              fontSize: 13,
              fontFamily: 'Poppins-Medium'
            }}>
            {
              this.props.club_members > 0
                ? this.props.club_members.toLocaleString() + " Mitglieder"
                : this.props.club_groups.toLocaleString() + " Gruppen beigetreten"
            }
          </Theme.TextOnColor>
        </View>
        <View style={{
            marginRight: -5,
            marginLeft: 'auto'
          }}>
          {
            this.props.navigateable
              ? <TouchableOpacity style={{
                    padding: 12
                  }} onPress={() => this.onPress()}>
                  <Theme.IconOnColor backgroundColor={"#" + this.props.club_color} size={19} color="white" icon={faChevronRight}/>
                </TouchableOpacity>
              : void 0
          }

          {
            this.props.editable
              ? <TouchableOpacity style={{
                    padding: 12
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
