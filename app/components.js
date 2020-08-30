import React from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ActionSheetIOS,
	StyleSheet,
	ActivityIndicator,
	Modal
} from 'react-native';
import AutoHeightImage from 'react-native-auto-height-image';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
	faChevronCircleRight,
	faArrowAltCircleDown,
	faTimesCircle,
	faQuoteRight,
	faCalendar,
	faMapMarker,
	faPen,
	faTrash,
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
	faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import CameraRoll from '@react-native-community/cameraroll';

export class NotificationCard extends React.Component {
	render() {
		var s = require('./style.js');
		return (
			<TouchableOpacity
				style={{
					height: 'auto',
					width: '86%',
					backgroundColor: this.props.color,
					alignSelf: 'flex-start',
					marginTop: 40,
					marginLeft: 21,
					marginRight: 21,

					borderRadius: 13,

					shadowColor: this.props.color,
					shadowOffset: {
						width: 6,
						height: 6,
					},
					shadowOpacity: 0.5,
					shadowRadius: 20.00,
				}}
				onPress={() => {
					this.props.navigation.navigate('MessageScreen', {
						club_name: this.props.club_name,
						ago: this.props.ago,
						headline: this.props.headline,
						long_text: this.props.long_text,
						img: this.props.img,
						files: this.props.files,
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
					<Text
						style={{
							alignSelf: 'flex-start',
							fontFamily: 'Poppins-Bold',
							fontSize: 30,
							color: '#FFFFFF',
						}}
					>{this.props.headline}</Text>
					<FontAwesomeIcon
						style={{
							marginLeft: 'auto',
							alignSelf: 'flex-end',
							marginBottom: 7,
						}}
						size={25}
						color="#E9E9E9"
						icon={faChevronCircleRight}
					/>
				</View>
				<Text
					style={{
						fontSize: 20,
						fontFamily: 'Poppins-Regular',
						color: 'white',
						marginTop: 5,
						marginLeft: 15,
					}}
				>{this.props.short_text}</Text>

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
							uri: this.props.club_img,
						}}
					/>
					<View
						style={{
							marginLeft: 15,
						}}
					>
						<Text style={{ marginTop: 4, fontSize: 13, color: 'white' }}>{this.props.ago}</Text>
						<Text style={{ marginTop: -2, fontSize: 16, fontFamily: 'Poppins-SemiBold', color: 'white' }}>
							{this.props.club_name}
						</Text>
					</View>
				</View>

			</TouchableOpacity>
		);
	}
}

export class DownloadCard extends React.Component {
	_downloadFile(url) {
		RNFetchBlob
			.config({
				fileCache: true,
			})
			.fetch('GET', url)
			// the image is now dowloaded to device's storage
			.then(resp => {
				// the image path you can use it directly with Image component
				imagePath = resp.path();
				return resp.readFile('base64');
			})
			.then(base64Data => {
				let options = {
					url: 'data:image/jpg;base64,' + base64Data,
					type: 'image/jpg',
				};

				Share.open(options)
					.then(res => {
						console.log(res);
					})
					.catch(err => {
						err && console.log(err);
					});

				// remove the file from storage
				//return RNFS.unlink(imagePath);
			});

		/*
		var date = new Date();
		const { config, fs } = RNFetchBlob;
		let PictureDir = fs.dirs.PictureDir; // this is the pictures directory. You can check the available directories in the wiki.
		let options = {
			fileCache: true,
			addAndroidDownloads: {
				useDownloadManager: true, // setting it to true will use the device's native download manager and will be shown in the notification bar.
				notification: false,
				path: PictureDir + '/' + Math.floor(date.getTime() + date.getSeconds() / 2) + '.png', // this is the path where your downloaded file will live in
				description: 'Downloading image.',
			},
		};
		config(options).fetch('GET', url).then(res => {
			alert(options.addAndroidDownloads.path);
			console.log(res.base64());
			console.log(res);
		});
		*/
	}

	render() {
		var s = require('./style.js');
		return (
			<View
				style={{
					marginTop: 20,
					borderRadius: 13,
					padding: 10,
					backgroundColor: '#201A30',
					marginRight: 55,
					color: '#ADA4A9',
					flexWrap: 'wrap',
					alignItems: 'flex-start',
					flexDirection: 'row',
				}}
			>
				<TouchableOpacity
					onPress={() => this._downloadFile(this.props.download_url)}
					style={{ zIndex: 0, marginTop: 6, marginLeft: 5 }}
				>
					<FontAwesomeIcon size={35} color="#ADA4A9" icon={faArrowAltCircleDown} />
				</TouchableOpacity>

				<View style={{ marginLeft: 16 }}>
					<Text style={{ marginTop: 2, fontFamily: 'Poppins-SemiBold', fontSize: 23, color: '#ADA4A9' }}>
						{this.props.name}
					</Text>
					<Text style={{ marginTop: -6, fontFamily: 'Poppins-SemiBold', fontSize: 16, color: '#ADA4A9' }}>
						{Math.round(this.props.size / 1000)} MB
					</Text>
				</View>
			</View>
		);
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
						<Text style={{ fontFamily: 'Poppins-Bold', color: 'white', fontSize: 25, width: '76%' }} numberOfLines={1}>
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
					</View><View style={{ marginBottom: 20 }}>
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

	onChange(key, name, location, date) {
		this.state.modal_visible = false;
		this.forceUpdate();
		this.props.onChange(key, name, location, date);
	}

	render() {
		var s = require('./style.js');
		return (
			<View>
				<ModalCard
					visible={this.state.modal_visible}
					name={this.props.name}
					location={this.props.location}
					date={this.props.date}
					onDone={(name, location, date) => this.onChange(this.props.pos, name, location, date)}
				/>

				<View style={{ backgroundColor: '#38304C', padding: 25, borderRadius: 15 }}>
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
				</View>
				<View
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
			</View>
		);
	}
}

export class FileCard extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			name: this.props.name,
			modal_visible: false,
		};
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
		return (
			<View style={{ marginBottom: 30 }}>
				<Modal animationType="slide" presentationStyle="formSheet" visible={this.state.modal_visible}>
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
				<View
					style={{
						justifyContent: 'flex-start',
						flexWrap: 'wrap',
						flexDirection: 'row',
						padding: 15,
						backgroundColor: '#38304C',
						marginBottom: 0,
						borderRadius: 13,
					}}
				>
					<View>
						<View
							style={{
								opacity: 0,
								position: 'absolute',
								marginLeft: 10,
								marginTop: 13,
								backgroundColor: '#0DF5E3',
								height: 17,
								width: 16,
							}}
						/>
						<FontAwesomeIcon style={{ position: 'absolute' }} size={30} color="#D1CFD5" icon={this.props.icon} />
					</View>
					<View style={{ marginLeft: 60, width: 220 }}>
						<Text style={{ fontSize: 19, fontFamily: 'Poppins-SemiBold', color: '#D1CFD5' }}>{this.props.name}</Text>
						<Text style={{ fontSize: 15, fontFamily: 'Poppins-SemiBold', color: '#D1CFD5' }}>
							{Math.round(this.props.size / 1000000)} MB
						</Text>
					</View>
					<TouchableOpacity onPress={() => this._openFileOptions()} style={{ zIndex: 0, marginTop: 6, marginLeft: 5 }}>
						<FontAwesomeIcon size={20} color="#D1CFD5" icon={faEllipsisV} />
					</TouchableOpacity>
				</View>
				{this.props.uploading
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
			</View>
		);
	}
}
