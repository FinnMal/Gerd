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
			newMesList: [],
			todayMesList: [],
			olderMesList: [],
			clubs: {},
			moveTo: 'none',
			navPos: 0,
			unread_messages_count: 0,
		};
		this.margin = new Animated.Value(0);
		this.navMarginLeft = new Animated.Value(0);

		database().ref('messages/list').on(
			'value',
			(function(snapshot) {
				var messages = snapshot.val();

				this.state.unread_messages_count = 0;
				Object.keys(messages).map(key => {
					var message = messages[key];
					if (message.read_by) {
						if (message.read_by['default']) return;
					}
					this.state.unread_messages_count++;
					this.forceUpdate();
				});
				this.forceUpdate();
			}).bind(this)
		);

		database().ref('messages/list').on(
			'value',
			(function(snapshot) {
				var messages = snapshot.val();
				this.state.newMesList = [];
				this.state.todayMesList = [];
				this.state.olderMesList = [];
				var total_messages = Object.keys(messages).length;

				var checked = 0;
				Object.keys(messages).map(key => {
					var message = messages[key];
					message.id = key;

					var read_by_user = false;
					if (message.read_by) {
						if (message.read_by['default']) read_by_user = true;
					}

					database().ref('clubs/' + message.club_id).once(
						'value',
						(function(snap) {
							var club = snap.val();
							message.color = club.color;
							message.club_name = club.name;
							message.club_img = club.logo;
							message.ago = utils.getAgoText(message.send_at);
							message.ago_seconds = utils.getAgoSec(message.send_at);

							console.log(message.headline + ': ' + message.ago_seconds);
							if (!read_by_user) this.state.newMesList[this.state.newMesList.length] = message;
							else if (message.ago_seconds / 60 / 60 < 24)
								this.state.todayMesList[this.state.todayMesList.length] = message;
							else
								this.state.olderMesList[this.state.olderMesList.length] = message;
							checked++;

							if (checked == total_messages) {
								this.sortList('newMesList');
								this.sortList('todayMesList');
								this.sortList('olderMesList');

								this.generateCards('newMesList');
								this.generateCards('todayMesList');
								this.generateCards('olderMesList');

								this.forceUpdate();
							}
						}).bind(this)
					);
				});
			}).bind(this)
		);
	}

	sortList(listName) {
		var list = this.state[listName];
		list.sort(function(a, b) {
			return parseInt(a.ago_seconds) - parseInt(b.ago_seconds);
		});
		this.state[listName] = list;
	}

	generateCards(listName) {
		var cardsList = Object.keys(this.state[listName]).map(key => {
			var mes = this.state[listName][key];
			return (
				<NotificationCard utils={this.props.utilsObject} content={mes} key={key} navigation={this.props.navigation} />
			);
		});
		this.state[listName] = cardsList;
	}

	navigateSection(pos, forceUpdate = true) {
		this.navMarginLeft.setValue(this.state.navPos * 115 - 3);

		this.state.navPos = pos;
		if (forceUpdate) this.forceUpdate();

		Animated
			.timing(this.navMarginLeft, {
				useNativeDriver: false,
				toValue: pos * 115 - 3,
				duration: 140,
				easing: Easing.ease,
			})
			.start(() => {});
	}

	render() {
		var s = require('./../app/style.js');
		const marginLeft = this.margin.interpolate({
			inputRange: [ 0, 2000 ],
			outputRange: [ 0, 2000 ],
		});

		const nav_margin_left = this.navMarginLeft.interpolate({
			inputRange: [ 0, 2000 ],
			outputRange: [ 0, 2000 ],
		});

		if (this.props.show) {
			if (this.state.newMesList.length == 0 && this.state.navPos == 0) this.navigateSection(1, false);
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
							{this.state.unread_messages_count
								? <View
										style={{
											minHeight: 20,
											minWidth: 20,
											zIndex: 100,
											position: 'absolute',
											marginTop: -10,
											marginLeft: 50,
											borderRadius: 40,
											paddingLeft: 5,
											paddingRight: 5,
											paddingTop: 2,
											paddingBottom: 1,
											backgroundColor: 'red',
											justifyContent: 'center',
											alignItems: 'center',
										}}
									>
										<Text style={{ fontFamily: 'Poppins-SemiBold', color: 'white' }}>
											{this.state.unread_messages_count}
										</Text>
									</View>
								: void 0}

							<Animated.View
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
									marginLeft: nav_margin_left,
									shadowOpacity: 0.20,
									shadowRadius: 20.00,
								}}
							/>

							<TouchableOpacity style={[ styles.navTouch ]} onPress={() => this.navigateSection(0)}>

								<Text style={[ styles.navText, { color: this.state.navPos == 0 ? '#201A30' : '#ffffff' } ]}>
									Neu
								</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.navTouch} onPress={() => this.navigateSection(1)}>
								<Text style={[ styles.navText, { color: this.state.navPos == 1 ? '#201A30' : '#ffffff' } ]}>
									Heute
								</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.navTouch} onPress={() => this.navigateSection(2)}>
								<Text style={[ styles.navText, { color: this.state.navPos == 2 ? '#201A30' : '#ffffff' } ]}>
									Älter
								</Text>
							</TouchableOpacity>
						</View>
					</View>
					<View style={{ marginBottom: 70 }}>
						{this.state.navPos == 0 ? this.state.newMesList : void 0}
						{this.state.navPos == 1 ? this.state.todayMesList : void 0}
						{this.state.navPos == 2 ? this.state.olderMesList : void 0}
					</View>
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
		this.props.navigation.navigate('NewMessageScreen', {});
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
		width: 70,
		marginTop: 0,
		marginRight: 45,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default withNavigation(HomeScreen);
