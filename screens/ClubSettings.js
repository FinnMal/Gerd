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
	faLock
} from '@fortawesome/free-solid-svg-icons';
import { Headlines } from './../app/constants.js';
import { withNavigation } from 'react-navigation';
import ClubCard from './../components/ClubCard.js';
import Setting from './../components/Setting.js';
import database from '@react-native-firebase/database';

class ClubSettings extends React.Component {
	constructor(props) {
		super(props);

		var club = this.props.navigation.getParam('club', null);
		var utils = this.props.navigation.getParam('utils', null);

		this.state = {
			utils: utils,
			moveTo: 'none',
			club: club,
		};
	}

	render() {
		const s_width = Dimensions.get('window').width;

		var s = require('./../app/style.js');

		const club = this.state.club;
		return (
			<ScrollView
				showsVerticalScrollIndicator={false}
				style={[
					{
						marginTop: -44,
						height: '100%',
						backgroundColor: '#201A30',
					},
				]}
				onLayout={event => {
					var { x, y, width, height } = event.nativeEvent.layout;
					//this.checkIfScrollViewIsNeeded(height);
				}}
			>
				<View
					style={{
						zIndex: 100,
						marginTop: s_width * 0.13,
						flexWrap: 'wrap',
						alignItems: 'flex-start',
						flexDirection: 'row',
					}}
				>
					<TouchableOpacity
						style={{
							zIndex: 100,
							marginLeft: s_width * 0.06,
						}}
						onPress={() => this.props.navigation.goBack()}
					>
						<FontAwesomeIcon size={29} color="#F5F5F5" icon={faChevronCircleLeft} />
					</TouchableOpacity>
					<View
						style={{
							justifyContent: 'center',
							alignItems: 'center',
							position: 'absolute',
							width: '100%',
						}}
					>
						<Text style={{ marginTop: -3, fontSize: 28, fontFamily: 'Poppins-Bold', color: 'white', opacity: 0.93 }}>
							Verwaltung
						</Text>
					</View>
				</View>
				<View style={{ marginTop: 40 }}>
					<View style={{ backgroundColor: '#38304C', padding: 15 }}>
						<View
							style={{
								flexWrap: 'wrap',
								alignItems: 'flex-start',
								flexDirection: 'row',
							}}
						>
							<AutoHeightImage
								style={{ borderRadius: 50 }}
								width={50}
								source={{
									uri: club.logo,
								}}
							/>
							<View
								style={{
									marginLeft: 20,
									height: 50,
									justifyContent: 'center',
									maxWidth: 275,
								}}
							>
								<Text
									style={{ textTransform: 'uppercase', fontSize: 21, color: 'white', fontFamily: 'Poppins-SemiBold' }}
								>
									{club.name}
								</Text>
								<Text style={{ fontSize: 16, color: 'white', opacity: 0.6, fontFamily: 'Poppins-Medium' }}>
									{club.members.toLocaleString()} Mitglieder
								</Text>
							</View>
						</View>
					</View>
					<View style={{ marginTop: 60, backgroundColor: '#38304C', padding: 15 }}>
						<Setting
							type="switch"
							isEnabled={club.public}
							onSwitch={() => {
								database().ref('clubs/' + club.id + '/public').set(!club.public);
								this.state.club.public = !club.public;
								this.forceUpdate();
							}}
							label="Öffentlich"
							icon={club.public ? faUnlock : faLock}
						/>
					</View>
					<View style={{ marginTop: 40, backgroundColor: '#38304C', padding: 15 }}>
						<Setting setting="groups" label="Gruppen" icon={faLayerGroup} utils={this.state.utils} club={club} />
						<Setting setting="qrcodes" utils={this.state.utils} club={club} label="QR-Codes" icon={faQrcode} />
					</View>
					<View style={{ marginTop: 40, backgroundColor: '#38304C', padding: 15 }}>
						<Setting setting="logo" label="Logo" icon={faImage} utils={this.state.utils} club={club} />
						<Setting label="Name" icon={faPen} onPress={() => alert('setting')} />
						<Setting setting="color" label="Farbe" icon={faTint} utils={this.state.utils} club={club} />
					</View>
					<View style={{ marginTop: 40, backgroundColor: '#38304C', padding: 15 }}>
						<Setting
							color="red"
							label="Verein löschen"
							icon={faTrash}
							iconColor="light"
							type="action"
							onPress={() => alert('setting')}
						/>
					</View>
				</View>
			</ScrollView>
		);
	}
}

//Styles
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'transparent',
	},
});

export default withNavigation(ClubSettings);
