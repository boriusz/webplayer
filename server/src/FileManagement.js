import path from "path";
import { promises as fsPromises } from "fs";
import { __dirname } from "./index.js";

export default class FileManagement {
  static async readDirectory(filePath) {
    const data = [];
    const pathToDir = path.join(__dirname, "../", ...filePath);
    const bands = await fsPromises.readdir(pathToDir);
    for (const band of bands) {
      const albumsList = await fsPromises.readdir(path.join(pathToDir, band));
      const bandId = bands.findIndex((el) => el === band);
      for (const album of albumsList) {
        const albumId =
          bandId + "" + albumsList.findIndex((el) => el === album);
        const albumDirectory = path.join(pathToDir, band, album);
        const albumFiles = await fsPromises.readdir(albumDirectory);
        const songs = albumFiles.filter((item) => /.mp3$/.test(item));
        let albumCover = albumFiles.find((item) => /.png$/.test(item));
        if (!albumCover)
          albumCover = albumFiles.find((item) => /.jpg/.test(item));
        const albumData = {
          artist: band,
          albumId: Number(albumId),
          albumName: album,
          songList: songs,
          albumCover,
        };
        data.push(albumData);
      }
    }
    return data;
  }

  static async readImageFile(filePath) {
    let file;
    try {
      file = await fsPromises.readFile(
        path.join(__dirname, "../", "static", "music", ...filePath)
      );
    } catch (e) {
      file = await fsPromises.readFile(
        path.join(__dirname, "../", "static", "default-cover.png")
      );
    }
    return file;
  }

  static async readAlbumFilesSize(albumsList, albumId) {
    const album = albumsList.find((el) => el.albumId === albumId);
    if (!album) return null;
    const pathToDir = path.join(
      __dirname,
      "../",
      "static",
      "music",
      album.artist,
      album.albumName
    );
    const responseData = [];
    if (!album.songList) return null;
    for (const song of album.songList) {
      const stat = await fsPromises.stat(path.join(pathToDir, song));
      const id = song.slice(0, 2);
      responseData.push({
        songName: song,
        songSize: stat.size,
        id: Number(id),
        artist: album.artist,
        albumName: album.albumName,
      });
    }
    return responseData;
  }

  static async readInitialData(filePath) {
    const data = [];
    const pathToDir = path.join(__dirname, "../", ...filePath);
    const bands = await fsPromises.readdir(pathToDir);
    for (const band of bands) {
      const albumsList = await fsPromises.readdir(path.join(pathToDir, band));
      const bandId = bands.findIndex((el) => el === band);
      for (const album of albumsList) {
        const albumId = albumsList.findIndex((el) => el === album);
        const finalId = bandId + "" + albumId;
        const albumDirectory = path.join(pathToDir, band, album);
        const albumFiles = await fsPromises.readdir(albumDirectory);
        let albumCover = albumFiles.find((item) => /.jpg$/.test(item));
        if (!albumCover)
          albumCover = albumFiles.find((item) => /.png$/.test(item));
        const albumData = {
          artist: band,
          albumId: Number(finalId),
          albumName: album,
          albumCover: albumCover ? albumCover : "default-cover.png",
        };
        data.push(albumData);
      }
    }
    return data;
  }
}
