const express = require('express');
const path = require('path');
var moment = require('moment');
moment().format();
const app = express();
const PORT = process.env.PORT || 5000;
var yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
var labels = [];
const mysql = require('mysql');

//all this will be removed when transferred to heroku, bc mostRecentDataPoint will already be up to date when logic is called
const connection = mysql.createConnection({

});
var mostRecentDataPoint;
connection.query("SELECT date FROM cryptos.coins date ORDER BY date DESC LIMIT 1", function(err, results) {
  if (err) {
    console.log(err);
  }

  else {
    mostRecentDataPoint = moment(results[0]['date']).format('YYYY-MM-DD');
  }

});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var coinColors = {
	'btc': {
		color: '#FF5757'
	},
	'bch': {
		color: '#ABFF57'
	},
	'btg': {
		color: '#57FFFF'
	},
	'ltc': {
		color: '#AB57FF'
	},
	'eth': {
		color: '#5784FF'
	},
	'dash': {
		color: '#57FF97'
	},
	'xem': {
		color: '#FF57F4'
	},
	'xmr': {
		color: '#FFB657'
	},
	'zec': {
		color: '#FFFF57'
	},
	'xvg': {
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
      var queryStart = moment().subtract(7, 'days').format('YYYY-MM-DD').toString();
      return queryStart;
    }
   
    else if (period === '1M') {
      var queryStart = moment().subtract(30, 'days').format('YYYY-MM-DD').toString();
      return queryStart;
    }
    else if (period === '3M') {
      var queryStart = moment().subtract(90, 'days').format('YYYY-MM-DD').toString();
      return queryStart;
    }
    else if (period === '1Y') {
      var queryStart = moment().subtract(365, 'days').format('YYYY-MM-DD').toString();
      return queryStart;
    }
    //time === ALL
    else {
      return "0000-00-00";
    } 
  }

}

//store date labels for frontend
var dateLabels = [];

// Answer API requests.
app.get('/addCoin', function (req, res) {
  var limit = findLimit(req.query.period);
  console.log(limit);
  const coinName = req.query.coin;
  const connection = mysql.createConnection({

  });

  connection.connect(function(err) {
    if (err) {
      console.log(err);
      res.send(err);
    }

    else {
      console.log("SELECT DATE_FORMAT(date, '%m/%d/%y'), price FROM cryptos.coins WHERE (date > '" + limit + " AND date <='" + mostRecentDataPoint + "') AND (coin='" + coinName + "');")
      connection.query("SELECT DATE_FORMAT(date, '%m/%d/%y'), price FROM cryptos.coins WHERE (date > '" + limit + "' AND date <='" + mostRecentDataPoint + "') AND (coin='" + coinName + "');", function(err, results, fields) {
        if (err) {
          console.log(err);
          res.send(err);
        }

        else {
          console.log(results);
          var coinDataStructure = {
            label: '',
            data: [],
            backgroundColor:[], 
            fill: false,
            borderColor: '',
            pointHoverBackgroundColor: '',
            pointHoverBorderColor: 'grey',
            pointRadius: 3,
            pointHoverRadius: 5
            };
            coinDataStructure.label = coinName;
            coinDataStructure.backgroundColor[0] = coinColors[coinName].color;
            coinDataStructure.borderColor = coinColors[coinName].color;
            coinDataStructure.pointHoverBackgroundColor = coinColors[coinName].color;
            coinDataStructure.data = results.map(result => result.price);
            labels = results.map(result => result['DATE_FORMAT(date, \'%m/%d/%y\')']);
            
            var finalObject = {
              labels: labels,
              datasets: [coinDataStructure]
            };
            res.send(finalObject);
        }
      });
    }
  });
});

app.get('/changePeriod', function(req,res) {
  //check to make sure that coin queries isnt empty, if so just return      
  if (req.query.coins === '') {
    console.log('no updates');
    res.send('no updates');
    return;
  }
  //check what time period is
  else {
    const connection = mysql.createConnection({

    });
    var coins = req.query.coins.split(',');
    var limit = findLimit(req.query.time, coins.length);
    //loop over coin name array and grab the data
    
    var response = {};    
    var coinParams = "(";
    for (var i = 0; i < coins.length; i++) {
      if (i === coins.length - 1) {
        coinParams += "coin='" + coins[i] + "') ";
        break;
      }

      coinParams += "coin='" + coins[i] + "' OR ";
    }

    connection.query("SELECT coin, DATE_FORMAT(date, '%m/%d/%y'), price FROM cryptos.coins WHERE date > '" + limit + "' AND date <= '" + mostRecentDataPoint + "' AND " + coinParams + "ORDER BY coin ASC, date ASC;", function(err, results, fields) {
      if (err) throw err;
      var currCoin = results[0].coin;
      var coinDataSets = [];
      var currCoinData = [];
      var finalObject = {
        labels: [],
        datasets: []
      };
      console.log(limit);
      for (var j = 0; j < results.length; j++) {
        
        if (j === results.length - 1) {

            //add date labels to final object but do so only once
          if (j < (results.length / coins.length)) {
            finalObject.labels.push(results[j]['DATE_FORMAT(date, \'%m/%d/%y\')']);
          }

          currCoinData.push(results[j].price);
          coinDataSets.push(currCoinData);
          var coinDataStructure = {
            label: '',
            data: [],
            backgroundColor:[], 
            fill: false,
            borderColor: '',
            pointHoverBackgroundColor: '',
            pointHoverBorderColor: 'grey',
            pointRadius: 3,
            pointHoverRadius: 5
            };
            coinDataStructure.label = currCoin;
            coinDataStructure.backgroundColor[0] = coinColors[currCoin].color;
            coinDataStructure.borderColor = coinColors[currCoin].color;
            coinDataStructure.pointHoverBackgroundColor = coinColors[currCoin].color;
            coinDataStructure.data = currCoinData;
            finalObject.datasets.push(coinDataStructure);
        }
        
        else if (results[j].coin === currCoin) {
          if (j < (results.length / coins.length)) {
            finalObject.labels.push(results[j]['DATE_FORMAT(date, \'%m/%d/%y\')']);
          }
          currCoinData.push(results[j].price);
        }

        else {
          var coinDataStructure = {
            label: '',
            data: [],
            backgroundColor:[], 
            fill: false,
            borderColor: '',
            pointHoverBackgroundColor: '',
            pointHoverBorderColor: 'grey',
            pointRadius: 3,
            pointHoverRadius: 5
            };
            coinDataStructure.label = currCoin;
            coinDataStructure.backgroundColor[0] = coinColors[currCoin].color;
            coinDataStructure.borderColor = coinColors[currCoin].color;
            coinDataStructure.pointHoverBackgroundColor = coinColors[currCoin].color;
            coinDataStructure.data = currCoinData;
            finalObject.datasets.push(coinDataStructure);

          coinDataSets.push(currCoinData);
          currCoinData = [];
          currCoinData.push(results[j].price);
          currCoin = results[j].coin;
        }
      }

      console.log(finalObject);
      res.send(finalObject);
      return false;
    });
  }
  
});

app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});
