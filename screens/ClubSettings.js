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
  Button,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Dimensions
} from "react-native";

import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {
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
import {Headlines} from "./../app/constants.js";
import {withNavigation} from "react-navigation";
import ClubCard from "./../components/ClubCard.js";
import Setting from "./../components/Setting.js";
import Toast from "./../components/Toast.js";
import database from "@react-native-firebase/database";
import storage from "@react-native-firebase/storage";
import ImagePicker from "react-native-image-crop-picker";
import {Theme} from './../app/index.js';

import {AnimatedCircularProgress} from "react-native-circular-progress";
import HeaderScrollView from "./../components/HeaderScrollView.js";

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
      console.log(image.path);
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
        console.log((taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100);
        this.state.image_upload.active = true;
        this.state.image_upload.progress = (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100;
        this.forceUpdate();
      });

      task.then(async () => {
        const url = await storage().ref(storage_path).getDownloadURL();
        database().ref("clubs/" + club.id + "/logo").set(url);
        this.state.club.logo = url;
        this.state.image_upload.active = false;
        this.forceUpdate();
      });
    });
  }

  render() {
    const s_width = Dimensions.get("window").width;

    var s = require("./../app/style.js");

    const club = this.state.club;
    return (
      <View>
        <HeaderScrollView headline={club.name} margin={0}>
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
                        <AnimatedCircularProgress
                          size={57}
                          width={3}
                          style={{
                            position: "absolute",
                            marginTop: -3.5,
                            marginLeft: -3.5
                          }}
                          fill={this.state.image_upload.progress}
                          tintColor="#0DF5E3"
                          onAnimationComplete={() => console.log("onAnimationComplete")}
                          backgroundColor="#121212"/>
                      )
                      : (void 0)
                  }

                  <AutoHeightImage
                    style={{
                      borderRadius: 50
                    }}
                    width={50}
                    source={{
                      uri: club.logo
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
                    {club.name}
                  </Theme.Text>
                  <Theme.Text
                    style={{
                      fontSize: 15,
                      opacity: 0.6,
                      fontFamily: "Poppins-Medium"
                    }}>
                    {club.members.toLocaleString()}
                    Mitglieder
                  </Theme.Text>
                </View>
              </View>
            </Theme.View>
            <Theme.View style={{
                marginTop: 40,
                padding: 3,
                paddingLeft: 15
              }}>
              <Setting
                type="switch"
                isEnabled={club.public}
                onSwitch={() => {
                  database().ref("clubs/" + club.id + "/public").set(!club.public);
                  this.state.club.public = !club.public;
                  this.forceUpdate();
                }}
                label="Öffentlich"
                icon={club.public
                  ? faUnlock
                  : faLock}/>
            </Theme.View>
            <Theme.View style={{
                marginTop: 40,
                padding: 3,
                paddingLeft: 15
              }}>
              <Setting setting="groups" label="Gruppen" icon={faLayerGroup} utils={this.state.utils} club={club}/>
              <Setting setting="qrcodes" utils={this.state.utils} club={club} label="QR-Codes" icon={faQrcode}/>
            </Theme.View>
            <Theme.View style={{
                marginTop: 40,
                padding: 3,
                paddingLeft: 15
              }}>
              <Setting setting="logo" imagePicker={this.openImagePicker.bind(this)} label="Logo" icon={faImage} utils={this.state.utils} club={club}/>
              <Setting
                setting="name"
                label="Name"
                icon={faPen}
                utils={this.state.utils}
                club={club}
                callback={(old_name, new_name) => {
                  this.state.club.name = new_name;
                  this.state.toast.visible = true;
                  this.state.toast.text = "Name geändert";
                  this.state.toast.action = "Rückgänig";
                  this.state.toast.callback = function() {
                    this.state.club.name = old_name;
                    this.forceUpdate();
                  }.bind(this);
                  this.forceUpdate();
                }}/>
              <Setting setting="color" label="Farbe" icon={faTint} utils={this.state.utils} club={club}/>
            </Theme.View>
            <Theme.View
              style={{
                marginBottom: 75,
                marginTop: 40,
                padding: 5,
                paddingLeft: 15
              }}>
              <Setting color="red" label="Verein löschen" icon={faTrash} iconColor="light" type="action" onPress={() => alert("setting")}/>
            </Theme.View>
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
