var express = require('express');
var mongoose = require('mongoose');

mongoose.connect('mongodb://kdin:kdin@ds019481.mlab.com:19481/cruddb');
var objectSchema = {
    name:String,
    role:String,
    hobbies:String
}

var object = mongoose.model('object',mongoose.Schema(objectSchema, {strict: false}), 'objects');

var app = express();
app.use(express.static(__dirname + '/public'));
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;


var bodyParser = require('body-parser');
var multer     = require('multer');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());
app.use(function (err, req, res, next) {
    var jsonResponse = {"verb":req.method,"URL":req.host+req.url, "message":err.message}
    res.json(jsonResponse);
    next();
});


app.get('/api/objects/:id', function(req, res){
    object.findById(req.params.id, function(err, doc){
        res.json(doc);
    })
});
app.get('/api/objects/', function(req, res){
    object.find(function(err, doc){
        var responseArray = [];
        for (var index = 0; index<doc.length;index += 1){
            responseArray.push(doc[index]._id);
        }
        res.json(responseArray);
    })
});

app.post('/api/objects/', function(req, res){
    object.create(req.body, function (err, post) {
        if (err){
            return err;
        }
        else{
            res.send(post);
        }
    });
});

app.put('/api/objects/:id',function(req, res){

    object.findByIdAndUpdate(req.params.id,req.body,function(err, post){
        if (err) { return err;}
        else{
            res.json(req.body);
        }
    });
});

app.delete('/api/objects/:id', function(req, res){

    object.findByIdAndRemove(req.params.id, req.body, function(err, post){
        if (err) {return err;}
        else{
            res.send();
        }
    })
});
app.listen(port, ipaddress);