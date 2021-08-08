import React from "react";
import {
    View,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import AutoHeightImage from "react-native-auto-height-image";
import {
    faChevronCircleRight
} from "@fortawesome/free-solid-svg-icons";
import { Theme } from './../app/index.js';
import { withNavigation } from 'react-navigation';
import ReactNativeHapticFeedback from "react-native-haptic-feedback"

class Message extends React.Component {
    club = {};
    user = null;
    showRead = false;
    author_info = {};

    constructor(props) {
        super(props)
        this.mes = props.message;
        this.club = props.club;
        this.render_ready = false;

        // set ago text
        this.mes.setReadyListener(function () {
            this.mes.loadIsRead(function(){
                this.mes.isViewable(function(viewable){
                    if (viewable){
                        this.render_ready = true;
                        this.forceUpdate()

                        this.mes.setValue(this._getAgoText(), 'ago')
                        if (this._getAgoSec() < 3600)
                            this.startAgoCounter();
                    }
                }.bind(this))
            }.bind(this))
        }.bind(this))

        this.club.setReadyListener(function(){
            this.forceUpdate()
        }.bind(this))
    }

    startAgoCounter(delay = 1000) {
        if (this._getAgoSec() < 3600) {
            setTimeout(function () {
                if (this._getAgoSec() > 60)
                    delay = 60000;
                this.mes.setValue(this._getAgoText(), 'ago')
                this.forceUpdate()
                this.startAgoCounter(delay);
            }.bind(this), delay)
        }
    }

    _getAgoSec() {
        var time = this.mes.getValue('send_at');
        var cur_time = new Date().getTime() / 1000;
        if (cur_time > time)
            return cur_time - time;
        if (time > cur_time)
            return time - cur_time;
        return 0;
    }

    _getAgoText() {
        var time = this.mes.getValue('send_at')
        var ago_pre = "";
        var cur_time = new Date().getTime() / 1000;
        if (cur_time > time) {
            var diff = cur_time - time;
            ago_pre = "Vor "
        } else if (time > cur_time) {
            var diff = time - cur_time;
            ago_pre = "In  "
        } else
            return "Gerade eben"

        var ago = ''
        if (diff < 60)
            ago = Math.round(diff) + " Sek."
        else if (diff < 3600)
            ago = Math.round(diff / 60) + " Min."
        else if (diff < 86400)
            ago = Math.round(diff / 3600) + " Std."
        else if (diff < 604800)
            ago = Math.round(diff / 86400) + " Tagen"
        else if (diff < 2592000)
            ago = Math.round(diff / 604800) + " Wochen"
        else if (diff < 31536000)
            ago = Math.round(diff / 2592000) + " Monaten"
        else if (diff > 31535999)
            ago = Math.round(diff / 31536000) + " Jahren"
        return ago_pre + ago;
    }

    onPress(){
        ReactNativeHapticFeedback.trigger("impactMedium");
        this.props.navigation.push('MessageScreen', {
            club: this.club,
            mes: this.mes,
            utils: this.props.utils
        })
        if(!this.showRead)
            this.mes.setRead(true)
        this.forceUpdate()
    }

    render() {
        const mes = this.mes;
        const club = this.club;
        const s_width = Dimensions.get("window").width;

        if (mes) {
            if (this.render_ready){
                this.showRead = this.props.showRead
                if ((!mes.isRead()  || this.props.showRead) && mes.isViewable()){
                    if (mes.getHeadline() && mes.getShortText() && club.getColor() && club.getImage() && club.getName()) {

                        var groupCards = [];
                        //groupCards
                        /*
                        TODO: show groups with group class defined down
                        if (this.user.getOption('show_groups')) {
                        groupCards = Object.keys(mes.groups).map(key => {
                            return <GroupCard textColor={club.text_color} key={key} club_id={this.data.club_id} group_id={key} />
                        });
                        }
                        */
        
                        return (
                            <Theme.View
                            shadow={'large'}
                                style={{
                                    width: s_width * 0.92,
                                    height: "auto",
                                    backgroundColor: '#'+club.getColor(),
                                    marginBottom: 40,
                                    shadowColor: '#'+club.getColor(),
                                    padding: 15,
                                    paddingTop: 22,
                                    borderRadius: 15
                                }}>
                                <TouchableOpacity
                                    style={{
                                        zIndex: 100,
                                        borderRadius: 17,
                                        backgroundColor: "rgba(0, 0,0,0)"
                                    }}
                                    onPress={() => { this.onPress()}}>

                                    <View style={{
                                        display: "flex",
                                        flexDirection: "row"
                                    }}>
                                        <Theme.Icon
                                            backgroundColor={'#'+club.getColor()}
                                            style={{
                                                top: 0,
                                                right: 0,
                                                position: "absolute",
                                                marginBottom: 7,
                                            }}
                                            size={19}
                                            icon={faChevronCircleRight}/>
                                        <Theme.Text
                                            backgroundColor={'#'+club.getColor()}
                                            style={{
                                                marginTop: -5,
                                                marginRight:20,
                                                alignSelf: "flex-start",
                                                fontFamily: "Poppins-Bold",
                                                lineHeight: 40,
                                                fontSize: 31
                                            }}>
                                            {mes.getHeadline()}
                                        </Theme.Text>
                                    </View>
                                    <Theme.Text
                                        backgroundColor={'#'+club.getColor()}
                                        style={{
                                            marginTop:5,
                                            textAlign: "justify",
                                            fontSize: 20,
                                            fontFamily: "Poppins-Regular",
                                            color: club.text_color,
                                            opacity: 0.8
                                        }}>
                                        {mes.getShortText()}
                                    </Theme.Text>
                                    {
                                        groupCards.length > 0
                                            ? <View
                                                style={{
                                                    marginRight: 20,
                                                    marginTop: 10,
                                                    marginBottom: 10,
                                                    flexWrap: 'wrap',
                                                    alignItems: 'flex-start',
                                                    flexDirection: 'row'
                                                }}>
                                                {groupCards}
                                            </View>
                                            : void 0
                                    }
        
                                    <View style={{
                                        marginTop: 20,
                                        display: "flex",
                                        flexDirection: "row"
                                    }}>
                                        <AutoHeightImage
                                            style={{
                                                borderRadius: 36
                                            }}
                                            width={40}
                                            source={{
                                                uri: club.getLogo()
                                            }} />
                                        <View style={{
                                            marginLeft: 15
                                        }}>
                                            <Theme.Text
                                                backgroundColor={'#'+club.getColor()}
                                                style={{
                                                    marginTop: 3,
                                                    fontSize: 16,
                                                    fontFamily: "Poppins-SemiBold",
                                                    color: club.getTextColor(),
        
                                                    opacity: 0.8
                                                }}>
                                                {club.getName()}
                                            </Theme.Text>
                                            <Theme.Text
                                                backgroundColor={'#'+club.getColor()}
                                                style={{
                                                    marginTop: -2,
                                                    fontSize: 13,
                                                    color: club.getTextColor(),
                                                    opacity: 0.7
                                                }}>
                                                {this.mes.getValue('ago')}
                                            </Theme.Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Theme.View>
                        );
                    }
                }       
            }
        }
        return null;
    }
}

/*
class GroupCard extends React.Component {
  name = "";
  name_fetched = false;
  constructor(props) {
    super(props);

    database().ref('clubs/' + this.props.club_id + '/groups/' + this.props.group_id + '/name').once('value', (function (snap) {
      this.name = snap.val();
      this.name_fetched = true;
      this.forceUpdate();
    }).bind(this));
  }

  render() {
    if (this.name) {
      return (
        <View
          style={{
            marginTop: 7,
            borderRadius: 10,
            padding: 5,
            paddingLeft: 8,
            paddingRight: 8,
            marginRight: 15,
            backgroundColor: "rgba(255, 255,255,0.25)"
          }}>
          <Text
            style={{
              opacity: 0.8,
              fontFamily: 'Poppins-Bold',
              color: this.props.textColor,
              fontSize: 17
            }}>{this.name}</Text>
        </View>
      )
    } else if (!this.name_fetched) {
      return <ActivityIndicator style={{
        transform: [
          {
            scale: 0.9
          }
        ]
      }} size="small" color="#1e1e1e" />;
    } else
      return <View />
  }
}
*/
export default withNavigation(Message);