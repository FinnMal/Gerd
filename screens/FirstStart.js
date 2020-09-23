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
	Dimensions,
	AsyncStorage
} from 'react-native';
import { Headlines } from './../app/constants.js';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUserCircle, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { NotificationCard } from './../app/components.js';
import database from '@react-native-firebase/database';
import { withNavigation } from 'react-navigation';
import auth from '@react-native-firebase/auth';

class FirstStartScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			profile_0_selected: true,
		};
	}

	_selectProfile(id) {
		this.state.profile_0_selected = !this.state.profile_0_selected;
		this.forceUpdate();
	}

	async _registerProfile() {
		console.log('_registerProfile');
		const onDone = this.props.navigation.getParam('onDone', null);
		const uid = this.props.navigation.getParam('uid', null);
		this._saveUserID(uid);

		database().ref('users/' + uid + '/account_type').set(this.state.profile_0_selected ? 'user' : 'manager');
		database().ref('users/' + uid + '/name').set('User ' + (Math.floor(Math.random() * 999999) + 1));

		try {
			const value = await AsyncStorage.getItem('onesignal_id');
			if (value) {
				database().ref('users/' + uid + '/onesignal_id').set(value);
				onDone();
			}
		} catch (error) {
			onDone();
		}
	}

	async _saveUserID(id) {
		try {
			await AsyncStorage.setItem('user_id', id);
		} catch (e) {
		}
	}

	render() {
		const ps0 = this.state.profile_0_selected;

		var s = require('./../app/style.js');
		return (
			<View style={s.container}>
				 
				<View
					style={{ justifyContent: 'center', alignItems: 'center', marginTop: 50, marginLeft: 20, marginRight: 20 }}
				>
					<Text style={{ color: '#E5EEF7', fontSize: 35, fontFamily: 'Poppins-ExtraBold' }}>Wähle dein Profil</Text>
					<Text
						style={{
							marginTop: 30,
							textAlign: 'center',
							color: '#635E6E',
							fontSize: 18,
							fontFamily: 'Poppins-SemiBold',
						}}
					>
						Gerd ist ein Tool zur Organisation von Vereinen. Du kannst es als Vereinsmitglied oder Vereinsbetreiber benutzen.
					</Text>
					<View
						style={{
							marginTop: 80,
							justifyContent: 'space-between',
							flexWrap: 'wrap',
							flexDirection: 'row',
						}}
					>
						<TouchableOpacity
							onPress={() => this._selectProfile(0)}
							style={{ marginRight: 50, justifyContent: 'center', alignItems: 'center' }}
						>
							<View style={{ padding: 45, backgroundColor: ps0 ? '#0FD5B3' : '#1e1e1e', borderRadius: 25 }}>
								<FontAwesomeIcon style={{}} size={50} color={ps0 ? '#1e1e1e' : '#E3E2E6'} icon={faUserCircle} />
							</View>
							<Text style={{ color: ps0 ? '#188E82' : '#635E6E', fontFamily: 'Poppins-Bold', fontSize: 16 }}>
								MITGLIED
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => this._selectProfile(1)}
							style={{ justifyContent: 'center', alignItems: 'center' }}
						>
							<View style={{ padding: 40, backgroundColor: ps0 ? '#1e1e1e' : '#0FD5B3', borderRadius: 25 }}>
								<FontAwesomeIcon style={{}} size={40} color={ps0 ? '#E3E2E6' : '#1e1e1e'} icon={faUserShield} />
							</View>
							<Text style={{ color: ps0 ? '#635E6E' : '#188E82', fontFamily: 'Poppins-Bold', fontSize: 16 }}>
								BETREIBER
							</Text>
						</TouchableOpacity>
					</View>
					<TouchableOpacity
						style={{
							marginTop: 80,
							backgroundColor: '#16FFD7',
							paddingLeft: 38,
							paddingRight: 38,
							paddingTop: 13,
							paddingBottom: 13,
							borderRadius: 20,
						}}
						onPress={() => this._registerProfile()}
					>
						<Text style={{ color: '#1e1e1e', fontSize: 20, fontFamily: 'Poppins-ExtraBold' }}>Fertig</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}

export default withNavigation(FirstStartScreen);
