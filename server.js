var express = require('express');
const fileUpload = require("express-fileupload");
var app = express();
const path = require('path');
const fs = require('fs');
const getHandler = require('./api/get/handler.js')
const postHandler = require('./api/post/handler.js')


// Read settings file
const JsonAfterReading = fs.readFileSync('./settings.json')
const jsonData = JSON.parse(JsonAfterReading);
const realToken = `Bearer ${jsonData.api.token}`
const port = jsonData.app.PORT

// Set the view engine and view directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/'));

// Use the fileUpload middleware
app.use(fileUpload());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the 'assets' directory
app.use('/assets', express.static('assets'));

// Route for the root path
app.get('/', function (req, res) {
    // Function to generate a random number between two values
    function getRandomNumberBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    let titleJ = jsonData.display_embed.title;

    // Function to get the total size of files in a directory
    const getAllFiles = function (dirPath, arrayOfFiles) {
        files = fs.readdirSync(dirPath)

        arrayOfFiles = arrayOfFiles || []

        files.forEach(function (file) {
            if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
            } else {
                arrayOfFiles.push(path.join(__dirname, dirPath, file))
            }
        })

        return arrayOfFiles
    }

    const getTotalSize = function (directoryPath) {
        const arrayOfFiles = getAllFiles(directoryPath)

        let totalSize = 0

        arrayOfFiles.forEach(function (filePath) {
            totalSize += fs.statSync(filePath).size
        })

        return totalSize
    }

    // Function to convert bytes to a human-readable size
    const convertBytes = function (bytes) {
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

        if (bytes == 0) {
            return "n/a"
        }

        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))

        if (i == 0) {
            return bytes + " " + sizes[i]
        }

        return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i]
    }

    let totalUploadedFiles = convertBytes(getTotalSize('./public/uploads'))
    let appName = jsonData.app.appName;
    let appFavicon = jsonData.app.appFavicon;



    res.status(200);
    res.render('themes/default/index', {
        appName: appName,
        appFavicon: appFavicon
    });
});

app.get('/api-docs', (req, res) => {
    res.status(200);
    res.render('themes/default/api-docs.ejs', {
        app_link: jsonData.app.appLink
    })
})


app.post('/upload', (req, res) => {
    if (!req.files) {
        res.status(404);
        res.render('themes/default/404')
        return;
    }
    //Generate Random Name
    function generateString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }
    let fileName = req.files.myFile.name;
    let splitter = fileName.split('.');
    let extension = splitter[splitter.length - 1];
    let appName = jsonData.app.appName;
    let appFavicon = jsonData.app.appFavicon;
    let DecidedFileName = generateString(20);
    let appPort = jsonData.app.PORT;

    req.files.myFile.mv('./public/uploads/' + DecidedFileName + '.' + extension, (error) => {
        if (error) console.log(error);
    })


    let filesize = Math.round(req.files.myFile.size / 1e+6) + " Megabytes";
    filesize === "0 Megabytes" ? filesize = Math.round(req.files.myFile.size / 1000) + " Kilobytes" :
        res.status(200);
    // res.redirect('/uploads/' + DecidedFileName + '.' + extension);

    if (appPort === 80) {

        let fileLink = jsonData.app.appLink + '/files/' + DecidedFileName + '.' + extension;
        res.render('themes/default/success.ejs', {
            fileLink: fileLink,
            fileSize: filesize,
            fileName: DecidedFileName + '.' + extension,
            appFavicon: appFavicon,
            appName: appName
        });

    } else {

        if (appPort === 443) {

            let fileLink = jsonData.app.appLink + '/files/' + DecidedFileName + '.' + extension;
            res.render('themes/default/success.ejs', {
                fileLink: fileLink,
                fileSize: filesize,
                fileName: DecidedFileName + '.' + extension,
                appFavicon: appFavicon,
                appName: appName
            });

        } else {

            let fileLink = jsonData.app.appLink + ':' + appPort + '/files/' + DecidedFileName + '.' + extension;
            res.render('themes/default/success.ejs', {
                fileLink: fileLink,
                fileSize: filesize,
                fileName: DecidedFileName + '.' + extension,
                appFavicon: appFavicon,
                appName: appName
            });





        }

    }

})

app.post('/api/upload', (req, res) => {
    if (!req.files) {
        res.status(404);
        res.json({ "ERROR": "No Files Specified" })
        return;
    }
    //Generate Random Name
    function generateString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }
    let fileName = req.files.myFile.name;
    let splitter = fileName.split('.');
    let extension = splitter[splitter.length - 1];

    let DecidedFileName = generateString(20);

    req.files.myFile.mv('./public/uploads/' + DecidedFileName + '.' + extension, (error) => {
        if (error) console.log(error);
    })


    let filesize = Math.round(req.files.myFile.size / 1e+6) + " Megabytes";
    let appPort = jsonData.app.PORT;
    filesize === "0 Megabytes" ? filesize = Math.round(req.files.myFile.size / 1000) + " Kilobytes" :
        // res.redirect('/uploads/' + DecidedFileName + '.' + extension);
        res.status(200);
    if (appPort === 80) {

        let fileLink = jsonData.app.appLink + '/files/' + DecidedFileName + '.' + extension;
        res.json({
            "data": {
                "fileLink": fileLink,
                "fileSize": filesize,
                "fileName": DecidedFileName + '.' + extension
            }
        })


    } else {

        if (appPort === 443) {

            let fileLink = jsonData.app.appLink + '/files/' + DecidedFileName + '.' + extension;
            res.json({
                "data": {
                    "fileLink": fileLink,
                    "fileSize": filesize,
                    "fileName": DecidedFileName + '.' + extension
                }
            })


        } else {

            let fileLink = jsonData.app.appLink + ':' + json.app.PORT + '/files/' + DecidedFileName + '.' + extension;
            res.json({
                "data": {
                    "fileLink": fileLink,
                    "fileSize": filesize,
                    "fileName": DecidedFileName + '.' + extension
                }
            })

        }

    }
    // res.render('themes/default/success.ejs', {
    //     fileLink: fileLink,
    //     fileSize: filesize,
    //     fileName: DecidedFileName + '.' + extension
    // });

    //creating a htmlFile
    //html content
    // let content = 
    // fs.writeFileSync(`./public/html/${DecidedFileName}.html`, content)

})

app.get('/files/*', (req, res) => {
    let fileToGet = req.path.slice(7);

    try {
        if (fs.existsSync(`./public/uploads/${fileToGet}`)) {

            //Random number
            function getRandomNumberBetween(min, max) {
                return Math.floor(Math.random() * (max - min + 1) + min);
            }

            let titleJ = jsonData.display_embed.title;
            let descriptionJ = jsonData.display_embed.description;

            res.status(200);

            res.render('themes/default/display_file', {
                imageDirectLink: `${jsonData.app.appLink}:${port}/uploads/${fileToGet}`,
                app_link: jsonData.app.appLink,
                title: titleJ[getRandomNumberBetween(0, titleJ.length - 1)],
                description: descriptionJ[getRandomNumberBetween(0, descriptionJ.length - 1)]
            })



        } else {
            res.status(404);
            res.render('themes/default/404')
        }
    }
    catch {
        res.status(404);
        res.render('themes/default/404')
    }
})


app.use('/api/*', (req, res) => {
    let token = req.headers.token;
    let pth = req.originalUrl
    // Return if Token dosent matches
    if (token != realToken) {
        res.status(404)
        res.render('themes/default/404')
        return;
    }

    if (req.method === 'GET') {
        getHandler(req, res, pth)
    } else if (req.method === 'POST') {
        postHandler(req, res, pth)
    } else {
        res.status(404)
        res.render('themes/default/404')
        return;
    }
})



app.use((req, res) => {
    res.status(404).render('themes/default/404')
})

app.listen(port, (err) => {
    err ? console.log(err) :
        console.log("Webserver Started on Port: " + port)
});
