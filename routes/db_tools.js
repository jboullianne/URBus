

var pg = require('pg');
 
// create a config to configure both pooling behavior 
// and client options 
// note: all config is optional and the environment variables 
// will be read if the config is not present 
var config = {
  user: 'hci', //env var: PGUSER 
  database: 'hci', //env var: PGDATABASE 
  password: 'LittleBobbyTables!7', //env var: PGPASSWORD 
  host: 'localhost', // Server hosting the postgres database 
  port: 5432, //env var: PGPORT 
  max: 10, // max number of clients in the pool 
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed 
};
 
 
//this initializes a connection pool 
//it will keep idle connections open for 30 seconds 
//and set a limit of maximum 10 idle clients 
var pool = new pg.Pool(config);

module.exports = {
  fetchAgencies: function(id, callback){ 
    pool.connect(function(err, client, done) {
      if(err) {
        return console.error('ERROR fetching client from pool: \"fetchLocations\"', err);
      }
      if(id){
        client.query('SELECT * FROM agencies where id = $1::text', [id], function(err, result) {
          //call `done(err)` to release the client back to the pool (or destroy it if there is an error) 
          done(err);
          if(err) {
            return console.error('ERROR running query: \"fetchLocations\"', err);
          }
          callback(result.rows);
        });
      }else{
        client.query('SELECT * FROM agencies', [], function(err, result) {
          //call `done(err)` to release the client back to the pool (or destroy it if there is an error) 
          done(err);
          if(err) {
            return console.error('ERROR running query: \"fetchLocations\"', err);
          }
          callback(result.rows);
        });
      }
      
    });
  }
}