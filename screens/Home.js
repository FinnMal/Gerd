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
	RefreshControl
} from 'react-native';
import { Headlines } from './../app/constants.js';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { NotificationCard } from './../app/components.js';
import database from '@react-native-firebase/database';
import { withNavigation } from 'react-navigation';
import { Message } from './../classes/Message.js';
import { MessagesList } from './../classes/MessagesList.js';

class HomeScreen extends React.Component {
	scrollOffset: 0;

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
			utils: utils,
			uid: utils.getUserID(),
			account_type: utils.getAccountType(),
			unread_messages_count: 0,
		};
		this.margin = new Animated.Value(0);
		this.navMarginLeft = new Animated.Value(0);

		/*
		database().ref('messages/list').on(
			'value',
			(function(snapshot) {
				this._filterMessages(
					snapshot.val(),
					(function(messages) {
						this.state.unread_messages_count = 0;
						Object.keys(messages).map(key => {
							database().ref('users/' + this.state.uid + '/messages/' + key + '/read').once(
								'value',
								(function(snap) {
									if (!snap.val()) this.state.unread_messages_count++;
									this.forceUpdate();
								}).bind(this)
							);
						});
						this.forceUpdate();
					}).bind(this)
				);
			}).bind(this)
		);

		database().ref('messages/list').on(
			'value',
			(function(snapshot) {
				this._filterMessages(
					snapshot.val(),
					(function(messages) {
						this.state.newMesList = [];
						this.state.todayMesList = [];
						this.state.olderMesList = [];
						var total_messages = Object.keys(messages).length;

						var checked = 0;
						Object.keys(messages).map(key => {
							var message = messages[key];

							if (!message.invisible) {
								message.id = key;

								database().ref('users/' + this.state.uid + '/messages/' + key + '/read').once(
									'value',
									(function(snap) {
										var read_by_user = snap.val();
										database().ref('clubs/' + message.club_id).once(
											'value',
											(function(snap) {
												var club = snap.val();
												message.color = club.color;
												message.club_name = club.name;
												message.club_img = club.logo;
												message.ago = utils.getAgoText(message.send_at);
												message.ago_seconds = utils.getAgoSec(message.send_at);

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
									}).bind(this)
								);
							} else
								checked++;
						});
					}).bind(this)
				);
			}).bind(this)
		);
*/
	}

	doRefresh() {
		this.state.refreshing = true;
		this.forceUpdate();
		this.refs.messagesList.refresh(
			(function() {
				this.state.refreshing = false;
				this.forceUpdate();
			}).bind(this)
		);
	}

	_filterMessages(data, cb) {
		var c_mes = 0;
		var messages = {};
		const total_mes = Object.keys(data).length;
		cb(data);

		Object.keys(data).map(mes_id => {
			var mes = data[mes_id];
			mes.id = mes_id;

			var c_group = 0;
			const total_groups = Object.keys(mes.groups).length;
			Object.keys(mes.groups).map(group_id => {
				if (mes.groups[group_id]) {
					database()
						.ref('users/' + this.state.uid + '/clubs/' + mes.club_id + '/groups/' + group_id + '/subscribed')
						.once(
							'value',
							(function(snap) {
								if (snap.val() === true) messages[mes_id] = mes;
								c_group++;
								if (c_mes == total_mes && c_group == total_groups) {
									cb(messages);
								}
							}).bind(this)
						);
				}
			});
			c_mes++;
		});
		/*
		console.log(JSON.stringify(messages));
		var ret = {};
		Object.keys(messages).map(key => {
			ret[messages[key].id] = messages[key];
		});
		console.log(JSON.stringify(ret));
		Object.keys(ret).map(key => {
			console.log('[mes_id]: ' + key);
		});
		return ret;
		*/
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
				duration: 100,
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
			//if (this.state.newMesList.length == 0 && this.state.navPos == 0) this.navigateSection(1, false);
			return (
				<ScrollView
					scrollEventThrottle={260}
					onScroll={event => {
						var currentOffset = event.nativeEvent.contentOffset.y;
						var state = currentOffset > this.offset ? 'hide' : 'show';
						var moved = currentOffset - this.offset;
						this.offset = currentOffset;
						if (moved > 200 || moved < -1) {
							console.log(state);
							this.props.startNavbarAnimation(state, 0);
						}
					}}
					style={{ marginTop: 0 }}
					refreshControl={
						(
							<RefreshControl
								style={{ marginTop: -44 }}
								refreshing={this.state.refreshing}
								onRefresh={this.doRefresh.bind(this)}
							/>
						)
					}
					onLayout={event => {
						var { x, y, width, height } = event.nativeEvent.layout;
						//this.checkIfScrollViewIsNeeded(height);
					}}
				>

					<View
						style={{
							width: '100%',
							flexWrap: 'wrap',
							alignItems: 'flex-start',
							flexDirection: 'row',
						}}
					>
						<Text style={s.pageHeadline}>Mitteilungen</Text>
						{this.state.account_type == 'manager'
							? <TouchableOpacity
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
							: void 0}

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
					<MessagesList ref="messagesList" section={this.state.navPos} utils={this.state.utils} />
				</ScrollView>
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
		this.props.navigation.navigate('NewMessageScreen', {
			utils: this.props.utilsObject,
		});
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
