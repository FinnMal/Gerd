import { createAppContainer } from 'react-navigation';
import React from 'react';
import * as utils from './utils.js';
import { createStackNavigator } from 'react-navigation-stack';
import { fadeIn } from 'react-navigation-transitions';
import { StyleSheet, Text, View, StatusBar, Image, Button, TouchableOpacity } from 'react-native';
import ScreenHandler from './screens/ScreenHandler';
import HomeScreen from './screens/Home';
import ManagmentScreen from './screens/Managment';
import MessagesScreen from './screens/Messages';
import SettingsScreen from './screens/Settings';
import { YellowBox } from 'react-native';
//import { NetInfo } from 'react-native-netinfo'

YellowBox.ignoreWarnings([ 'Warning: isMounted(...) is deprecated', 'Module RCTImageLoader' ]);

//firebase.config().enableDeveloperMode();

/**
NetInfo.getConnectionInfo().then((connectionInfo) => {
  console.log(
    'Initial, type: ' +
      connectionInfo.type +
      ', effectiveType: ' +
      connectionInfo.effectiveType,
  );
});
function handleFirstConnectivityChange(connectionInfo) {
  console.log(
    'First change, type: ' +
      connectionInfo.type +
      ', effectiveType: ' +
      connectionInfo.effectiveType,
  );
  NetInfo.removeEventListener(
    'connectionChange',
    handleFirstConnectivityChange,
  );
}
NetInfo.addEventListener('connectionChange', handleFirstConnectivityChange);
*/

navigationOptions = {
	headerShown: false,
	gestureEnabled: false,
};

const MainNavigator = createStackNavigator(
	{
		ScreenHandler: {
			screen: ScreenHandler,
			navigationOptions: navigationOptions,
		},
		HomeScreen: {
			screen: HomeScreen,
			navigationOptions: navigationOptions,
		},
		ManagmentScreen: {
			screen: ManagmentScreen,
			navigationOptions: navigationOptions,
		},
		MessagesScreen: {
			screen: MessagesScreen,
			navigationOptions: navigationOptions,
		},
		SettingsScreen: {
			screen: SettingsScreen,
			navigationOptions: navigationOptions,
		},
	},
	{ headerMode: 'screen', initialRouteName: 'ScreenHandler' }
);

const App = createAppContainer(MainNavigator);
export default App;
