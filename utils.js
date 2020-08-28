import React from 'react';
import { Alert, AsyncStorage } from 'react-native';

const USER_ID = '0';

//Reads the user ID
export async function getUserID(cb) {
	try {
		const value = await AsyncStorage.getItem('USER_ID');
		if (value == null) {
			return cb(null, 'no_id_found');
			//TODO: Show login or register screen
			/*firebase.auth().createUserWithEmailAndPassword("admin5@example.com", "Test12345").then((res) => {
        firebase.database().ref('user/' + res.user.uid).set({
          email: "admin5@example.com"
        })
        saveUserID(function(error){
            return cb(res.user.uid, error)
          }, res.user.uid)
      }).catch(function(e) {
        return cb(null, e)

    });
    */
		} else
			return cb(value, false);
	} catch (e) {
		return cb(null, e);
	}
}

export function getAgoText(time) {
	var cur_time = new Date().getTime() / 1000;
	if (cur_time > time) {
		var diff = cur_time - time;
		var ago_pre = 'Vor ';
	} else if (time > cur_time) {
		var diff = time - cur_time;
		var ago_pre = 'In ';
	} else
		return 'Gerade eben';

	if (diff < 60) var ago = Math.round(diff) + ' Sek.';
	else if (diff > 59 && diff < 3600) var ago = Math.round(diff / 60) + ' Min.';
	else if (diff > 3599 && diff < 86400) var ago = Math.round(diff / 3600) + ' Std.';
	else if (diff > 86399 && diff < 604800) var ago = Math.round(diff / 86400) + ' Tagen';
	else if (diff > 604799 && diff < 2592000) var ago = Math.round(diff / 604800) + ' Wochen';
	else if (diff > 2591999 && diff < 31536000) var ago = Math.round(diff / 2592000) + ' Monaten';
	else if (diff > 31535999) var ago = Math.round(diff / 31536000) + ' Jahren';
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
export function showAlert(title, msg, btnText = 'Try Again', callback = false, error = true, cancelable = true) {
	if (callback === false || isNull(callback))
		callback = function() {
			console.log(btnText + ' pressed');
		};
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