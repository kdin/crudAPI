/**
 * Created by KD on 25-Apr-16.
 */

/* This API is tested for the CRUD functionality using Jasmine testing framework */

var request = require("request");
var crudApp = require("../server.js");

// ------------------ Constants for testing ------------------
// Change the URL as you wish (Either test it local or the cloud API on OpenShift) -- CURRENTLY SET TO LOCAL
// Normally I would put these in a separate file. I put these in the same file to make it easy for the reader
var baseUrl = "http://localhost:3000/api/objects/";
var getUrl = baseUrl+"5722b177824401282653f435";
var updateUrl = baseUrl+"5722b182824401282653f436";
var deleteUrl = baseUrl+"5722b16d824401282653f434";

var postTest = {
    uri:baseUrl,
    method:'POST',
    json:{
        "name":"Mike",
        "hobby":"Playing with tech"
    }
};
var putTest = {
    uri:updateUrl,
    method:'PUT',
    json:{
        "name":"Allen",
        "hobby":"Football"
    }
};

//------------------------- Constants for testing -----------------

// ----------------------- Testing the CRUD functionality --------------------
describe("CRUD Test", function(){

    // ------------- Response Test : Checks the response code if the connection is Okay -------------
    describe("GET /api/objects/", function () {

        it("returns status code 200", function (done) {

            request.get(baseUrl, function (error, response, body) {
               expect(response.statusCode).toBe(200);
                done();
            });
        });
    });
    // ------------- Response Test end ----------------------------------------------------------------

    // ------------- GET test : Tests the read functionality of the API -------------
    describe("GET a document", function () {

        it("returns Dinesh", function (done) {
            request.get(getUrl, function (error, response, body) {
                var body = JSON.parse(body);
                expect(body.name).toBe("Dinesh");
                done();
            });
        });
    });
    // -------------- GET test end ---------------------------------------------------

    // -------------- POST test : Tests the create functionality of the API -----------------
    describe("POST a document", function () {

        it("returns Mike", function (done) {
            request(postTest, function (error, response, body) {
                expect(body.name).toBe("Mike");
                done();
            });
        });
    });
    // ------------- POST test end ------------------------------------------------------------

    // ------------- UPDATE test : Tests the update functionality of the API ------------------
    describe("Update a document", function () {
        it("returns Allen's hobby as Football", function (done) {
            request(putTest, function (error, response, body) {
                expect(body.hobby).toBe("Football");
                done();
            });
        });
    });
    // ------------- UPDATE test end ---------------------------------------------------------

    // ------------- DELETE test : Tests the delete functionality of the API -----------------
    describe("Delete an unwanted document", function () {
        it("returns nothing", function (done) {
            request.delete(deleteUrl, function (error, response, body) {
                expect(body).toBe('');
                crudApp.closeServer();
                done();
            });
        });
    });
    // ------------- DELETE test end ---------------------------------------------------------
});

// ----------- Testing CRUD functionality ends