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
	Dimensions
} from 'react-native';
import HomeScreen from './Home';
import ManagmentScreen from './Managment';
import MessagesScreen from './Messages';
import SettingsScreen from './Settings';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faUsers, faComment, faCog } from '@fortawesome/free-solid-svg-icons';

export default class ScreenHandler extends React.Component {
	constructor() {
		super();
		this.animation_pos = 0;
		this.animation_end = 0;
		this.animation_up = true;
		this.animation_delay = 0;
		this.last_nav_id = -1;
		this.state = {
			scrollViewEnabled: true,
			hole_margin: 0,
			nav: [
				{ x: 0, visible: true, moveTo: 'none', iconColor: 'white' },
				{ x: 0, visible: false, moveTo: 'none', iconColor: 'white' },
				{ x: 0, visible: false, moveTo: 'none', iconColor: 'white' },
				{ x: 0, visible: false, moveTo: 'none', iconColor: 'white' },
			],
		};
		this.holeMargin = new Animated.Value(40);
	}

	setScrollViewEnabled = data => {
		console.log(data);
		_scrollView.setNativeProps({ scrollEnabled: data });
	};

	render() {
		var s = require('./../app/style');
		const numbers = [ 1, 2, 3, 4, 5 ];
		const { navigate } = this.props.navigation;
		const { goBack } = this.props.navigation;
		const marginLeft = this.holeMargin.interpolate({
			inputRange: [ 0, 2000 ],
			outputRange: [ 0, 2000 ],
		});

		return (
			<View style={s.container}>
				<StatusBar hidden={true} />
				<ScrollView
					style={{ marginTop: -44 }}
					showsHorizontalScrollIndicator={false}
					scrollEnabled={true}
					ref={component => _scrollView = component}
				>
					<HomeScreen
						utilsObject={utils}
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
					<MessagesScreen
						utilsObject={utils}
						setScrollViewEnabled={this.setScrollViewEnabled}
						moveTo={this.state.nav[2].moveTo}
						show={this.state.nav[2].visible}
					/>
					<SettingsScreen
						utilsObject={utils}
						setScrollViewEnabled={this.setScrollViewEnabled}
						moveTo={this.state.nav[3].moveTo}
						show={this.state.nav[3].visible}
					/>
				</ScrollView>

				<View style={styles.navigationBar}>
					<View style={styles.navigationBarWhiteBackground} />

					<Animated.View style={{ marginLeft }}>
						<View
							style={{
								marginTop: 33,
								backgroundColor: '#0DF5E3',
								width: 44,
								height: 44,
								borderRadius: 44 / 2,
								shadowColor: '#0DF5E3',
								shadowOffset: {
									width: 6,
									height: 0,
								},
								shadowOpacity: 0.20,
								shadowRadius: 20.00,

								elevation: 10,
							}}
						/>
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
								size={30}
								color={this.state.nav[0].iconColor}
								icon={faHome}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							onLayout={event => {
								const layout = event.nativeEvent.layout;
								this.state.nav[1].x = layout.x;
								if (this.state.nav[1].visible) this.navigate(1);
							}}
							onPress={() => this.navigate(1)}
						>
							<FontAwesomeIcon
								style={styles.navigationBarIcon}
								size={30}
								color={this.state.nav[1].iconColor}
								icon={faUsers}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							onLayout={event => {
								const layout = event.nativeEvent.layout;
								this.state.nav[2].x = layout.x;
								if (this.state.nav[2].visible) this.navigate(2);
							}}
							onPress={() => this.navigate(2)}
						>
							<FontAwesomeIcon
								style={styles.navigationBarIcon}
								size={30}
								color={this.state.nav[2].iconColor}
								icon={faComment}
							/>
						</TouchableOpacity>
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
								size={30}
								color={this.state.nav[3].iconColor}
								icon={faCog}
							/>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		);
	}

	navigate(id) {
		if (this.last_nav_id != id) {
			for (var i = 0; i < 4; i++) {
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
					toValue: this.state.nav[id].x + 43,
					duration: 220,
					easing: Easing.ease,
				})
				.start(() => {
					for (var i = 0; i < 4; i++) {
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
			this.state.hole_margin = this.state.nav[id].x + 43;
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
				height: 107,
			},
			{
				height: 94,
			}
		),
		bottom: 0,
		position: 'absolute',
		width: '100%',
		opacity: 1.0,

		shadowColor: '#38304C',
		shadowOffset: {
			width: 0,
			height: 9,
		},
		shadowOpacity: 0.58,
		shadowRadius: 20.00,

		elevation: 30,
	},
	navigationBarWhiteBackground: {
		borderTopLeftRadius: 40,
		borderTopRightRadius: 40,
		position: 'absolute',
		marginTop: 22,
		height: 100,
		width: '100%',
		backgroundColor: '#38304C',
	},
	navigationBarImage: {
		position: 'absolute',
		marginTop: 5,
		height: 90,
		width: '100%',
	},
	navigationBarHole: {
		color: '#0DF5E3',
	},
	navigationBarIcons: {
		flexDirection: 'row',
		width: '100%',
		marginTop: 40,
		position: 'absolute',
	},
	navigationBarIcon: {
		marginLeft: 50,
	},
	logo: {
		marginTop: 40,
		marginLeft: 25,
		height: 150,
		width: 50,
	},
	backgroundIcons: {
		position: 'absolute',
		left: 0,
		top: 0,
		width: '100%',
	},
	donut: {
		marginTop: 170,
		marginLeft: -50,
		opacity: 0.4,
		height: 110,
		width: 110,
	},
	cupcake: {
		marginTop: -15,
		alignSelf: 'flex-end',
		marginRight: -50,
		opacity: 0.4,
		height: 110,
		width: 110,
	},
	yourFactory: {
		marginTop: 50,
		fontWeight: '600',
		fontSize: 14,
		color: '#E62D48',
	},
	bakeryImage: {
		marginTop: 75,
		height: 220,
		width: 270,
	},
	factoryStatsText: {
		fontWeight: '600',
		fontSize: 15,
		marginTop: 50,
		color: '#959FA6',
	},
	statCard: {
		marginTop: 17,
		width: 340,
		minHeight: 50,
		borderRadius: 5,
		backgroundColor: '#ffffff',
		shadowColor: '#E7E9EB',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.5,
		shadowRadius: 2,
		elevation: 2,
	},
	cardIcon: {
		marginTop: 10,
		marginBottom: 10,
		marginLeft: 10,
	},
	cardText: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		marginLeft: 58,
		height: '100%',
		flexDirection: 'row',
		alignSelf: 'flex-start',
	},
	cardValueName: {
		fontWeight: '700',
		color: '#7D8A91',
	},
	cardValue: {
		fontWeight: '700',
		color: '#FF0000',
	},
});
