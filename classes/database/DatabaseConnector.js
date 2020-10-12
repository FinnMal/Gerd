import React from "react";
import database from "@react-native-firebase/database";

export default class DatabaseConnector {
  id = null;
  data = {};
  listener = {};
  ready = false;
  ready_listener = null;
  start_values = [];
  parent_path = "";

  constructor(parent_path, id, start_values) {
    this.id = id;
    this.parent_path = parent_path;
    this.start_values = start_values;
    start_values.forEach((path, i) => {
      this.startListener(path, function() {
        this.checkIfReady()
      }.bind(this));
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
        
        if (value != undefined) 
          return value;
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
        for (i = 0; i < path_arr.length - 1; i++) 
          obj = obj[path_arr[i]];
        
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
    }
  
  hasValue(path, cb = false) {
    return this.getValue(path) != undefined;
  }

  removeValue(path) {
    path_arr = path.split("/");

    if (path_arr) {
      var obj = this.data;
      if (obj) {
        for (i = 0; i < path_arr.length - 1; i++) 
          obj = obj[path_arr[i]];
        obj[path_arr[i]] = undefined;
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

        this.listener[path].ref = database().ref(this.parent_path + "/" + this.id + "/" + path);
        this.listener[path].ref.on("value", function(snap) {
          this.setValue(snap.val(), path);
        }.bind(this));
      } else {
        this.listener[path].callbacks.push(cb);
        this._triggerCallbacks(path);
      }
    }
  }

  _stopListener(path) {
    this.listener[path].off();
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
    if (!this.ready) 
      this.ready_listener = cb;
    else 
      cb(this);
    }
  
  checkIfReady() {
    var values_ok = true;
    this.start_values.forEach((path, i) => {
      if (!this.hasValue(path)) 
        values_ok = false;
      }
    );
    if (values_ok) {
      if (this.ready_listener && !this.ready) {
        this.ready = true;
        this.ready_listener(this);
      }
    }
  }

  getID() {
    return this.id;
  }
}
