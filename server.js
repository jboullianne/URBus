// Load Dependencies
const express = require('express');
const routes = require('./routes');

var app = express();

//  Connect all our routes to our application
app.use(express.static('public'));
app.use('/api/', routes);

// Turn on the server!
app.listen(3000, () => {
  console.log('App listening on port 3000');
});