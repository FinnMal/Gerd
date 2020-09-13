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
	TouchableWithoutFeedback,
	Keyboard,
	Modal,
	KeyboardAvoidingView
} from 'react-native';

import { Headlines } from './../app/constants.js';
import InputScrollView from 'react-native-input-scroll-view';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
	faChevronCircleLeft,
	faChevronLeft,
	faChevronRight,
	faPlus,
	faPlusCircle,
	faUpload,
	faCloudUploadAlt,
	faFile,
	faEllipsisV,
	faFileWord,
	faFilePowerpoint,
	faFileExcel,
	faFileArchive,
	faFileCsv,
	faFileAudio,
	faFileVideo,
	faFileImage,
	faFileAlt,
	faTimesCircle,
	faCheck,
	faPaperPlane,
	faFilePdf,
	faLink
} from '@fortawesome/free-solid-svg-icons';
import { ClubCard, ModalCard, EventCard, FileCard } from './../app/components.js';
import database from '@react-native-firebase/database';
import { SafeAreaView } from 'react-navigation'; //added this import
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-picker';
import CheckBox from '@react-native-community/checkbox';

import storage from '@react-native-firebase/storage';

export default class NewMessageScreen extends React.Component {
	constructor(props) {
		super(props);
		const utils = this.props.navigation.getParam('utils', null);

		this.state = {
			curPageIndex: 0,
			clubsList: [],
			event_modal_visible: false,
			events: [],
			files: [],
			picture: {},
			group_serach: '',
			uid: utils.getUserID(),
			long_text_input_has_focus: false,
			link_modal: {
				visible: false,
				club_key: '',
				group_key: '',
			},
			headlineInputValue: 'Lorem ipsum dolor sit',
			shortTextInputValue: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et',
			textInputValue: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. ipsum dolor sit amet,',
		};

		this.headlineMarginLeft = new Animated.Value(40);
		this.nextHeadlineMarginLeft = new Animated.Value(40);

		database().ref('users/' + this.state.uid + '/clubs').once(
			'value',
			(function(snap) {
				var clubs = snap.val();
				console.log(clubs);
				var i = 0;
				Object.keys(clubs).map(key => {
					var club = clubs[key];
					if (club) {
						if (club.role == 'admin') {
							database().ref('clubs/' + club.club_id).once(
								'value',
								(function(snap) {
									var info = snap.val();
									club.name = info.name;
									club.logo = info.logo;
									club.members = info.members;
									club.color = info.color;
									club.selected = false;
									club.groups = info.groups;

									this.state.clubsList[i] = club;
									this.forceUpdate();
									i++;
								}).bind(this)
							);
						}
					}
				});
			}).bind(this)
		);
	}

	async openUploadFileModal() {
		try {
			const results = await DocumentPicker.pickMultiple({
				type: [ DocumentPicker.types.allFiles ],
			});
			for (const res of results) {
				console.log(
					res.uri,
					res.type, // mime type
					res.name,
					res.size
				);

				if (!res.type) alert('Fehler: Unbekanntes Dateiformat');
				else if (res.size > 3000000000) alert('Fehler: Datei größer als 3GB');
				else this.addFile(res);
			}
		} catch (err) {
			if (DocumentPicker.isCancel(err)) {
				// User cancelled the picker, exit any dialogs or menus and move on
			} else {
				throw err;
			}
		}
	}

	openUploadPictureModal() {
		const options = {
			title: 'Bild auswählen',
			customButtons: [],
			storageOptions: {
				skipBackup: true,
				path: 'images',
			},
		};

		/**
 * The first arg is the options object for customization (it can also be null or omitted for default options),
 * The second arg is the callback which sends object: response (more info in the API Reference)
 */
		ImagePicker.showImagePicker(options, response => {
			console.log('Response = ', response);

			if (response.didCancel) {
				console.log('User cancelled image picker');
			} else if (response.error) {
				console.log('ImagePicker Error: ', response.error);
			} else if (response.customButton) {
				console.log('User tapped custom button: ', response.customButton);
			} else {
				const source = { uri: response.uri };
				response.name = 'image_' + new Date().getTime();
				this.setPicture(response);
			}
		});
	}

	async setPicture(res) {
		var file = {
			name: res.name,
			path: res.uri,
			type: res.type,
			width: res.width,
			height: res.height,
			data: 'data:' + res.type + ';base64,' + res.data,
			uploading: true,
			uploaded_percentage: 0,
			storage_path: 'userfiles/' + this.state.uid + '/' + res.name,
		};

		this.state.picture = file;
		this.forceUpdate();

		const reference = storage().ref(file.storage_path);
		const pathToFile = file.path;
		const task = reference.putFile(pathToFile);

		task.on('state_changed', taskSnapshot => {
			if (this.state.picture) {
				if (this.state.picture.storage_path == taskSnapshot.metadata.name) {
					this.state.picture.uploaded_percentage = taskSnapshot.bytesTransferred / taskSnapshot.totalBytes * 100;
					this.forceUpdate();
					return;
				}
			}
			task.cancel();
		});

		task.then(async () => {
			const url = await storage().ref(this.state.picture.storage_path).getDownloadURL();
			this.state.picture.download_url = url;
			this.state.picture.thumbnail_download_url = url;
			this.state.picture.uploading = false;
		});
	}

	async addFile(res) {
		var file = {
			name: res.name,
			path: res.uri,
			size: res.size,
			type: res.type,
			uploading: true,
			uploaded_percentage: 0,
			storage_path: 'userfiles/' + this.state.uid + '/' + res.name + '_' + new Date().getTime(),
		};

		var pos = this.state.files.length;
		this.state.files[pos] = file;
		this.forceUpdate();
		const reference = storage().ref(file.storage_path);
		const pathToFile = file.path;
		const task = reference.putFile(pathToFile);

		task.on('state_changed', taskSnapshot => {
			if (this.state.files[pos]) {
				console.log(taskSnapshot);
				if (taskSnapshot.metadata.name) {
					if (this.state.files[pos].storage_path == taskSnapshot.metadata.name) {
						this.state.files[pos].uploaded_percentage = taskSnapshot.bytesTransferred / taskSnapshot.totalBytes * 100;
						this.forceUpdate();
						return;
					}
				}
			}
			task.cancel();
		});

		task.then(async () => {
			const url = await storage().ref(this.state.files[pos].storage_path).getDownloadURL();
			this.state.files[pos].download_url = url;
			this.state.files[pos].uploading = false;
		});
	}

	editFile(key, name) {
		// TODO: edit name in cloud
		this.state.files[key].name = name;
		this.forceUpdate();
	}

	deleteFile(key) {
		// TODO: Delete from cloud
		var files = [ ...this.state.files ];
		files.splice(key, 1);
		this.setState({ files: files });
		this.forceUpdate();
	}

	openAddEventModal() {
		if (this.state.event_modal_visible) {
			this.state.event_modal_visible = false;
			this.forceUpdate();
			setTimeout(
				(function() {
					this.state.event_modal_visible = true;
					this.forceUpdate();
				}).bind(this),
				0
			);
		} else {
			this.state.event_modal_visible = true;
			this.forceUpdate();
		}
	}

	addEvent(name, date, location) {
		this.state.event_modal_visible = false;

		var event = {
			modal_visible: false,
			name: name,
			date: date,
			location: location,
		};

		this.state.events[this.state.events.length] = event;
		this.forceUpdate();
	}

	editEvent(key, name, date, location) {
		var event = {
			modal_visible: false,
			name: name,
			date: date,
			location: location,
		};

		this.state.events[key] = event;
		this.forceUpdate();
	}

	deleteEvent(key) {
		var events = [ ...this.state.events ];
		events.splice(key, 1);
		this.setState({ events: events });
		this.forceUpdate();
	}

	selectClub(key) {
		this.state.clubsList[key].selected = !this.state.clubsList[key].selected;
		this.forceUpdate();
	}

	addGroup(key, g_key) {
		this.state.clubsList[key].groups[g_key].selected = !this.state.clubsList[key].groups[g_key].selected;
		this.forceUpdate();
	}

	linkGroup(key, g_key, state = 2, with_group = false, isLinked = true) {
		if (state == 0) {
			this.state.link_modal.club_key = key;
			this.state.link_modal.group_key = g_key;
			this._openModal();
		} else if (state == 1) {
			if (with_group) {
				var group = this.state.clubsList[key].groups[g_key];
				if (!group.linked_to) group.linked_to = {};
				group.linked_to[with_group] = isLinked;
				this.state.clubsList[key].groups[g_key] = group;

				group = this.state.clubsList[key].groups[with_group];
				if (!group.linked_to) group.linked_to = {};
				group.linked_to[g_key] = isLinked;
				this.state.clubsList[key].groups[with_group] = group;
				this.forceUpdate();
			} else
				alert('with_group is null');
		} else {
			this.state.link_modal.visible = false;
			this.forceUpdate();
		}
	}

	_openModal() {
		if (this.state.link_modal.visible) {
			this.state.link_modal.visible = false;
			this.forceUpdate();
			setTimeout(
				(function() {
					this.state.link_modal.visible = true;
					this.forceUpdate();
				}).bind(this),
				0
			);
		} else {
			this.state.link_modal.visible = true;
			this.forceUpdate();
		}
	}

	nextPage() {
		this.headlineMarginLeft.setValue(100);
		Animated
			.timing(this.headlineMarginLeft, {
				useNativeDriver: false,
				toValue: 0,
				duration: 520,
				easing: Easing.ease,
			})
			.start();

		this.nextHeadlineMarginLeft.setValue(0);
		Animated
			.timing(this.nextHeadlineMarginLeft, {
				useNativeDriver: false,
				toValue: 100,
				duration: 520,
				easing: Easing.ease,
			})
			.start();
		this.state.curPageIndex = this.state.curPageIndex + 1;
		this.forceUpdate();
	}

	previousPage() {
		if (this.state.curPageIndex > 0) {
			this.headlineMarginLeft.setValue(0);
			Animated
				.timing(this.headlineMarginLeft, {
					useNativeDriver: false,
					toValue: 100,
					duration: 520,
					easing: Easing.ease,
				})
				.start();

			this.nextHeadlineMarginLeft.setValue(0);
			Animated
				.timing(this.nextHeadlineMarginLeft, {
					useNativeDriver: false,
					toValue: 100,
					duration: 520,
					easing: Easing.ease,
				})
				.start();
			this.state.curPageIndex = this.state.curPageIndex - 1;
			this.forceUpdate();
		}
	}

	_showError(msg, page) {
		const utils = this.props.navigation.getParam('utils', null);
		return utils.showAlert(
			msg,
			'',
			[ 'Ok' ],
			(function() {
				this.state.curPageIndex = page;
				this.forceUpdate();
			}).bind(this)
		);
	}

	sendMessage() {
		// Check clubs and groups
		var send_at_groups = {};

		var selected_clubs, selected_groups = 0;
		this.state.clubsList.forEach((club, i) => {
			if (club.selected) {
				selected_clubs++;
				return Object.keys(club.groups).map(key => {
					if (club.groups[key].selected) {
						selected_groups++;

						if (club.groups[key].linked_to) {
							send_at_groups[key] = { linked_to: club.groups[key].linked_to };
						} else
							send_at_groups[key] = true;
					}
				});
			}
		});
		if (selected_clubs == 0) return this._showError('Kein Verein ausgewählt', 0);
		if (selected_groups == 0) return this._showError('Keine Gruppe ausgewählt', 5);

		// Check texts
		if (!this.state.headlineInputValue) return this._showError('Überschrift fehlt', 1);
		if (!this.state.shortTextInputValue) return this._showError('Subtext fehlt', 1);
		if (!this.state.textInputValue) return this._showError('Text fehlt', 1);

		//Check events
		this.state.events.forEach((event, i) => {
			if (!event.name) return this._showError('Name des Events fehlt', 2);
			if (!event.date) return this._showError('Datum des Events fehlt', 2);
			if (!event.location) return this._showError('Location des Events fehlt', 2);
		});

		//Check files
		this.state.files.forEach((file, i) => {
			if (file.uploading)
				return this._showError(
					'Upload nicht abgeschlossen (Noch ' + Math.round(100 - file.uploaded_percentage) + '%)',
					3
				);
			if (!file.path || !file.storage_path || !file.icon)
				return this._showError('Fehler beim Upload. Bitte erneut versuchen', 3);
		});

		this.state.clubsList.forEach((club, i) => {
			if (club.selected) {
				var files = [];
				this.state.files.forEach((file, i) => {
					file.path = null;
					file.storage_path = null;
					file.uploading = null;
					file.uploaded_percentage = null;
					file.icon = null;
					files.push(file);
				});

				var events = [];
				this.state.events.forEach((event, i) => {
					events.push({
						date: event.date,
						name: event.name,
						location: event.location,
					});
				});

				var mes = {
					author: this.state.uid,
					headline: this.state.headlineInputValue,
					short_text: this.state.shortTextInputValue,
					long_text: this.state.textInputValue,
					send_at: new Date().getTime() / 1000,
					img: this.state.picture.download_url,
					img_thumbnail: this.state.picture.thumbnail_download_url,
					files: files,
					events: events,
					groups: send_at_groups,
				};

				database()
					.ref('clubs/' + club.club_id + '/messages')
					.push(mes)
					.then(() => this.props.navigation.navigate('ScreenHandler').bind(this));
			}
		});
	}

	onChangeText(type, value) {
		if (type == 'headline')
			this.state.headlineInputValue = value;
		else if (type == 'text')
			this.state.textInputValue = value;
		else if (type == 'new_event_name')
			this.state.new_event_name = value;
		else if (type == 'new_event_location')
			this.state.new_event_location = value;
		else if (type == 'new_event_date')
			this.state.new_event_date = value;
		else if (type == 'group_serach')
			this.state.group_serach = value;
		else if (type == 'shortText') {
			if (!this.state.textInputValue || this.state.textInputValue == this.state.shortTextInputValue)
				this.state.textInputValue = value;
			this.state.shortTextInputValue = value;
		}
		this.forceUpdate();
	}

	render() {
		var s = require('./../app/style.js');

		const headlineMarginLeft = this.headlineMarginLeft.interpolate({
			inputRange: [ 0, 50, 100 ],
			outputRange: [ 40, -80, 40 ],
		});

		const nextHeadlineMarginLeft = this.nextHeadlineMarginLeft.interpolate({
			inputRange: [ 0, 25, 50, 75, 100 ],
			outputRange: [ 400, 20, -400, 0, 0 ],
		});

		var pageHeadline = '';
		var pageContent = '';
		if (this.state.curPageIndex == 0) {
			pageHeadline = 'Empfänger auswählen';
			pageContent = Object.keys(this.state.clubsList).map(key => {
				var club = this.state.clubsList[key];
				return (
					<ClubCard
						key={key}
						club_name={club.name}
						club_members={club.members}
						club_img={club.logo}
						color={club.selected ? '#615384' : '#38304C'}
						onPress={() => this.selectClub(key)}
					/>
				);
			});
		} else if (this.state.curPageIndex == 1) {
			pageHeadline = 'Mitteilung eingeben';
			pageContent = (
				<View
					style={{
						height: 600,
					}}
				>

					<InputScrollView topOffset={120} style={{ zIndex: 100 }}>
						<View style={{ marginBottom: 40 }}>
							<Text style={{ fontFamily: 'Poppins-SemiBold', marginLeft: 10, color: '#5C5768' }}>ÜBERSCHRIFT</Text>
							<View style={{ borderRadius: 10, backgroundColor: '#38304C' }}>
								<TextInput
									multiline
									onBlur={() => Keyboard.dismiss()}
									style={{
										maxHeight: 70,
										fontFamily: 'Poppins-Medium',
										marginTop: 8,
										padding: 15,
										fontSize: 17,
										color: '#D5D3D9',
									}}
									value={this.state.headlineInputValue}
									onChangeText={text => this.onChangeText('headline', text)}
								/>
							</View>
						</View>

						<View style={{ marginBottom: 40 }}>
							<Text style={{ fontFamily: 'Poppins-SemiBold', marginLeft: 10, color: '#5C5768' }}>ANREIßER</Text>
							<View style={{ borderRadius: 10, backgroundColor: '#38304C' }}>
								<TextInput
									multiline
									keyboardType="default"
									onBlur={() => Keyboard.dismiss()}
									style={{
										minHeight: 70,
										fontFamily: 'Poppins-Medium',
										marginTop: 8,
										padding: 15,
										fontSize: 17,
										color: '#D5D3D9',
									}}
									value={this.state.shortTextInputValue}
									onChangeText={text => this.onChangeText('shortText', text)}
								/>
							</View>
						</View>

						<View style={{ marginBottom: 300 }}>
							<Text style={{ fontFamily: 'Poppins-SemiBold', marginLeft: 10, color: '#5C5768' }}>TEXT</Text>
							<View style={{ borderRadius: 10, backgroundColor: '#38304C' }}>
								<TextInput
									multiline
									keyboardType="default"
									onBlur={() => {
										Keyboard.dismiss();
										this.state.long_text_input_has_focus = false;
									}}
									onFocus={() => {
										//this.scrollView.scrollToEnd({ animated: true });
										this.state.long_text_input_has_focus = true;
									}}
									style={{
										minHeight: 180,
										fontFamily: 'Poppins-Medium',
										marginTop: 8,
										padding: 15,
										fontSize: 17,
										color: '#D5D3D9',
									}}
									value={this.state.textInputValue}
									onChangeText={text => this.onChangeText('text', text)}
								/>
							</View>
						</View>
					</InputScrollView>
				</View>
			);
		} else if (this.state.curPageIndex == 2) {
			pageHeadline = 'Events hinzufügen';
			if (this.state.events.length > 0) {
				pageContent = Object.keys(this.state.events).map(key => {
					var event = this.state.events[key];
					return (
						<EventCard
							key={key}
							pos={key}
							card_type="new_message"
							editable={true}
							name={event.name}
							date={event.date}
							location={event.location}
							onChange={this.editEvent.bind(this)}
							onDelete={this.deleteEvent.bind(this)}
						/>
					);
				});
			} else
				pageContent = (
					<View
						style={{
							justifyContent: 'center',
							alignItems: 'center',
							width: '100%',
							height: '85%',
						}}
					>
						<Text
							style={{
								fontFamily: 'Poppins-ExtraBold',
								color: '#514D5D',
								fontSize: 30,
								alignSelf: 'center',
							}}
						>KEINE EVENTS</Text>
					</View>
				);
		} else if (this.state.curPageIndex == 3) {
			pageHeadline = 'Dateien hinzufügen';
			if (this.state.files.length > 0) {
				pageContent = Object.keys(this.state.files).map(key => {
					var file = this.state.files[key];
					return (
						<FileCard
							key={key}
							pos={key}
							editable={true}
							downloadable={false}
							type={file.type}
							path={file.path}
							name={file.name}
							uploading={file.uploading}
							uploaded_percentage={file.uploaded_percentage}
							size={file.size}
							onDelete={this.deleteFile.bind(this)}
							onEdit={this.editFile.bind(this)}
						/>
					);
				});
			} else
				pageContent = (
					<View
						style={{
							justifyContent: 'center',
							alignItems: 'center',
							width: '100%',
							height: '85%',
						}}
					>
						<Text
							style={{
								fontFamily: 'Poppins-ExtraBold',
								color: '#514D5D',
								fontSize: 30,
								alignSelf: 'center',
							}}
						>KEINE DATEIEN</Text>
					</View>
				);
		} else if (this.state.curPageIndex == 4) {
			pageHeadline = 'Beitragsbild hinzufügen';

			if (this.state.picture.data) {
				pageContent = (
					<View>
						{this.state.picture.uploaded_percentage < 100
							? <Text style={{ color: 'white', fontFamily: 'Poppins-Bold', fontSize: 18 }}>
									Hochgeladen: {Math.round(this.state.picture.uploaded_percentage)} %
								</Text>
							: void 0}

						<AutoHeightImage width={335} source={{ uri: this.state.picture.data }} />
					</View>
				);
			} else
				pageContent = (
					<View
						style={{
							justifyContent: 'center',
							alignItems: 'center',
							width: '100%',
							height: '85%',
						}}
					>
						<Text
							style={{
								fontFamily: 'Poppins-ExtraBold',
								color: '#514D5D',
								fontSize: 30,
								alignSelf: 'center',
							}}
						>KEIN BILD</Text>
					</View>
				);
		} else if (this.state.curPageIndex == 5) {
			pageHeadline = 'Gruppen auswählen';
			var groupsList = Object.keys(this.state.clubsList).map(key => {
				var club = this.state.clubsList[key];
				if (club.selected) {
					return Object.keys(club.groups).map(g_key => {
						var group = club.groups[g_key];
						if (group.name.includes(this.state.group_serach)) {
							var iconColor = group.selected ? club.color : '#ADA4A9';
							var icon = group.selected ? faTimesCircle : faPlusCircle;

							return (
								<TouchableOpacity
									onPress={() => this.addGroup(key, g_key)}
									key={g_key}
									style={{
										borderRadius: 5,
										paddingTop: 5,
										paddingBottom: 5,
										backgroundColor: group.selected ? '#615384' : '#38304C',
										marginTop: 5,
										marginBottom: 5,
										flexWrap: 'wrap',
										alignItems: 'flex-start',
										flexDirection: 'row',
									}}
								>
									<View
										style={{
											marginLeft: 8,
											marginTop: 5,
											zIndex: 100,
											height: 30,
											width: 30,
											justifyContent: 'center',
											alignItems: 'center',
										}}
									>
										<CheckBox
											lineWidth={2}
											animationDuration={0.15}
											onCheckColor="#0DF5E3"
											onTintColor="#0DF5E3"
											value={group.selected}
											onValueChange={() => this.addGroup(key, g_key)}
											style={{
												height: 20,
												width: 20,
											}}
										/>
									</View>
									<View style={{ marginLeft: 18 }}>
										<Text style={{ fontSize: 18, fontFamily: 'Poppins-SemiBold', color: 'white', opacity: 0.85 }}>
											{group.name}
										</Text>
										<Text style={{ fontSize: 15, fontFamily: 'Poppins-SemiBold', color: 'white', opacity: 0.6 }}>
											{group.members.toLocaleString()} Mitglieder
										</Text>
									</View>
									{group.selected
										? <TouchableOpacity
												style={{ opacity: 0.6, position: 'absolute', marginTop: 15, marginLeft: 275 }}
												onPress={() => this.linkGroup(key, g_key, 0)}
											>
												<FontAwesomeIcon size={20} color={'white'} icon={faLink} />
											</TouchableOpacity>
										: void 0}
								</TouchableOpacity>
							);
						}
					});
				}
			});

			const modal_club_key = this.state.link_modal.club_key;
			const modal_group_key = this.state.link_modal.group_key;

			var linkingGroupsList = null;
			const club = this.state.clubsList[modal_club_key];

			if (modal_club_key && modal_group_key) {
				linkingGroupsList = Object.keys(club.groups).map(g_key => {
					console.log('group_key: ' + g_key);
					if (g_key != modal_group_key) {
						var group = club.groups[g_key];

						var is_linked = false;
						if (group.linked_to) {
							if (group.linked_to[modal_group_key]) is_linked = true;
						}
						var iconColor = is_linked ? club.color : '#ADA4A9';
						var icon = is_linked ? faTimesCircle : faPlusCircle;

						return (
							<TouchableOpacity
								onPress={() => this.linkGroup(modal_club_key, modal_group_key, 1, g_key, !is_linked)}
								key={g_key}
								style={{
									borderRadius: 5,
									paddingTop: 5,
									paddingBottom: 5,
									backgroundColor: is_linked ? '#615384' : '#201A30',
									marginTop: 5,
									marginBottom: 5,
									flexWrap: 'wrap',
									alignItems: 'flex-start',
									flexDirection: 'row',
								}}
							>
								<View
									style={{
										marginLeft: 8,
										marginTop: 5,
										zIndex: 100,
										height: 30,
										width: 30,
										justifyContent: 'center',
										alignItems: 'center',
									}}
								>
									<CheckBox
										lineWidth={2}
										animationDuration={0.15}
										onCheckColor="#0DF5E3"
										onTintColor="#0DF5E3"
										value={is_linked}
										onValueChange={() => this.linkGroup(modal_club_key, modal_group_key, 1, g_key, !is_linked)}
										style={{
											height: 20,
											width: 20,
										}}
									/>
								</View>
								<View style={{ marginLeft: 18 }}>
									<Text style={{ fontSize: 18, fontFamily: 'Poppins-SemiBold', color: 'white', opacity: 0.85 }}>
										{group.name}
									</Text>
									<Text style={{ fontSize: 15, fontFamily: 'Poppins-SemiBold', color: 'white', opacity: 0.6 }}>
										{group.members.toLocaleString()} Mitglieder
									</Text>
								</View>
							</TouchableOpacity>
						);
					}
				});
			}

			if (!groupsList[0])
				groupsList = (
					<Text style={{ color: '#665F75', fontFamily: 'Poppins-Bold' }}>
						{this.state.clubsList ? 'Kein Verein ausgewählt' : 'Keine Gruppen gefunden'}
					</Text>
				);

			pageContent = (
				<View style={{ marginBottom: 20 }}>
					<Modal animationType="slide" presentationStyle="formSheet" visible={this.state.link_modal.visible}>
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
									Gruppe verlinken
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
									onPress={text => this.linkGroup()}
								>
									<Text style={{ fontSize: 18, fontFamily: 'Poppins-Bold', color: '#38304C' }}>FERTIG</Text>
								</TouchableOpacity>
							</View>

							<View
								style={{ marginLeft: -20, height: 0.5, marginBottom: 20, backgroundColor: '#38304C', width: '140%' }}
							/>

							<ScrollView showsVerticalScrollIndicator={false}>
								<Text
									style={{
										opacity: 0.6,
										color: 'white',
										fontFamily: 'Poppins-Medium',
										fontSize: 18,
										marginBottom: 30,
									}}
								>
									In verlinkten Gruppen erhalten nur die Mitglieder eine Mitteilung, die sich in jeder verlinkten Gruppen befinden. Verlinkungen werden nicht für den gesamten Verein übernommen.
								</Text>

								{linkingGroupsList}
							</ScrollView>
						</View>
					</Modal>
					<View
						style={{
							borderRadius: 10,
							borderBottomLeftRadius: 0,
							borderBottomRightRadius: 0,
							backgroundColor: '#38304C',
						}}
					>
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
							value={this.state.group_serach}
							placeholderTextColor="#665F75"
							placeholder="Gruppe suchen ..."
							onChangeText={text => this.onChangeText('group_serach', text)}
						/>
					</View>
					<View style={{ height: 0.5, width: '100%', backgroundColor: '#201A30' }} />
					<View
						style={{
							backgroundColor: '#38304C',
							marginTop: 0,
							padding: 20,
							paddingLeft: 10,
							borderRadius: 10,
							borderTopLeftRadius: 0,
							borderTopRightRadius: 0,
							maxHeight: 550,
						}}
					>
						<ScrollView showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
							{groupsList}
						</ScrollView>
					</View>

				</View>
			);
		}

		return (
			<View style={[ s.container ]} keyboardShouldPersistTaps="always">

				<ModalCard
					visible={this.state.event_modal_visible}
					name="Neue Veranstaltung"
					location=""
					date={new Date().toLocaleString()}
					onDone={(name, date, location) => this.addEvent(name, date, location)}
				/>
				{this.state.curPageIndex == 0
					? <TouchableOpacity
							style={{
								zIndex: 20,
								marginTop: 52,
								marginLeft: 20,
								position: 'absolute',
							}}
							onPress={() => this.props.navigation.navigate('ScreenHandler')}
						>
							<FontAwesomeIcon style={{ zIndex: 0 }} size={29} color="#F5F5F5" icon={faChevronCircleLeft} />
						</TouchableOpacity>
					: void 0}

				{pageHeadline != ''
					? <Animated.View
							style={{
								zIndex: 10,
								marginTop: 50,
								width: '100%',
								flexWrap: 'wrap',
								alignItems: 'center',
								justifyContent: 'center',
								flexDirection: 'row',
							}}
						>
							<Text style={{ color: 'white', fontFamily: 'Poppins-Bold', fontSize: 27 }}>
								{pageHeadline}
							</Text>
						</Animated.View>
					: void 0}

				{pageContent != ''
					? <View style={{ marginTop: 30, marginLeft: 20, marginRight: 20 }}>
							{pageContent}
						</View>
					: void 0}

				<View
					style={{
						marginTop: 720,
						width: '89.2%',
						position: 'absolute',
						marginLeft: 20,
						marginRight: 20,
						flexWrap: 'wrap',
						justifyContent: 'space-between',
						flexDirection: 'row',
					}}
				>

					{this.state.curPageIndex > 0
						? <TouchableOpacity
								style={{
									justifyContent: 'center',
									alignSelf: 'center',
									width: 47,
									height: 47,
									borderRadius: 40,
									backgroundColor: '#38304C',
									justifyContent: 'center',

									shadowColor: '#38304C',
									shadowOffset: {
										width: 6,
										height: 0,
									},
									shadowOpacity: 0.20,
									shadowRadius: 20.00,
								}}
								onPress={() => this.previousPage()}
							>
								<FontAwesomeIcon
									style={{
										marginRight: 4,
										alignSelf: 'center',
										textAlign: 'center',
										zIndex: 0,
									}}
									size={27}
									color="#F5F5F5"
									icon={faChevronLeft}
								/>
							</TouchableOpacity>
						: <TouchableOpacity
								style={{
									justifyContent: 'center',
									alignSelf: 'center',
									width: 47,
									height: 47,
								}}
							/>}

					{this.state.curPageIndex == 2 || this.state.curPageIndex == 3 || this.state.curPageIndex == 4
						? <TouchableOpacity
								style={{
									justifyContent: 'center',
									alignSelf: 'center',
									width: 65,
									height: 65,
									marginLeft: 138,
									borderRadius: 40,
									position: 'absolute',
									backgroundColor: '#0DF5E3',
									justifyContent: 'center',

									shadowColor: '#0DF5E3',
									shadowOffset: {
										width: 0,
										height: 0,
									},
									shadowOpacity: 0.4,
									shadowRadius: 15.00,
								}}
								onPress={() => {
									if (this.state.curPageIndex == 2) this.openAddEventModal();
									else if (this.state.curPageIndex == 3) this.openUploadFileModal();
									else this.openUploadPictureModal();
								}}
							>
								<FontAwesomeIcon
									style={{
										alignSelf: 'center',
										textAlign: 'center',
										zIndex: 0,
									}}
									size={30}
									color="#38304C"
									icon={this.state.curPageIndex == 2 ? faPlus : faUpload}
								/>
							</TouchableOpacity>
						: void 0}

					{this.state.curPageIndex < 5
						? <TouchableOpacity
								style={{
									justifyContent: 'center',
									alignSelf: 'center',
									width: 47,
									height: 47,
									borderRadius: 40,
									backgroundColor: '#38304C',
									justifyContent: 'center',

									shadowColor: '#38304C',
									shadowOffset: {
										width: 6,
										height: 0,
									},
									shadowOpacity: 0.20,
									shadowRadius: 20.00,
								}}
								onPress={() => this.nextPage()}
							>
								<FontAwesomeIcon
									style={{
										marginLeft: 4,
										alignSelf: 'center',
										textAlign: 'center',
										zIndex: 0,
									}}
									size={27}
									color="#F5F5F5"
									icon={faChevronRight}
								/>
							</TouchableOpacity>
						: void 0}

					{this.state.curPageIndex == 5
						? <TouchableOpacity
								style={{
									alignSelf: 'center',
									width: 50,
									height: 50,
									marginLeft: 280,
									borderRadius: 40,
									backgroundColor: '#0DF5E3',
									justifyContent: 'center',
									alignItems: 'center',
									alignContent: 'center',
									padding: 5,
									position: 'absolute',
									shadowColor: '#38304C',
									shadowOffset: {
										width: 6,
										height: 0,
									},
									shadowOpacity: 0.20,
									shadowRadius: 20.00,
								}}
								onPress={() => this.sendMessage()}
							>
								<FontAwesomeIcon
									style={{
										marginRight: 5,
										alignSelf: 'center',
										textAlign: 'center',
										zIndex: 0,
									}}
									size={27}
									color="#38304C"
									icon={faPaperPlane}
								/>
							</TouchableOpacity>
						: void 0}
				</View>
			</View>
		);
	}
}

//Styles
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'transparent',
	},
});
