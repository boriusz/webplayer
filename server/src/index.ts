import http, { IncomingMessage, ServerResponse } from "http";
import fs from "fs";
import path from "path";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Datastore from "nedb";
import DatabaseController, {
  DatabaseDataInterface,
} from "./DatabaseController";
const PORT = process.env.PORT || 4000;

const fsPromises = fs.promises;

export const collection = new Datastore({
  filename: "favorites.db",
  autoload: true,
});

interface AlbumInterface {
  artist: string;
  albumId: number;
  albumName: string;
  songList: string[] | null;
  albumCover: string;
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
      const songs = albumFiles.filter((item) => /.mp3$/.test(item));
      let albumCover = albumFiles.find((item) => /.png$/.test(item));
      if (!albumCover)
        albumCover = albumFiles.find((item: string) => /.jpg/.test(item));
      if (albumCover) {
        const albumData: AlbumInterface = {
          artist: band,
          albumId: Number(albumId),
          albumName: album,
          songList: songs,
          albumCover,
        };
        data.push(albumData);
      }
    }
  }
  return data;
};

const readImage = async (filePath: string[]) =>
  await fsPromises.readFile(
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
const readFileSize = async (filePath: string) => {
  const file = await fsPromises.stat(filePath);
  return file.size;
};

const readAlbumFilesSize = async (
  albumsList: AlbumInterface[],
  albumId: number
) => {
  const album = albumsList.find((el: AlbumInterface) => el.albumId === albumId);
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
    const splitUrl = req.url!.split("/")!;
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
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
    res.setHeader("Access-Control-Allow-Headers", "*");
    if (req.method === "GET") {
      if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "application/json" });
        const data = await readInitialData(["/static", "music"]);
        const albumsList = await readDirectory(["/static", "music"]);
        const responseData = await readAlbumFilesSize(albumsList, 0);
        res.write(JSON.stringify({ data, responseData }));
        res.end();
        return;
      }
      if (req.url === "/favorites") {
        res.writeHead(200, { "Content-Type": "application/json" });
        collection.find(
          {},
          async (err: Error | null, docs: DatabaseDataInterface[]) => {
            if (err) console.log(err);
            const songsWithSizes = await Promise.all(
              docs.map(async (element: DatabaseDataInterface) => {
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
          }
        );
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
        let clientData: never[] = [];
        let albumId: number;
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
        const data: Buffer[] = [];
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
        const data: Buffer[] = [];
        req.on("data", (chunk) => data.push(chunk));
        req.on("end", () => {
          const sentData = JSON.parse(data.toString());
          console.log(sentData);
          DatabaseController.removeFromFavorites(sentData.data);
        });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify("ok"));
        res.end();
      }
    }
  }
);

server.listen(PORT, () => {
  console.log(`listening on http://192.168.1.8:${PORT}`);
});
