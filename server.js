const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const app = express();
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const bodyParser = require("body-parser");

// Read settings file
const config = fs.readFileSync("./settings.json");
const settings = JSON.parse(config);

// Get the app name, port, link and favicon from settings
const appName = settings.app.appName;
const appFavicon = settings.app.appFavicon;
const appPort = settings.app.appPort;
const appLink = settings.app.appLink;
const apiToken = settings.api.apiToken;
const webhookUrl = settings.app.webhookURL;
const discordInvite = settings.social.discord;
const twitterInvite = settings.social.twitter;
const facebookInvite = settings.social.facebook;
const instagramInvite = settings.social.instagram;
const linkedinInvite = settings.social.linkedin;

app.use(cors());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/"));
app.use(fileUpload());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static("assets"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(200);
  res.render("views/index", {
    appName: appName,
    appFavicon: appFavicon,
    discordInvite: discordInvite,
    twitterInvite: twitterInvite,
    facebookInvite: facebookInvite,
    instagramInvite: instagramInvite,
    linkedinInvite: linkedinInvite,
  });
});

app.post("/subscribe", (req, res) => {
  if (req.method === "POST") {
    const email = req.body.email;
    const data = {
      embeds: [
        {
          title: "Email Recieved (Subscription):",
          color: 0xff0000,
          description: "Email - " + "`" + email + "`",
        },
      ],
    };
    axios
      .post(webhookUrl, data)
      .then(() => {
        res.redirect("/");
      })
      .catch((error) => {
        res.send(`Error sending email: ${error}`);
      });
  } else {
    res.status(405).send("Invalid request method");
  }
});

const authenticate = (req, res, next) => {
  const authorizationHeader = req.headers["x-api-token"];
  if (!authorizationHeader || authorizationHeader !== apiToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

app.get("/upload", (req, res) => {
  res.redirect("/");
});
app.post("/upload", (req, res) => {
  if (!req.files) {
    res.status(404);
    res.render("views/404");
    return;
  }

  function generateString(length) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  let fileName = req.files.myFile.name;
  let splitter = fileName.split(".");
  let extension = splitter[splitter.length - 1];

  let DecidedFileName = generateString(20);

  req.files.myFile.mv(
    "./public/uploads/" + DecidedFileName + "." + extension,
    (error) => {
      if (error) console.log(error);
    }
  );

  let filesize = Math.round(req.files.myFile.size / 1e6) + " Megabytes";

  if (filesize === "0 Megabytes") {
    filesize = Math.round(req.files.myFile.size / 1000) + " Kilobytes";
  } else {
    res.status(200);
  }

  if (appPort === 80 || appPort === 443) {
    let fileLink = appLink + "/files/" + DecidedFileName + "." + extension;
    let uploadLink = appLink + "/uploads/" + DecidedFileName + "." + extension;

    res.render("views/success.ejs", {
      uploadLink: uploadLink,
      fileLink: fileLink,
      fileSize: filesize,
      fileName: DecidedFileName + "." + extension,
      appFavicon: appFavicon,
      appName: appName,
      discordInvite: discordInvite,
      twitterInvite: twitterInvite,
      facebookInvite: facebookInvite,
      instagramInvite: instagramInvite,
      linkedinInvite: linkedinInvite,
    });
    const data = {
      embeds: [
        {
          title: "User Uploaded an file (/upload)",
          color: 0xff0000,
          description: "\nFile Name - " + fileName + "\nFile Link - " + fileLink + "\nFile Sze - " + "||" + fileSize + "||",
          image: {
            url: uploadLink,
          },
        },
      ],
    };
    axios.post(webhookUrl, data);
  } else {
    let fileLink =
      appLink + ":" + appPort + "/files/" + DecidedFileName + "." + extension;
    let uploadLink =
      appLink + ":" + appPort + "/uploads/" + DecidedFileName + "." + extension;

    res.render("views/success.ejs", {
      fileLink: fileLink,
      fileSize: filesize,
      fileName: DecidedFileName + "." + extension,
      appFavicon: appFavicon,
      appName: appName,
      discordInvite: discordInvite,
    });
    const data = {
      embeds: [
        {
          title: "User Uploaded an file (/upload)",
          color: 0xff0000,
          description:
            "User IP - " + "||" + clientIP + "|| \n File Link - " + fileLink,
          image: {
            url: uploadLink,
          },
        },
      ],
    };
    axios.post(webhookUrl, data);
  }
});

app.post("/api/upload", cors(), authenticate, (req, res) => {
  if (!req.files) {
    res.status(404);
    res.json({ ERROR: "No Files Specified" });
    return;
  }

  function generateString(length) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  let fileName = req.files.myFile.name;
  let splitter = fileName.split(".");
  let extension = splitter[splitter.length - 1];

  let DecidedFileName = generateString(20);

  req.files.myFile.mv(
    "./public/uploads/" + DecidedFileName + "." + extension,
    (error) => {
      if (error) console.log(error);
    }
  );

  let filesize = Math.round(req.files.myFile.size / 1e6) + " Megabytes";
  filesize === "0 Megabytes"
    ? (filesize = Math.round(req.files.myFile.size / 1000) + " Kilobytes")
    : res.status(200);

  if (appPort === 80) {
    let fileLink = appLink + "/files/" + DecidedFileName + "." + extension;
    res.json({
      data: {
        fileLink: fileLink,
        fileSize: filesize,
        fileName: DecidedFileName + "." + extension,
      },
    });
  } else if (appPort === 443) {
    let fileLink = appLink + "/files/" + DecidedFileName + "." + extension;
    res.json({
      data: {
        fileLink: fileLink,
        fileSize: filesize,
        fileName: DecidedFileName + "." + extension,
      },
    });
  } else {
    let fileLink =
      appLink + ":" + appPort + "/files/" + DecidedFileName + "." + extension;
    res.json({
      data: {
        fileLink: fileLink,
        fileSize: filesize,
        fileName: DecidedFileName + "." + extension,
      },
    });
  }
});

app.get("/files/*", (req, res) => {
  let fileToGet = req.path.slice(7);

  try {
    if (fs.existsSync(`./public/uploads/${fileToGet}`)) {
      function getRandomNumberBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
      }

      let appTitle = settings.embed.title;
      let appDescription = settings.embed.description;

      res.status(200);

      res.render("views/display", {
        imageDirectLink: `${appLink}:${appPort}/uploads/${fileToGet}`,
        app_link: appLink,
        title: appTitle[getRandomNumberBetween(0, appTitle.length - 1)],
        description:
          appDescription[getRandomNumberBetween(0, appDescription.length - 1)],
      });
    } else {
      res.status(404);
      res.render("views/404");
    }
  } catch {
    res.status(404);
    res.render("views/404");
  }
});

app.use((req, res) => {
  res.status(404).render("views/404");
});

app.listen(appPort, (err) => {
  err
    ? console.log(err)
    : console.log("Webserver Started on appPort: " + appPort);
});
