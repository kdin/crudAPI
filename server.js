var express = require('express');
var mongoose = require('mongoose');

// Using Mongolab's driver to connect to a mongo instance on the cloud
mongoose.connect('mongodb://kdin:kdin@ds019481.mlab.com:19481/cruddb');

// Sample object schema : This can be overridden, meaning the schema is not strictly followed to support arbitrary inputs
var objectSchema = {
    name:String,
    role:String,
    hobbies:String
}

// Instance of our model, Collection is called as objects
var object = mongoose.model('object',mongoose.Schema(objectSchema, {strict: false}), 'objects');

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
    object.findById(req.params.id, function(err, doc){
        doc == null?res.status(404).send("Not Found"):res.json(doc);

    }).select('-__v');
});

// Retrieve all the id's of the documents in the collection
// RETURNS : An array of document ID's
app.get('/api/objects/', function(req, res){
    object.find(function(err, doc){
        var responseArray = [];
        for (var index = 0; index<doc.length;index += 1){
            responseArray.push(req.host+req.url+doc[index]._id);
        }
        res.json(responseArray);
    });
});

// Create a document to store it in the database
// RETURNS : A JSON object, document that is posted recently
app.post('/api/objects/', function(req, res){
    object.create(req.body, function (err, post) {
        if (err){
            return err;
        }
        else{

            object.findById(post._id, function (err, doc) {
                res.send(doc);
            }).select('-__v');

        }
    });
});

// Update a specific document with it's ID
// RETURNS: A JSON object, the updated document with the corresponding ID
app.put('/api/objects/:id',function(req, res){

    object.count({_id:req.params.id}, function(err, count) {
        if (count > 0){
            object.findByIdAndUpdate(req.params.id,req.body,{overwrite:true},function(err, post){
                if (err) { return err;}
                else{
                    object.findById(req.params.id, function(err, doc){
                        res.json(doc);
                    }).select('-__v');
                }
            });
        }
        else{
            res.status(404).send("ID does not exists");
        }
    });

});

// Delete a specific document with it's id
// RETURNS: Null, when the operation is successful
app.delete('/api/objects/:id', function(req, res){

    object.findByIdAndRemove(req.params.id, req.body, function(err, post){
        if (err) {return err;}
        else{
            res.send();
        }
    })
});

// Instantiate server
var server = app.listen(port, ipaddress, function () {
    console.log("Server started successfully")
});

// Exports useful for our testing
exports.closeServer = function(){
    server.close();
};