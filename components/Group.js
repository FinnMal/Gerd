import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import CheckBox from '@react-native-community/checkbox';

export default class Group extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: this.props.selected
    };
  }

  _onSelect(selected) {
    this.state.selected = selected;
    this.props.onSelect(this.props.id, selected);
  }

  render() {
    return (
      <TouchableOpacity
        style={{
          marginLeft: 5,
          paddingTop: 14,
          paddingBottom: 14,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          flexDirection: 'row'
        }}
        onPress={() => this._onSelect(!this.state.selected)}>
        <View style={{
            height: 25,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <CheckBox
            lineWidth={2}
            animationDuration={0.15}
            onCheckColor="#0DF5E3"
            onTintColor="#0DF5E3"
            value={this.state.selected}
            onValueChange={isSelected => this._onSelect(isSelected)}
            style={{
              height: 25,
              width: 25
            }}/>
        </View>
        <View style={{
            marginLeft: 20,
            height: 25,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <Text style={{
              opacity: 0.7,
              color: 'white',
              fontFamily: 'Poppins-Bold',
              fontSize: 19
            }}>
            {this.props.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}
