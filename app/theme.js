import React from 'react';
import {
  View as ReactView,
  Text as ReactText,
  TextInput as ReactTextInput,
  TouchableOpacity as ReactTouchableOpacity,
  StyleSheet,
  Animated
} from 'react-native';
import {useDarkMode} from 'react-native-dynamic'
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import ReactLinearGradient from 'react-native-linear-gradient';

const colors = {
  "primary": ["#00e0b9", "#16FFD7"]
}

function View(props) {
  const isDarkMode = useDarkMode()

  var color = isDarkMode
    ? "#1C1C1E"
    : "white";

  if (props.color) 
    color = isDarkMode
      ? colors[props.color][1]
      : colors[props.color][0];
  
  return <Animated.View style={[
      props.style, {
        backgroundColor: color
      }
    ]}>{props.children}</Animated.View>;
}

function SelectedView(props) {
  const isDarkMode = useDarkMode()

  var color = isDarkMode
    ? "#2C2C2E"
    : "#E5E5EA";

  if (props.color) 
    color = isDarkMode
      ? colors[props.color][1]
      : colors[props.color][0];
  
  return <Animated.View style={[
      props.style, {
        backgroundColor: color
      }
    ]}>{props.children}</Animated.View>;
}

function LightView(props) {
  const isDarkMode = useDarkMode()

  var color = isDarkMode
    ? "#636366"
    : "#C7C7CC";

  if (props.color) 
    color = isDarkMode
      ? colors[props.color][1]
      : colors[props.color][0];
  
  return <Animated.View style={[
      props.style, {
        backgroundColor: color
      }
    ]}>{props.children}</Animated.View>;
}

function BackgroundView(props) {
  const isDarkMode = useDarkMode()

  var color = isDarkMode
    ? "#1C1C1E"
    : "#F9F9F9"

  if (props.color) 
    color = isDarkMode
      ? colors[props.color][1]
      : colors[props.color][0];
  
  return <Animated.View style={[
      props.style, {
        backgroundColor: color
      }
    ]}>{props.children}</Animated.View>;
}

function Text(props) {
  const isDarkMode = useDarkMode()

  var color = isDarkMode
    ? "white"
    : "#1C1C1E";

  if (props.color) 
    color = isDarkMode
      ? colors[props.color][0]
      : colors[props.color][1];
  
  return <Animated.Text style={[
      props.style, {
        color: color
      }
    ]}>{props.children}</Animated.Text>;
}

function TouchableOpacity(props) {
  const isDarkMode = useDarkMode()
  return <ReactTouchableOpacity onPress={props.onPress} style={[props.style]}>{props.children}</ReactTouchableOpacity>;
}

function Icon(props) {
  const isDarkMode = useDarkMode()

  var color = isDarkMode
    ? "#F5F5F5"
    : "#121212";

  if (props.color) {
    if (colors[props.color]) {
      color = isDarkMode
        ? colors[props.color][1]
        : colors[props.color][0];
    }
  }

  return <FontAwesomeIcon size={props.size} style={[
      props.style, {
        color: color
      }
    ]} icon={props.icon}>{props.children}</FontAwesomeIcon>;
}

function LinearGradient(props) {
  const isDarkMode = useDarkMode()

  var rgb = hexToRgb(
    props.color
      ? props.color
      : "#007AFF"
  )
  var colors = [
    //'rgba(255, 255, 255, 0.0000001)', 'rgba(28, 28, 30, 0.95)'
    'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', .01)',
    'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', .97)'
  ];

  return <View style={props.style}>{props.children}</View>
  return <ReactLinearGradient style={props.style} start={{
      x: 0,
      y: 0.5
    }} end={{
      x: 0,
      y: .67
    }} colors={colors}>{props.children}</ReactLinearGradient>
}

function hexToRgb(hex) {
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ]
    : null;
}

export {
  TouchableOpacity,
  View,
  SelectedView,
  LightView,
  BackgroundView,
  Text,
  Icon,
  LinearGradient
};
