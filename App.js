import {createAppContainer} from "react-navigation";
import React, {useState, useEffect, Component} from "react";
import {Alert, AsyncStorage} from "react-native";
import OneSignal from "react-native-onesignal";
import * as utils from "./utils.js";
import {createStackNavigator} from "react-navigation-stack";
import {createSharedElementStackNavigator} from "react-navigation-shared-element";
import {fadeIn} from "react-navigation-transitions";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Image,
  Button,
  TouchableOpacity,
  TransitionConfig,
  CardStackStyleInterpolator
} from "react-native";
import ScreenHandler from "./screens/ScreenHandler";
import HomeScreen from "./screens/Home";
import ManagmentScreen from "./screens/Managment";
import MessagesScreen from "./screens/Messages";
import MessageScreen from "./screens/Message";
import NewMessageScreen from "./screens/NewMessage";
import SettingsScreen from "./screens/Settings";
import ChatScreen from "./screens/Chat";
import FirstStartScreen from "./screens/FirstStart";
import AddClubScreen from "./screens/AddClub";
import ClubSettingsScreen from "./screens/ClubSettings";
import SettingScreen from "./screens/Setting";
import AllMessagesScreen from "./screens/AllMessages";
import NotificationActionHandler from "./classes/NotificationActionHandler";

import {LogBox, AppRegistry} from "react-native";
import database from "@react-native-firebase/database";
import Firebase from "firebase";
import auth from "@react-native-firebase/auth";
import {openDatabase} from 'react-native-sqlite-storage';
import {useDarkMode} from 'react-native-dynamic'

// access data for firebase
const firebaseConfig = {
  apiKey: "...",
  authDomain: "gerd-eu.firebaseapp.com",
  databaseURL: "https://gerd-eu.firebaseio.com",
  projectId: "gerd-eu",
  storageBucket: "gerd-eu.appspot.com",
  messagingSenderId: "489695065428",
  appId: "1:489695065428:web:b9c6acce57e1e6cdd344c1",
  measurementId: "G-MFKRBK5EZS"
};
const app = Firebase.initializeApp(firebaseConfig);

AppRegistry.registerComponent("app", () => App);

//create SQL Database file if not exists
var db = openDatabase('gerd.db');
db.transaction(function(txn) {
  //txn.executeSql('DROP TABLE chat_messages')
  txn.executeSql(
    'CREATE TABLE IF NOT EXISTS "chat_messages" ("send_at"	INTEGER NOT NULL,"chat_id"	TEXT,"text"	TEXT,"is_own"	NUMERIC, "read"	NUMERIC, PRIMARY KEY("send_at"));',
    []
  );
  txn.executeSql('CREATE TABLE IF NOT EXISTS "chats" ("ID"	TEXT NOT NULL,"partner_uid"	INTEGER NOT NULL,PRIMARY KEY("ID"));', []);
  txn.executeSql('CREATE TABLE IF NOT EXISTS "local_files" ("ID"	TEXT, "club_id"	INTEGER,"local_path"	TEXT );', [])
});

// firebase anonymous login
auth().signInAnonymously().then(() => {
  console.log("User signed in anonymously");
}).catch(error => {
  if (error.code === "auth/operation-not-allowed") {
    console.log("Enable anonymous in your firebase console.");
  }
  console.error(error);
});

navigationOptions = {
  headerShown: false,
  gestureEnabled: true
};

// create navigator for screens
const MainNavigator = createStackNavigator({
  ScreenHandler: {
    screen: ScreenHandler,
    navigationOptions: navigationOptions
  },
  HomeScreen: {
    screen: HomeScreen,
    navigationOptions: navigationOptions
  },
  ManagmentScreen: {
    screen: ManagmentScreen,
    navigationOptions: navigationOptions
  },
  MessagesScreen: {
    screen: MessagesScreen,
    navigationOptions: navigationOptions
  },
  SettingsScreen: {
    screen: SettingsScreen,
    navigationOptions: navigationOptions
  },
  MessageScreen: {
    screen: MessageScreen,
    navigationOptions: navigationOptions
  },
  NewMessageScreen: {
    screen: NewMessageScreen,
    navigationOptions: navigationOptions
  },
  ChatScreen: {
    screen: ChatScreen,
    navigationOptions: navigationOptions
  },
  FirstStartScreen: {
    screen: FirstStartScreen,
    navigationOptions: navigationOptions
  },
  AddClubScreen: {
    screen: AddClubScreen,
    navigationOptions: navigationOptions
  },
  ClubSettingsScreen: {
    screen: ClubSettingsScreen,
    navigationOptions: navigationOptions
  },
  AllMessagesScreen: {
    screen: AllMessagesScreen,
    navigationOptions: navigationOptions
  },
  SettingScreen: {
    screen: SettingScreen,
    navigationOptions: navigationOptions
  }
}, {
  headerMode: "screen",
  initialRouteName: "ScreenHandler"
}, {
  transitionConfig: () => ({screenInterpolator: CardStackStyleInterpolator.forVertical})
});

const AppContainer = createAppContainer(MainNavigator);
export default class App extends Component {
  constructor(properties) {
    super(properties);

    OneSignal.setLogLevel(0, 0);

    OneSignal.init("18ae4cf5-c5af-4a62-accb-2324b9e03f2c", {
      kOSSettingsKeyAutoPrompt: false,
      kOSSettingsKeyInAppLaunchURL: false,
      kOSSettingsKeyInFocusDisplayOption: 2
    });
    OneSignal.inFocusDisplaying(2); // Controls what should happen if a notification is received while the app is open. 2 means that the notification will go directly to the device's notification center.

    OneSignal.promptForPushNotificationsWithUserResponse(iOSPromptCallback);

    OneSignal.addEventListener("received", this.onReceived);
    OneSignal.addEventListener("opened", this.onOpened);
    OneSignal.addEventListener("ids", this.onIds);
  }

  componentWillUnmount() {
    // stop onesignal listener
    OneSignal.removeEventListener("received", this.onReceived);
    OneSignal.removeEventListener("opened", this.onOpened);
    OneSignal.removeEventListener("ids", this.onIds);
  }

  onReceived(notification) {
    // callback test
    console.log("Notification received: ", notification);
  }

  onOpened(openResult) {
    // pass opened notification to the NofiticationHandler
    handler = new NotificationActionHandler(openResult)
    handler.handle()
  }

  async onIds(device) {
    // save onesignal id
    console.log("Device info: ", device);
    try {
      await AsyncStorage.setItem("onesignal_id", device.userId);
    } catch (e) {}
  }

  render() {
    return (<AppContainer ref={nav => {
        this.navigator = nav;
      }}/>);
  }
}

// callback for ios notifcation prompt
function iOSPromptCallback(permission) {
  console.log(permission);
}
