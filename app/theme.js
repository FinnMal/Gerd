import React from 'react';
import {
  View as ReactView,
  Text as ReactText,
  TextInput as ReactTextInput,
  TouchableOpacity as ReactTouchableOpacity,
  ActivityIndicator as ReactActivityIndicator,
  StyleSheet,
  Animated
} from 'react-native';
import {useDarkMode} from 'react-native-dynamic'
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import ReactLinearGradient from 'react-native-linear-gradient';
import {usePalette} from 'react-palette';
import {BlurView as ReactBlurView} from "@react-native-community/blur";

const colors = {
  "view": [
    "#2C2C2E", "#E5E5EA"
  ],
  "primary": ["#0B84FF", "#007AFF"]
}

function View(props) {
  const isDarkMode = useDarkMode()
  var shadow = {
    "normal": {
      shadowColor: "#2C2C2E",
      shadowOffset: {
        width: 0,
        height: 0
      },
      shadowOpacity: isDarkMode
        ? 0
        : .3,
      shadowRadius: 10.0
    },
    "large": {
      shadowColor: "black",
      shadowOffset: {
        width: 0,
        height: 0
      },
      shadowOpacity: isDarkMode
        ? 0
        : .4,
      shadowRadius: 18.0
    }
  };

  var color = isDarkMode
    ? colors["view"][0]
    : colors["view"][1];

  if (props.color) 
    color = isDarkMode
      ? colors[props.color][0]
      : colors[props.color][1];
  
  return <Animated.View style={[
      props.style,
      shadow[props.shadow], {
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
      ? colors[props.color][0]
      : colors[props.color][1];
  
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
      ? colors[props.color][0]
      : colors[props.color][1];
  
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
    : "#F2F2F7"

  if (props.color) 
    color = isDarkMode
      ? colors[props.color][0]
      : colors[props.color][1];
  
  return <Animated.View style={[
      props.style, {
        backgroundColor: color
      }
    ]} onLayout={props.onLayout}>{props.children}</Animated.View>;
}

function BlurView(props) {
  const isDarkMode = useDarkMode()
  return (
    <ReactBlurView
      onLayout={props.onLayout}
      blurType={isDarkMode
        ? "dark"
        : "regular"}
      blurAmount={10}
      reducedTransparencyFallbackColor="#121212"
      style={props.style}>{props.children}</ReactBlurView>
  );
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

function TextInput(props) {
  const isDarkMode = useDarkMode()

  var color = isDarkMode
    ? colors["view"][0]
    : colors["view"][1];

  var text_color = isDarkMode
    ? "#ffffff"
    : "#1C1C1E";

  return <ReactTextInput
    onFocus={props.onFocus}
    onBlur={props.onBlur}
    keyboardType={props.keyboardType}
    placeholderTextColor={hexToRGBA(text_color, .8)}
    placeholder={props.placeholder}
    textContentType={props.type}
    secureTextEntry={props.secure}
    style={[
      props.style, {
        color: text_color,
        backgroundColor: color
      }
    ]}
    value={props.value}
    onChangeText={props.onChangeText}/>;
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
        ? colors[props.color][0]
        : colors[props.color][1];
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
    'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)'
    //'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', .01)', 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', .97)'
  ];

  return <ReactLinearGradient style={props.style} start={{
      x: 0,
      y: 0.5
    }} end={{
      x: 0,
      y: .67
    }} colors={colors}>{props.children}</ReactLinearGradient>
}

function ActivityIndicator(props) {
  const isDarkMode = useDarkMode()

  var color = isDarkMode
    ? "#F5F5F5"
    : "#121212"

  if (props.visible) 
    return <ReactActivityIndicator
      style={[
        props.style, {
          transform: [
            {
              scale: props.scale
            }
          ]
        }
      ]}
      size="small"
      color={color}/>
  return null;
}

function hexToRGBA(hex, alpha) {
  if (!/^#([A-Fa-f0-9]{3,4}){1,2}$/.test(hex)) {
    throw new Error("Invalid HEX")
  }
  const hexArr = hex.slice(1).match(new RegExp(`.{${Math.floor((hex.length - 1) / 3)}}`, "g"))
  return hexArr.map(convertHexUnitTo256)
}

function convertHexUnitTo256(hexStr) {
  return parseInt(hexStr.repeat(2 / hexStr.length), 16)
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
  BlurView,
  Text,
  TextInput,
  Icon,
  LinearGradient,
  ActivityIndicator
};
