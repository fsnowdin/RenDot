/* Library for storing and editing data */
/* Choppa2 */

const fs = require('fs');
const path = require('path');

const lib = {};

lib.base_dir = path.join(__dirname, '..' + '/');

lib.createTextFile = (path, data, callback) => {
  fs.open(path, 'w', (err, file_descriptor) => {
    if (!err && file_descriptor) {
      fs.writeFile(file_descriptor, data, (err) => {
        if (!err) {
          fs.close(file_descriptor, (err) => {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing file');
            }
          });
        } else {
          callback('Error writing to file');
        }
      });
    } else {
      callback('Error opening file to write');
    }
  });
};

lib.createSync = (path, data) => {
  const fd = fs.openSync(path, 'w');
  fs.writeFileSync(fd, data);
  fs.closeSync(fd);
};

// Write data to a file
lib.create = (filepath, data, callback) => {
  // Open the file for writing
  // Like the python open
  fs.open(filepath, 'w', (err, file_descriptor /* a way to uniquely identify a file */) => {
    if (!err && file_descriptor) {
      // Convert the data to a string
      var string_data = JSON.stringify(data);
      // Write to file and close it
      fs.writeFile(file_descriptor, string_data, (err) => {
        if (!err) {
          // Close the file
          fs.close(file_descriptor, (err) => {
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

lib.mkDir = (path, callback) => {
  if (!fs.existsSync(path)) fs.mkdir(path, callback);
};

lib.readSync = (path) => {
  return fs.readFileSync(path, 'utf-8');
};

lib.existsSync = (path) => {
  return fs.existsSync(path);
};

// Export the module
module.exports = lib;
