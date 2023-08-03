const bodyParser = require('body-parser');
var fs = require('fs');
var http = require('http');
var https = require('https');
const path = require('path');

var privateKey = fs.readFileSync('./key.pem', 'utf8');
var certificate = fs.readFileSync('./cert.pem', 'utf8');

var credentials = { key: privateKey, cert: certificate, passphrase: '789456123' };
var express = require('express');
var app = express();
var dapp = express();
const upload = require('express-fileupload');

var cors = require('cors');
var _month;

app.use(upload());
app.use('/public', express.static(__dirname + '/public'));

// your express configuration here

app.use(bodyParser.json());

app.use(express.urlencoded({
    extended: true
}));


app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'HEAD, GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', '*'/*'X-Requested-With,content-type'*/);

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);


    // Pass to next layer of middleware
    next();
});

var corsOptions = {
    origin: ['http://localhost:5000/', 'https://donations.treepoets.com/'],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.post('/slashProfile', cors(corsOptions), (req, res) => {

    (async () => {

        var counter;

        await new Promise(resolve => setTimeout(resolve, 3000));

        var addressW = req.body.addressW;
        
        console.log("addressW :" + addressW);

        await new Promise(resolve => setTimeout(resolve, 2000));

        if (req.files) {
            console.log(req.files);

            var file = req.files.file;
            var filename = file.name;


            var csvName = "./uploads/" + addressW + '.png';
            var csvNameBNB = "./uploadsbnb/" + addressW + '.png';

            file.mv(__dirname + '/uploads/' + filename, function (err) {
                if (err) {
                    res.send(err);
                } else {

                    //...................................................................................//
                    try {

                        fs.rename(__dirname + '/uploads/' + filename, __dirname + '/uploads/' + addressW + '.png', function (err) {
                            if (err) {
                                throw err;
                            } else {
                                console.log('File Renamed.' + __dirname + '/uploads/' + addressW + '.png');
                            }
                        });

                        // new Promise(resolve => setTimeout(resolve, 3000));

                        const EasyFtp = require('easy-ftp');

                        const config = {
                          host: '173.201.184.246',
                          type: 'ftp',
                          port: '21',
                          username: 'poet@treepoets.com',
                          password: "layerlapse@2022"
                        };
                        
                       
                          const ftpbnb = new EasyFtp();
                        
                          ftpbnb.connect(config);
                        
                          ftpbnb.on('open', function () {
                            ftpbnb.upload(csvName, csvNameBNB, function (err) {
                              if (err) {
                                console.log('Error uploading CSV:', err);
                              } else {
                                console.log('CSV uploaded successfully');
                              }
                            });
                          });                        
                         
                       
                    } catch (err) {
                        console.log("Error :" + err);
                    }
                }

                //...................................................................................//

            });

            await new Promise(resolve => setTimeout(resolve, 60000));

            fs.unlink(csvName, function () {
                //file deleted
            });

        }

    })();
})

app.listen(process.env.PORT || 5000, () => {
    console.log("running on port 5000");
});