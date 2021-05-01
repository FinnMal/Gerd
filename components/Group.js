import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {Theme} from './../app/index.js';

// GROUP class: component for club group
export default class Group extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: this.props.selected
    };
  }

  _onSelect(selected, rerender) {
    this.state.selected = selected;
    this.props.onSelect(this.props.id, selected);
    if (rerender) 
      this.forceUpdate();
    }
  
  render() {
    return (<Theme.CheckBox label={this.props.name} checked={this.state.selected} onChange={(isSelected, rerender) => this._onSelect(isSelected, rerender)}/>);
  }
}
