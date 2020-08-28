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
	Modal
} from 'react-native';
import { Headlines } from './../app/constants.js';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronCircleLeft, faClock, faArrowAltCircleDown } from '@fortawesome/free-solid-svg-icons';
import { NotificationCard } from './../app/components.js';
import database from '@react-native-firebase/database';
import { SafeAreaView } from 'react-navigation'; //added this import

export default class MessageScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			scrollY: new Animated.Value(0),
		};
	}

	_getHeadlineMarginTop = () => {
		const { scrollY } = this.state;
		return scrollY.interpolate({
			inputRange: [ 0, 160, 210 ],
			outputRange: [ 200, 81, 15 ],
			extrapolate: 'clamp',
			useNativeDriver: true,
		});
	};

	_getHeadlineMarginLeft = () => {
		const { scrollY } = this.state;
		return scrollY.interpolate({
			inputRange: [ 0, 160 ],
			outputRange: [ 20, 30 ],
			extrapolate: 'clamp',
			useNativeDriver: true,
		});
	};

	_getHeadlineFontScale = () => {
		const { scrollY } = this.state;

		return scrollY.interpolate({
			inputRange: [ 0, 160 ],
			outputRange: [ 1, 0.65 ],
			extrapolate: 'clamp',
			useNativeDriver: true,
		});
	};

	_getBackButtonMarginLeft = () => {
		const { scrollY } = this.state;

		return scrollY.interpolate({
			inputRange: [ 0, 160, 210 ],
			outputRange: [ 20, 20, 20 ],
			extrapolate: 'clamp',
			useNativeDriver: true,
		});
	};

	_getBackButtonMarginTop = () => {
		const { scrollY } = this.state;

		return scrollY.interpolate({
			inputRange: [ 0, 160, 210 ],
			outputRange: [ 40, 40, -29 ],
			extrapolate: 'clamp',
			useNativeDriver: true,
		});
	};

	_getImageScale = () => {
		const { scrollY } = this.state;

		return scrollY.interpolate({
			inputRange: [ 0, 160 ],
			outputRange: [ 1, 2 ],
			extrapolate: 'clamp',
			useNativeDriver: true,
		});
	};

	render() {
		const headlineFontScale = this._getHeadlineFontScale();
		const headlineMarginTop = this._getHeadlineMarginTop();
		const headlineMarginLeft = this._getHeadlineMarginLeft();
		const backButtonMarginLeft = this._getBackButtonMarginLeft();
		const backButtonMarginTop = this._getBackButtonMarginTop();
		const imageScale = this._getImageScale();

		var s = require('./../app/style.js');
		return (
			<View>
				<View style={{ position: 'absolute' }}>
					<View style={{ width: 400, marginLeft: 0, marginTop: -50, position: 'absolute' }}>
						<View style={{ position: 'absolute' }}>
							<Animated.Text
								style={{
									fontFamily: 'Poppins-Bold',
									marginRight: 20,
									marginLeft: headlineMarginLeft,
									marginTop: headlineMarginTop,
									fontSize: 40,
									transform: [ { scale: headlineFontScale } ],

									color: 'white',
								}}
							>
								Lorem ipsum.
							</Animated.Text>
							<View
								style={{
									opacity: 0.8,
									width: 500,
									flexWrap: 'wrap',
									alignItems: 'flex-start',
									flexDirection: 'row',
									marginTop: 260,
									position: 'absolute',
									marginLeft: 20,
								}}
							>
								<FontAwesomeIcon size={13} color="#F5F5F5" icon={faClock} />
								<Text
									style={{ fontFamily: 'Poppins-Medium', marginTop: -2, fontSize: 13, marginLeft: 10, color: 'white' }}
								>
									VOR 45 MIN.
								</Text>
								<FontAwesomeIcon style={{ marginLeft: 20 }} size={13} color="#F5F5F5" icon={faClock} />
								<Text
									style={{ fontFamily: 'Poppins-Medium', marginTop: -2, fontSize: 13, marginLeft: 10, color: 'white' }}
								>
									ST. ANNA SCHULE WUPPERTAL
								</Text>
							</View>
						</View>
						<Animated.Image
							blurRadius={30}
							style={{
								backgroundColor: 'rgba(0,0,0,1)',
								flex: 1,
								zIndex: -1,
								height: 370,
								resizeMode: 'cover',
								marginTop: 0,
								transform: [ { scale: imageScale } ],
							}}
							source={{
								uri: 'https://images.unsplash.com/photo-1569411638773-469c48df3ce4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80',
							}}
						/>
					</View>

				</View>
				<Animated.ScrollView
					alwaysBounceHorizontal={false}
					alwaysBounceVertical={false}
					bounces={false}
					scrollEventThrottle={1}
					overScrollMode={'never'}
					style={{
						zIndex: 10,
						marginBottom: -35,
					}}
					onScroll={Animated.event([
						{
							nativeEvent: { contentOffset: { y: this.state.scrollY } },
						},
					])}
				>
					<View
						style={{
							zIndex: 10,
							marginTop: 240,
							backgroundColor: '#201A30',
							borderRadius: 35,
						}}
					>
						<View style={{ marginTop: 30, marginLeft: 22, marginRight: 20 }}>
							<Text style={{ fontFamily: 'Poppins-Regular', fontSize: 20, color: 'white' }}>
								Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
							</Text>
							<View
								style={{
									paddingTop: 20,
									paddingLeft: 30,
									borderRadius: 30,
									marginLeft: -22,
									marginTop: 20,
									backgroundColor: '#38304C',
									height: 200,
									width: '120%',
								}}
							>
								<Text style={{ fontFamily: 'Poppins-Bold', fontSize: 37, color: '#B3A9AF' }}>Dateien</Text>
								<View
									style={{
										marginTop: 20,
										borderRadius: 13,
										padding: 10,
										backgroundColor: '#201A30',
										marginRight: 55,
										color: '#ADA4A9',
									}}
								>
									<FontAwesomeIcon style={{ zIndex: 0 }} size={29} color="#ADA4A9" icon={faArrowAltCircleDown} />
									<Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 23, color: '#ADA4A9' }}>lorem.pdf</Text>
									<Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16, color: '#ADA4A9' }}>12MB</Text>
								</View>

							</View>
						</View>
					</View>
				</Animated.ScrollView>
				<Animated.View
					style={
						([ s.headlineIcon ], {
							zIndex: 20,
							position: 'absolute',
							marginTop: backButtonMarginTop,
							marginLeft: backButtonMarginLeft,
						})
					}
				>
					<TouchableOpacity onPress={() => this.props.navigation.navigate('ScreenHandler')}>
						<FontAwesomeIcon style={{ zIndex: 0 }} size={29} color="#F5F5F5" icon={faChevronCircleLeft} />
					</TouchableOpacity>
				</Animated.View>
			</View>
		);
	}
}
