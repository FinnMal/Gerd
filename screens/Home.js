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
import { Headlines } from './../app/constants.js';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { NotificationCard } from './../app/components.js';
import database from '@react-native-firebase/database';
import { withNavigation } from 'react-navigation';

class HomeScreen extends React.Component {
	constructor(props) {
		super(props);

		var utils = this.props.utilsObject;
		//var uid = utils.USER_ID;
		this.state = {
			mesList: [],
			clubs: {},
			moveTo: 'none',
		};
		this.margin = new Animated.Value(0);

		database().ref('messages/list').on(
			'value',
			(function(snapshot) {
				var messages = snapshot.val();
				this.state.mesList = [];
				var total_messages = Object.keys(messages).length;

				var i = 0;
				Object.keys(messages).map(key => {
					var message = messages[key];
					database().ref('clubs/' + message.club_id).once(
						'value',
						(function(snap) {
							var club = snap.val();
							message.color = club.color;
							message.club_name = club.name;
							message.ago = utils.getAgoText(message.send_at);
							this.state.mesList[total_messages - i] = message;
							i++;
							this.forceUpdate();
						}).bind(this)
					);
				});
			}).bind(this)
		);
	}

	render() {
		var s = require('./../app/style.js');
		const marginLeft = this.margin.interpolate({
			inputRange: [ 0, 2000 ],
			outputRange: [ 0, 2000 ],
		});

		if (this.props.show) {
			const cardsList = Object.keys(this.state.mesList).map(key => {
				var mes = this.state.mesList[key];
				return (
					<NotificationCard
						color={mes.color}
						key={key}
						headline={mes.headline}
						text={mes.text}
						clubImg={require('./../assets/img/cvjm_logo_vektor-converted.png')}
						clubName={mes.club_name}
						ago={mes.ago}
						onPress={() => {
							this.props.navigation.navigate('MessageScreen', {
								utilsObject: this.utils,
								navigation: this.props.navigation,
							});
						}}
					/>
				);
			});

			return (
				<View
					onLayout={event => {
						var { x, y, width, height } = event.nativeEvent.layout;
						this.checkIfScrollViewIsNeeded(height);
					}}
				>
					<StatusBar hidden={true} />
					<View
						style={{
							width: '100%',
							flexWrap: 'wrap',
							alignItems: 'flex-start',
							flexDirection: 'row',
						}}
					>
						<Text style={s.pageHeadline}>Mitteilungen</Text>
						<TouchableOpacity
							style={
								([ styles.headlineIcon ], {
									marginTop: 55,
									marginLeft: 30,
								})
							}
							onPress={() => this.openAddMessage()}
						>
							<FontAwesomeIcon size={29} color="#F5F5F5" icon={faPlusCircle} />
						</TouchableOpacity>
						<View
							style={{
								marginTop: 20,
								marginLeft: 21,
								flexWrap: 'wrap',
								alignItems: 'flex-start',
								flexDirection: 'row',
							}}
						>
							<View
								style={{
									borderRadius: 16,
									marginTop: -2.5,
									position: 'absolute',
									width: 76,
									backgroundColor: '#0DF5E3',
									height: 31,
									shadowColor: '#0DF5E3',
									shadowOffset: {
										width: 6,
										height: 0,
									},
									shadowOpacity: 0.20,
									shadowRadius: 20.00,
								}}
							/>
							<TouchableOpacity style={styles.navTouch}>
								<Text style={[ styles.navText, { marginLeft: 20, color: '#201A30' } ]}>Neu</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.navTouch}>
								<Text style={styles.navText}>Heute</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.navTouch}>
								<Text style={styles.navText}>Älter</Text>
							</TouchableOpacity>
						</View>
					</View>
					{cardsList}
				</View>
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

	openAddMessage() {
		alert('Test');
	}
}

//Styles
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'transparent',
	},
	navText: {
		fontFamily: 'Poppins-ExtraBold',
		fontSize: 22,
		marginLeft: 0,
		color: 'white',
	},
	navTouch: {
		marginTop: 0,
		marginRight: 45,
	},
});

export default withNavigation(HomeScreen);
