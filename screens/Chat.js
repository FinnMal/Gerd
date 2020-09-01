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
	Dimensions,
	Keyboard,
	KeyboardAvoidingView
} from 'react-native';

import { Headlines } from './../app/constants.js';
import { withNavigation } from 'react-navigation';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import database from '@react-native-firebase/database';
import { faChevronCircleLeft, faChevronLeft, faChevronRight, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

class ChatScreen extends React.Component {
	constructor(props) {
		super(props);
		var utils = this.props.utilsObject;

		this.state = {
			cur_message: '',
		};

		this.lastViewHeight = new Animated.Value(630);
	}

	_onChangeText(value) {
		this.state.cur_message = value;
		this.forceUpdate();
	}

	_sendMessage() {
		const chat = this.props.navigation.getParam('chat', null);

		var mes = {
			text: this.state.cur_message,
			send_at: new Date().getTime() / 1000,
			read: false,
			sender: chat.user_id_1 != 'default' ? chat.user_id_2 : chat.user_id_1,
			receiver: chat.user_id_1 != 'default' ? chat.user_id_1 : chat.user_id_2,
		};

		database().ref('chats/' + chat.id + '/messages').push(mes);
	}

	componentDidMount() {
		//this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
		//this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
	}

	componentWillUnmount() {
		//this.keyboardDidShowListener.remove();
		//this.keyboardDidHideListener.remove();
	}

	_keyboardDidShow() {
		this.lastViewHeight.setValue(630);
		Animated
			.timing(this.lastViewHeight, {
				useNativeDriver: false,
				toValue: 320,
				duration: 150,
				easing: Easing.ease,
			})
			.start(() => {});
	}

	_keyboardDidHide() {
		this.lastViewHeight.setValue(320);
		Animated
			.timing(this.lastViewHeight, {
				useNativeDriver: false,
				toValue: 630,
				duration: 150,
				easing: Easing.ease,
			})
			.start(() => {});
	}

	render() {
		var s = require('./../app/style.js');
		const chat = this.props.navigation.getParam('chat', null);

		const messageCards = Object.keys(chat.messages).map(key => {
			var mes = chat.messages[key];
			return <MessageCard message={mes} key={key} />;
		});

		const last_view_height = this.lastViewHeight.interpolate({
			inputRange: [ 0, 70 ],
			outputRange: [ 0, 70 ],
		});

		return (
			<View style={s.container}>
				<StatusBar hidden={true} />
				<View style={{ paddingLeft: 20, paddingRight: 20, marginTop: 45 }}>
					<TouchableOpacity
						style={{
							zIndex: 20,
							marginTop: 4,
							marginLeft: 20,
							position: 'absolute',
						}}
						onPress={() => this.props.navigation.navigate('ScreenHandler')}
					>
						<FontAwesomeIcon style={{ zIndex: 0 }} size={29} color="#F5F5F5" icon={faChevronCircleLeft} />
					</TouchableOpacity>
					<View
						style={{
							width: '100%',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<Text style={{ fontFamily: 'Poppins-Bold', fontSize: 30, color: 'white' }}>
							{chat.user_name}
						</Text>
					</View>
					<Animated.ScrollView style={{ marginTop: 10, height: last_view_height }}>
						{messageCards}
					</Animated.ScrollView>
					<View
						style={{
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<View
							style={{
								borderRadius: 40,
								backgroundColor: '#38304C',
								width: '100%',
								padding: 15,
							}}
						>
							<TouchableOpacity
								style={{
									marginTop: 4,
									marginLeft: 287,
									position: 'absolute',
									borderRadius: 50,
									width: 43,
									height: 43,
									backgroundColor: '#201A30',
									padding: 5,
									justifyContent: 'center',
									alignItems: 'center',
								}}
								onPress={() => this._sendMessage()}
							>
								<FontAwesomeIcon style={{ zIndex: 0 }} size={20} color="#F5F5F5" icon={faPaperPlane} />
							</TouchableOpacity>
							<TextInput
								multiline
								style={{
									maxHeight: 25,
									fontFamily: 'Poppins-Medium',
									paddingTop: -2,
									paddingLeft: 5,
									fontSize: 17,
									color: '#D5D3D9',
								}}
								placeholderTextColor="#665F75"
								placeholder="Nachricht schreiben ..."
								value={this.state.cur_message}
								onFocus={() => this._keyboardDidShow()}
								onBlur={() => this._keyboardDidHide()}
								onChangeText={text => this._onChangeText(text)}
							/>
						</View>
					</View>
				</View>
			</View>
		);
	}
}

class MessageCard extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const mes = this.props.message;

		return (
			<View
				style={{
					marginTop: 30,
					borderTopLeftRadius: 20,
					borderTopRightRadius: 20,
					borderBottomLeftRadius: mes.sender == 'default' ? 20 : 0,
					borderBottomRightRadius: mes.sender == 'default' ? 0 : 20,
					padding: 10,
					paddingLeft: 20,
					minWidth: 100,
					maxWidth: 270,
					backgroundColor: mes.sender == 'default' ? '#38304C' : '#3D384B',
				}}
			>
				<Text style={{ color: 'white', fontFamily: 'Poppins-Medium', fontSize: 16 }}>{mes.text}</Text>
			</View>
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

export default withNavigation(ChatScreen);
