const express = require('express');
const mongoose = require('mongoose');
const uuid = require('node-uuid');
const config = require('./config')
const Promise = require('bluebird')

// Using Mongolab's driver to connect to a mongo instance on the cloud
mongoose.connect('mongodb://' + config.db.username +':'+ config.db.password + '@' + config.db.driverPath + '/' + config.db.database);



// Sample object schema : This can be overridden, meaning the schema is not strictly followed to support arbitrary inputs
const objectSchema = {
    name:String,
    role:String,
    hobbies:String
};

// Instance of our model, Collection is called as objects
const object = mongoose.model('object',mongoose.Schema(objectSchema, {strict: false},{_id:false}), 'objects');

// Server variables
const app = express();
app.use(express.static(__dirname + '/public'));
const ipaddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
const port = process.env.OPENSHIFT_NODEJS_PORT || 3000;


// Body parser : Helps parse objects as JSON
const bodyParser = require('body-parser');
const multer     = require('multer');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());

// Error handling middleware : Vallidates input and reports accordingly
app.use(function (err, req, res, next) {
    const jsonResponse = {"verb":req.method,"URL":req.host+req.url, "message":err.message}
    res.json(jsonResponse);
    next();
});


// Read a document with it's ID
// RETURNS : A JSON object, appropriate document with the corresponding ID
app.get('/api/objects/:id', function(req, res){
    object.find({uid:req.params.id}, function(err, doc){
        doc.length === 0?res.status(404).send("Not Found"):res.json(doc[0]);

    }).select('-__v').select('-_id');
});

// Retrieve all the id's of the documents in the collection
// RETURNS : An array of document ID's
app.get('/api/objects/', function(req, res){

    object.distinct('uid')
        .then((doc) => {
            const responseArray = [];
            for (let index = 0; index<doc.length; index += 1) {
                responseArray.push('http://'+req.host+req.url+doc[index])
            }
            res.send(responseArray)
        })
        .catch((err) => res.status(500).send('Internal server error'))
});


// Create a document to store it in the database
// RETURNS : A JSON object, document that is posted recently
app.post('/api/objects/', function(req, res){
    const uid = req.body.uid || uuid.v1();

    req.body.uid = uid;
    object.count({uid:uid})
        .then((count) => {
            if (count > 0) {
                res.status(409).send('Conflict with an existing resource');
            }
            return object.create(req.body);
        })
        .then((post) => object.findById(post._id).select('-__v').select('-_id'))
        .then((doc) => res.send(doc))
        .catch((err) => res.status(500).send('Internal server error'))
});

// Update a specific document with it's ID
// RETURNS: A JSON object, the updated document with the corresponding ID
app.put('/api/objects/:id',function(req, res){

    object.count({uid:req.params.id})
        .then((count) => {
            if (count > 0) {
                req.body.uid = req.params.id;
                return object.update({uid : req.params.id}, req.body,{overwrite:true})
            }
            res.status(404).send('ID does not exist')
        })
        .then((post) => object.find({uid:req.body.id}).select('-__v').select('-_id'))
        .then((doc) => res.json(doc[0]))
        .catch((err) => res.status(500).send('Internal server error'))
});

// Delete a specific document with it's id
// RETURNS: Null, when the operation is successful
app.delete('/api/objects/:id', function(req, res){

    object.remove({uid:req.params.id})
        .then((post) => res.send())
        .catch((err) => res.status(500).send('Internal server error'))
});

// Instantiate server
const server = app.listen(port, ipaddress, function () {
    console.log("Server started successfully")
});

// Exports useful for our testing
exports.closeServer = function(){
    server.close();
};