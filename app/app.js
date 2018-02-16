'use strict';

var express = require('express');
var child_process = require('child_process');
var fs = require('fs');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var path = require('path');

var app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

// find static files (referenced by /assets) in the assets directory
app.use('/assets', express.static(path.join(__dirname,'assets')));

// use bodyParser middleware to get data from post requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// use expressValidator to validate and sanitize data from post requests
app.use(expressValidator());


app.get('/', function(req, res) {
    var data = {
        inputs : {
            n1 : 13,
            n2 : -7,
            n3 : -3
        }
    };
    res.render('index', { data: data });
});


app.post('/', function(req, res) {

    console.log('incoming data from client:');
    console.log (JSON.stringify(req.body));

    // validate parameters from form
    req.checkBody('n1', 'Invalid number').isInt();
    req.checkBody('n2', 'Invalid number').isInt();
    req.checkBody('n3', 'Invalid number').isInt();

    // sanitize to avoid cross site scripting errors
    req.sanitize('n1').escape();
    req.sanitize('n2').escape();
    req.sanitize('n3').escape();

    var data = {
        inputs : {
            n1 : parseFloat(req.body.n1),
            n2 : parseFloat(req.body.n2),
            n3 : parseFloat(req.body.n3)
        }
    };

    console.log('sanitized data from client to simulation:');
    console.log(data);

    // FIXME: send error if form data did not pass validation.
    // FIXME: look into form validation bubbles:
    // http://developer.telerik.com/featured/building-html5-form-validation-bubble-replacements/

    // kick off a simulation run
    console.log('running the simulation');
    var spawn = child_process.spawn;
    var spiroPath = path.join(__dirname,'spiro.py');
    var process = spawn( 'python', [ spiroPath, '--use-stdstreams' ]);

    // feed inputs into simulator
    process.stdin.write(JSON.stringify(data));
    process.stdin.end();

    // read output file
    let results = [];
    process.stdout
        .on('data', (chunk) => {
            console.log('receiving results from simulation');
            results.push(chunk);
        })
        .on('end', () => {
            results = JSON.parse(Buffer.concat(results).toString('utf8'));

            // send plotly javascript back to client
            console.log('returning results to client');
            res.type('json').send(results)
        });
});

module.exports = app;

// app.listen(8001, function() {
//     console.log('server running on port 8001');
// });
