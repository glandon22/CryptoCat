const express = require('express');
const path = require('path');
var moment = require('moment');
moment().format();
const app = express();
const PORT = process.env.PORT || 5000;
var yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
var labels = [];
const mysql = require('mysql');


var coinColors = {
	'Bitcoin': {
		color: '#FF5757'
	},
	'BTC Cash': {
		color: '#ABFF57'
	},
	'BTC Gold': {
		color: '#57FFFF'
	},
	'Litecoin': {
		color: '#AB57FF'
	},
	'Ethereum': {
		color: '#5784FF'
	},
	'Dash': {
		color: '#57FF97'
	},
	'NEM': {
		color: '#FF57F4'
	},
	'Monero': {
		color: '#FFB657'
	},
	'Zcash': {
		color: '#FFFF57'
	},
	'Verge': {
		color: '#001EFF'
	},
};

function findLimit(period) {
    //check to make sure that coin queries isnt empty, if so just return
    if (period === '') {
      return null;
    }
    //check what time period is
    else {
      if (period === '1W') {
        var queryStart = moment().subtract(8, 'days').format('YYYY-MM-DD').toString();
        return "'" + queryStart + "'" + " LIMIT 7";
      }
     
      else if (period === '1M') {
        var queryStart = moment().subtract(31, 'days').format('YYYY-MM-DD').toString();
        return "'" + queryStart + "'" + " LIMIT 30";
      }
      else if (period === '3M') {
        var queryStart = moment().subtract(91, 'days').format('YYYY-MM-DD').toString();
        return "'" + queryStart + "'" + " LIMIT 90";
      }
      else if (period === '1Y') {
        var queryStart = moment().subtract(366, 'days').format('YYYY-MM-DD').toString();
        return "'" + queryStart + "'" + " LIMIT 365";
      }
      //time === ALL
      else {
        return "'0000-00-00' LIMIT 1000000";
      } 
    }
  
}

//store date labels for frontend
var dateLabels = [];

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

// Answer API requests.
app.get('/addCoin', function (req, res) {
  var limit = findLimit(req.query.period);
  console.log(limit);
  const coinName = req.query.coin;
  const connection = mysql.createConnection({
    host: 'coins.cvndjrqk9gtt.us-east-2.rds.amazonaws.com',
    user: 'REDACTED',
    password: 'REDACTED',
  });

  connection.connect(function(err) {
    if (err) {
      console.log(err);
      res.send(err);
    }

    else {
      var columns = labels.length === 0 ? "DATE_FORMAT(date, '%m/%d/%y'), price" : "price";
      connection.query("SELECT " + columns + " FROM coins." + coinName + " WHERE date > " + limit, function(err, results, fields) {
        if (err) {
          console.log(err);
          res.send(err);
        }

        else {
          console.log(results);
          var coinDataStructure = [{
            label: '',
            data: [],
            backgroundColor:[], 
            fill: false,
            borderColor: '',
            pointHoverBackgroundColor: '',
            pointHoverBorderColor: 'grey',
            pointRadius: 1,
            pointHoverRadius: 1
            },
            {
              dates: []
            }
          ];
            coinDataStructure[0].label = coinName;
            coinDataStructure[0].backgroundColor[0] = coinColors[coinName].color;
            coinDataStructure[0].borderColor = coinColors[coinName].color;
            coinDataStructure[0].pointHoverBackgroundColor = coinColors[coinName].color;
            coinDataStructure[0].data = results.map(result => result.price);
            if (labels.length === 0) {
              labels = results.map(result => result['DATE_FORMAT(date, \'%m/%d/%y\')']);
            }
            
            var finalObject = {
              labels: labels,
              datasets: [coinDataStructure[0]]
            };
            res.send(finalObject);
        }
      });
    }
  });
});

app.get('/changePeriod', function(req,res) {
  const connection = mysql.createConnection({
    host: 'coins.cvndjrqk9gtt.us-east-2.rds.amazonaws.com',
    user: 'glandon22',
    password: 'taylord22',
  });
  var limit = findLimit(req.query.time);
  //check to make sure that coin queries isnt empty, if so just return      
  if (req.query.coins === '') {
    //probably need to move this out to global scope for changePeriod bc i will have to update date every time this gets called$@%^^%$#^%&)(&)_&*(&^%^$%@$%!$!$#%@%^$@++++++++++++++)
    connection.query("SELECT DATE_FORMAT(date, '%m/%d/%y') FROM coins.NEM where date > " + limit, function(err,results,fields) {
      labels = results.map(result => result['DATE_FORMAT(date, \'%m/%d/%y\')']);
    res.send(labels);
    });
  }
  //check what time period is
  else {
    //loop over coin name array and grab the data
    
    //load up for loop or map function to make a SQL query for each coin in the query

  //load objects into an array and send back to the front end for integration with my chart
  }
  
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});

app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});
