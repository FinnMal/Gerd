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
	ActionSheetIOS,
	ScrollView,
	Animated,
	Easing,
	Dimensions,
	Modal,
	ImageBackground
} from 'react-native';
import { Headlines } from './../app/constants.js';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronCircleLeft, faClock, faArrowAltCircleDown, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { NotificationCard, FileCard, EventCard } from './../app/components.js';
import database from '@react-native-firebase/database';
import { SafeAreaView } from 'react-navigation'; //added this import

export default class MessageScreen extends React.Component {
	constructor(props) {
		super(props);

		var headlineHeight = 0;
		const utils = this.props.navigation.getParam('utils', null);
		const mes = this.props.navigation.getParam('content', null);

		this.state = {
			scrollY: new Animated.Value(0),
			headlineHeight: -1,
			backBtnY: 0,
			cardY: 0,
			inputRange: [ 0, 160, 210 ],
			shortInputRange: [ 0, 160 ],
			ago: mes.ago,
			send_at: mes.send_at,
			ago_seconds: mes.ago_seconds,
			agoTextInterval: null,
		};

		if (mes.ago_seconds < 3600) {
			this.state.agoTextInterval = setInterval(
				(function() {
					this._updateAgoText();
				}).bind(this),
				1000
			);
		}
		//utils.setMessageRead(mes.id);
		database().ref('users/default/messages/' + mes.id + '/read').set(true);
	}

	componentWillUnmount() {
		clearInterval(this.state.agoTextInterval);
	}

	_updateAgoText() {
		if (this.state.ago_seconds < 3600) {
			this.state.ago_seconds++;
			this.state.ago = this.props.navigation.getParam('utils', null).getAgoText(this.state.send_at);
			this.forceUpdate();
		} else
			clearInterval(this.state.agoTextInterval);
	}

	_getHeadlineMarginTop = () => {
		// 160
		const { scrollY, shortInputRange, inputRange, headlineHeight } = this.state;
		return scrollY.interpolate({
			inputRange: inputRange,
			outputRange: [ 165, headlineHeight + 33, headlineHeight - 40 ],
			extrapolate: 'clamp',
			useNativeDriver: true,
		});
	};

	_getHeadlineLines = () => {
		// 160
		const { scrollY, shortInputRange, inputRange, headlineHeight } = this.state;
		return scrollY.interpolate({
			inputRange: inputRange,
			outputRange: [ 10, 10, 10 ],
			useNativeDriver: true,
		});
	};

	_getHeadlineMaxWidth = () => {
		// 160
		const { scrollY, shortInputRange, inputRange, headlineHeight } = this.state;
		return scrollY.interpolate({
			inputRange: inputRange,
			outputRange: [ 380, 380, 700 ],
			useNativeDriver: true,
		});
	};

	_getHeadlineMarginLeft = () => {
		const { scrollY, shortInputRange, inputRange, headlineHeight } = this.state;
		return scrollY.interpolate({
			inputRange: shortInputRange,
			outputRange: [ 20, 30 ],
			extrapolate: 'clamp',
			useNativeDriver: true,
		});
	};

	_getHeadlineFontScale = () => {
		const { scrollY, shortInputRange, inputRange, headlineHeight } = this.state;
		console.log(scrollY);
		return scrollY.interpolate({
			inputRange: shortInputRange,
			outputRange: [ 1, 0.65 ],
			extrapolate: 'clamp',
			useNativeDriver: true,
		});
	};

	_getBackButtonMarginLeft = () => {
		const { scrollY, shortInputRange, inputRange, headlineHeight } = this.state;

		return scrollY.interpolate({
			inputRange: inputRange,
			outputRange: [ 20, 20, 20 ],
			extrapolate: 'clamp',
			useNativeDriver: true,
		});
	};

	_getBackButtonMarginTop = () => {
		const { scrollY, shortInputRange, inputRange, headlineHeight } = this.state;

		return scrollY.interpolate({
			inputRange: inputRange,
			outputRange: [ 40, 40, -29 ],
			extrapolate: 'clamp',
			useNativeDriver: true,
		});
	};

	_getImageScale = () => {
		const { scrollY, shortInputRange, inputRange, headlineHeight } = this.state;

		return scrollY.interpolate({
			inputRange: shortInputRange,
			outputRange: [ 1, 1.5 ],
			extrapolate: 'clamp',
			useNativeDriver: true,
		});
	};

	_getImageOpacity = () => {
		const { scrollY, shortInputRange, inputRange, headlineHeight } = this.state;

		return scrollY.interpolate({
			inputRange: shortInputRange,
			//outputRange: [ 'rgba(0, 0, 0, 0.3)', 'rgba(32, 26, 48, 0.6)' ],
			outputRange: [ 'rgba(0, 0, 0, 0.3)', 'rgba(32, 26, 48, 0.5)' ],
			extrapolate: 'clamp',
			useNativeDriver: true,
		});
	};

	_openMessageModal() {
		ActionSheetIOS.showActionSheetWithOptions(
			{
				options: [ 'Abbrechen', 'Bearbeiten', 'Löschen' ],
				destructiveButtonIndex: 2,
				cancelButtonIndex: 0,
			},
			buttonIndex => {
				if (buttonIndex === 0) {
				} else if (buttonIndex === 1) {
					// edit uploaded file
					this.state.modal_visible = true;
					this.forceUpdate();
				} else if (buttonIndex === 2) {
					this._deleteMessage();
				}
			}
		);
	}

	_deleteMessage() {
		const mes = this.props.navigation.getParam('content', null);
		database().ref('messages/list/' + mes.id + '/invisible').set(true);
		// TODO: Alert to confirm delete
		// -> navigate to ScreenHandler
	}

	render() {
		const content = this.props.navigation.getParam('content', null);

		const headlineFontScale = this._getHeadlineFontScale();
		const headlineMaxWidth = this._getHeadlineMaxWidth();
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
					<FileCard
						key={key}
						editable={false}
						downloadable={true}
						name={file.name}
						type={file.type}
						size={file.size}
						download_url={file.download_url}
					/>
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
								onLayout={event => {
									var { x, y, width, height } = event.nativeEvent.layout;
									if (this.state.headlineHeight == -1) {
										this.setState({ headlineHeight: height });
										this.setState({ inputRange: [ 0, 70 + height, 120 + height ] });
										this.setState({ shortInputRange: [ 0, 70 + height ] });
									}
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
									marginTop: 260 + this.state.headlineHeight - 85,
									position: 'absolute',
									marginLeft: 20,
								}}
							>
								<FontAwesomeIcon size={13} color="#F5F5F5" icon={faClock} />
								<Text
									style={{ fontFamily: 'Poppins-Medium', marginTop: -2, fontSize: 13, marginLeft: 10, color: 'white' }}
								>
									{this.state.ago}
								</Text>
								<Image
									style={{ opacity: 0.9, borderRadius: 14, marginLeft: 20, height: 13, width: 13 }}
									source={{ uri: content.club_img }}
								/>
								<Text
									style={{ fontFamily: 'Poppins-Medium', marginTop: -1, fontSize: 13, marginLeft: 10, color: 'white' }}
								>
									{content.club_name}
								</Text>
							</View>
						</View>
						<Animated.View
							style={{
								flex: 1,
								zIndex: -1,
								height: 370 + this.state.headlineHeight,
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
									height: 370 + this.state.headlineHeight,
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
					showsVerticalScrollIndicator={false}
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
							minHeight: 615,
							marginTop: 240 + this.state.headlineHeight - 90,
							backgroundColor: '#201A30',
							borderTopLeftRadius: 30,
							borderTopRightRadius: 30,
						}}
					>
						<View style={{ marginTop: 30, marginLeft: 22, marginRight: 20 }}>
							<Text style={{ fontFamily: 'Poppins-Regular', fontSize: 20, color: 'white', marginBottom: 30 }}>
								{content.long_text}
							</Text>
							{downloadsElements || eventsElements
								? <View
										style={{
											paddingTop: 20,
											paddingBottom: 40,
											paddingLeft: 30,
											borderRadius: 30,
											marginLeft: -22,
											marginTop: 0,
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
								: void 0}
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
							justifyContent: 'flex-start',
							flexWrap: 'wrap',
							flexDirection: 'row',
						})
					}
					onLayout={event => {
						var { x, y, width, height } = event.nativeEvent.layout;
						console.log(y);
						this.setState({ backBtnY: y });
					}}
				>
					<TouchableOpacity onPress={() => this.props.navigation.navigate('ScreenHandler')}>
						<FontAwesomeIcon style={{ zIndex: 0 }} size={29} color="#F5F5F5" icon={faChevronCircleLeft} />
					</TouchableOpacity>
					<TouchableOpacity onPress={() => this._openMessageModal()}>
						<FontAwesomeIcon style={{ zIndex: 0, marginLeft: 285 }} size={25} color="#F5F5F5" icon={faEllipsisV} />
					</TouchableOpacity>
				</Animated.View>
			</View>
		);
	}
}
