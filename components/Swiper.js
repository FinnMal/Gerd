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
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlusCircle, faChevronCircleLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Theme } from './../app/index.js';
import SwiperEvent from './SwiperEvent.js';

import database from "@react-native-firebase/database";

// SWIPER class: swiper component for events on homescreen
export default class Swiper extends React.Component {
  cur_index = 0;
  data = [];
  elements = <View />;
  scrollView = null;
  swiper_width = 0;
  autplay_interval = null;

  constructor(props) {
    super(props);
    this.data = [];
    this.autoplay = true;
    props.data.forEach((event, i) => {
      this.data.push(new SwiperEvent(event))
    });
  }

  componentWillUnmount() {
    clearInterval(this.autplay_interval);
  }

  componentDidMount() {
    this.forceUpdate();
    this.cur_index = -1;
    this.onScrolledTo(0, true)
    this.resetInterval()
  }

  resetInterval() {
    var index = 0;
    clearInterval(this.autplay_interval);
    if (this.autoplay) {
      this.autplay_interval = setInterval(function () {
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
          setTimeout(function () {
            this.onScrolledTo(Math.round(index * (s_width * .8936)), true)
          }.bind(this), 60)
        }
      }.bind(this), 4000)
    }
  }

  onScrolledTo(x_pos, from_autoplay = false) {
    if (!from_autoplay)
      clearInterval(this.autplay_interval);

    const s_width = Dimensions.get("window").width;
    var index = Math.round(x_pos / (s_width * .8936))
    if (this.cur_index != index) {
      if (this.cur_index > -1) {
        if (this.data[this.cur_index])
          this.data[this.cur_index].onHide();
      }

      if (this.data[index])
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
    this.autoplay = this.props.autoplay;
    this.resetInterval();

    if (this.props.data.length > 0) {
      this.data = []
      this.props.data.forEach((event, i) => {
        this.data.push(new SwiperEvent(event))
      });
      console.log('[SWIPER.JS] rerender')
      return (
        <Theme.View color={'view'} shadow={"normal"} style={[
          this.props.style, {
            borderRadius: 20,
            height: s_width
          }
        ]}>
          <ScrollView
            ref={(v) => {
              this.scrollView = v;
              if (v)
                v.scrollTo({ x: 0, y: 0, animated: true })
            }}
            onScrollEndDrag={(e) => {
              console.log(e.nativeEvent.targetContentOffset.x)
              this.onScrolledTo(e.nativeEvent.targetContentOffset.x)
            }}
            onLayout={event => {
              var {
                x,
                y,
                width,
                height
              } = event.nativeEvent.layout;
              if (width > 1 && this.swiper_width == 0) {
                this.swiper_width = width;
                this.forceUpdate();
              }
            }}
            scrollEnabled={true}
            bounces={false}
            nestedScrollEnabled={true}
            horizontal={true}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            style={{
              borderRadius: 20,
            }}>
            {
              Object.keys(this.data).map(index => {
                const ele = this.data[index];
                return ele.render(this.swiper_width, index)
              })
            }
          </ScrollView>
        </Theme.View>
      )
    }
    return null;

  }
}
