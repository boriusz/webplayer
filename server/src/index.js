import http from "http";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import Datastore from "nedb";
import DatabaseController from "./DatabaseController.js";
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fsPromises = fs.promises;

export const collection = new Datastore({
  filename: "favorites.db",
  autoload: true,
});

const defaultAlbumCover = "default-cover.png";

const readDirectory = async (filePath) => {
  const data = [];
  const pathToDir = path.join(__dirname, "../", ...filePath);
  const bands = await fsPromises.readdir(pathToDir);
  for (const band of bands) {
    const albumsList = await fsPromises.readdir(path.join(pathToDir, band));
    const bandId = bands.findIndex((el) => el === band);
    for (const album of albumsList) {
      const albumId = bandId + "" + albumsList.findIndex((el) => el === album);
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
};

const readImage = async (filePath) => {
  let file;
  try {
    file = await fsPromises.readFile(
      path.join(
        __dirname,
        "../",
        "static",
        "music",
        decodeURIComponent(filePath[1]),
        decodeURIComponent(filePath[2]),
        decodeURIComponent(filePath[3])
      )
    );
  } catch (e) {
    file = await fsPromises.readFile(
      path.join(__dirname, "../", "static", "default-cover.png")
    );
  }
  return file;
};
const readFileSize = async (filePath) => {
  const file = await fsPromises.stat(filePath);
  return file.size;
};

const readAlbumFilesSize = async (albumsList, albumId) => {
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
};

const readInitialData = async (filePath) => {
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
        albumCover: albumCover ? albumCover : defaultAlbumCover,
      };
      data.push(albumData);
    }
  }
  return data;
};

const server = http.createServer(async (req, res) => {
  const splitUrl = req.url.split("/");
  const lastone = splitUrl[splitUrl.length - 1];
  if (/.png$/.test(lastone)) {
    res.writeHead(200, { "Content-Type": "image/png" });
    res.write(await readImage(splitUrl));
    res.end();
    return;
  }
  if (/.jpg$/.test(lastone)) {
    res.writeHead(200, { "Content-Type": "image/jpeg" });
    res.write(await readImage(splitUrl));
    res.end();
    return;
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Request-Method", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "GET") {
    if (req.url === "/") {
      res.writeHead(200, { "Content-Type": "application/json" });
      const data = await readInitialData(["static", "music"]);
      res.write(JSON.stringify({ data }));
      res.end();
      return;
    }
    if (req.url === "/favorites") {
      res.writeHead(200, { "Content-Type": "application/json" });
      collection.find({}, async (err, docs) => {
        if (err) console.log(err);
        const songsWithSizes = await Promise.all(
          docs.map(async (element) => {
            const pathToElem = path.join(
              __dirname,
              "../",
              "static",
              "music",
              element.artist,
              element.albumName,
              element.songName
            );
            const fileSize = await readFileSize(pathToElem);
            return { ...element, songSize: fileSize };
          })
        );
        res.write(JSON.stringify(songsWithSizes));
        res.end();
      });
    }
    if (/.mp3$/.test(lastone)) {
      const pathToFile = path.join(
        __dirname,
        "../",
        "static",
        "music",
        decodeURIComponent(splitUrl[1]),
        decodeURIComponent(splitUrl[2]),
        decodeURIComponent(splitUrl[3])
      );
      const range = req.headers.range;
      const fileSize = await readFileSize(pathToFile);

      if (range) {
        const [first, last] = range.replace(/bytes=/, "").split("-");
        const start = parseInt(first, 10);
        const end = last ? parseInt(last, 10) : fileSize - 1;
        res.writeHead(206, {
          "Content-Type": "audio/mpeg",
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": end - start + 1,
        });
        const file = fs.createReadStream(pathToFile, {
          start,
          end,
        });
        file.pipe(res);
      } else {
        res.writeHead(200, {
          "Content-Type": "audio/mpeg",
          "Content-Length": await readFileSize(pathToFile),
        });
        const file = fs.createReadStream(pathToFile);
        file.pipe(res);
      }
    }
  } else if (req.method === "POST") {
    if (req.url === "/songlist") {
      let clientData = [];
      let albumId;
      req.on("data", (chunk) => {
        clientData = chunk;
      });
      req.on("end", async () => {
        albumId = Number(clientData.toString());
        const albumsList = await readDirectory(["/static", "music"]);
        const responseData = await readAlbumFilesSize(albumsList, albumId);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify(responseData));
        res.end();
      });
      return;
    }
    if (req.url === "/addToFavorites") {
      const data = [];
      req.on("data", (chunk) => data.push(chunk));
      req.on("end", () => {
        const sentData = JSON.parse(data.toString()).data;
        DatabaseController.addToFavorites(sentData);
      });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify("ok"));
      res.end();
      return;
    }
    if (req.url === "/removeFromFavorities") {
      const data = [];
      req.on("data", (chunk) => data.push(chunk));
      req.on("end", () => {
        const sentData = JSON.parse(data.toString());
        DatabaseController.removeFromFavorites(sentData.data);
      });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify("ok"));
      res.end();
    }
  } else if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`server available at address: http://localhost:3000`);
});
