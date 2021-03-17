const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = process.env.PORT || 4000;

const fsPromises = fs.promises;

import { IncomingMessage, ServerResponse } from "http";

interface AlbumInterface {
  artist: string;
  albumId: number;
  albumName: string;
  songList: string[] | null;
  albumCover: string;
}

interface AudioFileProps {
  artist: string;
  albumName: string;
  songName: string;
}

const readDirectory = async (filePath: string[]) => {
  const data: AlbumInterface[] = [];
  const pathToDir = path.join(__dirname, "../", ...filePath);
  const bands: string[] = await fsPromises.readdir(pathToDir);
  for (const band of bands) {
    const albumsList: string[] = await fsPromises.readdir(
      path.join(pathToDir, band)
    );
    const bandId = bands.findIndex((el: string) => el === band);
    for (const album of albumsList) {
      const albumId =
        bandId + "" + albumsList.findIndex((el: string) => el === album);
      const albumDirectory: string = path.join(pathToDir, band, album);
      const albumFiles: string[] = await fsPromises.readdir(albumDirectory);
      const [albumCover, ...rest] = albumFiles.reverse();
      const albumData: AlbumInterface = {
        artist: band,
        albumId: Number(albumId),
        albumName: album,
        songList: rest.reverse(),
        albumCover,
      };
      data.push(albumData);
    }
  }
  return data;
};

const readImage = async (filePath: string[]) => {
  return await fsPromises.readFile(
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
};

const readFileSize = async (albumsList: AlbumInterface[], albumId: number) => {
  const album = albumsList.find((el) => el.albumId === albumId);
  if (!album) return;
  const pathToDir = path.join(
    __dirname,
    "../",
    "static",
    "music",
    album.artist,
    album.albumName
  );
  const responseData = [];
  if (!album.songList) return;
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

const readAudioFile = async (audioFile: AudioFileProps) => {
  const pathToFile = path.join(
    __dirname,
    "../",
    "static",
    "music",
    audioFile.artist,
    audioFile.albumName,
    audioFile.songName
  );
  return await fsPromises.readFile(pathToFile);
};

const readInitialData = async (filePath: string[]) => {
  const data: AlbumInterface[] = [];
  const pathToDir = path.join(__dirname, "../", ...filePath);
  const bands: string[] = await fsPromises.readdir(pathToDir);
  for (const band of bands) {
    const albumsList: string[] = await fsPromises.readdir(
      path.join(pathToDir, band)
    );
    const bandId = bands.findIndex((el: string) => el === band);
    for (const album of albumsList) {
      const albumId = albumsList.findIndex((el: string) => el === album);
      const finalId = bandId + "" + albumId;
      const albumDirectory: string = path.join(pathToDir, band, album);
      const albumFiles: string[] = await fsPromises.readdir(albumDirectory);
      const [albumCover] = albumFiles.reverse();
      const albumData: AlbumInterface = {
        artist: band,
        albumId: Number(finalId),
        albumName: album,
        songList: null,
        albumCover,
      };
      data.push(albumData);
    }
  }
  return data;
};

const server = http.createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    const splitUrl = req.url?.split("/")!;
    const lastone = splitUrl[splitUrl.length - 1];
    if (/.png$/.test(lastone)) {
      res.writeHead(200, { "Content-Type": "image/png" });
      res.write(await readImage(splitUrl));
      res.end();
      return;
    }
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Request-Method", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
    res.setHeader("Access-Control-Allow-Headers", "*");
    if (req.method === "GET") {
      if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "application/json" });
        const data = await readInitialData(["/static", "music"]);
        const albumsList = await readDirectory(["/static", "music"]);
        const responseData = await readFileSize(albumsList, 0);
        res.write(JSON.stringify({ data, responseData }));
        res.end();
        return;
      }
      if (/.mp3$/.test(lastone)) {
        console.log("mp3 audio");
        const audioSource: AudioFileProps = {
          artist: decodeURIComponent(splitUrl[1]),
          albumName: decodeURIComponent(splitUrl[2]),
          songName: decodeURIComponent(splitUrl[3]),
        };
        res.writeHead(200, { "Content-Type": "audio/mpeg" });
        res.write(await readAudioFile(audioSource));
      }
    } else if (req.method === "POST") {
      if (req.url === "/songlist") {
        let clientData: any[] = [];
        let albumId: number;
        req.on("data", (chunk) => {
          clientData = chunk;
        });
        req.on("end", async (_: any) => {
          albumId = Number(clientData.toString());
          const albumsList = await readDirectory(["/static", "music"]);
          const responseData = await readFileSize(albumsList, albumId);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.write(JSON.stringify(responseData));
          res.end();
        });
        return;
      }
    }
  }
);

server.listen(PORT, () => {
  console.log(`listening on http://192.168.1.8:${PORT}`);
});
