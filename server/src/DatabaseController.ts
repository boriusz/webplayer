import { collection } from "./index";

export interface DatabaseDataInterface {
  albumName: string;
  songName: string;
  artist: string;
  _id: string;
}

export default class DatabaseController {
  public static addToFavorites(dataToAdd: DatabaseDataInterface): void {
    collection.findOne(
      {
        albumName: dataToAdd.albumName,
        artist: dataToAdd.artist,
        songName: dataToAdd.songName,
      },
      (err: Error | null, data: DatabaseDataInterface[]) => {
        if (err) console.log(err);
        if (!data) collection.insert(dataToAdd);
      }
    );
  }

  public static removeFromFavorites(dataToRemove: DatabaseDataInterface): void {
    collection.remove(
      {
        albumName: dataToRemove.albumName,
        songName: dataToRemove.songName,
        artist: dataToRemove.artist,
      },
      () => {
        console.log("removed");
      }
    );
  }
}
