This is a CRUD API built in nodejs

Public URL of this API : http://crudapi-kdin.rhcloud.com/api/objects/

Automated tests information:
- The automated tests are written using the Jasmine testing framework
- Tests can be found in spec/test_spec.js
- All the tests are properly commented for understandability
- My normal practice is to put the testing constants in a separate file and import them
- It is not done so here to make things easy for the reader

Code information:
- The server side code can be found in /server.js
- The code is properly commented for understandability
- My normal practice is to have a separate file for a functionality
- It is not done so here to make things easy for the reader

Instructions for setting up and executing the code and tests:
- Pull entire code into a local repository
- Have nodejs and npm installed in your computer
- This API has quite a few dependencies, you need to install all of them specified in /package.json (or simply run "npm install" from bash)
- Executing the code: run the command "node server.js", you can see the server running at "localhost:3000/api/objects/"
- Executing the tests : DONT START THE SERVER, run the command "npm test", you see the status of tests

- Rest of the usage information correspond exactly to the Assignment document

Database information:
- I have used an online MongoDB instance from Mongolabs and connected using their driver into this API through Mongoose


