import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Picker} from 'react-native';
import {Theme} from './../app/index.js';
import BottomSheet from './BottomSheet.js';
import InputBox from './InputBox.js';

// SELECTBOX class: component for a item selection
export default class SelectBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selected_value: 0
    }

    if (!this.props.mode) 
      this.props.mode = 'datetime'
  }

  render() {
    const elements = this.props.elements.map(label => {
      return <Picker.Item label={label} value={this.props.elements.indexOf(label)}/>
    });
    return (
      <View>
        <InputBox
          dummy={true}
          onRef={(ref) => this.input = ref}
          label={this.props.label}
          width={this.props.width}
          marginTop={this.props.marginTop}
          value={this.props.value}
          onPress={() => this.bottom_sheet.open()}/>
        <BottomSheet
          ref={(ref) => {
            this.bottom_sheet = ref;
          }}
          color={'selected_view'}
          label={this.props.sheet_headline}
          height={345}
          onDone={() => {
            this.forceUpdate()
          }}>
          <Theme.Picker
            selectedValue={this.state.selected_value}
            style={{
              height: 200,
              width: this.props.picker_width
            }}
            onValueChange={(itemValue, itemIndex) => {
              this.state.selected_value = itemValue
              this.props.value = itemValue
              if (this.props.onChange) 
                this.props.onChange(this.props.elements[itemValue], itemIndex)
              this.forceUpdate();
            }}>
            {elements}
          </Theme.Picker>
        </BottomSheet>
      </View>
    );
  }
}
