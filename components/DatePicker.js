import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {Theme} from './../app/index.js';
import BottomSheet from './BottomSheet.js';
import InputBox from './InputBox.js';

export default class DatePicker extends React.Component {
  constructor(props) {
    super(props);

    if (!this.props.mode) 
      this.props.mode = 'datetime'
  }

  dateToString(date) {
    if (date) {
      if (this.props.mode == 'date') {
        return date.toLocaleDateString("de-DE", {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
      if (this.props.mode == 'time') {
        return date.toLocaleDateString("de-DE", {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return date.toLocaleDateString("de-DE", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return ''
  }

  render() {
    return (
      <View>
        <InputBox
          dummy={true}
          onRef={(ref) => this.input = ref}
          label={this.props.label}
          width={this.props.width}
          marginTop={this.props.marginTop}
          value={this.dateToString(this.props.value)}
          onPress={() => this.bottom_sheet.open()}/>
        <BottomSheet
          ref={(ref) => {
            this.bottom_sheet = ref;
          }}
          color={'selected_view'}
          label="Datum auswählen"
          height={345}
          onDone={() => {
            this.forceUpdate()
          }}>
          <Theme.DatePicker
            locale="de"
            mode={this.props.mode}
            minuteInterval={5}
            date={this.props.value}
            onChange={(v) => {
              this.props.value = v
              if (this.props.onChange) 
                this.props.onChange(v)
              this.forceUpdate();
            }}></Theme.DatePicker>
        </BottomSheet>
      </View>
    );
  }
}
