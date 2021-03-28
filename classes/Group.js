import React from "react";
import DatabaseConnector from "./database/DatabaseConnector";

export default class Club extends DatabaseConnector {
  id = null;
  club_id = null;
  user = null;

  constructor(id, club_id, user = null) {
    super('clubs/' + club_id + '/groups', id, ['name', 'members', 'public'])
    this.id = id;
    this.club_id = club_id;
    this.user = user;
  }

  getClubID() {
    return this.club_id;
  }

  getName() {
    return this.getValue('name');
  }

  setName(v) {
    this.setValue(v, 'name');
  }

  updateName(v) {
    this.setValue(v, 'name', true);
  }

  isPublic() {
    return this.getValue('public');
  }

  setPublic(v) {
    this.setValue(v === true, 'public');
  }

  updatePublic(v) {
    this.setValue(v, 'public', true);
  }

  isJoined() {
    if (this.user) {
      return this.user.getValue('clubs/' + this.getClubID() + '/groups/' + this.getID()) === true;
    }
  }

  join() {
    if (this.user) {
      return this.user.setValue(true, 'clubs/' + this.getClubID() + '/groups/' + this.getID(), true);
    }
  }

  leave() {
    if (this.user) {
      return this.user.removeValue('clubs/' + this.getClubID() + '/groups/' + this.getID());
    }
  }
}
