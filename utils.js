import React from "react";
import {Alert, AsyncStorage} from "react-native";
import auth from "@react-native-firebase/auth";
import database from "@react-native-firebase/database";
import storage from "@react-native-firebase/storage";
import ImagePicker from "react-native-image-crop-picker";
import User from './classes/User.js';

var USER = null;
var USER_ID = "0";
var ACCOUNT_TYPE = "0";
var NAVIGATION = null;
var TOAST = null;
this.state = {};

// utils class, was written at the beginning of the project. But it is only used in a few places. Almost just the alert function.

auth().onAuthStateChanged(function(user) {
  console.log(user)
  console.log("onAuthStateChanged utils: " + user.uid);
  USER_ID = user.uid;
}.bind(this));

//Reads the user ID
export function getUserID() {
  return USER_ID;
}

export function setUserID(id) {
  USER_ID = id;
}

export function getUser() {
  return USER;
}

export function setUser(user) {
  USER = user;
}

export function setAccountType(type) {
  ACCOUNT_TYPE = type;
}

export function getAccountType() {
  return ACCOUNT_TYPE;
}

export function setNavigation(nav) {
  NAVIGATION = nav;
}

export function getNavigation() {
  return NAVIGATION;
}

export function setToast(pToast) {
  TOAST = pToast
}

export function getToast() {
  return TOAST;
}

export function showToast(text, icon = false, has_btn = false, cb) {
  TOAST.setText(text);
  TOAST.setButtonVisible(has_btn)
  TOAST.setIcon(icon)
  if (!TOAST.isVisible()) 
    TOAST.show();
  }

export async function setMessageRead(mes_id, read = true) {
  try {
    await AsyncStorage.setItem(mes_id + "_read", "yes");
  } catch (e) {}
}

export function hasReadMessage(mes_id) {
  const read = AsyncStorage.getItem(mes_id + "_read");

  if (read == "yes") 
    alert(mes_id + " read");
  else 
    alert(mes_id + " not read");
  
  return read == "yes";
}

export function getAgoSec(time) {
  var cur_time = new Date().getTime() / 1000;
  if (cur_time > time) 
    return cur_time - time;
  if (time > cur_time) 
    return time - cur_time;
  return 0;
}

export function getAgoText(time, with_ago_pre = true, with_in_pre = true, small_text = false) {
  var ago_pre = "";
  var cur_time = new Date().getTime() / 1000;
  if (cur_time > time) {
    var diff = cur_time - time;
    ago_pre = with_ago_pre
      ? "Vor "
      : "";
  } else if (time > cur_time) {
    var diff = time - cur_time;
    ago_pre = with_in_pre
      ? "In  "
      : "";
  } else 
    return + (
      !small_text
        ? " Gerade eben"
        : "now"
    );
  
  if (diff < 60) 
    var ago = Math.round(diff) + (
      !small_text
        ? " Sek."
        : " sec"
    );
  else if (diff < 3600) 
    var ago = Math.round(diff / 60) + (
      !small_text
        ? " Min."
        : " min"
    );
  else if (diff < 86400) 
    var ago = Math.round(diff / 3600) + (
      !small_text
        ? " Std."
        : " std"
    );
  else if (diff < 604800) 
    var ago = Math.round(diff / 86400) + (
      !small_text
        ? " Tagen"
        : " day"
    );
  else if (diff < 2592000) 
    var ago = Math.round(diff / 604800) + (
      !small_text
        ? " Wochen"
        : " w"
    );
  else if (diff < 31536000) 
    var ago = Math.round(diff / 2592000) + (
      !small_text
        ? " Monaten"
        : " m"
    );
  else if (diff > 31535999) 
    var ago = Math.round(diff / 31536000) + (
      !small_text
        ? " Jahren"
        : " j"
    );
  
  //if (small_text) ago = ago.toLowerCase().split('.').join('');

  return ago_pre + ago;
}

export function openImagePicker(cb, label = "Bild") {
  const options = {
    title: "Bild auswählen",
    customButtons: [],
    storageOptions: {
      skipBackup: true,
      path: "images"
    }
  };

  ImagePicker.openPicker({
    cropperToolbarTitle: label + " zuschneiden",
    width: 400,
    height: 400,
    cropping: true,
    avoidEmptySpaceAroundImage: true,
    mediaType: "photo",
    cropperCircleOverlay: true,
    cropperChooseText: "Fertig",
    cropperCancelText: "Abbrechen"
  }).then(image => {
    var storage_path = "userfiles/" + this.getUserID() + "/image_" + new Date().getTime() + ".jpg";

    const reference = storage().ref(storage_path);
    const task = reference.putFile(image.path);

    task.on("state_changed", taskSnapshot => {
      cb(true, (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100);
    });

    task.then(async () => {
      const url = await storage().ref(storage_path).getDownloadURL();
      cb(true, -1, url);
    });
  });
}

export function msToHMS(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10
    ? "0" + hours
    : hours;
  minutes = minutes < 10
    ? "0" + minutes
    : minutes;
  seconds = seconds < 10
    ? "0" + seconds
    : seconds;

  return hours + ":" + minutes + ":" + seconds;
}

//Deletes the user ID
export async function deleteUserID(cb) {
  try {
    await AsyncStorage.removeItem("USER_ID");
    return cb(null);
  } catch (e) {
    return cb(e);
  }
}

//Saves the user ID
export async function saveUserID(cb, id, navigate) {
  try {
    await AsyncStorage.setItem("USER_ID", id);
    return cb(false);
  } catch (e) {
    return cb(e);
  }
}

//Formats an number with commas
export function format_int(num) {
  return num.toLocaleString(navigator.language, {minimumFractionDigits: 0});
}

//Shows an alert
export function showAlert(title, msg, btnText = "Ok", callback = false, error = true, cancelable = true) {
  if (callback === false || isNull(callback)) 
    callback = function() {
      console.log(btnText + " pressed");
    };
  if (btnText.lenght == 0) {
    if (error) {
      btns = {
        text: btnText,
        onPress: callback,
        style: "cancel"
      };
    } else {
      btns = {
        text: btnText,
        onPress: callback
      };
    }
    Alert.alert(title, msg, [btns], {cancelable: cancelable});
  } else {
    var btns = [];
    btnText.forEach((text, i) => {
      var btn = {
        text: text,
        onPress: () => callback(i),
        style: i == 0
          ? "cancel"
          : ""
      };
      btns.push(btn);
    });
    Alert.alert(title, msg, btns, {cancelable: cancelable});
  }
}
