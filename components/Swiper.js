import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActionSheetIOS,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
  ScrollView
} from "react-native";
import AutoHeightImage from "react-native-auto-height-image";
import FileViewer from "react-native-file-viewer";
import {FontAwesomeIcon} from "@fortawesome/react-native-fontawesome";
import {faPlusCircle, faChevronCircleLeft, faChevronRight} from "@fortawesome/free-solid-svg-icons";
import {Theme} from './../app/index.js';

import database from "@react-native-firebase/database";

export default class Swiper extends React.Component {
  cur_index = 0;
  data = [];
  elements = <View/>;
  constructor(props) {
    super(props);
    this.data = props.data;

  }

  onScrolledTo(x_pos) {
    const s_width = Dimensions.get("window").width;
    var index = x_pos / (s_width * .88)
    if (this.cur_index != index) {
      console.log(index)
      this.data[this.cur_index].onHide();
      this.data[index].onShow(
        this.cur_index < index
          ? 'left'
          : 'right'
      );
      this.cur_index = index;
    }
  }

  render() {
    const s_width = Dimensions.get("window").width;

    this.elements = Object.keys(this.data).map(index => {
      const ele = this.data[index];
      return ele.getRenderForPreview()
    });

    return (
      <ScrollView
        onScrollEndDrag={(e) => {
          this.onScrolledTo(e.nativeEvent.targetContentOffset.x)
        }}
        bounces={false}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        pagingEnabled={true}
        style={{
          marginTop: 10,
          marginLeft: 20,
          marginRight: 25,
          shadowColor: "black",
          shadowOffset: {
            width: 0,
            height: 0
          },
          shadowOpacity: 0.4,
          shadowRadius: 15.0,
          borderRadius: 20,
          backgroundColor: "white",
          height: s_width * 1.1
        }}>
        {this.elements}
      </ScrollView>
    )

  }
}
