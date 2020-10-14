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
  scrollView = null;
  swiper_width = 0;
  autplay_interval = null;

  constructor(props) {
    super(props);
    this.data = props.data;

    var index = 0;
    this.autplay_interval = setInterval(function() {
      const s_width = Dimensions.get("window").width;
      if (this.scrollView) {
        index++;
        if (index == this.data.length) 
          index = 0;
        this.scrollView.scrollTo({
          x: Math.round(index * this.swiper_width),
          y: 0,
          animated: true
        })
        setTimeout(function() {
          this.onScrolledTo(Math.round(index * (s_width * .8936)), true)
        }.bind(this), 60)
      }
    }.bind(this), 4000)
  }

  onScrolledTo(x_pos, from_autoplay = false) {
    if (!from_autoplay) 
      clearInterval(this.autplay_interval);
    
    const s_width = Dimensions.get("window").width;
    var index = Math.round(x_pos / (s_width * .8936))
    if (this.cur_index != index) {
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

    return (
      <Theme.View shadow={"large"} style={[
          this.props.style, {
            borderRadius: 25
          }
        ]}>
        <ScrollView
          ref={(v) => {
            this.scrollView = v;
          }}
          onScrollEndDrag={(e) => {
            this.onScrolledTo(e.nativeEvent.targetContentOffset.x)
          }}
          onLayout={event => {
            var {
              x,
              y,
              width,
              height
            } = event.nativeEvent.layout;
            this.swiper_width = width;
          }}
          bounces={false}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          pagingEnabled={true}
          style={{

            borderRadius: 25,
            backgroundColor: "white",
            height: s_width
          }}>
          {
            Object.keys(this.data).map(index => {
              const ele = this.data[index];
              return ele.getRenderForPreview(this.swiper_width)
            })
          }
        </ScrollView>
      </Theme.View>
    )

  }
}
