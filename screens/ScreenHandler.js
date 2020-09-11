import React from 'react';
import * as utils from './../utils.js';
import AutoHeightImage from 'react-native-auto-height-image';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';
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
import HomeScreen from './Home';
import ManagmentScreen from './Managment';
import MessagesScreen from './Messages';
import SettingsScreen from './Settings';
import AddClubScreen from './AddClub';
import FirstStartScreen from './FirstStart';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { faHome, faUsers, faComment, faCog, faPlusCircle } from '@fortawesome/free-solid-svg-icons';

export default class ScreenHandler extends React.Component {
	constructor() {
		super();
		this.animation_pos = 0;
		this.animation_end = 0;
		this.animation_up = true;
		this.animation_delay = 0;
		this.last_nav_id = -1;
		this.state = {
			refreshing: false,
			account_type: '',
			first_start_done: false,
			scrollViewEnabled: true,
			hole_margin: 0,
			nav: [
				{ x: 0, visible: false, moveTo: 'none', iconColor: 'white' },
				{ x: 0, visible: false, moveTo: 'none', iconColor: 'white' },
				{ x: 0, visible: false, moveTo: 'none', iconColor: 'white' },
				{ x: 0, visible: false, moveTo: 'none', iconColor: 'white' },
				{ x: 0, visible: false, moveTo: 'none', iconColor: 'white' },
			],
		};
		this.holeMargin = new Animated.Value(40);
		this.navbarMarginBottom = new Animated.Value(-100);
		auth().onAuthStateChanged(
			(function(user) {
				database().ref('users/' + user.uid + '/account_type').once(
					'value',
					(function(snap) {
						if (!snap.val()) {
							// account does not exist
							console.log('account does not exist');
							this.props.navigation.navigate('FirstStartScreen', {
								utils: utils,
								uid: user.uid,
								onDone: this._onAuthDone.bind(this),
							});
						} else {
							// acount exists
							utils.setUserID(user.uid);
							utils.setAccountType(snap.val());
							utils.setNavigation(this.props.navigation);
							this.state.nav[0].visible = true;
							this.state.first_start_done = true;
							this.state.account_type = snap.val();
							this.forceUpdate();
						}
					}).bind(this)
				);
			}).bind(this)
		);
	}

	_onAuthDone() {
		console.log('onDone');
		this.props.navigation.navigate('ScreenHandler');
		this.state.nav[0].visible = true;
		this.state.first_start_done = true;
		this.forceUpdate();
	}

	setScrollViewEnabled = data => {
		//_scrollView.setNativeProps({ scrollEnabled: data });
	};

	startNavbarAnimation = dir => {
		if (dir == 'show') {
			console.log('startNavbarAnimation show');
			this.navbarMarginBottom.setValue(-100);
			Animated
				.timing(this.navbarMarginBottom, {
					useNativeDriver: false,
					toValue: 0,
					duration: 300,
					easing: Easing.ease,
				})
				.start();
		} else if (dir == 'hide') {
			console.log('startNavbarAnimation hide');
			this.navbarMarginBottom.setValue(0);
			Animated
				.timing(this.navbarMarginBottom, {
					useNativeDriver: false,
					toValue: -100,
					duration: 300,
					easing: Easing.ease,
				})
				.start();
		}
	};

	_onRefresh() {
		this.state.home_screen.doRefresh();
	}

	render() {
		var s = require('./../app/style');
		const numbers = [ 1, 2, 3, 4, 5 ];
		const { navigate } = this.props.navigation;
		const { goBack } = this.props.navigation;
		const navbarMarginBottom = this.navbarMarginBottom.interpolate({
			inputRange: [ -100, 0 ],
			outputRange: [ -100, 0 ],
		});
		console.log(navbarMarginBottom);
		const marginLeft = this.holeMargin.interpolate({
			inputRange: [ 0, 2000 ],
			outputRange: [ 0, 2000 ],
		});

		if (this.state.first_start_done) {
			return (
				<View style={s.container}>
					<StatusBar hidden={true} />
					<View
						style={{ marginTop: 0 }}
						showsHorizontalScrollIndicator={false}
						scrollEnabled={true}
						ref={component => _scrollView = component}
					>
						<HomeScreen
							utilsObject={utils}
							startNavbarAnimation={this.startNavbarAnimation}
							setScrollViewEnabled={this.setScrollViewEnabled}
							moveTo={this.state.nav[0].moveTo}
							show={this.state.nav[0].visible}
						/>
						<ManagmentScreen
							utilsObject={utils}
							setScrollViewEnabled={this.setScrollViewEnabled}
							moveTo={this.state.nav[1].moveTo}
							show={this.state.nav[1].visible}
						/>
						<AddClubScreen
							utilsObject={utils}
							setScrollViewEnabled={this.setScrollViewEnabled}
							moveTo={this.state.nav[2].moveTo}
							show={this.state.nav[2].visible}
						/>
						<MessagesScreen
							utilsObject={utils}
							setScrollViewEnabled={this.setScrollViewEnabled}
							moveTo={this.state.nav[3].moveTo}
							show={this.state.nav[3].visible}
						/>
						<SettingsScreen
							utilsObject={utils}
							setScrollViewEnabled={this.setScrollViewEnabled}
							moveTo={this.state.nav[4].moveTo}
							show={this.state.nav[4].visible}
						/>
					</View>

					<Animated.View style={[ styles.navigationBar, { bottom: navbarMarginBottom } ]}>
						<View style={styles.navigationBarWhiteBackground} />

						<Animated.View style={{ marginLeft }}>
							<View style={styles.navigatonBarMarker} />
						</Animated.View>
						<View style={styles.navigationBarIcons}>
							<TouchableOpacity
								onLayout={event => {
									const layout = event.nativeEvent.layout;
									this.state.nav[0].x = layout.x;
									if (this.state.nav[0].visible) this.navigate(0);
								}}
								onPress={() => this.navigate(0)}
							>
								<FontAwesomeIcon
									style={styles.navigationBarIcon}
									size={29}
									color={this.state.nav[0].iconColor}
									icon={faHome}
								/>
							</TouchableOpacity>
							{this.state.account_type == 'manager'
								? <TouchableOpacity
										onLayout={event => {
											const layout = event.nativeEvent.layout;
											this.state.nav[1].x = layout.x;
											if (this.state.nav[1].visible) this.navigate(1);
										}}
										onPress={() => this.navigate(1)}
									>
										<FontAwesomeIcon
											style={styles.navigationBarIcon}
											size={29}
											color={this.state.nav[1].iconColor}
											icon={faUsers}
										/>
									</TouchableOpacity>
								: <TouchableOpacity
										onLayout={event => {
											const layout = event.nativeEvent.layout;
											this.state.nav[2].x = layout.x;
											if (this.state.nav[2].visible) this.navigate(2);
										}}
										onPress={() => this.navigate(2)}
									>
										<FontAwesomeIcon
											style={styles.navigationBarIcon}
											size={29}
											color={this.state.nav[2].iconColor}
											icon={faPlusCircle}
										/>
									</TouchableOpacity>}

							<TouchableOpacity
								onLayout={event => {
									const layout = event.nativeEvent.layout;
									this.state.nav[3].x = layout.x;
									if (this.state.nav[3].visible) this.navigate(3);
								}}
								onPress={() => this.navigate(3)}
							>
								<FontAwesomeIcon
									style={styles.navigationBarIcon}
									size={28}
									color={this.state.nav[3].iconColor}
									icon={faComment}
								/>
							</TouchableOpacity>
							<TouchableOpacity
								onLayout={event => {
									const layout = event.nativeEvent.layout;
									this.state.nav[4].x = layout.x;
									if (this.state.nav[4].visible) this.navigate(4);
								}}
								onPress={() => this.navigate(4)}
							>
								<FontAwesomeIcon
									style={styles.navigationBarIcon}
									size={28}
									color={this.state.nav[4].iconColor}
									icon={faCog}
								/>
							</TouchableOpacity>
						</View>
					</Animated.View>
				</View>
			);
		} else {
			return null;
		}
	}

	navigate(id) {
		if (this.last_nav_id != id) {
			for (var i = 0; i < 5; i++) {
				if (id != i) {
					this.state.nav[i].iconColor = 'white';
					this.state.nav[i].visible = false;
				} else {
					this.state.nav[i].visible = true;
				}
			}

			this.holeMargin.setValue(this.state.hole_margin);
			Animated
				.timing(this.holeMargin, {
					useNativeDriver: false,
					toValue: this.state.nav[id].x + 44,
					duration: 120,
					easing: Easing.ease,
				})
				.start(() => {
					for (var i = 0; i < 5; i++) {
						if (id != i) {
							this.state.nav[i].iconColor = 'white';
						} else {
							this.state.nav[i].iconColor = '#38304C';
						}
					}

					this.forceUpdate();
				});

			//if(this.last_nav_id > id) this.state.nav[id].moveTo = "left"
			//else this.state.nav[id].moveTo = "right"
			this.state.hole_margin = this.state.nav[id].x + 44;
			this.forceUpdate();
			this.last_nav_id = id;
		}
	}

	navigateLeft() {
		if (this.last_nav_id < 3) this.navigate(this.last_nav_id + 1);
	}

	navigateRight() {
		if (this.last_nav_id > 0) this.navigate(this.last_nav_id - 1);
	}
}

//Styles
const styles = StyleSheet.create({
	navigationBar: {
		...ifIphoneX(
			{
				height: 105,
			},
			{
				height: 94,
			}
		),
		position: 'absolute',
		width: '100%',

		shadowColor: '#38304C',
		shadowOffset: {
			width: 0,
			height: 9,
		},
		shadowOpacity: 0.58,
		shadowRadius: 20.00,

		elevation: 30,
	},
	navigatonBarMarker: {
		marginTop: 33,
		backgroundColor: '#0DF5E3',
		width: 40,
		height: 40,
		borderRadius: 22,
	},
	navigationBarWhiteBackground: {
		borderTopLeftRadius: 45,
		borderTopRightRadius: 45,
		position: 'absolute',
		marginTop: 20,
		height: 95,
		width: '100%',
		backgroundColor: '#38304C',
	},
	navigationBarIcons: {
		flexDirection: 'row',
		width: '100%',
		marginTop: 39,
		position: 'absolute',
	},
	navigationBarIcon: {
		marginLeft: 50,
	},
});
