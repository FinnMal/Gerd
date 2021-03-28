import React from 'react';
import {
  View as ReactView,
  Text as ReactText,
  TextInput as ReactTextInput,
  TouchableOpacity as ReactTouchableOpacity,
  ActivityIndicator as ReactActivityIndicator,
  StyleSheet,
  Animated,
  Switch as ReactSwitch
} from 'react-native';
import {useDarkMode} from 'react-native-dynamic'
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import ReactLinearGradient from 'react-native-linear-gradient';
import {usePalette} from 'react-palette';
import {BlurView as ReactBlurView} from "@react-native-community/blur";
import {default as ReactCheckBox} from '@react-native-community/checkbox';
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import {AnimatedCircularProgress as ReactAnimatedCircularProgress} from "react-native-circular-progress";

// first value is for darkmode
const colors = {
  "view": [
    "#1C1C1E", "#FFFFFF"
  ],
  "background_view": [
    "black", "#F2F1F6"
  ],
  "selected_view": [
    "#2C2C2E", "#E4E3E9"
  ],
  "primary": [
    "#0B84FF", "#007AFF"
  ],
  "danger": [
    "#FF3B31", "#FF453A"
  ],
  "success": [
    "#30D158", "#33C759"
  ],
  "inacitve": [
    "#B4B7CB", "#B4B7CB"
  ],
  'teal': ['#64D2FF', '#5AC7FA']
}

function View(props) {
  var isDarkMode = useDarkMode()
  if (props.invertedColor) {
    isDarkMode = !isDarkMode;
  }

  var shadow = {
    "normal": {
      shadowColor: "#E4E3E9",
      shadowOffset: {
        width: 0,
        height: 0
      },
      shadowOpacity: isDarkMode
        ? 0
        : 1,
      shadowRadius: 9.0
    },
    "large": {
      shadowColor: "black",
      shadowOffset: {
        width: 0,
        height: 0
      },
      shadowOpacity: isDarkMode
        ? 0
        : .3,
      shadowRadius: 18.0
    }
  };

  var color = props.color;
  if (!props.color) {
    color = isDarkMode
      ? colors["view"][0]
      : colors["view"][1];
  } else {
    if (colors[props.color]) 
      color = isDarkMode
        ? colors[props.color][0]
        : colors[props.color][1];
    }
  
  if (props.colorOpacity < 1 && props.colorOpacity > 0) {
    color = hexToRGBA(color, props.colorOpacity, true);
  }

  return <Animated.View
    style={[
      shadow[props.shadow], {
        backgroundColor: props.hasColor !== false
          ? color
          : null
      },
      props.style
    ]}>{props.children}</Animated.View>;
}

function SelectedView(props) {
  const isDarkMode = useDarkMode()

  var color = isDarkMode
    ? colors["selected_view"][0]
    : colors["selected_view"][1]

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
  var isDarkMode = useDarkMode()
  if (props.invertedColor) {
    isDarkMode = !isDarkMode;
  }

  var color = isDarkMode
    ? colors["background_view"][0]
    : colors["background_view"][1];

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

  var blurType = ["xlight", "extraDark"];
  if (props.blurType) 
    blurType = props.blurType;
  
  return (
    <ReactBlurView onLayout={props.onLayout} blurType={isDarkMode
        ? blurType[1]
        : blurType[0]} blurAmount={10} style={props.style}>{props.children}</ReactBlurView>
  );
}

function Text(props) {
  var isDarkMode = useDarkMode()
  if (props.invertedColor) {
    isDarkMode = !isDarkMode;
  }

  var color = isDarkMode
    ? "white"
    : "black";

  var backgroundColor = props.backgroundColor;
  if (colors[backgroundColor]) 
    backgroundColor = isDarkMode
      ? colors[backgroundColor][0]
      : colors[backgroundColor][1];
  
  if (props.color) 
    color = isDarkMode
      ? colors[props.color][0]
      : colors[props.color][1];
  
  return <Animated.Text
    numberOfLines={props.numberOfLines}
    style={[
      props.style, {
        color: backgroundColor
          ? calculateTextColor(backgroundColor)
          : color
      }
    ]}>{props.children}</Animated.Text>;
}

function TextOnColor(props) {
  const isDarkMode = useDarkMode()

  var color = props.backgroundColor;
  if (colors[color]) 
    color = isDarkMode
      ? colors[color][0]
      : colors[color][1];
  
  return <Animated.Text style={[
      props.style, {
        color: calculateTextColor(color)
      }
    ]}>{props.children}</Animated.Text>;
}

function calculateTextColor(color) {
  var rgb = hexToRGBA(color)

  const brightness = Math.round(((parseInt(rgb[0]) * 299) + (parseInt(rgb[1]) * 587) + (parseInt(rgb[2]) * 114)) / 1000);
  return (brightness > 125)
    ? 'black'
    : 'white';
}

function TextInput(props) {
  const isDarkMode = useDarkMode()

  var color = props.color;
  if (!colors[color]) 
    color = 'view';
  color = isDarkMode
    ? colors[color][0]
    : colors[color][1];

  var text_color = isDarkMode
    ? "#ffffff"
    : "#1C1C1E";

  return <ReactTextInput
    ref={(input) => {
      if (props.onRef) 
        props.onRef(input);
      }}
    multiline={props.multiline}
    numberOfLines={props.numberOfLines}
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
        backgroundColor: props.hasBackgroundColor !== false
          ? color
          : null
      }
    ]}
    value={props.value}
    onChangeText={props.onChangeText}/>;
}

function TouchableOpacity(props) {
  const isDarkMode = useDarkMode()

  var backgroundColor = "";
  if (colors[props.color]) {
    backgroundColor = isDarkMode
      ? colors[props.color][0]
      : colors[props.color][1];
  }

  return <ReactTouchableOpacity onPress={props.onPress} style={[
      {
        backgroundColor: backgroundColor
      },
      props.style
    ]}>{props.children}</ReactTouchableOpacity>;
}

function Icon(props) {
  const isDarkMode = useDarkMode()

  var color = isDarkMode
    ? "#F5F5F5"
    : "#121212";

  var backgroundColor = props.backgroundColor;
  if (colors[backgroundColor]) 
    backgroundColor = isDarkMode
      ? colors[backgroundColor][0]
      : colors[backgroundColor][1];
  
  if (props.color) {
    if (colors[props.color]) {
      color = isDarkMode
        ? colors[props.color][0]
        : colors[props.color][1];
    }
  }
  return <FontAwesomeIcon
    size={props.size}
    style={[
      props.style, {
        color: backgroundColor
          ? calculateTextColor(backgroundColor)
          : color
      }
    ]}
    icon={props.icon}>{props.children}</FontAwesomeIcon>;
}

function IconOnColor(props) {
  const isDarkMode = useDarkMode()

  var color = props.backgroundColor;
  if (colors[color]) 
    color = isDarkMode
      ? colors[color][0]
      : colors[color][1];
  
  return <FontAwesomeIcon size={props.size} style={[
      props.style, {
        color: calculateTextColor(color)
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

  var backgroundColor = props.backgroundColor;
  if (colors[backgroundColor]) 
    backgroundColor = isDarkMode
      ? colors[backgroundColor][0]
      : colors[backgroundColor][1];
  
  if (props.visible) 
    return <ReactActivityIndicator
      style={[
        props.style, {
          transform: [
            {
              scale: props.scale
                ? props.scale
                : 1
            }
          ]
        }
      ]}
      size="small"
      color={backgroundColor
        ? calculateTextColor(backgroundColor)
        : color}/>
  return null;
}

function hexToRGBA(hex, alpha = 1, returnString = false) {
  if (!/^#([A-Fa-f0-9]{3,4}){1,2}$/.test(hex)) {
    throw new Error("Invalid HEX")
  }
  const hexArr = hex.slice(1).match(new RegExp(`.{${Math.floor((hex.length - 1) / 3)}}`, "g"))
  if (!returnString) 
    return hexArr.map(convertHexUnitTo256)
  else {
    var rgba = hexArr.map(convertHexUnitTo256);
    return 'rgba(' + rgba[0] + ', ' + rgba[1] + ', ' + rgba[2] + ', ' + alpha + ')';
  }
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

function CheckBox(props) {
  const isDarkMode = useDarkMode()

  var color = isDarkMode
    ? colors["primary"][0]
    : colors["primary"][1]

  var tintColor = isDarkMode
    ? colors["selected_view"][0]
    : colors["selected_view"][1]

  return <ReactView
    style={[
      props.style, {
        marginLeft: 5,
        paddingTop: 14,
        paddingBottom: 14,
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        flexDirection: 'row'
      }
    ]}>
    <ReactView style={{
        height: 25,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
      <ReactCheckBox
        lineWidth={2}
        animationDuration={0.12}
        onCheckColor={color}
        tintColor={tintColor}
        value={props.checked}
        style={{
          height: 25,
          width: 25
        }}
        onValueChange={(checked) => {
          ReactNativeHapticFeedback.trigger("impactMedium");
          if (props.onChange) 
            props.onChange(checked, false);
          }}/>
    </ReactView>
    <TouchableOpacity
      style={{
        marginLeft: 20,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center'
      }}
      onPress={() => {
        ReactNativeHapticFeedback.trigger("impactMedium");
        if (props.onChange) 
          props.onChange(!props.checked, true);
        }}>
      <Text style={{
          opacity: 0.85,
          fontFamily: 'Poppins-Bold',
          fontSize: 19
        }}>
        {props.label}
      </Text>
    </TouchableOpacity>
  </ReactView>
}

function Switch(props) {
  const isDarkMode = useDarkMode()

  var color = isDarkMode
    ? colors["primary"][0]
    : colors["primary"][1]

  return <ReactSwitch
    style={[
      props.style, {
        transform: [
          {
            scale: 0.83
          }
        ]
      }
    ]}
    trackColor={{
      false: "#575757",
      true: color
    }}
    thumbColor={"white"}
    ios_backgroundColor="#3e3e3e"
    onValueChange={props.onValueChange}
    value={props.value}/>
}

function AnimatedCircularProgress(props) {
  const isDarkMode = useDarkMode()

  var fillColor = isDarkMode
    ? colors["primary"][0]
    : colors["primary"][1]

  var backgroundColor = isDarkMode
    ? colors["view"][0]
    : colors["view"][1]

  return <ReactAnimatedCircularProgress
    size={props.size}
    width={props.width}
    style={props.style}
    fill={props.fill}
    tintColor={fillColor}
    onAnimationComplete={props.onAnimationComplete}
    backgroundColor={backgroundColor}/>
}

export {
  TouchableOpacity,
  View,
  SelectedView,
  LightView,
  BackgroundView,
  BlurView,
  Text,
  TextOnColor,
  TextInput,
  Icon,
  IconOnColor,
  LinearGradient,
  ActivityIndicator,
  CheckBox,
  Switch,
  AnimatedCircularProgress
};
