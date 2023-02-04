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
// Set the view engine and view directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/"));

// Use the fileUpload middleware
app.use(fileUpload());

// Use the express.json
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Serve static files from the 'assets' directory
app.use("/assets", express.static("assets"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Route for the root path
app.get("/", (req, res) => {
  // Set the response status to 200 (OK)
  res.status(200);
  // Render the "views/index" template, passing in appName and appFavicon as data
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
    axios
      .post(webhookUrl, {
        content: `Received email: ${email}`,
      })
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

// A function to authenticate with API
const authenticate = (req, res, next) => {
  const authorizationHeader = req.headers["x-api-token"];
  if (!authorizationHeader || authorizationHeader !== apiToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// The POST endpoint "/upload"
app.get("/upload", (req, res) => {
  res.redirect("/");
});
app.post("/upload", (req, res) => {
  // If there are no files in the request, return a 404 error
  if (!req.files) {
    res.status(404);
    res.render("views/404");
    return;
  }

  // A function to generate a random string of a specified length
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

  // Get the original name of the file and its extension
  let fileName = req.files.myFile.name;
  let splitter = fileName.split(".");
  let extension = splitter[splitter.length - 1];

  // Generate a random string for the file name
  let DecidedFileName = generateString(20);

  // Move the uploaded file to the "./public/uploads" directory with the decided file name
  req.files.myFile.mv(
    "./public/uploads/" + DecidedFileName + "." + extension,
    (error) => {
      if (error) console.log(error);
    }
  );

  // Calculate the file size in MB or KB
  let filesize = Math.round(req.files.myFile.size / 1e6) + " Megabytes";

  // If the file size is 0 MB, calculate it in KB instead
  if (filesize === "0 Megabytes") {
    filesize = Math.round(req.files.myFile.size / 1000) + " Kilobytes";
  } else {
    res.status(200);
  }

  // Check the app port number
  if (appPort === 80 || appPort === 443) {
    // If app port is 80, create file link without port
    let fileLink = appLink + "/files/" + DecidedFileName + "." + extension;
    let uploadLink = appLink + "/uploads/" + DecidedFileName + "." + extension;

    // Render the success page with file link, size, name, app favicon and name
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
  } else {
    // If app port is neither 80 nor 443, create file link with port
    let fileLink =
      appLink + ":" + appPort + "/files/" + DecidedFileName + "." + extension;

    // Render the success page with file link, size, name, app favicon and name
    res.render("views/success.ejs", {
      fileLink: fileLink,
      fileSize: filesize,
      fileName: DecidedFileName + "." + extension,
      appFavicon: appFavicon,
      appName: appName,
      discordInvite: discordInvite,
    });
  }
});

app.post("/api/upload", cors(), authenticate, (req, res) => {
  // If no file is uploaded
  if (!req.files) {
    res.status(404);
    res.json({ ERROR: "No Files Specified" });
    return;
  }

  // Generates a random string of specified length
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

  // Split file name and get its extension
  let fileName = req.files.myFile.name;
  let splitter = fileName.split(".");
  let extension = splitter[splitter.length - 1];

  // Generate a random string for the file name
  let DecidedFileName = generateString(20);

  // Move the uploaded file to public/uploads folder
  req.files.myFile.mv(
    "./public/uploads/" + DecidedFileName + "." + extension,
    (error) => {
      if (error) console.log(error);
    }
  );

  // Calculate file size and set response status to 200
  let filesize = Math.round(req.files.myFile.size / 1e6) + " Megabytes";
  filesize === "0 Megabytes"
    ? (filesize = Math.round(req.files.myFile.size / 1000) + " Kilobytes")
    : res.status(200);

  // Respond with file details based on app port number
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

// The GET endpoint "/files/*"
app.get("/files/*", (req, res) => {
  let fileToGet = req.path.slice(7);

  try {
    if (fs.existsSync(`./public/uploads/${fileToGet}`)) {
      //Random number
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
