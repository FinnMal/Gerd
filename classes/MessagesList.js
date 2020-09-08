import React, { Component } from 'react';

import { AppRegistry, StyleSheet, Text, View, Image, TextInput, Button, TouchableHighlight } from 'react-native';
import database from '@react-native-firebase/database';
import { Message } from './Message.js';

export class MessagesList extends React.Component {
	constructor(props) {
		super(props);

		const utils = this.props.utils;

		this.state = {
			utils: utils,
			uid: utils.getUserID(),
			messages: {},
			refs: {},
		};

		console.log('users/' + this.state.uid + '/clubs');
		database().ref('users/' + this.state.uid + '/clubs').on(
			'value',
			(function(snap) {
				console.log('user clubs changed');
				const clubs = snap.val();
				this._stopAllClubListener();
				Object.keys(clubs).map(key => {
					const club = clubs[key];
					this._startClubListener(club.club_id);
				});
			}).bind(this)
		);
	}

	_stopAllClubListener() {
		Object.keys(this.state.refs).map(key => {
			var ref = this.state.refs[key];
			ref.off();
		});
		this.forceUpdate();
	}

	_startClubListener(club_id) {
		this.state.refs[club_id] = database().ref('clubs/' + club_id + '/messages');
		this.state.refs[club_id].on(
			'value',
			(function(snap) {
				var messages = snap.val();
				if (messages) {
					Object.keys(messages).map(mes_id => {
						if (!this.state.messages[mes_id]) {
							this.state.messages[mes_id] = {
								club_id: club_id,
							};
						}
					});
				}
			}).bind(this)
		);
	}

	render() {
		const messagesList = Object.keys(this.state.messages).map(mes_id => {
			const club_id = this.state.messages[mes_id].club_id;
			return <Message club_id={club_id} mes_id={mes_id} utils={this.state.utils} />;
		});
		return messagesList;
	}
}
