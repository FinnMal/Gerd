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
	Dimensions
} from 'react-native';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { Headlines } from './../app/constants.js';
import { withNavigation } from 'react-navigation';
import ClubCard from './../components/ClubCard.js';
import database from '@react-native-firebase/database';
import HeaderScrollView from './../components/HeaderScrollView.js';

class ManagmentScreen extends React.Component {
	uid: null;
	constructor(props) {
		super(props);
		var utils = this.props.utilsObject;
		this.uid = utils.getUserID();
		this.state = {
			clubsList: [],
			moveTo: 'none',
		};
		this.margin = new Animated.Value(0);

		database().ref('users/' + this.uid + '/clubs').once(
			'value',
			(function(snap) {
				var clubs = snap.val();

				var i = 0;
				Object.keys(clubs).map(key => {
					var club = clubs[key];
					if (club) {
						if (club.role == 'admin') {
							database().ref('clubs/' + club.club_id).once(
								'value',
								(function(snap) {
									var info = snap.val();
									club.id = club.club_id;
									club.name = info.name;
									club.logo = info.logo;
									club.members = info.members;
									club.color = info.color;
									club.selected = false;
									club.groups = info.groups;
									club.invite_codes = info.invite_codes;

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

	_openAddClub() {
		this.props.navigation.navigate('AddClubScreen', {
			utils: this.props.utilsObject,
			show: true,
		});
	}

	render() {
		const s_width = Dimensions.get('window').width;

		var s = require('./../app/style.js');
		const marginLeft = this.margin.interpolate({
			inputRange: [ 0, 2000 ],
			outputRange: [ 0, 2000 ],
		});

		const clubCards = Object.keys(this.state.clubsList).map(key => {
			var club = this.state.clubsList[key];
			return (
				<ClubCard
					key={key}
					navigateable={true}
					club_name={club.name}
					club_members={club.members}
					club_img={club.logo}
					color="#38304C"
					onNavigate={() => this.props.navigation.navigate('ClubSettingsScreen', {
						club: club,
						utils: this.props.utilsObject,
					})}
				/>
			);
		});

		if (this.props.show) {
			return (
				<HeaderScrollView
					headline="Verwaltung"
					headlineFontSize={47}
					backButton={false}
					showHeadline={false}
					actionButton={
						(
							<TouchableOpacity style={{ marginLeft: 20 }} onPress={() => this._openAddClub()}>
								<FontAwesomeIcon size={29} color="#F5F5F5" icon={faPlusCircle} />
							</TouchableOpacity>
						)
					}
				>
					<View style={{ flex: 1, marginTop: 40 }}>
						{clubCards}
					</View>
				</HeaderScrollView>
			);
		}
		return null;
	}

	checkIfScrollViewIsNeeded(viewHeight) {
		if (viewHeight < Dimensions.get('window').height) {
			this.props.setScrollViewEnabled(false);
		} else {
			this.props.setScrollViewEnabled(true);
		}
	}
}

//Styles
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'transparent',
	},
});

export default withNavigation(ManagmentScreen);
