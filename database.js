import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("gallery.db");

export const initializeDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS photos (id INTEGER PRIMARY KEY AUTOINCREMENT, photoUri TEXT, latitude REAL, longitude REAL, address TEXT);"
    );
  });
};

export const savePhotoToDatabase = (uri, latitude, longitude, address) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO photos (photoUri, latitude, longitude, address) VALUES (?, ?, ?, ?);",
        [uri, latitude, longitude, address],
        (_, resultSet) => {
          const newId = resultSet.insertId;
          resolve(newId);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const fetchPhotosFromDatabase = (successCallback, errorCallback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM photos;",
      [],
      (_, { rows }) => {
        successCallback(rows._array);
      },
      (_, error) => {
        errorCallback(error);
      }
    );
  });
};

export const deletePhotoFromDatabase = (id, successCallback, errorCallback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "DELETE FROM photos WHERE id = ?;",
      [id],
      () => {
        successCallback();
      },
      (_, error) => {
        errorCallback(error);
      }
    );
  });
};
