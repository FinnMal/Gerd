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

class ManagmentScreen extends React.Component {
	constructor(props) {
		super(props);
		//var utils = this.props.utilsObject;
		//var uid = utils.USER_ID;
		this.state = {
			moveTo: 'none',
		};
		this.margin = new Animated.Value(0);
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

		if (this.props.show) {
			return (
				<View
					style={s.container}
					onLayout={event => {
						var { x, y, width, height } = event.nativeEvent.layout;
						this.checkIfScrollViewIsNeeded(height);
					}}
				>
					<StatusBar hidden={true} />
					<View
						style={{
							flexWrap: 'wrap',
							alignItems: 'flex-start',
							flexDirection: 'row',
						}}
					>
						<Text style={s.pageHeadline}>Verwaltung</Text>
						<TouchableOpacity
							style={{
								marginTop: s_width * 0.15,
								marginLeft: s_width * 0.1,
							}}
							onPress={() => this._openAddClub()}
						>
							<FontAwesomeIcon size={29} color="#F5F5F5" icon={faPlusCircle} />
						</TouchableOpacity>
					</View>
				</View>
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
