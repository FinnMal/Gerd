import React from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ActionSheetIOS,
	StyleSheet,
	ActivityIndicator,
	Modal,
	Platform
} from 'react-native';
import AutoHeightImage from 'react-native-auto-height-image';
import FileViewer from 'react-native-file-viewer';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
	faChevronCircleRight,
	faArrowAltCircleDown,
	faQuoteRight,
	faCalendar,
	faMapMarker,
	faPen,
	faTrash,
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
import { withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import CameraRoll from '@react-native-community/cameraroll';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

export class NotificationCard extends React.Component {
	render() {
		const content = this.props.content;
		var s = require('./style.js');

		if (content) {
			if (content.headline && content.short_text && content.color) {
				return (
					<TouchableOpacity
						style={{
							height: 'auto',
							width: '86%',
							backgroundColor: content.color,
							alignSelf: 'flex-start',
							marginTop: 40,
							marginLeft: 21,
							marginRight: 21,

							borderRadius: 13,

							shadowColor: content.color,
							shadowOffset: {
								width: 6,
								height: 6,
							},
							shadowOpacity: 0.5,
							shadowRadius: 20.00,
						}}
						onPress={() => {
							this.props.navigation.navigate('MessageScreen', {
								content: this.props.content,
								utils: this.props.utils,
							});
						}}
					>
						<View
							style={{
								width: '90%',
								marginTop: 13,
								marginLeft: 15,
								display: 'flex',
								flexDirection: 'row',
							}}
						>
							<FontAwesomeIcon
								style={{
									marginLeft: 270,
									marginTop: 5,
									position: 'absolute',
									marginBottom: 7,
								}}
								size={25}
								color="#E9E9E9"
								icon={faChevronCircleRight}
							/>
							<Text
								style={{
									marginRight: 23,
									alignSelf: 'flex-start',
									fontFamily: 'Poppins-Bold',
									fontSize: 30,
									color: '#FFFFFF',
								}}
							>{content.headline}</Text>

						</View>
						<Text
							style={{
								fontSize: 20,
								fontFamily: 'Poppins-Regular',
								color: 'white',
								marginTop: 5,
								marginLeft: 15,
								marginRight: 15,
							}}
						>{content.short_text}</Text>

						<View
							style={{
								width: '90%',
								marginBottom: 20,
								marginTop: 20,
								marginLeft: 15,
								display: 'flex',
								flexDirection: 'row',
							}}
						>
							<AutoHeightImage
								style={{ borderRadius: 36 }}
								width={36}
								source={{
									uri: content.club_img,
								}}
							/>
							<View
								style={{
									marginLeft: 15,
								}}
							>
								<Text style={{ marginTop: 4, fontSize: 13, color: 'white' }}>{content.ago}</Text>
								<Text style={{ marginTop: -2, fontSize: 16, fontFamily: 'Poppins-SemiBold', color: 'white' }}>
									{content.club_name}
								</Text>
							</View>
						</View>

					</TouchableOpacity>
				);
			}
		}
		return <View />;
	}
}

export class ClubCard extends React.Component {
	render() {
		var s = require('./style.js');
		return (
			<TouchableOpacity
				style={{
					marginBottom: 20,
					borderRadius: 13,
					padding: 13,
					backgroundColor: this.props.color,
					flexWrap: 'wrap',
					alignItems: 'flex-start',
					flexDirection: 'row',
				}}
				onPress={() => this.props.onPress()}
			>
				<AutoHeightImage
					style={{ borderRadius: 50 }}
					width={50}
					source={{
						uri: this.props.club_img,
					}}
				/>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center',

						height: 50,
						marginLeft: 20,
						alginSelf: 'center',
						justifySelf: 'center',
					}}
				>
					<View>
						<Text style={{ fontSize: 18, fontFamily: 'Poppins-SemiBold', color: 'white' }}>{this.props.club_name}</Text>
						<Text style={{ fontSize: 13, fontFamily: 'Poppins-SemiBold', color: 'rgba(255, 255, 255, 0.34)' }}>
							{this.props.club_members.toLocaleString()} Mitglieder
						</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	}
}

export class ModalCard extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			name: this.props.name,
			date: this.props.date,
			location: this.props.location,
		};
	}

	onChange(type, value) {
		this.state[type] = value;
		this.forceUpdate();
	}

	onDone() {
		this.props.onDone(this.state.name, this.state.date, this.state.location);
	}

	render() {
		var s = require('./style.js');
		return (
			<Modal
				animationType="slide"
				presentationStyle="formSheet"
				visible={this.props.visible}
				display={this.props.display}
			>
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
							style={{ height: 30, fontFamily: 'Poppins-Bold', color: 'white', fontSize: 25, width: '76%' }}
							numberOfLines={1}
						>
							{this.state.name}
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
							onPress={text => this.onDone()}
						>
							<Text style={{ fontSize: 18, fontFamily: 'Poppins-Bold', color: '#38304C' }}>FERTIG</Text>
						</TouchableOpacity>
					</View>

					<View style={{ marginLeft: -20, height: 0.5, marginBottom: 40, backgroundColor: '#38304C', width: '140%' }} />

					<View style={{ marginBottom: 20 }}>
						<Text style={{ fontFamily: 'Poppins-SemiBold', marginLeft: 10, color: '#5C5768' }}>NAME</Text>
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
								value={this.state.name}
								onChangeText={text => this.onChange('name', text)}
							/>
						</View>
					</View>
					<View style={{ marginBottom: 20 }}>
						<Text style={{ fontFamily: 'Poppins-SemiBold', marginLeft: 10, color: '#5C5768' }}>DATE</Text>
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
								value={this.state.date}
								onChangeText={text => this.onChange('date', text)}
							/>
						</View>
					</View>
					<View style={{ marginBottom: 20 }}>
						<Text style={{ fontFamily: 'Poppins-SemiBold', marginLeft: 10, color: '#5C5768' }}>LOCATION</Text>
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
								value={this.state.location}
								onChangeText={text => this.onChange('location', text)}
							/>
						</View>
					</View>

				</View>
			</Modal>
		);
	}
}

export class EventCard extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			modal_visible: false,
		};
	}

	editEvent() {
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

	onChange(key, name, date, location) {
		this.state.modal_visible = false;
		this.forceUpdate();
		this.props.onChange(key, name, date, location);
	}

	render() {
		var s = require('./style.js');
		return (
			<View style={{ marginBottom: 20 }}>
				{this.props.editable
					? <ModalCard
							visible={this.state.modal_visible}
							name={this.props.name}
							date={this.props.date}
							location={this.props.location}
							onDone={(name, date, location) => this.onChange(this.props.pos, name, date, location)}
						/>
					: void 0}

				<View
					style={{
						backgroundColor: this.props.card_type == 'new_message' ? '#38304C' : '#201A30',
						padding: 25,
						borderRadius: 15,
					}}
				>
					<View
						style={{
							marginBottom: 25,
							flexWrap: 'wrap',
							flexDirection: 'row',
						}}
					>
						<FontAwesomeIcon size={28} color="#ADA4A9" icon={faQuoteRight} />
						<Text
							style={{
								marginLeft: 20,
								marginTop: 4,
								fontSize: 20,
								textTransform: 'uppercase',
								fontFamily: 'Poppins-ExtraBold',
								color: '#BBB0B5',
							}}
						>
							{this.props.name}
						</Text>
					</View>
					<View
						style={{
							marginBottom: 25,
							flexWrap: 'wrap',
							flexDirection: 'row',
						}}
					>
						<FontAwesomeIcon size={28} color="#ADA4A9" icon={faCalendar} />
						<Text
							style={{
								marginLeft: 20,
								marginTop: 4,
								fontSize: 20,
								textTransform: 'uppercase',
								fontFamily: 'Poppins-ExtraBold',
								color: '#BBB0B5',
							}}
						>
							{this.props.date}
						</Text>
					</View>
					<View
						style={{
							flexWrap: 'wrap',
							flexDirection: 'row',
						}}
					>
						<FontAwesomeIcon size={28} color="#ADA4A9" icon={faMapMarker} />
						<Text
							style={{
								marginLeft: 20,
								marginTop: 4,
								fontSize: 20,
								textTransform: 'uppercase',
								fontFamily: 'Poppins-ExtraBold',
								color: '#BBB0B5',
							}}
						>
							{this.props.location}
						</Text>
					</View>

					{!this.props.editable || this.props.card_type == 'message'
						? <TouchableOpacity
								style={{
									backgroundColor: '#38304C',
									borderRadius: 25,
									marginTop: 30,
									marginLeft: 20,
									marginRight: 20,
									padding: 12,
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 17, color: '#D8CDCD' }}>
									In Kalender speichern
								</Text>
							</TouchableOpacity>
						: void 0}

				</View>
				{this.props.editable
					? <View
							style={{
								marginTop: -15,
								marginLeft: 245,
								width: 500,
								justifyContent: 'flex-start',
								flexWrap: 'wrap',
								flexDirection: 'row',
							}}
						>
							<TouchableOpacity
								onPress={() => this.editEvent()}
								style={{
									borderRadius: 30,
									width: 30,
									height: 30,
									zIndex: 0,
									backgroundColor: '#0DF5E3',
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<FontAwesomeIcon size={17} color="#38304C" icon={faPen} />
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => this.props.onDelete(this.props.pos)}
								style={{
									borderRadius: 30,
									width: 30,
									height: 30,
									zIndex: 0,
									marginLeft: 10,
									backgroundColor: '#0DF5E3',
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<FontAwesomeIcon size={17} color="#38304C" icon={faTrash} />
							</TouchableOpacity>
						</View>
					: void 0}
			</View>
		);
	}
}

export class FileCard extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			download_progress: 0,
			downloaded: false,
			path: '',
			name: this.props.name,
			modal_visible: false,
			size: this.props.size,
		};

		if (this.props.path) this.state.path = this.props.path;

		if (this.state.size < 1000) {
			// Byte
			this.state.size = Math.round(this.state.size) + ' B';
		}
		if (this.state.size < 1000000) {
			// KB
			this.state.size = Math.round(this.state.size / 1000) + ' KB';
		} else if (this.props.size < 1000000000) {
			// MB
			this.state.size = Math.round(this.state.size / 1000000) + ' MB';
		} else if (this.props.size < 1000000000000) {
			// GB
			this.state.size = Math.round(this.state.size / 1000000000) + ' GB';
		}
	}

	_openFile() {
		FileViewer.open(Platform.OS === 'android' ? 'file://' + this.state.path : '' + this.state.path)
			.then(() => {})
			.catch(error => {});
	}

	_openFileOptions() {
		ActionSheetIOS.showActionSheetWithOptions(
			{
				options: [ 'Abbrechen', 'Bearbeiten', 'Löschen' ],
				destructiveButtonIndex: 2,
				cancelButtonIndex: 0,
			},
			buttonIndex => {
				if (buttonIndex === 0) {
					// cancel action
				} else if (buttonIndex === 1) {
					// edit uploaded file
					this.state.modal_visible = true;
					this.forceUpdate();
				} else if (buttonIndex === 2) {
					// delete uploaded file
					this.props.onDelete(this.props.pos);
				}
			}
		);
	}

	_downloadFile(url) {
		RNFetchBlob
			.config({
				path: RNFetchBlob.fs.dirs.DocumentDir + '/' + this.props.name + '.' + this.props.type.split('/')[1],
				fileCache: true,
				appendExt: this.props.type.split('/')[1],
			})
			.fetch('GET', url, {
				'Cache-Control': 'no-store',
			})
			.progress({ count: 1000 }, (received, total) => {
				this.state.download_progress = received / total * 100;
				this.forceUpdate();
				console.log('progress: ' + received / total * 100 + '%');
			})
			.then(res => {
				this.state.downloaded = true;
				this.state.path = res.path();
				this.forceUpdate();
			});
	}

	onChangeText(value) {
		this.state.name = value;
		this.forceUpdate();
	}

	editFile() {
		this.props.onEdit(this.props.pos, this.state.name);
		this.state.modal_visible = false;
		this.forceUpdate();
	}

	render() {
		if (this.props.downloadable && !this.state.downloaded) var icon = faArrowAltCircleDown;
		else var icon = faFile;
		if (this.state.downloaded || !this.props.downloadable) {
			if (this.props.type == 'application/pdf') icon = faFilePdf;
			if (this.props.type == 'application/msword') icon = faFileWord;
			if (this.props.type == 'application/mspowerpoint') icon = faFilePowerpoint;
			if (this.props.type == 'application/msexcel') icon = faFileExcel;
			if (this.props.type == 'application/pdf') icon = faFilePdf;
			if (this.props.type == 'application/zip') icon = faFileArchive;
			if (this.props.type == 'text/comma-separated-values	') icon = faFileCsv;

			if (!this.props.icon) {
				if (this.props.type.includes('audio')) icon = faFileAudio;
				if (this.props.type.includes('video')) icon = faFileVideo;
				if (this.props.type.includes('image')) icon = faFileImage;
				if (this.props.type.includes('text')) icon = faFileAlt;
			}
		}

		var s = require('./style.js');
		return (
			<View style={{ marginBottom: 30 }}>
				{this.props.editable
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
										Datei bearbeiten
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
										onPress={text => this.editFile()}
									>
										<Text style={{ fontSize: 18, fontFamily: 'Poppins-Bold', color: '#38304C' }}>FERTIG</Text>
									</TouchableOpacity>
								</View>

								<View
									style={{ marginLeft: -20, height: 0.5, marginBottom: 40, backgroundColor: '#38304C', width: '140%' }}
								/>

								<View style={{ marginBottom: 20 }}>
									<Text style={{ fontFamily: 'Poppins-SemiBold', marginLeft: 10, color: '#5C5768' }}>NAME</Text>
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
											value={this.state.name}
											onChangeText={text => this.onChangeText(text)}
										/>
									</View>
								</View>
							</View>
						</Modal>
					: void 0}

				<TouchableOpacity
					onPress={() => {
						if (this.props.downloadable && !this.state.downloaded) this._downloadFile(this.props.download_url);
						else this._openFile();
					}}
				>
					<View
						style={{
							marginTop: this.props.editable ? 0 : 20,
							marginRight: this.props.editable ? 0 : 55,

							justifyContent: 'flex-start',
							flexWrap: 'wrap',
							flexDirection: 'row',
							padding: 15,
							backgroundColor: this.props.editable ? '#38304C' : '#201A30',
							marginBottom: 0,
							borderRadius: 13,
						}}
					>
						<View
							style={{
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>

							<FontAwesomeIcon
								style={{ zIndex: 0 }}
								size={35}
								color={this.props.editable ? '#D1CFD5' : '#ADA4A9'}
								icon={icon}
							/>
							{this.props.downloadable && !this.state.downloaded
								? <AnimatedCircularProgress
										size={41}
										width={2}
										style={{ position: 'absolute', marginTop: 13, marginLeft: 12 }}
										fill={this.state.download_progress}
										tintColor="#0DF5E3"
										onAnimationComplete={() => console.log('onAnimationComplete')}
										backgroundColor="#201A30"
									/>
								: void 0}
						</View>

						<View style={{ marginLeft: 20, width: this.props.editable ? 225 : 228 }}>
							<Text
								style={{
									fontSize: 19,
									fontFamily: 'Poppins-SemiBold',
									color: this.props.editable ? '#D1CFD5' : '#ADA4A9',
								}}
							>
								{this.props.name}
							</Text>
							<Text
								style={{
									fontSize: 15,
									fontFamily: 'Poppins-SemiBold',
									color: this.props.editable ? '#D1CFD5' : '#ADA4A9',
								}}
							>
								{this.state.size}
							</Text>
						</View>
						{this.props.editable
							? <View
									style={{
										padding: 1,
										justifyContent: 'center',
										alignItems: 'center',
									}}
								>
									<TouchableOpacity onPress={() => this._openFileOptions()} style={{ zIndex: 0 }}>
										<FontAwesomeIcon size={20} color="#D1CFD5" icon={faEllipsisV} />
									</TouchableOpacity>
								</View>
							: void 0}
					</View>
					{this.props.uploading && this.props.editable
						? <View
								style={{
									marginLeft: 15,
									marginRight: 15,
									marginTop: -2,
								}}
							>
								<View
									style={{
										borderRadius: 3,
										shadowColor: '#0DF5E3',
										shadowOffset: {
											width: 6,
											height: 6,
										},
										shadowOpacity: 0.5,
										shadowRadius: 20.00,
										backgroundColor: '#0DF5E3',
										height: 2,
										width: '' + this.props.uploaded_percentage + '%',
										maxWidth: 1000,
									}}
								/>
							</View>
						: void 0}
				</TouchableOpacity>
			</View>
		);
	}
}
