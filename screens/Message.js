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
		const mes = this.props.navigation.getParam('mes', null);
		const club = this.props.navigation.getParam('club', null);
		const utils = this.props.navigation.getParam('utils', null);

		this.state = {
			mes: mes,
			club: club,
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
			modal_visible: false,
			uid: utils.getUserID(),
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
		database().ref('users/' + utils.getUserID() + '/messages/' + mes.id + '/read').set(true);
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
		const mes = this.state.mes;
		const club = this.state.club;
		const utils = this.props.navigation.getParam('utils', null);

		database().ref('users/' + mes.author + '/name').once(
			'value',
			(function(snapshot) {
				console.log('AUTHOR: ' + mes.author);
				console.log('UID: ' + this.state.uid);
				if (mes.author == this.state.uid) var options = [ 'Abbrechen', 'Bearbeiten', 'Löschen' ];
				else var options = [ 'Abbrechen', 'Nachricht an ' + snapshot.val() ];
				ActionSheetIOS.showActionSheetWithOptions(
					{
						options: options,
						destructiveButtonIndex: 2,
						cancelButtonIndex: 0,
					},
					buttonIndex => {
						if (buttonIndex === 0) {
							// cancel
						} else if (buttonIndex === 1) {
							if (mes.author == this.state.uid)
								this._openModal();
							else
								utils.startChat(
									mes.author,
									(function() {
										this.props.navigation.navigate('ScreenHandler');
									}).bind(this)
								);
						} else if (buttonIndex === 2) {
							if (mes.author == this.state.uid) this._deleteMessage();
						}
					}
				);
			}).bind(this)
		);
	}

	_openModal() {
		if (this.state.modal_visible) {
			this.state.modal_visible = false;
			this.forceUpdate();
			setTimeout(
				(function() {
					this.state.modal_visible = true;
					this.forceUpdate();
				}).bind(this),
				0
			);
		} else {
			this.state.modal_visible = true;
			this.forceUpdate();
		}
	}

	_closeModal() {
		this.state.modal_visible = false;
		this.forceUpdate();
	}

	_deleteMessage() {
		database().ref('messages/list/' + this.state.mes.id + '/invisible').set(true);
		this.props.navigation.navigate('ScreenHandler');
		// TODO: Alert to confirm delete
		// -> navigate to ScreenHandler
	}

	_editMessage() {
		const mes = this.state.mes;
		this.state.headlineHeight = -1;
		database().ref('messages/list/' + mes.id + '/invisible').set(false);
		database().ref('messages/list/' + mes.id + '/headline').set(mes.headline);
		database().ref('messages/list/' + mes.id + '/short_text').set(mes.short_text);
		database().ref('messages/list/' + mes.id + '/long_text').set(mes.long_text);
		this._closeModal();
		this.forceUpdate();
	}

	_onChangeText(name, value) {
		this.state.mes[name] = value;
		this.forceUpdate();
	}

	_editEvent(key, name, date, location) {
		const mes_id = this.state.mes.id;
		const event = this.state.mes.events[key];
		event.name = name;
		event.date = date;
		event.location = location;
		this.state.mes.events[key] = event;
		this.forceUpdate();
		database().ref('messages/list/' + mes_id + '/events/' + key + '/name').set(name);
		database().ref('messages/list/' + mes_id + '/events/' + key + '/date').set(date);
		database().ref('messages/list/' + mes_id + '/events/' + key + '/location').set(location);
	}

	_deleteEvent(key) {
		const utils = this.props.navigation.getParam('utils', null);
		utils.showAlert(
			'Event löschen?',
			'',
			[ 'Ja', 'Nein' ],
			(function(btn_id) {
				if (btn_id == 0) {
					// delete event
					const mes_id = this.state.mes.id;
					var events = [ ...this.state.mes.events ];
					events.splice(key, 1);
					this.state.mes.events = events;
					this.forceUpdate();
					database().ref('messages/list/' + mes_id + '/events').set(this.state.mes.events);
				}
			}).bind(this),
			true,
			false
		);
	}

	render() {
		const mes = this.state.mes;
		const club = this.state.club;

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
		if (mes.files) {
			downloadsElements = Object.keys(mes.files).map(key => {
				var file = mes.files[key];
				return (
					<FileCard
						key={key}
						editable={mes.author == this.state.uid}
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
		if (mes.events) {
			eventsElements = Object.keys(mes.events).map(key => {
				var event = mes.events[key];
				if (event) {
					return (
						<EventCard
							key={key}
							pos={key}
							card_type="message"
							editable={mes.author == this.state.uid}
							name={event.name}
							date={event.date}
							location={event.location}
							onDelete={key => this._deleteEvent(key)}
							onChange={(key, name, date, location) => this._editEvent(key, name, date, location)}
						/>
					);
				}
			});
		}

		return (
			<View>
				{mes.author == this.state.uid
					? <Modal animationType="slide" presentationStyle="formSheet" visible={this.state.modal_visible}>
							<View
								style={{
									padding: 20,
									backgroundColor: '#201A30',
									height: '100%',
								}}
							>
								<View
									style={{
										marginBottom: 10,
										justifyContent: 'space-between',
										flexWrap: 'wrap',
										flexDirection: 'row',
									}}
								>
									<Text
										style={{ fontFamily: 'Poppins-Bold', color: 'white', fontSize: 25, width: '76%' }}
										numberOfLines={1}
									>
										{this.state.mes.headline ? this.state.mes.headline : 'Mitteilung bearbeiten'}
									</Text>
									<TouchableOpacity
										style={{
											height: 30,
											borderRadius: 10,
											marginLeft: 10,
											width: 70,
											padding: 5,
											paddingLeft: 10,
											backgroundColor: '#0DF5E3',
										}}
										onPress={text => this._editMessage()}
									>
										<Text style={{ fontSize: 18, fontFamily: 'Poppins-Bold', color: '#38304C' }}>FERTIG</Text>
									</TouchableOpacity>
								</View>

								<View
									style={{ marginLeft: -20, height: 0.5, marginBottom: 40, backgroundColor: '#38304C', width: '140%' }}
								/>

								<ScrollView>
									<View style={{ marginBottom: 20 }}>
										<Text style={{ fontFamily: 'Poppins-SemiBold', marginLeft: 10, color: '#5C5768' }}>Überschrift</Text>
										<View style={{ borderRadius: 10, backgroundColor: '#38304C' }}>
											<TextInput
												multiline
												autoCorrect={false}
												keyboardType="default"
												multiline={true}
												style={{
													fontFamily: 'Poppins-Medium',
													marginTop: 8,
													padding: 15,
													fontSize: 17,
													color: '#D5D3D9',
												}}
												value={this.state.mes.headline}
												onChangeText={text => this._onChangeText('headline', text)}
											/>
										</View>
									</View>
									<View style={{ marginBottom: 20 }}>
										<Text style={{ fontFamily: 'Poppins-SemiBold', marginLeft: 10, color: '#5C5768' }}>Subtext</Text>
										<View style={{ borderRadius: 10, backgroundColor: '#38304C' }}>
											<TextInput
												multiline
												autoCorrect={false}
												keyboardType="default"
												multiline={true}
												style={{
													fontFamily: 'Poppins-Medium',
													marginTop: 8,
													padding: 15,
													fontSize: 17,
													color: '#D5D3D9',
												}}
												value={this.state.mes.short_text}
												onChangeText={text => this._onChangeText('short_text', text)}
											/>
										</View>
									</View>
									<View style={{ marginBottom: 20 }}>
										<Text style={{ fontFamily: 'Poppins-SemiBold', marginLeft: 10, color: '#5C5768' }}>Text</Text>
										<View style={{ borderRadius: 10, backgroundColor: '#38304C' }}>
											<TextInput
												multiline
												autoCorrect={false}
												keyboardType="default"
												multiline={true}
												style={{
													fontFamily: 'Poppins-Medium',
													marginTop: 8,
													padding: 15,
													fontSize: 17,
													color: '#D5D3D9',
												}}
												value={this.state.mes.long_text}
												onChangeText={text => this._onChangeText('text', text)}
											/>
										</View>
									</View>
								</ScrollView>
							</View>
						</Modal>
					: void 0}
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
								{mes.headline}
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
									source={{ uri: club.logo }}
								/>
								<Text
									style={{ fontFamily: 'Poppins-Medium', marginTop: -1, fontSize: 13, marginLeft: 10, color: 'white' }}
								>
									{club.name}
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
									uri: mes.img,
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
								{mes.long_text}
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
