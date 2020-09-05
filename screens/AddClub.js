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
	AsyncStorage,
	Modal,
	Linking
} from 'react-native';
import { Headlines } from './../app/constants.js';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
	faUserCircle,
	faUserShield,
	faPlusCircle,
	faCamera,
	faSearch,
	faCheckCircle,
	faChevronCircleRight
} from '@fortawesome/free-solid-svg-icons';
import { NotificationCard } from './../app/components.js';
import database from '@react-native-firebase/database';
import { withNavigation } from 'react-navigation';
import auth from '@react-native-firebase/auth';
import functions from '@react-native-firebase/functions';
import CheckBox from '@react-native-community/checkbox';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

class AddClubScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			utils: this.props.utilsObject,
			selected_club: -1,
			search_value: '',
			clubs: [],
			joinable_groups: [],
			search_results: [
				{
					name: 'Test',
				},
			],
			text_input_focused: false,
			modal_visible: [ true, false ],
			qr_code_result: null,
		};

		this.margin = new Animated.Value(-20);
	}

	onChangeText(value) {
		this.state.search_value = value;
		this.forceUpdate();
	}

	_onTextInputFocus(has_focus) {
		this.state.text_input_focused = has_focus;
		this._doSearch();
		this.forceUpdate();
	}

	_doSearch(qrCodeResult = -1) {
		if (this.state.search_value && this.state.search_value != '' && this.state.search_value != ' ') {
			console.log('searching');
			functions().httpsCallable('searchClub')({ search: this.state.search_value }).then(response => {
				console.log(response.data);
				this.state.search_results = response.data;
				if (qrCodeResult > -1) {
					this.margin.setValue(250);
					Animated
						.timing(this.margin, {
							useNativeDriver: false,
							toValue: -20,
							duration: 250,
							easing: Easing.ease,
						})
						.start(() => {});
					this.state.qr_code_result = response.data[qrCodeResult];
				}
				this.forceUpdate();
			});
		}
	}

	_joinClub(id, state = 0, selected_groups = {}) {
		if (state == 0) {
			this.state.selected_club = id;
			console.log('clubs/' + id + '/groups');
			database().ref('clubs/' + id + '/groups').once(
				'value',
				(function(snapshot) {
					var groups = snapshot.val();

					var joinable_groups = [];
					Object.keys(groups).map(key => {
						var group = groups[key];
						group.key = key;
						group.members = null;
						group.selected = selected_groups[key] === true;
						joinable_groups.push(group);
						this.forceUpdate();
					});
					this.state.joinable_groups = joinable_groups;
					console.log(this.state.joinable_groups);

					this._openModal(1);

					this.forceUpdate();
				}).bind(this)
			);
		} else if (state == 1) {
			const utils = this.state.utils;

			var selected_groups = 0;
			this.state.joinable_groups.forEach((group, i) => {
				if (group.selected) selected_groups++;
			});
			console.log(selected_groups);
			if (selected_groups > 0) {
				database().ref('clubs/' + id + '/name').once(
					'value',
					(function(snapshot) {
						const uid = utils.getUserID();
						var club_name = snapshot.val();
						this.state.modal_visible[1] = false;
						this.forceUpdate();
						setTimeout(
							(function() {
								database().ref('users/' + uid + '/clubs/' + id + '/club_id').set(id);
								database().ref('users/' + uid + '/clubs/' + id + '/notifications').set(true);
								database().ref('users/' + uid + '/clubs/' + id + '/role').set('subscriber');

								this.state.joinable_groups.forEach((group, i) => {
									if (group.selected) {
										database().ref('users/' + uid + '/clubs/' + id + '/groups/' + group.key).set({
											group_id: group.key,
											subscribed: true,
										});
									}
								});

								utils.showAlert('Du bist jetzt Mitglied von ' + club_name, '', [ 'Ok' ], false, false);
							}).bind(this),
							500
						);
					}).bind(this)
				);
			} else
				utils.showAlert('Bitte wähle eine Gruppe aus', '', [ 'Ok' ]);
		}
	}

	_selectGroup(key, selected) {
		this.state.joinable_groups[key].selected = selected;
		this.forceUpdate();
	}

	_openModal(modal_id) {
		if (this.state.modal_visible[modal_id]) {
			this.state.modal_visible[modal_id] = false;
			this.forceUpdate();
			setTimeout(
				(function() {
					this.state.modal_visible[modal_id] = true;
					this.forceUpdate();
				}).bind(this),
				0
			);
		} else {
			this.state.modal_visible[modal_id] = true;
			this.forceUpdate();
		}
	}

	_qrCodeScanned(e) {
		console.log(e.data);
		//this.state.modal_visible[0] = false;
		this.state.search_value = e.data;
		this._doSearch(0);
		this.forceUpdate();
	}

	checkIfScrollViewIsNeeded(viewHeight) {
		if (viewHeight < Dimensions.get('window').height) {
			this.props.setScrollViewEnabled(false);
		} else {
			this.props.setScrollViewEnabled(true);
		}
	}

	render() {
		const margin = this.margin.interpolate({
			inputRange: [ 0, 2000 ],
			outputRange: [ 0, 2000 ],
		});

		const ps0 = this.state.profile_0_selected;

		const searchResults = Object.keys(this.state.search_results).map(key => {
			var result = this.state.search_results[key];
			return (
				<SearchResult
					key={key}
					groups={result.groups}
					club_id={result.id}
					name={result.name}
					img={result.img}
					onPress={(id, selected_groups) => this._joinClub(id, 0, selected_groups)}
				/>
			);
		});

		const groupsList = Object.keys(this.state.joinable_groups).map(key => {
			var group = this.state.joinable_groups[key];
			return (
				<Group
					key={key}
					id={key}
					name={group.name}
					onSelect={(key, selected) => this._selectGroup(key, selected)}
					selected={group.selected}
				/>
			);
		});

		var s = require('./../app/style.js');
		if (this.props.show) {
			return (
				<View
					style={s.container}
					onLayout={event => {
						var { x, y, width, height } = event.nativeEvent.layout;
						this.checkIfScrollViewIsNeeded(height);
					}}
				>
					<Modal animationType="slide" presentationStyle="formSheet" visible={this.state.modal_visible[0]}>
						<View
							style={{
								backgroundColor: '#201A30',
								height: '100%',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>

							<QRCodeScanner
								reactivate={true}
								reactivateTimeout={3500}
								onRead={this._qrCodeScanned.bind(this)}
								topContent={
									(
										<View style={{ marginLeft: 20, marginRight: 20 }}>
											<Text style={{ opacity: 0.9, color: 'white', fontFamily: 'Poppins-ExtraBold', fontSize: 35 }}>
												QR-Code scannen
											</Text>
											<Text
												style={{
													marginTop: 8,
													opacity: 0.6,
													color: 'white',
													fontFamily: 'Poppins-Regular',
													fontSize: 19,
												}}
											>
												Du kannst einem Verein per QR-Code beitreten. Halte dazu deine Kamera auf den QR-Code des Vereins.
											</Text>
										</View>
									)
								}
								bottomContent={
									this.state.qr_code_result
										? <Animated.View
												style={{
													marginTop: margin,
													borderRadius: 13,
													marginLeft: 50,
													marginRight: 50,
													//backgroundColor: '#34c759',
													backgroundColor: '#0DF5E3',
													justifyContent: 'center',
													alignItems: 'center',

													shadowColor: '#0DF5E3',
													shadowOffset: {
														width: 0,
														height: 0,
													},
													shadowOpacity: 0.5,
													shadowRadius: 10.00,
												}}
											>
												<TouchableOpacity
													style={{
														padding: 12,
														paddingLeft: 15,
														paddingRight: 15,
														flexWrap: 'wrap',
														alignItems: 'flex-start',
														flexDirection: 'row',
													}}
													onPress={() => {
														if (this.state.qr_code_result) {
															this.state.modal_visible[0] = false;
															this.forceUpdate();
															console.log(this.state.qr_code_result);
															this._joinClub(this.state.qr_code_result.id, 0, this.state.qr_code_result.groups);
														}
													}}
												>
													<Text
														style={{
															marginRight: 15,
															opacity: 0.8,
															color: '#201A30',
															fontFamily: 'Poppins-Bold',
															fontSize: 26,
														}}
													>
														{this.state.qr_code_result.name}
													</Text>
													<FontAwesomeIcon
														style={{
															opacity: 0.95,
															marginTop: 3,
														}}
														size={25}
														color="#201A30"
														icon={faChevronCircleRight}
													/>
												</TouchableOpacity>
											</Animated.View>
										: void 0
								}
							/>
						</View>
					</Modal>
					<Modal animationType="slide" presentationStyle="formSheet" visible={this.state.modal_visible[1]}>
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
									Rollen auswählen
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
									onPress={text => this._joinClub(this.state.selected_club, 1)}
								>
									<Text style={{ fontSize: 18, fontFamily: 'Poppins-Bold', color: '#38304C' }}>FERTIG</Text>
								</TouchableOpacity>
							</View>

							<View
								style={{ marginLeft: -20, height: 0.5, marginBottom: 20, backgroundColor: '#38304C', width: '140%' }}
							/>

							<ScrollView style={{ marginBottom: 20 }}>
								{groupsList}
							</ScrollView>
						</View>
					</Modal>
					<StatusBar hidden={true} />
					<View
						style={{
							width: '100%',
							flexWrap: 'wrap',
							alignItems: 'flex-start',
							flexDirection: 'row',
						}}
					>
						<Text style={s.pageHeadline}>Beitreten</Text>
						<TouchableOpacity
							style={
								([ s.headlineIcon ], {
									marginTop: 55,
									marginLeft: 110,
								})
							}
							onPress={() => this._openModal(0)}
						>
							<FontAwesomeIcon size={29} color="#F5F5F5" icon={faCamera} />
						</TouchableOpacity>
					</View>
					<View
						style={{
							marginTop: 20,
							marginLeft: 20,
							marginRight: 20,
						}}
					>
						<Text
							style={{
								color: '#635E6E',
								fontSize: 18,
								fontFamily: 'Poppins-SemiBold',
							}}
						>
							Du kannst nach öffentlichen Vereinen suchen, oder einen Einladungcode eingeben.
						</Text>

						<View
							style={{
								marginTop: 30,
								borderRadius: 10,
								borderBottomLeftRadius: this.state.search_results.length > 0 ? 0 : 10,
								borderBottomRightRadius: this.state.search_results.length > 0 ? 0 : 10,
								backgroundColor: '#38304C',
							}}
						>
							<TextInput
								multiline
								returnKeyType="search"
								blurOnSubmit={true}
								onFocus={() => this._onTextInputFocus(true)}
								onBlur={() => this._onTextInputFocus(false)}
								style={{
									paddingRight: 55,
									maxHeight: 70,
									fontFamily: 'Poppins-Medium',
									marginTop: 8,
									padding: 15,
									fontSize: 17,
									color: '#D5D3D9',
								}}
								value={this.state.search_value}
								placeholderTextColor="#665F75"
								placeholder="NAME ODER CODE EINGEBEN ..."
								onChangeText={text => this.onChangeText(text)}
							/>
							<TouchableOpacity
								onPress={() => this._doSearch()}
								style={{ position: 'absolute', marginTop: 12, marginLeft: 290 }}
							>
								<FontAwesomeIcon
									size={23}
									color={this.state.text_input_focused ? 'white' : '#665F75'}
									icon={faSearch}
								/>
							</TouchableOpacity>
						</View>
					</View>
					{this.state.search_results.length
						? <View
								style={{
									paddingBottom: 20,
									marginBottom: 20,
									marginLeft: 20,
									marginRight: 20,
									marginTop: 0,
									borderBottomLeftRadius: 10,
									borderBottomRightRadius: 10,
									backgroundColor: '#38304C',
								}}
							>
								{searchResults}
							</View>
						: void 0}

				</View>
			);
		} else
			return null;
	}
}

const styles = StyleSheet.create({
	centerText: {
		flex: 1,
		fontSize: 18,
		padding: 32,
		color: '#777',
	},
	textBold: {
		fontWeight: '500',
		color: '#000',
	},
	buttonText: {
		fontSize: 21,
		color: 'rgb(0,122,255)',
	},
	buttonTouchable: {
		padding: 16,
	},
});

class SearchResult extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		if (this.props.name && this.props.img)
			return (
				<TouchableOpacity
					style={{
						marginTop: 15,
						marginLeft: 13,
						marginRight: 20,
						width: '80%',
						flexWrap: 'wrap',
						alignItems: 'flex-start',
						flexDirection: 'row',
					}}
					onPress={() => this.props.onPress(this.props.club_id, this.props.groups)}
				>
					<AutoHeightImage style={{ borderRadius: 40 }} width={40} source={{ uri: this.props.img }} />
					<View
						style={{
							height: 40,
							paddingLeft: 15,
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<Text style={{ fontFamily: 'Poppins-SemiBold', color: '#C5C3CB', fontSize: 16 }}>{this.props.name}</Text>
					</View>
				</TouchableOpacity>
			);
		return null;
	}
}

class Group extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: this.props.selected,
		};
	}

	_onSelect(selected) {
		this.state.selected = selected;
		this.props.onSelect(this.props.id, selected);
	}

	render() {
		return (
			<TouchableOpacity
				style={{
					marginLeft: 5,
					paddingTop: 14,
					paddingBottom: 14,
					flexWrap: 'wrap',
					alignItems: 'flex-start',
					flexDirection: 'row',
				}}
				onPress={() => this._onSelect(!this.state.selected)}
			>
				<View
					style={{
						height: 25,
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<CheckBox
						lineWidth={2}
						animationDuration={0.15}
						onCheckColor="#0DF5E3"
						onTintColor="#0DF5E3"
						value={this.state.selected}
						onValueChange={isSelected => this._onSelect(isSelected)}
						style={{
							height: 25,
							width: 25,
						}}
					/>
				</View>
				<View
					style={{
						marginLeft: 20,
						height: 25,
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<Text style={{ opacity: 0.7, color: 'white', fontFamily: 'Poppins-Bold', fontSize: 19 }}>
						{this.props.name}
					</Text>
				</View>
			</TouchableOpacity>
		);
	}
}

export default withNavigation(AddClubScreen);