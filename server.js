var express = require('express');
var mongoose = require('mongoose');
var uuid = require('node-uuid');
var config = require('config')
// Using Mongolab's driver to connect to a mongo instance on the cloud

mongoose.connect('mongodb://' + config.db.username +':'+ config.db.password + '@' + config.db.driverPath + '/' + config.db.database);



// Sample object schema : This can be overridden, meaning the schema is not strictly followed to support arbitrary inputs
var objectSchema = {
    name:String,
    role:String,
    hobbies:String
};

// Instance of our model, Collection is called as objects
var object = mongoose.model('object',mongoose.Schema(objectSchema, {strict: false},{_id:false}), 'objects');

// Server variables
var app = express();
app.use(express.static(__dirname + '/public'));
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;


// Body parser : Helps parse objects as JSON
var bodyParser = require('body-parser');
var multer     = require('multer');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());

// Error handling middleware : Vallidates input and reports accordingly
app.use(function (err, req, res, next) {
    var jsonResponse = {"verb":req.method,"URL":req.host+req.url, "message":err.message}
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
    object.distinct("uid",function(err, doc){
        var responseArray = [];
        for (var index = 0; index<doc.length;index += 1){
            responseArray.push("http://"+req.host+req.url+doc[index]);
        }
        res.send(responseArray);
    });
});

// Create a document to store it in the database
// RETURNS : A JSON object, document that is posted recently
app.post('/api/objects/', function(req, res){
    if (req.body._id){
        res.send("CANNOT USE _id : MONGODB'S DEFAULT IDENTIFIER");
    }
    else{
        if (req.body.uid){
            object.count({uid:req.body.uid}, function (err, count) {
                if(count>0){
                    res.send("DOCUMENT WITH UID ALREADY EXISTS");
                }
                else{
                    object.create(req.body, function(err, post){
                        if (err){ return err;}
                        else{
                            object.findById(post._id, function (err, doc) {
                                res.send(doc);
                            }).select('-__v').select('-_id');
                        }
                    });
                }
            });
        }
        else{
            req.body.uid = uuid.v1();
            object.create(req.body, function(err, post){
                if (err){ return err;}
                else{
                    object.findById(post._id, function (err, doc) {
                        res.send(doc);
                    }).select('-__v').select('-_id');
                }
            });
        }

    }
});

// Update a specific document with it's ID
// RETURNS: A JSON object, the updated document with the corresponding ID
app.put('/api/objects/:id',function(req, res){
    if (req.body._id) {
        res.send("DO NOT TOUCH THE DEFAULT _id");
    }
    else{
        object.count({uid:req.params.id}, function(err, count) {
            if (count > 0){
                if (!req.body.uid){
                    req.body.uid = req.params.id;
                }
                object.update({uid : req.params.id}, req.body,{overwrite:true},function(err, post){
                    if (err) { return err;}
                    else{
                        object.find({uid:req.body.uid}, function(err, doc){
                            res.json(doc[0]);
                        }).select('-__v').select('-_id');
                    }
                });
            }
            else{
                res.status(404).send("ID does not exists");
            }
        });
    }
});

// Delete a specific document with it's id
// RETURNS: Null, when the operation is successful
app.delete('/api/objects/:id', function(req, res){

    object.remove({uid:req.params.id}, function(err, post){
        if (err) {return err;}
        else {res.send();}
    });
});

// Instantiate server
var server = app.listen(port, ipaddress, function () {
    console.log("Server started successfully")
});

// Exports useful for our testing
exports.closeServer = function(){
    server.close();
};