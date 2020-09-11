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
	Platform,
	Dimensions
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

		this.state = {
			read: null,
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
		const utils = this.state.utils;
		database().ref('clubs/' + this.state.club_id + '/color').on(
			'value',
			(function(snap) {
				console.log('club color triggered: ' + this.state.mes_id);
				this.state.club.color = snap.val();
				this.forceUpdate();
			}).bind(this)
		);

		database().ref('clubs/' + this.state.club_id + '/logo').on(
			'value',
			(function(snap) {
				console.log('club logo triggered: ' + this.state.mes_id);
				this.state.club.logo = snap.val();
				this.forceUpdate();
			}).bind(this)
		);

		database().ref('clubs/' + this.state.club_id + '/name').on(
			'value',
			(function(snap) {
				console.log('club name triggered: ' + this.state.mes_id);
				this.state.club.name = snap.val();
				this.forceUpdate();
			}).bind(this)
		);

		database().ref('users/' + this.state.uid + '/messages/' + this.state.mes_id + '/read').once(
			'value',
			(function(snap) {
				console.log('message read triggered: ' + this.state.mes_id);
				this.state.read = snap.val() === true;
				this.forceUpdate();
			}).bind(this)
		);

		this.state.ref.on(
			'value',
			(function(snap) {
				console.log('message triggered: ' + this.state.mes_id);
				var message = snap.val();
				message.id = this.state.mes_id;

				message.ago = utils.getAgoText(message.send_at);
				message.ago_seconds = utils.getAgoSec(message.send_at);

				message.read = this.state.read;

				this.state.data = message;
				this.forceUpdate();
			}).bind(this)
		);
	}

	_stopListener() {
		this.state.ref.off();
	}

	set(values) {
		Object.keys(values).map(key => {
			this.state.ref.child(key).set(values[key]);
		});
	}

	setHeadline(value) {
		this.state.ref.child('headline').set(value);
	}

	setLongText(value) {
		this.state.ref.child('long_text').set(value);
	}

	setShortText(value) {
		this.state.ref.child('short_text').set(value);
	}

	_getDifference(o1, o2) {
		var diff = {};
		var tmp = null;
		if (JSON.stringify(o1) === JSON.stringify(o2)) return;

		for (var k in o1) {
			if (Array.isArray(o1[k]) && Array.isArray(o2[k])) {
				tmp = o1[k].reduce(
					function(p, c, i) {
						var _t = this._getDifference(c, o2[k][i]);
						if (_t) p.push(_t);
						return p;
					},
					[]
				);
				if (Object.keys(tmp).length > 0) diff[k] = tmp;
			} else if (typeof o1[k] === 'object' && typeof o2[k] === 'object') {
				tmp = this._getDifference(o1[k], o2[k]);
				if (tmp && Object.keys(tmp) > 0) diff[k] = tmp;
			} else if (o1[k] !== o2[k]) {
				diff[k] = o2[k];
			}
		}
		return diff;
	}

	render() {
		const club = this.state.club;
		const mes = this.state.data;
		const s_width = Dimensions.get('window').width;
		var s = require('./../app/style.js');

		if (this.state.read != null) {
			mes.section = 2;
			if (!this.state.read) mes.section = 0;
			else if (mes.ago_seconds / 60 / 60 < 24) mes.section = 1;

			this.props.onVisibilityChange(this.state.mes_id, this.props.showIfSectionIs == mes.section);
			if (this.props.showIfSectionIs == mes.section) {
				if (mes) {
					if (mes.headline && mes.short_text && club.color && club.logo && club.name) {
						return (
							<TouchableOpacity
								style={{
									width: s_width * 0.875,
									height: 'auto',
									backgroundColor: club.color,
									alignSelf: 'flex-start',
									marginTop: 40,
									marginLeft: 23,
									marginRight: 23,

									borderRadius: 10,

									shadowColor: club.color,
									shadowOffset: {
										width: 0,
										height: 0,
									},
									shadowOpacity: 0.5,
									shadowRadius: 14.00,
								}}
								onPress={() => {
									this.state.nav.navigate('MessageScreen', {
										club: club,
										mes: mes,
										mesObj: this,
										utils: this.state.utils,
									});
								}}
							>
								<View
									style={{
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
											marginRight: 42,
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
										marginRight: 35,
									}}
								>{mes.short_text}</Text>

								<View style={{ height: 0.5, marginTop: 20, marginBottom: 12, backgroundColor: '#38304C' }} />

								<View
									style={{
										marginBottom: 12,
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
										<Text style={{ marginTop: 4, fontSize: 13, color: 'white' }}>{mes.ago}</Text>
										<Text style={{ marginTop: -2, fontSize: 16, fontFamily: 'Poppins-SemiBold', color: 'white' }}>
											{club.name}
										</Text>
									</View>
								</View>

							</TouchableOpacity>
						);
					} else
						console.log('Missing value');
				} else
					console.log('mes is null');
			}
		}

		return null;
	}
}
