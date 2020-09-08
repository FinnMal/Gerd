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
import database from '@react-native-firebase/database';

export class Message extends React.Component {
	constructor(props) {
		super(props);

		const utils = this.props.utils;

		console.log('clubs/' + this.props.club_id + '/messages/' + this.props.mes_id);

		this.state = {
			utils: utils,
			uid: utils.getUserID(),
			nav: utils.getNavigation(),
			club_id: this.props.club_id,
			mes_id: this.props.mes_id,
			ref: database().ref('clubs/' + this.props.club_id + '/messages/' + this.props.mes_id),
			data: {},
			club: {},
		};

		this._startListener();
	}

	_startListener() {
		database().ref('clubs/' + this.state.club_id + '/color').on(
			'value',
			(function(snap) {
				this.state.club.color = snap.val();
				this.forceUpdate();
			}).bind(this)
		);

		database().ref('clubs/' + this.state.club_id + '/logo').on(
			'value',
			(function(snap) {
				this.state.club.logo = snap.val();
				this.forceUpdate();
			}).bind(this)
		);

		database().ref('clubs/' + this.state.club_id + '/name').on(
			'value',
			(function(snap) {
				this.state.club.name = snap.val();
				this.forceUpdate();
			}).bind(this)
		);

		this.state.ref.on(
			'value',
			(function(snap) {
				this.state.data = snap.val();
				this.state.data.id = this.state.mes_id;
				console.log(snap.val());
				this.forceUpdate();
			}).bind(this)
		);
	}

	_stopListener() {
		this.state.ref.off();
	}

	render() {
		const club = this.state.club;
		const mes = this.state.data;
		var s = require('./../app/style.js');

		if (mes) {
			if (mes.headline && mes.short_text && club.color && club.logo && club.name) {
				return (
					<TouchableOpacity
						style={{
							height: 'auto',
							width: '86%',
							backgroundColor: club.color,
							alignSelf: 'flex-start',
							marginTop: 40,
							marginLeft: 21,
							marginRight: 21,

							borderRadius: 13,

							shadowColor: club.color,
							shadowOffset: {
								width: 6,
								height: 6,
							},
							shadowOpacity: 0.5,
							shadowRadius: 20.00,
						}}
						onPress={() => {
							this.state.nav.navigate('MessageScreen', {
								club: club,
								mes: mes,
								utils: this.state.utils,
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
							>{mes.headline}</Text>

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
						>{mes.short_text}</Text>

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
									uri: club.logo,
								}}
							/>
							<View
								style={{
									marginLeft: 15,
								}}
							>
								<Text style={{ marginTop: 4, fontSize: 13, color: 'white' }}>{mes.send_at}</Text>
								<Text style={{ marginTop: -2, fontSize: 16, fontFamily: 'Poppins-SemiBold', color: 'white' }}>
									{club.name}
								</Text>
							</View>
						</View>

					</TouchableOpacity>
				);
			} else
				console.log('cant return 1');
		} else
			console.log('cant return 2');
		return <View />;
	}
}
