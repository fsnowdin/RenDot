/* eslint-disable standard/no-callback-literal */
/* Library for storing and editing data with CRUD */
/* Falling Snowdin */

'use strict';

const fs = require('fs');

const data = {};

// Create a file. Fails if the filepath already exists.
data.create = (filepath, data, callback) => {
  fs.open(filepath, 'wx', (err, fd) => {
    if (!err && fd) {
      fs.writeFile(fd, data, (err) => {
        if (!err) {
          fs.close(fd, (err) => {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing new file');
            }
          });
        } else {
          callback('Error writing to new file');
        }
      });
    } else {
      callback(`${err}\nCould not create new file. It may already exists.`);
    }
  });
};

// Create a file synchronously. Fails if already exists.
data.createSync = (path, data) => {
  const fd = fs.openSync(path, 'wx');
  if (!fd) throw Error("Couldn't synchronously open file.");
  fs.writeFileSync(fd, data);
  fs.closeSync(fd);
};

// Create a directory
data.mkDir = (path, callback) => {
  if (!fs.existsSync(path)) fs.mkdir(path, callback);
};

// Read data from a file async.
data.read = (path, callback) => {
  fs.readFile(path, { encoding: 'utf-8', flag: 'r' }, (err, data) => {
    if (!err && data) callback(false, data);
    else callback(err, undefined);
  });
};
// Read data synchronously from a file
data.readSync = (path) => {
  try {
    return fs.readFileSync(path, 'utf-8', 'rx');
  } catch (err) {
    return undefined;
  }
};

// Update (replace) an already existing file
data.update = (path, data, callback) => {
  fs.writeFile(path, data, { encoding: 'utf-8', flag: 'w' }, (err) => {
    if (err) callback(`${err}. Could not update file. It may not exists.`);
    else callback(false);
  });
};
data.updateSync = (path, data) => {
  fs.writeFileSync(path, data);
};

// Delete a file
data.delete = (path, callback) => {
  fs.unlink(path, (err) => {
    if (err) callback(`${err}. Could not delete file.`);
    else callback(false);
  });
};

// Delete a file synchronously
data.deleteSync = (path) => {
  fs.unlinkSync(path);
};

// Check if a file/folder exists with a given path
data.existsSync = (path) => {
  return fs.existsSync(path);
};

// Export the module
module.exports = data;
