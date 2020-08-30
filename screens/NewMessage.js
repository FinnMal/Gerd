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
	TouchableWithoutFeedback,
	Keyboard,
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
	faFilePdf
} from '@fortawesome/free-solid-svg-icons';
import { ClubCard, ModalCard, EventCard, FileCard } from './../app/components.js';
import database from '@react-native-firebase/database';
import { SafeAreaView } from 'react-navigation'; //added this import
import DocumentPicker from 'react-native-document-picker';
import storage from '@react-native-firebase/storage';

export default class NewMessageScreen extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			curPageIndex: 0,
			clubsList: [],
			event_modal_visible: false,
			events: [],
			files: [],
			group_serach: '',
			long_text_input_has_focus: false,
		};

		this.headlineMarginLeft = new Animated.Value(40);
		this.nextHeadlineMarginLeft = new Animated.Value(40);

		database().ref('users/default/clubs').once(
			'value',
			(function(snap) {
				var clubs = snap.val();
				var i = 0;
				Object.keys(clubs).map(key => {
					var club = clubs[key];
					if (club.role == 'admin') {
						database().ref('clubs/' + club.club_id).once(
							'value',
							(function(snap) {
								var info = snap.val();
								club.name = info.name;
								club.logo = info.logo;
								club.members = info.members;
								club.card_color = '#38304C';
								club.selected = false;
								club.groups = info.groups;

								this.state.clubsList[i] = club;
								this.forceUpdate();
								i++;
							}).bind(this)
						);
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

	async addFile(res) {
		var file = {
			name: res.name,
			path: res.uri,
			size: res.size,
			type: res.type,
			uploading: true,
			uploaded_percentage: 0,
			storage_path: 'userfiles/default/' + res.name + '_' + new Date().getTime(),
		};

		var icon = '';

		// dircet file types

		if (res.type == 'application/pdf') icon = faFilePdf;
		if (res.type == 'application/msword') icon = faFileWord;
		if (res.type == 'application/mspowerpoint') icon = faFilePowerpoint;
		if (res.type == 'application/msexcel') icon = faFileExcel;
		if (res.type == 'application/pdf') icon = faFilePdf;
		if (res.type == 'application/zip') icon = faFileArchive;
		if (res.type == 'text/comma-separated-values	') icon = faFileCsv;

		if (!icon) {
			if (res.type.includes('audio')) icon = faFileAudio;
			if (res.type.includes('video')) icon = faFileVideo;
			if (res.type.includes('image')) icon = faFileImage;
			if (res.type.includes('text')) icon = faFileAlt;

			if (!icon) icon = faFile;
		}
		file.icon = icon;

		var pos = this.state.files.length;
		this.state.files[pos] = file;
		this.forceUpdate();
		const reference = storage().ref(file.storage_path);
		const pathToFile = file.path;
		const task = reference.putFile(pathToFile);

		task.on('state_changed', taskSnapshot => {
			if (this.state.files[pos]) {
				if (this.state.files[pos].storage_path == taskSnapshot.metadata.name) {
					this.state.files[pos].uploaded_percentage = taskSnapshot.bytesTransferred / taskSnapshot.totalBytes * 100;
					this.forceUpdate();
					return;
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
		if (!this.state.clubsList[key].groups[g_key].selected) this.state.clubsList[key].groups[g_key].selected = true;
		else this.state.clubsList[key].groups[g_key].selected = false;
		this.forceUpdate();
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

	sendMessage() {
		this.state.clubsList.forEach((club, i) => {
			if (club.selected) {
				var files = [];
				this.state.files.forEach((pFile, i) => {
					var file = pFile;
					file.path = null;
					file.storage_path = null;
					file.uploading = null;
					file.uploaded_percentage = null;
					file.icon = null;
					files.push(file);
				});

				var mes = {
					club_id: club.club_id,
					headline: this.state.headlineInputValue,
					short_text: this.state.shortTextInputValue,
					long_text: this.state.textInputValue,
					send_at: new Date().getTime() / 1000,
					img: 'https://www.cvjm-westbund.de/system/getthumb/images/__tn__ecics_6063_9187_600_9999.png',
					files: files,
				};

				database()
					.ref('messages/list')
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
							icon={file.icon}
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
			pageHeadline = 'Gruppen auswählen';
			const groupsList = Object.keys(this.state.clubsList).map(key => {
				return Object.keys(this.state.clubsList[key].groups).map(g_key => {
					var group = this.state.clubsList[key].groups[g_key];
					if (group.name.includes(this.state.group_serach)) {
						var iconColor = group.selected ? 'red' : '#ADA4A9';
						var icon = group.selected ? faTimesCircle : faPlusCircle;

						return (
							<TouchableOpacity
								onPress={() => this.addGroup(key, g_key)}
								key={g_key}
								style={{
									marginTop: 10,
									marginBottom: 10,
									flexWrap: 'wrap',
									alignItems: 'flex-start',
									flexDirection: 'row',
								}}
							>
								<FontAwesomeIcon style={{ marginTop: 7, marginLeft: 5 }} size={23} color={iconColor} icon={icon} />
								<View style={{ marginLeft: 20 }}>
									<Text style={{ fontSize: 17, fontFamily: 'Poppins-SemiBold', color: 'white' }}>
										{group.name}
									</Text>
									<Text style={{ fontSize: 13, fontFamily: 'Poppins-SemiBold', color: 'rgba(255, 255, 255, 0.34)' }}>
										{group.members.toLocaleString()} Mitglieder
									</Text>
								</View>
							</TouchableOpacity>
						);
					}
				});
			});

			pageContent = (
				<View style={{ marginBottom: 20 }}>
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
							Placeholder="NAME ODER CODE EINGEBEN"
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
						<ScrollView>
							{groupsList}
						</ScrollView>
					</View>

				</View>
			);
		}

		return (
			<View style={[ s.container ]} keyboardShouldPersistTaps="always">
				<StatusBar hidden={true} />
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
							<Text style={{ justifySelf: 'center', color: 'white', fontFamily: 'Poppins-Bold', fontSize: 27 }}>
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

					{this.state.curPageIndex == 2 || this.state.curPageIndex == 3
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
								onPress={
									this.state.curPageIndex == 2 ? () => this.openAddEventModal() : () => this.openUploadFileModal()
								}
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

					{this.state.curPageIndex < 4
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

					{this.state.curPageIndex == 4
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
