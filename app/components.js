import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AutoHeightImage from 'react-native-auto-height-image';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronCircleRight } from '@fortawesome/free-solid-svg-icons';

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
				onPress={() => this.props.onPress()}
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
				>{this.props.text}</Text>

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
					<AutoHeightImage width={36} source={this.props.clubImg} />
					<View
						style={{
							marginLeft: 15,
						}}
					>
						<Text style={{ marginTop: 4, fontSize: 13, color: 'white' }}>{this.props.ago}</Text>
						<Text style={{ marginTop: -2, fontSize: 16, fontFamily: 'Poppins-SemiBold', color: 'white' }}>
							{this.props.clubName}
						</Text>
					</View>
				</View>

			</TouchableOpacity>
		);
	}
}
