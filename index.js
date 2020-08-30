import { registerRootComponent } from 'expo';

import messaging from '@react-native-firebase/messaging';

import App from './App';

messaging().setBackgroundMessageHandler(async remoteMessage => {
	console.log('Message handled in the background!', remoteMessage);
});

function HeadlessCheck({ isHeadless }) {
	if (isHeadless) {
		// App has been launched in the background by iOS, ignore
		return null;
	}

	return <App />;
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately

registerRootComponent(App, () => HeadlessCheck);
