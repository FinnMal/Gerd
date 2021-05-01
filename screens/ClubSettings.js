import React from "react";
import AutoHeightImage from "react-native-auto-height-image";
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
  Dimensions
} from "react-native";

import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {
  faFolder,
  faCalendar,
  faPlusCircle,
  faChevronCircleLeft,
  faLayerGroup,
  faUsers,
  faQrcode,
  faTrash,
  faTint,
  faPen,
  faImage,
  faUnlock,
  faLock,
  faCloudUploadAlt
} from "@fortawesome/free-solid-svg-icons";
import {withNavigation} from "react-navigation";
import ClubCard from "./../components/ClubCard.js";
import Setting from "./../components/Setting.js";
import Toast from "./../components/Toast.js";
import InputBox from "./../components/InputBox.js";
import Button from "./../components/Button.js";
import database from "@react-native-firebase/database";
import storage from "@react-native-firebase/storage";
import ImagePicker from "react-native-image-crop-picker";
import {Theme} from './../app/index.js';
import HeaderScrollView from "./../components/HeaderScrollView.js";

// Setting
import {default as FilesSetting} from './../components/Settings/ClubFiles.js';
import {default as EventsSetting} from './../components/Settings/ClubEvents.js';
import {default as GroupsSetting} from './../components/Settings/ClubGroups.js';
import {default as QRCodesSetting} from './../components/Settings/ClubQRCodes.js';
import {default as NameSetting} from './../components/Settings/ClubName.js';
import {default as ColorSetting} from './../components/Settings/ClubColor.js';

// CLUBSETTINGS class: screen with club settings
class ClubSettings extends React.Component {
  constructor(props) {
    super(props);

    var club = this.props.navigation.getParam("club", null);
    var utils = this.props.navigation.getParam("utils", null);

    this.state = {
      utils: utils,
      moveTo: "none",
      club: club,
      image_upload: {
        active: false,
        progress: 0
      },
      toast: {
        visible: false,
        text: "",
        action: "",
        callback: null
      }
    };

    // fetch name, logo, and public from firebase
    club.startListener([
      'name', 'logo', 'public'
    ], function(name) {
      this.forceUpdate();
    }.bind(this))

    //club.setReadyListener(function(club) {}.bind(this))
  }

  openImagePicker() {
    const utils = this.props.navigation.getParam("utils", null);
    const club = this.props.navigation.getParam("club", null);
    const options = {
      title: "Bild auswählen",
      customButtons: [],
      storageOptions: {
        skipBackup: true,
        path: "images"
      }
    };

    ImagePicker.openPicker({
      cropperToolbarTitle: "Logo zuschneiden",
      width: 400,
      height: 400,
      cropping: true,
      avoidEmptySpaceAroundImage: true,
      mediaType: "photo",
      cropperCircleOverlay: true,
      cropperChooseText: "Fertig",
      cropperCancelText: "Abbrechen"
    }).then(image => {
      var response = {
        uri: `data:image/jpg;base64,${image.data}`
      };
      response.name = "image_" + new Date().getTime() + ".jpg";

      var storage_path = "userfiles/" + utils.getUserID() + "/" + response.name;

      this.state.image_upload.active = false;
      this.state.image_upload.progress = 0;
      const reference = storage().ref(storage_path);
      const pathToFile = response.uri;
      const task = reference.putFile(image.path);

      task.on("state_changed", taskSnapshot => {
        this.state.image_upload.active = true;
        this.state.image_upload.progress = (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100;
        this.forceUpdate();
      });

      task.then(async () => {
        const url = await storage().ref(storage_path).getDownloadURL();
        this.state.club.updateImage(url);
        this.state.image_upload.active = false;
        this.forceUpdate();
      });
    });
  }

  render() {
    const s_width = Dimensions.get("window").width;
    const club = this.state.club;
    return (
      <View>
        <HeaderScrollView headline={"Verwaltung"} margin={0}>
          <View style={{
              marginLeft: -20,
              marginRight: -20
            }}>
            <Theme.View style={{
                padding: 15
              }}>
              <View style={{
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  flexDirection: "row"
                }}>
                <TouchableOpacity onPress={() => this.openImagePicker()}>
                  {
                    this.state.image_upload.active
                      ? (
                        <Theme.AnimatedCircularProgress
                          size={57}
                          width={3}
                          style={{
                            position: "absolute",
                            marginTop: -3.5,
                            marginLeft: -3.5
                          }}
                          fill={this.state.image_upload.progress}/>
                      )
                      : (void 0)
                  }

                  <AutoHeightImage
                    style={{
                      borderRadius: 50
                    }}
                    width={50}
                    source={{
                      uri: club.getImage()
                    }}/>
                </TouchableOpacity>
                <View
                  style={{
                    marginLeft: 15,
                    height: 50,
                    justifyContent: "center",
                    maxWidth: 275
                  }}>
                  <Theme.Text
                    style={{
                      textTransform: "uppercase",
                      fontSize: 21,
                      fontFamily: "Poppins-SemiBold"
                    }}>
                    {club.getName()}
                  </Theme.Text>
                  <Theme.Text
                    style={{
                      fontSize: 15,
                      opacity: 0.6,
                      fontFamily: "Poppins-Medium"
                    }}>
                    {club.getMembersCount().toLocaleString() + ' '}
                    Mitglieder
                  </Theme.Text>
                </View>
              </View>
            </Theme.View>
            <View style={{
                marginTop: 40
              }}>
              <Setting
                type="switch"
                isEnabled={club.isPublic()}
                onSwitch={() => {
                  this.state.club.togglePublic();
                  this.forceUpdate();
                }}
                label="Öffentlich"
                icon={club.isPublic()
                  ? faUnlock
                  : faLock}/>
            </View>
            <View style={{
                marginTop: 40
              }}>
              <Setting label="Dateien" icon={faFolder} utils={this.state.utils}><FilesSetting club={this.state.club}/></Setting>
              <Setting label="Veranstaltungen" icon={faCalendar} utils={this.state.utils}><EventsSetting club={this.state.club}/></Setting>
            </View>
            <View style={{
                marginTop: 40
              }}>
              <Setting label="Gruppen" icon={faLayerGroup} utils={this.state.utils}><GroupsSetting club={this.state.club}/></Setting>
              <Setting label="QR-Codes" icon={faQrcode} utils={this.state.utils}><QRCodesSetting club={this.state.club}/></Setting>
            </View>
            <View style={{
                marginTop: 40
              }}>
              <Setting setting="logo" imagePicker={this.openImagePicker.bind(this)} label="Logo" icon={faImage} utils={this.state.utils} club={club}/>
              <Setting label="Name" icon={faPen} utils={this.state.utils}><NameSetting club={this.state.club}/></Setting>
              <Setting label="Farbe" icon={faTint} utils={this.state.utils}><ColorSetting club={this.state.club}/></Setting>
            </View>
            <View style={{
                marginTop: 40
              }}>
              <Setting color="red" label="Verein löschen" icon={faTrash} iconColor="light" type="action" onPress={() => alert("setting")}/>
            </View>
          </View>
        </HeaderScrollView>

        <Toast
          visible={this.state.toast.visible}
          text={this.state.toast.text}
          action={this.state.toast.action}
          onHide={() => {
            this.state.toast.visible = false;
            this.forceUpdate();
          }}
          onAction={() => this.state.toast.callback()}/>
      </View>
    );
  }
}

//Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent"
  }
});

export default withNavigation(ClubSettings);
