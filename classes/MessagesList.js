import React, { Component } from 'react';

import { AppRegistry, StyleSheet, Text, View, Image, TextInput, Button, TouchableHighlight } from 'react-native';
import database from '@react-native-firebase/database';
import { Message } from './Message.js';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faInbox, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

export class MessagesList extends React.Component {
	constructor(props) {
		super(props);

		const utils = this.props.utils;

		this.state = {
			utils: utils,
			uid: utils.getUserID(),
			messages: {},
			refs: {},
			last_section: null,
			shows_messages: true,
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
		//this.forceUpdate();
	}

	_startClubListener(club_id) {
		this.state.refs[club_id] = database().ref('clubs/' + club_id + '/messages');
		this.state.refs[club_id].on(
			'value',
			(function(snap) {
				console.log('_startClubListener triggerd: ' + club_id);
				var messages = snap.val();
				if (messages) {
					Object.keys(messages).map(mes_id => {
						if (!this.state.messages[mes_id]) {
							this.state.messages[mes_id] = {
								visible: true,
								club_id: club_id,
							};
						}
					});
				}
			}).bind(this)
		);
	}

	onVisibilityChange(mes_id, visible) {
		var total_visible = 0;
		this.state.messages[mes_id].visible = visible;
		Object.keys(this.state.messages).map(mes_id => {
			if (this.state.messages[mes_id].visible) total_visible++;
		});
		if (total_visible == 0) {
			if (this.state.shows_messages) {
				this.state.shows_messages = false;
				this.forceUpdate();
			}
		}
	}

	render() {
		var messagesList = Object.keys(this.state.messages).map(mes_id => {
			const club_id = this.state.messages[mes_id].club_id;
			this.state.messages[mes_id].visible = true;
			return (
				<Message
					showIfSectionIs={this.props.section}
					onVisibilityChange={(id, visible) => this.onVisibilityChange(id, visible)}
					club_id={club_id}
					mes_id={mes_id}
					utils={this.state.utils}
				/>
			);
		});
		messagesList = messagesList.filter(function(e) {
			return e != null;
		});
		if (this.state.last_section != this.props.section) this.state.shows_messages = true;

		console.log('[shows_messages]: ' + this.state.shows_messages);
		if (!this.state.shows_messages && this.state.last_section != null)
			messagesList.push(
				<View style={{ opacity: 0.4, marginTop: 200, justifyContent: 'center', alignItems: 'center' }}>
					<FontAwesomeIcon style={{}} size={65} color="white" icon={faInbox} />
					<Text
						style={{
							margin: 20,
							textTransform: 'uppercase',
							textAlign: 'center',
							color: 'white',
							fontFamily: 'Poppins-ExtraBold',
							fontSize: 24,
						}}
					>
						{this.props.section == 0 ? 'Keine ungelesenen Mitteilungen' : 'Keine Mitteilungen'}

					</Text>
				</View>
			);

		this.state.last_section = this.props.section;

		return <View style={{ marginBottom: 80 }}>{messagesList}</View>;
	}
}
