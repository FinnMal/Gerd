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
	Dimensions
} from 'react-native';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { Headlines } from './../app/constants.js';
import { withNavigation } from 'react-navigation';
import database from '@react-native-firebase/database';
import HeaderScrollView from './../components/HeaderScrollView.js';
import Setting from './../components/Setting.js';
import InputBox from './../components/InputBox.js';
import { faTrash, faEye } from '@fortawesome/free-solid-svg-icons';

class SettingsScreen extends React.Component {
	uid: null;
	constructor(props) {
		super(props);
		var utils = this.props.utilsObject;
		this.uid = utils.getUserID();
		this.state = {
			user: {
				name: 'Finn Malkus',
				img: 'https://www.shareicon.net/data/512x512/2016/09/15/829452_user_512x512.png',
			},
			moveTo: 'none',
			image_upload: {
				active: false,
				progress: 0,
			},
		};
		this.margin = new Animated.Value(0);

		database().ref('users/' + this.uid).once('value', (function(snap) {}).bind(this));
	}

	render() {
		const s_width = Dimensions.get('window').width;

		const user = this.state.user;
		var s = require('./../app/style.js');
		const marginLeft = this.margin.interpolate({
			inputRange: [ 0, 2000 ],
			outputRange: [ 0, 2000 ],
		});

		if (this.props.show) {
			return (
				<HeaderScrollView
					marginTop={80}
					headline="Einstellungen"
					headlineFontSize={47}
					backButton={false}
					showHeadline={false}
				>
					<View style={{ marginLeft: -20, marginRight: -20 }}>
						<View style={{ backgroundColor: '#38304C', padding: 15 }}>
							<View
								style={{
									flexWrap: 'wrap',
									alignItems: 'flex-start',
									flexDirection: 'row',
								}}
							>
								<TouchableOpacity onPress={() => this.openImagePicker()}>
									{this.state.image_upload.active
										? <AnimatedCircularProgress
												size={57}
												width={3}
												style={{ position: 'absolute', marginTop: -3.5, marginLeft: -3.5 }}
												fill={this.state.image_upload.progress}
												tintColor="#0DF5E3"
												onAnimationComplete={() => console.log('onAnimationComplete')}
												backgroundColor="#201A30"
											/>
										: void 0}

									<AutoHeightImage
										style={{ borderRadius: 50 }}
										width={50}
										source={{
											uri: user.img,
										}}
									/>
								</TouchableOpacity>
								<View
									style={{
										marginLeft: 15,
										height: 50,
										justifyContent: 'center',
										maxWidth: 275,
									}}
								>
									<Text style={{ fontSize: 21, color: 'white', fontFamily: 'Poppins-SemiBold' }}>
										{user.name}
									</Text>
								</View>

							</View>
						</View>
						<View style={{ marginTop: 60, backgroundColor: '#38304C', padding: 15 }}>
							<InputBox color="dark" label="Name" value={user.name} />
							<InputBox color="dark" label="E-Mail" value={user.email} />
							<InputBox color="dark" label="Passwort" value="" secure={true} />
						</View>
						<View style={{ marginTop: 40, backgroundColor: '#38304C', padding: 15 }}>
							<Setting
								type="switch"
								isEnabled={true}
								onSwitch={() => {
									/*database().ref('clubs/' + club.id + '/public').set(!club.public);
							this.state.club.public = !club.public;
							this.forceUpdate();*/
								}}
								label="Empfänger anzeigen"
								icon={faEye}
							/>
							<Setting
								type="switch"
								isEnabled={true}
								onSwitch={() => {
									/*database().ref('clubs/' + club.id + '/public').set(!club.public);
							this.state.club.public = !club.public;
							this.forceUpdate();*/
								}}
								label="Mitteilungen senden"
								icon={faEye}
							/>
						</View>
						<View style={{ marginTop: 40, backgroundColor: '#38304C', padding: 15 }}>
							<Setting label="Vereine" icon={faTrash} onPress={() => alert('setting')} />
							<Setting label="Konto löschen" icon={faTrash} onPress={() => alert('setting')} />
						</View>

						<View style={{ marginTop: 40, backgroundColor: '#38304C', padding: 15 }}>
							<Setting
								color="red"
								label="Konto löschen"
								icon={faTrash}
								iconColor="light"
								type="action"
								onPress={() => alert('setting')}
							/>
						</View>
					</View>
				</HeaderScrollView>
			);
		}
		return null;
	}

	checkIfScrollViewIsNeeded(viewHeight) {
		if (viewHeight < Dimensions.get('window').height) {
			this.props.setScrollViewEnabled(false);
		} else {
			this.props.setScrollViewEnabled(true);
		}
	}
}

//Styles
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'transparent',
	},
});

export default withNavigation(SettingsScreen);
