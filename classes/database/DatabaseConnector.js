import React from "react";
import database from "@react-native-firebase/database";
import { openDatabase } from 'react-native-sqlite-storage';

// DatabaseConnector class: Manages the connection for Lists in the Firebase Database
export default class DatabaseConnector {
  id = null;
  db = null;
  data = {};
  listener = {};
  ready = false;
  ready_listeners = [];
  start_values = [];
  parent_path = "";

  constructor(parent_path, id, start_values = false, data = false) {
    this.id = id
    this.parent_path = parent_path
    this.start_values = start_values

    if (data !== false) {
      this.data = data;
    }

    if (start_values !== false) {
      this.startListener(this.start_values, function () {
        this.checkIfReady()
      }.bind(this));
    }
  }

  // runs SQL command on local database no connection to firebase
  executeSQL(s, p = [], cb) {
    if (s.indexOf('"?"') > -1 || s.indexOf("'?'") > -1)
      alert('[DatabaseConnector] Error: symbol "?" should not be used with quotation marks')

    var db = openDatabase('gerd.db');
    db.transaction(function (txn) {
      //txn.executeSql('INSERT INTO chat_messages VALUES ("MES_ID", "-MIAN2v5d1Bs4WTf7AUI", 100, "Text", 1);', [])
      txn.executeSql(s, p, (tx, results) => {
        if (cb)
          cb(tx, results);
      }
      );
    });
  }

  /*
  returns the value of the path, if path is already downloaded
  if the path is not stored locally, it calls getDatabaseValue with a callback function
  @param print_path is for debugging purposes
  */
  getValue(path, cb = null, print_path = false) {
    var obj = this.data;
    if (print_path)
      console.log(this.parent_path + '/' + this.id + '/' + path)
    if (obj) {
      path = path.toString()
      path_arr = path.split("/");
      if (path_arr) {
        for (i = 0; i < path_arr.length - 1; i++) {
          if (obj)
            obj = obj[path_arr[i]];
          else if (cb)
            this.getDatabaseValue(path, cb);
          else
            return null;
        }
        if (obj && path_arr && path_arr[i])
          var value = obj[path_arr[i]];
        if (value != undefined) {
          if (cb)
            return cb(value);
          return value;
        }
        if (cb)
          this.getDatabaseValue(path, cb);
      }
    }
  }

  /*
  stores a value to the given path locally
  @param store if true it stores in the firebase database additionally
  */
  setValue(value, path, store = false) {
    if (path) {
      path = path.toString()
      path_arr = path.split("/");
      if (path_arr) {
        var obj = this.data;
        if (obj) {
          for (i = 0; i < path_arr.length - 1; i++) {
            if (!obj)
              obj = {}
            obj = obj[path_arr[i]];
          }

          if (obj)
            obj[path_arr[i]] = value;
          else
            database().ref(this.parent_path + "/" + this.id + "/" + path).set(value);

          if (store) {
            database().ref(this.parent_path + "/" + this.id + "/" + path).set(value);
          } else
            this._triggerCallbacks(path, value);
        }
      }
    }
  }

  /*
  pushes a new element to an array
  */
  pushValue(value, path, cb) {
    var key = database().ref(this.parent_path + "/" + this.id + "/" + path).push(value).key;
    if (cb)
      cb(key);
    else
      return key;
  }

  /*
  uploads a local stored value to db
  */
  storeValue(path) {
    this.setValue(this.getValue(path), path, true)
  }

  /*
  counts path one up
  */
  countUp(path, cb) {
    this.getDatabaseValue(path, function (value) {
      value = value + 1;
      this.setValue(value, path, true);
      if (cb)
        cb(value);
    }
      .bind(this))
  }

  /*
  returns true if path is downloaded
  if cb is not null it checks if the value is stored in the database
  */
  hasValue(path, cb = false) {
    return this.getValue(path) != undefined && this.getValue(path) != [] && this.getValue(path) != "";
  }

  /*
  removes the element
  */
  remove() {
    database().ref(this.parent_path + "/" + this.id).remove();
  }

  /*
  removes a value on path
  */
  removeValue(path) {
    path_arr = path.split("/");

    if (path_arr) {
      var obj = this.data;
      if (obj) {
        for (i = 0; i < path_arr.length - 1; i++) {
          if (!obj)
            obj = {}
          obj = obj[path_arr[i]];
        }
        if (obj) {
          if (path_arr) {
            if (path_arr[i])
              obj[path_arr[i]] = undefined;
          }
        }
      }
      database().ref(this.parent_path + "/" + this.id + "/" + path).remove();
      this._triggerCallbacks(path, undefined);
    }
  }

  /*
  gives the current value from path in firebase datbase to callback function
  */
  getDatabaseValue(path, cb) {
    database().ref(this.parent_path + "/" + this.id + "/" + path).once("value", function (snap) {
      this.setValue(snap.val(), path);
      cb(snap.val());
    }.bind(this));
  }

  /*
  starts a listener for a path
  */
  startListener(path, cb) {
    if (Array.isArray(path)) {
      path.forEach((path_value, i) => {
        this.startListener(path_value, cb);
      });

    } else {
      if (!this.listener[path]) {
        this.listener[path] = {
          callbacks: [cb]
        };

        if (this.data[path]) {
          this.listener[path].is_db_value = true;
          this._triggerCallbacks(path);
        }

        this.listener[path].ref = database().ref(this.parent_path + "/" + this.id + "/" + path);
        this.listener[path].ref.on("value", function (snap) {
          if (!this.listener[path] && cb) {
            this.listener[path] = {
              callbacks: [cb],
              ref: ref
            };
          }
          this.listener[path].is_db_value = true;

          this.setValue(snap.val(), path);
        }.bind(this));
      } else {
        this.listener[path].callbacks.push(cb);
        this._triggerCallbacks(path);
      }
    }
  }

  /*
  stops every listener for a path
  */
  stopListener(path) {
    if (this.listener) {
      if (this.listener[path]) {
        if (this.listener[path].ref)
          this.listener[path].ref.off();
        this.listener[path] = null;
      }
    }
  }

  /*
  stops every listener
  */
  stopAllListener() {
    if (this.listener) {
      for (var path in this.listener) {
        this.stopListener(path);
      }
    }
  }

  _triggerCallbacks(path, value = null) {
    if (this.listener[path]) {
      if (this.listener[path].callbacks) {
        this.listener[path].callbacks.forEach((cb, i) => {
          if (cb)
            cb(
              value
                ? value
                : this.getValue(path)
            );
        }
        );
      }
    }
  }

  setReadyListener(cb) {
    if (!this.ready) {
      if (!this.ready_listeners)
        this.ready_listeners = [];
      this.ready_listeners.push(cb);
      this.checkIfReady();
    } else
      cb(this);
  }

  triggerReadyListeners(value) {
    this.ready_listeners.forEach((listener, i) => {
      listener(value);
    });
  }

  checkIfReady() {
    if (!this.ready) {
      var values_ok = true;
      if (this.start_values) {
        this.start_values.forEach((path, i) => {
          if (this.listener[path]) {
            if (this.listener[path].is_db_value !== true)
              values_ok = false;
          }
          else
            values_ok = false;
        }
        );
      }

      if (values_ok) {
        if (this.ready_listeners && !this.ready) {
          this.ready = true;
          this.triggerReadyListeners(this);
        }
      }
    }
  }

  getID() {
    return this.id;
  }
}
