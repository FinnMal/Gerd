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
	Modal,
	ImageBackground
} from 'react-native';
import { Headlines } from './../app/constants.js';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronCircleLeft, faClock, faArrowAltCircleDown } from '@fortawesome/free-solid-svg-icons';
import { NotificationCard, DownloadCard, EventCard } from './../app/components.js';
import database from '@react-native-firebase/database';
import { SafeAreaView } from 'react-navigation'; //added this import

export default class MessageScreen extends React.Component {
	constructor(props) {
		super(props);

		const mes = this.props.navigation.getParam('content', null);

		this.state = {
			scrollY: new Animated.Value(0),
		};

		database().ref('messages/list/' + mes.id + '/read_by/default').set(true);
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
			outputRange: [ 1, 1.5 ],
			extrapolate: 'clamp',
			useNativeDriver: true,
		});
	};

	_getImageOpacity = () => {
		const { scrollY } = this.state;

		return scrollY.interpolate({
			inputRange: [ 0, 160 ],
			outputRange: [ 'rgba(0, 0, 0, 0.3)', 'rgba(32, 26, 48, 0.6)' ],
			extrapolate: 'clamp',
			useNativeDriver: true,
		});
	};

	render() {
		const content = this.props.navigation.getParam('content', null);

		const headlineFontScale = this._getHeadlineFontScale();
		const headlineMarginTop = this._getHeadlineMarginTop();
		const headlineMarginLeft = this._getHeadlineMarginLeft();
		const backButtonMarginLeft = this._getBackButtonMarginLeft();
		const backButtonMarginTop = this._getBackButtonMarginTop();
		const imageScale = this._getImageScale();
		const imageOpacity = this._getImageOpacity();
		var s = require('./../app/style.js');

		var downloadsElements = null;
		if (content.files) {
			downloadsElements = Object.keys(content.files).map(key => {
				var file = content.files[key];
				return (
					<DownloadCard key={key} name={file.name} type={file.type} size={file.size} download_url={file.download_url} />
				);
			});
		}

		var eventsElements = null;
		if (content.events) {
			eventsElements = Object.keys(content.events).map(key => {
				var event = content.events[key];
				return <EventCard key={key} editable={false} name={event.name} date={event.date} location={event.location} />;
			});
		}

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
								{content.headline}
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
									{content.ago}
								</Text>
								<FontAwesomeIcon style={{ marginLeft: 20 }} size={13} color="#F5F5F5" icon={faClock} />
								<Text
									style={{ fontFamily: 'Poppins-Medium', marginTop: -2, fontSize: 13, marginLeft: 10, color: 'white' }}
								>
									{content.club_name}
								</Text>
							</View>
						</View>
						<Animated.View
							style={{
								flex: 1,
								zIndex: -1,
								height: 370,
								resizeMode: 'cover',
								marginTop: 0,
								transform: [ { scale: imageScale } ],
							}}
						>
							<ImageBackground
								blurRadius={20}
								style={{
									flex: 1,
									zIndex: -1,
									height: 370,
									resizeMode: 'cover',
								}}
								source={{
									uri: content.img,
								}}
							>
								<Animated.View
									style={{
										flex: 1,
										backgroundColor: imageOpacity,
									}}
								/>
							</ImageBackground>
						</Animated.View>
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
					onScroll={Animated.event(
						[
							{
								nativeEvent: { contentOffset: { y: this.state.scrollY } },
							},
						],
						{ useNativeDriver: false }
					)}
				>
					<View
						style={{
							zIndex: 10,
							marginTop: 240,
							backgroundColor: '#201A30',
							borderRadius: 30,
						}}
					>
						<View style={{ marginTop: 30, marginLeft: 22, marginRight: 20 }}>
							<Text style={{ fontFamily: 'Poppins-Regular', fontSize: 20, color: 'white' }}>
								{content.long_text}
							</Text>
							<View
								style={{
									paddingTop: 20,
									paddingBottom: 40,
									paddingLeft: 30,
									borderRadius: 30,
									marginLeft: -22,
									marginTop: 20,
									backgroundColor: '#38304C',
									width: '120%',
								}}
							>
								{downloadsElements
									? <View>
											<Text style={{ fontFamily: 'Poppins-Bold', fontSize: 40, color: '#B3A9AF' }}>Dateien</Text>
											{downloadsElements}
										</View>
									: void 0}

								{eventsElements
									? <View>
											<Text style={{ fontFamily: 'Poppins-Bold', marginTop: 50, fontSize: 40, color: '#B3A9AF' }}>
												Events
											</Text>
											<View style={{ marginTop: 20, marginRight: 55 }}>
												{eventsElements}
											</View>
										</View>
									: void 0}
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
