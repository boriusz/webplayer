import http from "http";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import Datastore from "nedb";
import DatabaseController from "./DatabaseController.js";
import FileManagement from "./FileManagement.js";
import formidable from "formidable";
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

const fsPromises = fs.promises;
const form = formidable({ multiples: true });

export const collection = new Datastore({
  filename: "favorites.db",
  autoload: true,
});

const server = http.createServer(async (req, res) => {
  const { url } = req;
  const splitUrl = decodeURIComponent(req.url).split("/");
  if (/.png$/.test(url)) {
    res.writeHead(200, { "Content-Type": "image/png" });
    res.write(await FileManagement.readImageFile(splitUrl));
    res.end();
    return;
  }
  if (/.jpg$/.test(url)) {
    res.writeHead(200, { "Content-Type": "image/jpeg" });
    res.write(await FileManagement.readImageFile(splitUrl));
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
      const data = await FileManagement.readInitialData(["static", "music"]);
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
            const fileSize = (await fsPromises.stat(pathToElem)).size;
            return { ...element, songSize: fileSize };
          })
        );
        res.write(JSON.stringify(songsWithSizes));
        res.end();
      });
    }
    if (url === "/admin") {
      console.log("admin");
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(
        await fsPromises.readFile(
          path.join(__dirname, "../", "static", "admin.html")
        )
      );
      res.end();
      return;
    }
    if (/.mp3$/.test(url)) {
      const pathToFile = path.join(
        __dirname,
        "../",
        "static",
        "music",
        ...splitUrl
      );
      const range = req.headers.range;
      const fileSize = (await fsPromises.stat(pathToFile)).size;

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
          "Content-Length": (await fsPromises.stat(pathToFile)).size,
        });
        const file = fs.createReadStream(pathToFile);
        file.pipe(res);
      }
    }
  } else if (req.method === "POST") {
    if (url === "/songlist") {
      let clientData = [];
      let albumId;
      req.on("data", (chunk) => {
        clientData = chunk;
      });
      req.on("end", async () => {
        albumId = Number(clientData.toString());
        const albumsList = await FileManagement.readDirectory([
          "/static",
          "music",
        ]);
        const responseData = await FileManagement.readAlbumFilesSize(
          albumsList,
          albumId
        );
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify(responseData));
        res.end();
      });
      return;
    }
    if (url === "/addToFavorites") {
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
    if (url === "/removeFromFavorities") {
      const data = [];
      req.on("data", (chunk) => data.push(chunk));
      req.on("end", () => {
        const sentData = JSON.parse(data.toString());
        DatabaseController.removeFromFavorites(sentData.data);
      });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify("ok"));
      res.end();
      return;
    }
    if (url === "/send") {
      const key = Date.now().toString();
      form.uploadDir = path.join(
        __dirname,
        "../",
        "static",
        "music",
        "upload",
        key
      );
      const dir = path.join(__dirname, "../", "static", "music", "upload", key);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      let names = [];
      form
        .on("fileBegin", (_field, file) => {
          const tempFilePath = file.path.split("\\");
          tempFilePath[tempFilePath.length - 1] = file.name;
          file.path = tempFilePath.join("\\");
          names.push(file.name);
        })
        .parse(req, () => {
          console.log("writing head");
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(names));
        });
      return;
    }
  } else if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }
});

server.listen(PORT, () => {
  console.log(`server available at address: http://localhost:3000`);
});
