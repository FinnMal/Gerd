import React from "react";
import {Text, View, ActionSheetIOS, ScrollView, Dimensions} from "react-native";
import {Theme} from './../../app/index.js';
import InputBox from "./../../components/InputBox.js";
import Button from "./../../components/Button.js";
import Modal from "./../../components/Modal.js";
import ClubCard from "./../../components/ClubCard.js"
import Group from "./../../components/Group.js";

export default class UserClubs extends React.Component {
  clubs_list = [];
  constructor(props) {
    super(props);

    var user = this.props.user;
    this.state = {
      clubs: [],
      clubs_list: [],
      groups: {},
      groups_list: {},
      modal_visible: false,
      selected_club: null,
      modalContentHeight: Dimensions.get("window").height
    }
    user.getClubsList(function(list) {
      console.log(list)
      this.state.clubs = list;
      this.state.clubs_list = [];
      list.forEach((club, i) => {
        club.setReadyListener(function() {
          this.state.clubs_list.push(
            <ClubCard
              key={club.getID()}
              editable={true}
              club_color={club.getColor()}
              club_img={club.getImage()}
              club_name={club.getName()}
              club_groups={Object.keys(club.getJoinedGroups()).length}
              onPress={() => this._showOptions(club.getID())}/>
          )

          this.state.groups_list[club.getID()] = [];
          club.getGroupsObjects(function(groups) {
            groups.forEach((group, i) => {
              group.setReadyListener(function() {
                if (group.isPublic() || group.isJoined()) {
                  this.state.groups[group.getID()] = group;
                  this.state.groups_list[club.getID()].push(
                    <Group
                      key={group.getID()}
                      id={group.getID()}
                      selected={group.isJoined()}
                      name={group.getName()}
                      onSelect={(group_id, selected) => {
                        const group = this.state.groups[group_id];
                        if (selected) 
                          group.join()
                        else 
                          group.leave()
                        this.forceUpdate()
                      }}/>
                  )
                  if (!this.modal) 
                    this.forceUpdate()
                  else if (!this.modal.isOpen()) {
                    this.forceUpdate()
                  }

                }
              }.bind(this))
            });
          }.bind(this))
        }.bind(this))
      });
    }.bind(this), true)
  }

  _showOptions(club_id) {
    ActionSheetIOS.showActionSheetWithOptions({
      options: [
        "Abbrechen", "Gruppen verwalten", "Verlassen"
      ],
      destructiveButtonIndex: 2,
      cancelButtonIndex: 0
    }, buttonIndex => {
      if (buttonIndex === 0) {
        //cancel
      } else if (buttonIndex === 1) {
        this.state.selected_club = club_id;
        this.forceUpdate();
        this.modal.open();
      } else if (buttonIndex === 2) {
        alert('Funktion nicht verfügbar')
      }
    });
  }

  onModalDone() {
    this.forceUpdate()
  }

  onModalClose() {
    this.forceUpdate()
  }

  render() {
    const s_height = Dimensions.get("window").height;

    var groupsList = <Text>Kein Club ausgewählt</Text>;
    if (this.state.selected_club) {
      var groups = this.state.groups_list[this.state.selected_club];
      if (groups) {
        groupsList = groups.map(group => {
          return group;
        })
      }
    }

    return (
      <View>
        <Modal ref={(modal) => this.modal = modal} headline="Gruppen" done_text="Fertig" onDone={this.onModalDone.bind(this)} onClose={this.onModalClose.bind(this)}>
          <View style={{
              paddingTop: 20,
              minHeight: s_height * 0.73
            }}>
            {groupsList}
          </View>
          <Theme.Text
            style={{
              marginBottom: 15,
              marginTop: 20,
              marginLeft: 10,
              marginRight: 20,
              opacity: 0.5,
              fontSize: 16,
              fontFamily: 'Poppins-SemiBold'
            }}>Du kannst weiteren Gruppen durch eine Einladung vom Betreiber des Vereins beitreten.</Theme.Text>
        </Modal>
        <View>
          {this.state.clubs_list}
        </View>
      </View>
    );
  }
}
