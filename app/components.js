import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AutoHeightImage from 'react-native-auto-height-image';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronCircleRight, faArrowAltCircleDown } from '@fortawesome/free-solid-svg-icons';
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
						downloads: this.props.downloads,
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
						{this.props.name}.{this.props.format}
					</Text>
					<Text style={{ marginTop: -6, fontFamily: 'Poppins-SemiBold', fontSize: 16, color: '#ADA4A9' }}>
						{Math.round(this.props.size / 1000)} MB
					</Text>
				</View>
			</View>
		);
	}
}
