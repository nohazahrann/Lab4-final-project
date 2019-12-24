"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var app = express();
var ejs = require('ejs');
var path = require("path");
app.use(express.static(path.join(__dirname, '/public')));
var metrics_1 = require("./metrics");
app.set('views', __dirname + "/views");
app.set('view engine', 'ejs');
var port = process.env.PORT || '8080';
app.get('/', function (req, res) {
    res.write('Hello world');
    res.end();
});
app.get('/hello/:name', function (req, res) { return res.render('hello.ejs', { name: req.params.name }); });
app.listen(port, function (err) {
    if (err) {
        throw err;
    }
    console.log("server is listening on port " + port);
});
app.get('/metrics.json', function (req, res) {
    metrics_1.MetricsHandler.get(function (err, data) {
        if (err)
            throw err;
        res.status(200).json(data);
    });
});
