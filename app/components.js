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
  faFilePdf
} from '@fortawesome/free-solid-svg-icons';
import {withNavigation} from 'react-navigation';
import {useNavigation} from '@react-navigation/native';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import CameraRoll from '@react-native-community/cameraroll';
import {AnimatedCircularProgress} from 'react-native-circular-progress';

export class NotificationCard extends React.Component {
  render() {
    const content = this.props.content;

    if (content) {
      if (content.headline && content.short_text && content.color) {
        return (
          <TouchableOpacity
            style={{
              height: 'auto',
              width: '86%',
              backgroundColor: content.color,
              alignSelf: 'flex-start',
              marginTop: 40,
              marginLeft: 21,
              marginRight: 21,

              borderRadius: 13,

              shadowColor: content.color,
              shadowOffset: {
                width: 6,
                height: 6
              },
              shadowOpacity: 0.5,
              shadowRadius: 20.00
            }}
            onPress={() => {
              this.props.navigation.navigate('MessageScreen', {
                content: this.props.content,
                utils: this.props.utils
              });
            }}>
            <View
              style={{
                width: '90%',
                marginTop: 13,
                marginLeft: 15,
                display: 'flex',
                flexDirection: 'row'
              }}>
              <FontAwesomeIcon
                style={{
                  marginLeft: 270,
                  marginTop: 5,
                  position: 'absolute',
                  marginBottom: 7
                }}
                size={25}
                color="#E9E9E9"
                icon={faChevronCircleRight}/>
              <Text
                style={{
                  marginRight: 23,
                  alignSelf: 'flex-start',
                  fontFamily: 'Poppins-Bold',
                  fontSize: 30,
                  color: '#FFFFFF'
                }}>{content.headline}</Text>

            </View>
            <Text
              style={{
                fontSize: 20,
                fontFamily: 'Poppins-Regular',
                color: 'white',
                marginTop: 5,
                marginLeft: 15,
                marginRight: 15
              }}>{content.short_text}</Text>

            <View
              style={{
                width: '90%',
                marginBottom: 20,
                marginTop: 20,
                marginLeft: 15,
                display: 'flex',
                flexDirection: 'row'
              }}>
              <AutoHeightImage
                style={{
                  borderRadius: 36
                }}
                width={36}
                source={{
                  uri: content.club_img
                }}/>
              <View style={{
                  marginLeft: 15
                }}>
                <Text style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: 'white'
                  }}>{content.ago}</Text>
                <Text
                  style={{
                    marginTop: -2,
                    fontSize: 16,
                    fontFamily: 'Poppins-SemiBold',
                    color: 'white'
                  }}>
                  {content.club_name}
                </Text>
              </View>
            </View>

          </TouchableOpacity>
        );
      }
    }
    return <View/>;
  }
}

export class ModalCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: this.props.name,
      date: this.props.date,
      location: this.props.location
    };
  }

  onChange(type, value) {
    this.state[type] = value;
    this.forceUpdate();
  }

  onDone() {
    this.props.onDone(this.state.name, this.state.date, this.state.location);
  }

  render() {
    return (
      <Modal animationType="slide" presentationStyle="formSheet" visible={this.props.visible} display={this.props.display}>
        <View style={{
            padding: 20,
            backgroundColor: '#121212',
            height: '100%'
          }}>
          <View
            style={{
              marginBottom: 10,
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              flexDirection: 'row'
            }}>
            <Text
              style={{
                height: 30,
                fontFamily: 'Poppins-Bold',
                color: 'white',
                fontSize: 25,
                width: '76%'
              }}
              numberOfLines={1}>
              {this.state.name}
            </Text>
            <TouchableOpacity
              style={{
                height: 30,
                borderRadius: 10,
                marginLeft: 10,
                width: 70,
                padding: 5,
                paddingLeft: 10,
                backgroundColor: '#0DF5E3'
              }}
              onPress={text => this.onDone()}>
              <Text style={{
                  fontSize: 18,
                  fontFamily: 'Poppins-Bold',
                  color: '#1e1e1e'
                }}>FERTIG</Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              marginLeft: -20,
              height: 0.5,
              marginBottom: 40,
              backgroundColor: '#1e1e1e',
              width: '140%'
            }}/>

          <View style={{
              marginBottom: 20
            }}>
            <Text style={{
                fontFamily: 'Poppins-SemiBold',
                marginLeft: 10,
                color: '#5C5768'
              }}>NAME</Text>
            <View style={{
                borderRadius: 10,
                backgroundColor: '#1e1e1e'
              }}>
              <TextInput
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
                value={this.state.name}
                onChangeText={text => this.onChange('name', text)}/>
            </View>
          </View>
          <View style={{
              marginBottom: 20
            }}>
            <Text style={{
                fontFamily: 'Poppins-SemiBold',
                marginLeft: 10,
                color: '#5C5768'
              }}>DATE</Text>
            <View style={{
                borderRadius: 10,
                backgroundColor: '#1e1e1e'
              }}>
              <TextInput
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
                value={this.state.date}
                onChangeText={text => this.onChange('date', text)}/>
            </View>
          </View>
          <View style={{
              marginBottom: 20
            }}>
            <Text style={{
                fontFamily: 'Poppins-SemiBold',
                marginLeft: 10,
                color: '#5C5768'
              }}>LOCATION</Text>
            <View style={{
                borderRadius: 10,
                backgroundColor: '#1e1e1e'
              }}>
              <TextInput
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
                value={this.state.location}
                onChangeText={text => this.onChange('location', text)}/>
            </View>
          </View>

        </View>
      </Modal>
    );
  }
}
