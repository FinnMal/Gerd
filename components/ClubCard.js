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
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { withNavigation } from 'react-navigation';
import { useNavigation } from '@react-navigation/native';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import CameraRoll from '@react-native-community/cameraroll';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

export default class ClubCard extends React.Component {
	onPress() {
		if (this.props.navigateable) this.props.onNavigate();
		else this.props.onPress();
	}

	render() {
		//var s = require('./style.js');
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
				onPress={() => this.onPress()}
			>
				<AutoHeightImage
					style={{ borderRadius: 45 }}
					width={45}
					source={{
						uri: this.props.club_img,
					}}
				/>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center',

						height: 45,
						marginLeft: 15,
						alginSelf: 'center',
						justifySelf: 'center',
					}}
				>
					<View>
						<Text
							style={{
								width: 210,
								fontSize: 18,
								fontFamily: 'Poppins-SemiBold',
								color: 'white',
							}}
						>
							{this.props.club_name}
						</Text>
						<Text
							style={{
								marginTop: -1,
								fontSize: 13,
								fontFamily: 'Poppins-SemiBold',
								color: 'rgba(255, 255, 255, 0.34)',
							}}
						>
							{this.props.club_members.toLocaleString()} Mitglieder
						</Text>
					</View>
					{this.props.navigateable
						? <TouchableOpacity
								style={{
									marginLeft: 15,
								}}
								onPress={() => this.onPress()}
							>
								<FontAwesomeIcon size={19} color="white" icon={faChevronRight} />
							</TouchableOpacity>
						: void 0}
				</View>
			</TouchableOpacity>
		);
	}
}
