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

import { Headlines } from './../app/constants.js';

export default class ManagmentScreen extends React.Component {
	constructor(props) {
		super(props);
		//var utils = this.props.utilsObject;
		//var uid = utils.USER_ID;
		this.state = {
			moveTo: 'none',
		};
		this.margin = new Animated.Value(0);
	}

	render() {
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
					<Text style={s.pageHeadline}>Verwaltung</Text>
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

	animate() {
		this.animatedValue.setValue(0);
		Animated
			.timing(this.animatedValue, {
				toValue: 1,
				duration: 2000,
				easing: Easing.linear,
			})
			.start(() => this.animate());
	}
}

//Styles
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'transparent',
	},
});
