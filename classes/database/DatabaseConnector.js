import React from "react";
import database from "@react-native-firebase/database";
import {openDatabase} from 'react-native-sqlite-storage';

export default class DatabaseConnector {
  id = null;
  db = null;
  data = {};
  listener = {};
  ready = false;
  ready_listener = null;
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
      this.startListener(this.start_values, function() {
        this.checkIfReady()
      }.bind(this));
    }
  }

  executeSQL(s, p = [], cb) {
    if (s.indexOf('"?"') > -1 || s.indexOf("'?'") > -1) 
      alert('[DatabaseConnector] Error: symbol "?" should not be used with quotation marks')

    var db = openDatabase('gerd.db');
    db.transaction(function(txn) {
      //txn.executeSql('INSERT INTO chat_messages VALUES ("MES_ID", "-MIAN2v5d1Bs4WTf7AUI", 100, "Text", 1);', [])
      txn.executeSql(s, p, (tx, results) => {
        if (cb) 
          cb(tx, results);
        }
      );
    });
  }

  getValue(path, cb = null) {
    var obj = this.data;
    if (obj) {
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

  setValue(value, path, store = false) {
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

  pushValue(value, path, cb) {
    var key = database().ref(this.parent_path + "/" + this.id + "/" + path).push(value).key;
    if (cb) 
      cb(key);
    else 
      return key;
    }
  
  countUp(path, cb) {
    this.getDatabaseValue(path, function(value) {
      value = value + 1;
      this.setValue(value, path, true);
      if (cb) 
        cb(value);
      }
    .bind(this))
  }

  hasValue(path, cb = false) {
    return this.getValue(path) != undefined;
  }

  remove() {
    database().ref(this.parent_path + "/" + this.id).remove();
  }

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

  getDatabaseValue(path, cb) {
    database().ref(this.parent_path + "/" + this.id + "/" + path).once("value", function(snap) {
      this.setValue(snap.val(), path);
      cb(snap.val());
    }.bind(this));
  }

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
        this.listener[path].ref.on("value", function(snap) {
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

  stopListener(path) {
    if (this.listener) {
      if (this.listener[path]) {
        if (this.listener[path].ref) 
          this.listener[path].ref.off();
        this.listener[path] = null;
      }
    }
  }

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
      this.ready_listener = cb;
      this.checkIfReady();
    } else 
      cb(this);
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
        if (this.ready_listener && !this.ready) {
          this.ready = true;
          this.ready_listener(this);
        }
      }
    }
  }

  getID() {
    return this.id;
  }
}
