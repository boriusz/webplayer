import { collection } from "./index.js";

export default class DatabaseController {
  static addToFavorites(dataToAdd) {
    collection.findOne(
      {
        albumName: dataToAdd.albumName,
        artist: dataToAdd.artist,
        songName: dataToAdd.songName,
      },
      (err, data) => {
        if (err) console.log(err);
        if (!data) collection.insert(dataToAdd);
      }
    );
  }

  static removeFromFavorites(dataToRemove) {
    collection.remove(
      {
        albumName: dataToRemove.albumName,
        songName: dataToRemove.songName,
        artist: dataToRemove.artist,
      },
      () => {}
    );
  }
}
