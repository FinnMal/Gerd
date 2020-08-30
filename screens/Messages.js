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
import database from '@react-native-firebase/database';

export default class MessagesScreen extends React.Component {
	constructor(props) {
		super(props);
		var utils = this.props.utilsObject;
		//var uid = utils.USER_ID;
		this.state = {
			moveTo: 'none',
			chats: {},
		};
		this.margin = new Animated.Value(0);

		database().ref('users/default/chats').on(
			'value',
			(function(snapshot) {
				var chats = snapshot.val();
				this.state.chats = {};

				Object.keys(chats).map(chat_key => {
					var chat_id = chats[chat_key].chat_id;
					database().ref('chats/' + chat_id).on(
						'value',
						(function(snap) {
							var chat = snap.val();
							chat.unread_messages_count = 0;
							chat.last_message_send_at = 0;
							chat.last_message_id = null;

							Object.keys(chat.messages).map(mes_key => {
								var message = chat.messages[mes_key];
								if (!message.read) chat.unread_messages_count++;

								if (chat.last_message_id) {
									if (chat.messages[chat.last_message_id]) {
										if (message.send_at > chat.messages[chat.last_message_id].send_at)
											chat.last_message_id = message.id;
									} else
										chat.last_message_id = message.id;
								} else
									chat.last_message_id = message.id;
							});

							chat.messages[chat.last_message_id].ago_text = utils.getAgoText(
								chat.messages[chat.last_message_id].send_at,
								false,
								false,
								true
							);

							var reciver_user_id = chat.user_id_1 != 'default' ? chat.user_id_1 : chat.user_id_2;
							database().ref('users/' + reciver_user_id + '/img').once(
								'value',
								(function(snap) {
									chat.user_img = snap.val();
									database().ref('users/' + reciver_user_id + '/name').once(
										'value',
										(function(snap) {
											chat.user_name = snap.val();
											this.state.chats[chat.id] = chat;
											this.forceUpdate();
										}).bind(this)
									);
								}).bind(this)
							);
						}).bind(this)
					);
				});
			}).bind(this)
		);
	}

	render() {
		var s = require('./../app/style.js');
		const marginLeft = this.margin.interpolate({
			inputRange: [ 0, 2000 ],
			outputRange: [ 0, 2000 ],
		});

		var chatsElements = null;
		if (this.state.chats) {
			chatsElements = Object.keys(this.state.chats).map(key => {
				var chat = this.state.chats[key];
				return <ChatCard key={key} chat={chat} />;
			});
		}

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
					<Text style={s.pageHeadline}>Nachrichten</Text>
					<View style={{ marginTop: 30 }}>
						{chatsElements}
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

class ChatCard extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const chat = this.props.chat;

		return (
			<TouchableOpacity
				style={{
					marginBottom: 25,
					marginLeft: 20,
					marginRight: 20,
					flexWrap: 'wrap',
					flexDirection: 'row',
				}}
			>
				<Image
					style={{ borderRadius: 36 }}
					width={50}
					height={50}
					source={{
						uri: chat.user_img,
					}}
				/>
				<View
					style={{
						width: 235,
						marginLeft: 15,
						justifyContent: 'center',
					}}
				>
					<View
						style={{
							justifyContent: 'center',
						}}
					>
						<Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 18, color: '#C2C1C7' }}>{chat.user_name}</Text>
						<Text numberOfLines={1} style={{ fontFamily: 'Poppins-Regular', color: '#7B7784' }}>
							{chat.messages[chat.last_message_id].text}
						</Text>
					</View>
				</View>
				<View
					style={{
						marginBottom: 4,
						alignSelf: 'flex-end',
					}}
				>
					<Text style={{ fontFamily: 'Poppins-Regular', color: '#6F6B79' }}>
						{chat.messages[chat.last_message_id].ago_text}
					</Text>
					{chat.unread_messages_count
						? <View
								style={{
									marginTop: 3,
									borderRadius: 40,
									paddingTop: 2,
									paddingBottom: 1,
									backgroundColor: '#0DF5E3',
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<Text style={{ fontFamily: 'Poppins-SemiBold', color: 'white' }}>{chat.unread_messages_count}</Text>
							</View>
						: void 0}

				</View>

			</TouchableOpacity>
		);
	}
}

//Styles
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'transparent',
	},
});
