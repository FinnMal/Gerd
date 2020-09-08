import React from 'react';
import { Alert, AsyncStorage } from 'react-native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

var USER_ID = '0';
var ACCOUNT_TYPE = '0';
var NAVIGATION = null;
this.state = {};

auth().onAuthStateChanged(
	(function(user) {
		console.log('onAuthStateChanged utils: ' + user.uid);
		USER_ID = user.uid;
	}).bind(this)
);

//Reads the user ID
export function getUserID() {
	return USER_ID;
}

export function setUserID(id) {
	USER_ID = id;
}

export function setAccountType(type) {
	ACCOUNT_TYPE = type;
}

export function getAccountType() {
	return ACCOUNT_TYPE;
}

export function setNavigation(nav) {
	NAVIGATION = nav;
}

export function getNavigation() {
	return NAVIGATION;
}

export function startChat(user_id, cb) {
	//TODO: check if a chat with this user already exists
	var new_chat = {
		user_id_1: USER_ID,
		user_id_2: user_id,
	};

	var chatRef = database().ref('chats').push(new_chat);
	database().ref('chats/' + chatRef.key + '/id').set(chatRef.key);

	database().ref('users/' + USER_ID + '/chats/' + chatRef.key + '/chat_id').set(chatRef.key);
	database().ref('users/' + user_id + '/chats/' + chatRef.key + '/chat_id').set(chatRef.key);

	if (cb) cb();
}

export async function setMessageRead(mes_id, read = true) {
	try {
		await AsyncStorage.setItem(mes_id + '_read', 'yes');
	} catch (e) {
	}
}

export function hasReadMessage(mes_id) {
	const read = AsyncStorage.getItem(mes_id + '_read');

	if (read == 'yes') alert(mes_id + ' read');
	else alert(mes_id + ' not read');

	return read == 'yes';
}

export function getAgoSec(time) {
	var cur_time = new Date().getTime() / 1000;
	if (cur_time > time) return cur_time - time;
	if (time > cur_time) return time - cur_time;
	return 0;
}

export function getAgoText(time, with_ago_pre = true, with_in_pre = true, small_text = false) {
	var ago_pre = '';
	var cur_time = new Date().getTime() / 1000;
	if (cur_time > time) {
		var diff = cur_time - time;
		ago_pre = with_ago_pre ? 'Vor ' : '';
	} else if (time > cur_time) {
		var diff = time - cur_time;
		ago_pre = with_in_pre ? 'In  ' : '';
	} else
		return +(!small_text ? ' Gerade eben' : 'now');

	console.log('time: ' + time);
	if (diff < 60) var ago = Math.round(diff) + (!small_text ? ' Sek.' : ' sec');
	else if (diff > 59 && diff < 3600) var ago = Math.round(diff / 60) + (!small_text ? ' Min.' : ' min');
	else if (diff > 3599 && diff < 86400) var ago = Math.round(diff / 3600) + (!small_text ? ' Std.' : ' std');
	else if (diff > 86399 && diff < 604800) var ago = Math.round(diff / 86400) + (!small_text ? ' Tagen' : ' day');
	else if (diff > 604799 && diff < 2592000) var ago = Math.round(diff / 604800) + (!small_text ? ' Wochen' : ' w');
	else if (diff > 2591999 && diff < 31536000) var ago = Math.round(diff / 2592000) + (!small_text ? ' Monaten' : ' m');
	else if (diff > 31535999) var ago = Math.round(diff / 31536000) + (!small_text ? ' Jahren' : ' j');

	//if (small_text) ago = ago.toLowerCase().split('.').join('');

	return ago_pre + ago;
}

export function msToHMS(duration) {
	var milliseconds = parseInt(duration % 1000 / 100),
		seconds = parseInt(duration / 1000 % 60),
		minutes = parseInt(duration / (1000 * 60) % 60),
		hours = parseInt(duration / (1000 * 60 * 60) % 24);

	hours = hours < 10 ? '0' + hours : hours;
	minutes = minutes < 10 ? '0' + minutes : minutes;
	seconds = seconds < 10 ? '0' + seconds : seconds;

	return hours + ':' + minutes + ':' + seconds;
}

//Deletes the user ID
export async function deleteUserID(cb) {
	try {
		await AsyncStorage.removeItem('USER_ID');
		return cb(null);
	} catch (e) {
		return cb(e);
	}
}

//Saves the user ID
export async function saveUserID(cb, id, navigate) {
	try {
		await AsyncStorage.setItem('USER_ID', id);
		return cb(false);
	} catch (e) {
		return cb(e);
	}
}

//Formats an number with commas
export function format_int(num) {
	return num.toLocaleString(navigator.language, { minimumFractionDigits: 0 });
}

//Shows an alert
export function showAlert(title, msg, btnText = 'Ok', callback = false, error = true, cancelable = true) {
	if (callback === false || isNull(callback))
		callback = function() {
			console.log(btnText + ' pressed');
		};
	if (btnText.lenght == 0) {
		if (error) {
			btns = {
				text: btnText,
				onPress: callback,
				style: 'cancel',
			};
		} else {
			btns = {
				text: btnText,
				onPress: callback,
			};
		}
		Alert.alert(title, msg, [ btns ], { cancelable: cancelable });
	} else {
		var btns = [];
		btnText.forEach((text, i) => {
			var btn = {
				text: text,
				onPress: () => callback(i),
				style: i == 0 ? 'cancel' : '',
			};
			btns.push(btn);
		});
		Alert.alert(title, msg, btns, { cancelable: cancelable });
	}
}

//Resets the CakeHype app
export function resetApp(q = true) {
	if (q) {
		Alert.alert(
			'Reset App',
			'Do you really want to reset the CakeHype App? Your account will not be deleted. You have the option to log in again.',
			[
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{ text: 'OK', onPress: () => this.resetApp(false) },
			],
			{ cancelable: false }
		);
	} else {
		deleteUserID(function(error) {
			if (!error) BackHandler.exitApp();
			else showAlert('Error while forgetting the account', error);
		});
	}
}

//Returns true if value is not empty
export function isNull(val) {
	return val == undefined || val == '' || val == 'null';
}

//Checks if the password meets the requirements and returns true/false
export function check_password_validity(pW, re_entered_pW = false) {
	if (!pW) showAlert('Missing Password', 'Please enter a password');
	else if (pW.length < 6) showAlert('Password to short', 'Please enter a password with more than 6 characters');
	else if (/^\d+$/.test(pW)) showAlert('Invalid password', 'Please enter password with at least one letter');
	else if (/^[a-zA-Z]+$/.test(pW)) showAlert('Invalid password', 'Please enter a password with at least one digit');
	else if (pW.match(/^[^a-zA-Z0-9]+$/))
		showAlert('Invalid password', 'Please a password with not only special characters');
	else if (pW != re_entered_pW || re_entered_pW == false)
		showAlert('Passowrds do not match', 'The re-entered password does not match your password');
	else
		return true;
	return false;
}

//Checks if the username meets the requirements and returns true/false
export function check_username_validity(uN) {
	if (!uN) showAlert('Missing Username', 'Please enter a username');
	else if (isUsernameAssigned(uN)) showAlert('Invalid Username', 'This username is already given');
	else if (uN.length > 30) showAlert('Username to long', 'Please enter a username with less than 30 characters');
	else if (!uN.match('[A-z]'))
		showAlert('Illegal characters in username', 'Please enter a username with letters and digits');
	else if (/^\d+$/.test(uN)) showAlert('Illegal username', 'Please add letters to your username');
	else if (uN.charAt(0) == '.' || uN.slice(-1) == '.')
		showAlert('Illegal username', 'Dots at begin/end of username are not allowed');
	else
		return true;
	return false;
}

//Checks if the email meets the requirements and returns true/false
export function check_email_validity(eM) {
	let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	if (!eM) showAlert('Missing email', 'Please enter your email adress');
	else if (!reg.test(eM)) showAlert('Invalid email', 'Please a valid email adress');
	else return true;
	return false;
}

export function validate_email(eM) {
	let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	return reg.test(String(eM).toLowerCase());
}
