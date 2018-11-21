// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

var mysql      = require('mysql');
var members = require("./members");
//import { getMembersList } from '/members'; // or './module'

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
//-----------------------------

function waitMs(ms) {
  return new Promise(resolve => {
    console.log('wait : begin'); 
    console.log(`wait(${ms}) : before wait`);   // using template literal
    //`Fifteen is ${a + b} and not ${2 * a + b}.`
    setTimeout(resolve, ms);
    console.log('wait : end'); 
  });
}


//--  returns connection
async function mysqlConnect(credentials) {
  console.log('mysqlConnect --> credentials: "' + JSON.stringify(credentials));  
  await waitMs(500); 
  console.log('mysqlConnect --> after await wait');   
  //return new Error('bad idea') ;

  let connection = mysql.createConnection(credentials);
  let promise = new Promise((resolve, reject) => {
      connection.connect(function(err) {
      if ( err ) {
        console.log('mysqlConnect --> REJECT'); 
        reject(err);
      }
      else {
        console.log('mysqlConnect --> CONNECTED');   
        resolve(connection);
      };
    });
  });
  await promise;
}

async function mysqlQuery(connection, query) {
  console.log('mysqlQuery --> query: "' + JSON.stringify(query));  
  let promise = new Promise((resolve, reject) => {
      connection.query(function(err,  rows, fields) {
      if ( err )
        reject(err);
      else {
        console.log('mysqlConnect --> query OK, fields:'+ JSON.stringify(fields));   
        resolve(rows);
      };
    });
  });
}


async function getMembers() {
  let credentials = {
    host     : process.env.CAF_HOST,
    user     : process.env.CAF_USER,
    password : process.env.CAF_PWD ,
    database : process.env.CAF_DB
  };
 

  try {
    let connection = await mysqlConnect(credentials);
    let query = "'SELECT `memberid`, `forename`, `surname`  FROM `members` WHERE `surname` LIKE 'dalberto'";
    let rows = await mysqlQuery(connection, query);
    connection.end();
    console.log('getMembers --> CLOSED');   
    return rows;
  } catch(err) {
    console.log('getMembers --> ERR' + JSON.stringify(err));  
  }   
  try {
     return members.getMembersList();
  } catch(err) {
    console.log('getMembersList --> ERR' + JSON.stringify(err)); 
    console.error(err, err.stack);
    return [];
  }
}


//-------------------------------

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

/*
app.get("/save-comment-mysql", function (request, response) {

  console.log('save-comment --> STARTED');

  var connection = mysql.createConnection({
    host     : 'sql11.freesqldatabase.com',
    user     : 'sql11154725',
    password : 'pdbP2Kyrxb',
    database : 'sql11154725'
  });

  connection.connect();
  
  console.log('save-comment --> CONNECTED');
  
  connection.query('INSERT INTO comment (subject, message) VALUES (?,?)', [request.query.subject, request.query.message ], function(err, rows, fields) {
  
      if (err) {
      
        console.log('ERROR --> ' + err);
        throw err;
      
      } 
      
      console.log('The subject is: ', request.query.subject);
      console.log('The message is: ', request.query.message);
    }); 

  console.log('save-comment --> EXECUTED');

  connection.end();

  console.log('save-comment --> CLOSED');

  response.sendFile(__dirname + '/public/contact.html');
  
});

*/

app.get("/save-comment", function (request, response) {

  console.log('save-comment --> STARTED');

  const pg = require('pg');
  const connectionString = process.env.DATABASE_URL || 'postgres://exsqqpom:c0HOgBvpwA08L_Be8J7QjNpZtBzSU7iT@stampy.db.elephantsql.com:5432/exsqqpom';

   const client = new pg.Client(connectionString);
   client.connect();

   const query = client.query(
       'UPDATE visits SET visited = visited+1');

   query.on('end', () => { client.end(); });

  //console.log('save-comment --> CONNECTED<<');  
  //console.log('save-comment --> EXECUTED<<');
 // console.log('save-comment --> CLOSED<<');

  response.sendFile(__dirname + '/public/contact.html');
  
});


/*
app.get("/show-comments", function (request, response) {

  console.log('show-comments --> STARTED');

  var connection = mysql.createConnection({
    host     : 'sql11.freesqldatabase.com',
    user     : 'sql11154725',
    password : 'pdbP2Kyrxb',
    database : 'sql11154725'
  });

  connection.connect();
  
  console.log('show-comments --> CONNECTED');
  
  connection.query('SELECT subject AS subject, message AS message FROM comment ', function(err, rows, fields) {
  
      if (err) {
      
        console.log('ERROR --> ' + err);
        throw err;
      
      }  
      
      var commentsRows = '';
      rows.forEach(function(row, nr, rows) {
        
        commentsRows+='<tr><td>' + row.subject + '</td><td>' + row.message + '</td></tr>';
        
      });
      
      var commentsPage = '<html><body>'
      + '<table>'
      + '<tr> <th> Subject </th> <th> Message </th> </tr>'
      + commentsRows
      + '</table>'
      + '</body></html>';
      
      response.send(commentsPage);
      
    }); 

  console.log('show-comments --> EXECUTED');

  connection.end();

  console.log('show-comments --> CLOSED');

  
});

*/

app.get("/show-comments", function (request, response) {
  console.log('show-comments --> STARTED<<');
  getMembers().then(rows => {
    let commentsPage = '<html><body>' + members.prepareMembersTable(rows)  + '</body></html>';;
    response.send(commentsPage);
  });
  console.log('show-comments --> End');
         
  
});


/*
app.get("/dreams", function (request, response) {
  response.send(dreams);
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream);
  response.sendStatus(200);
});

// Simple in-memory store for now
var dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

*/

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

/*
const pg = require('pg');
  const connectionString = process.env.DATABASE_URL || 'postgres://pnwltdwd:wbFjqYU1O2-RiktHhyN6NHEn7-lQAocT@babar.elephantsql.com:5432/pnwltdwd';

   const client = new pg.Client(connectionString);
   client.connect();

   const query1 = client.query(
      'CREATE TABLE redbutton (seen INTEGER, pressed INTEGER)');

//const query1 = client.query(
 //      'DROP TABLE redbutton');

   //query1.on('end', () => { client.end(); });
 
   //client.connect();
   const query2 = client.query(
       'INSERT INTO redbutton (seen, pressed) VALUES (0, 0)');

   //query2.on('end', () => { client.end(); });
*/
