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
			user_clubs_ref: database().ref('users/' + utils.getUserID() + '/clubs'),
		};

		this._startUserClubsListener();
	}

	_startUserClubsListener() {
		this.state.user_clubs_ref.on(
			'value',
			(function(snap) {
				console.log('user clubs changed');
				const clubs = snap.val();
				this._stopAllClubsListener();
				Object.keys(clubs).map(key => {
					this._startClubListener(key);
				});
			}).bind(this)
		);
	}

	_stopUserClubsListener() {
		this.state.user_clubs_ref.off();
	}

	_stopAllClubsListener() {
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

	refresh(cb) {
		Object.keys(this.state.messages).map(mes_id => {
			var mes = this.state.messages[mes_id];
			if (mes) {
				if (mes.object) {
					this.state.messages[mes_id].refreshing = true;
					mes.object.refresh(
						(function() {
							this.state.messages[mes_id].refreshing = false;
						}).bind(this)
					);
				}
			}
		});

		var total_refreshing = this.state.messages.length;
		while (total_refreshing > 0) {
			Object.keys(this.state.messages).map(mes_id => {
				var mes = this.state.messages[mes_id];
				if (mes) {
					console.log(mes.refreshing);
					if (!mes.refreshing) total_refreshing--;
				}
			});
		}
		if (cb) cb();
	}

	onVisibilityChange(mes_id, visible) {
		var total_visible = 0;
		console.log('-------------------');
		this.state.messages[mes_id].visible = visible;
		Object.keys(this.state.messages).map(mes_id => {
			if (this.state.messages[mes_id].visible) {
				console.log(mes_id + ' is visible');
				total_visible++;
			}
		});
		console.log('total_visible: ' + total_visible);
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
					ref={component => {
						this.state.messages[mes_id].object = component;
					}}
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
