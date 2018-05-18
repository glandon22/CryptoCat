import React, { Component } from 'react';
//import logo from './logo.svg';
import CoinList from './components/coin_list';
import Chart from './components/chart';
import TimeList from './components/time_period';
import axios from 'axios';
import update from 'immutability-helper';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coins: [['Bitcoin', 'btc'], ['BTC Cash', 'bch'], ['BTC Gold', 'btg'], ['Litecoin', 'ltc'], ['Ethereum', 'eth'], ['Dash', 'dash'], ['NEM', 'xem'], ['Monero', 'xmr'], ['Zcash', 'zec'], ['Verge', 'xvg']],
      activeCoins: [],
      dateLabels: [],
      coinData: [],
      timePeriods: ['1W', '1M', '3M', '1Y', 'ALL'],
      activeTime: '1W',
      chartData: {
      }
    };
    this.addCoin = this.addCoin.bind(this);
    this.changeTimePeriod = this.changeTimePeriod.bind(this);
  }

  addCoin(data) {
    var newCoins = this.state.activeCoins;
    //check if coin is already added
    if (newCoins.indexOf(data) !== -1) {
      newCoins.splice(newCoins.indexOf(data), 1);
      var updatedData;
      var newChartState
      //then i need to remove the coin data from the chartjs piece
      for (var i = 0; i < this.state.chartData.datasets.length; i++) {
        if (this.state.chartData.datasets[i].label == data) {
          updatedData = this.state.chartData.datasets;
          updatedData.splice(i,1);
          newChartState = update(this.state.chartData, {datasets: {$set: updatedData}});
          this.setState({activeCoins: newCoins, chartData: newChartState});
          break;
        }
      }

      //ALTERNATIVE IDEA
        //set up one for loop
        //check if value is null with i for each element in unique dataset
        //knock of the null value for each dataset
        //if value isnt null, stop chopping off values, add back null value to any array that came before in that iteration so all data sets are equal length
        //return

      //init an array to hold length of longest array and its position in dataset array
      //start for loop to loop over remaining coins
        //check to see if first value is null, if not, then end loop and dont update further bc data length doesnt need to change
        //if it is null, filter all null values from array, likely using reduce function
        //save length of array somewhere so i can find longest array at end
        //get length of longest array, compare that with length of remaining arrays
        //fill remaining arrays with null values
        //load into final object
        //cut unnecessary dates out of date array
        //save chartdata
        
      var largestDataset = [0, 0];
      for (var j = 0; j < this.state.chartData.datasets.length; j++) {
        console.log(updatedData);
        updatedData[j].data = updatedData[j].data.filter(x=>x);
        if (updatedData[j].length > largestDataset[0]) {
          largestDataset = [updatedData[j].length, j];
        }
      } 
      console.log(updatedData);
    }
    //add new coin
    else {
      newCoins.push(data);
      this.setState({activeCoins: newCoins});
      var self = this;
      axios.get('/addCoin?coin=' + data + '&period=' + this.state.activeTime).then(function(res) {
        //if two coins are added too quickly the self.state.chartdata etc comparison break my code and throw an error bc if hasnt had time to load data and show a length of zero. NEED A FIX#@!#@!@#!#!@
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        if (self.state.activeCoins.length > 1) {
          if (self.state.chartData.datasets[0].data.length > res.data.datasets[0].data.length) {
            var difference = self.state.chartData.datasets[0].data.length - res.data.datasets[0].data.length;
            const nullArray = new Array(difference).fill(null);
            res.data.datasets[0].data.unshift(nullArray);
            res.data.datasets[0].data = [].concat.apply([], res.data.datasets[0].data);
            var preservedLabels = self.state.chartData.labels.slice();
            res.data.labels = preservedLabels;
            console.log(res.data);
          }

          else if (self.state.chartData.datasets[0].data.length < res.data.datasets[0].data.length) {
            console.log('here1');
            var difference = res.data.datasets[0].data.length - self.state.chartData.datasets[0].data.length;
            const nullArray = new Array(difference).fill(null);
            var currentChartData = self.state.chartData.datasets.slice();
            currentChartData.map((coin) => {
              coin.data.unshift(nullArray);
              console.log(coin);
              coin.data = [].concat.apply([], coin.data);
              res.data.datasets.push(coin);
              self.setState({chartData: res.data});
            });
            console.log(res.data);
            return;
          }

          var currentChartData = self.state.chartData.datasets.slice();
          currentChartData.map((coin) => {
            res.data.datasets.push(coin);
          });
        }

        //first coin being added to chart
        self.setState({chartData: res.data});
      });
    }    
  }

  changeTimePeriod(data) {
    console.log(data);
    
    var comparison = this.state.activeTime;
    if (comparison === data) {
      console.log('no update to time period');
    }

    else {
      this.setState({activeTime: data});
      var self = this;
      axios.get('/changePeriod?time=' + data + '&coins=' + this.state.activeCoins).then(function(res) {
        if (res.data === 'no updates') {
          return;
        }
        self.setState({chartData: res.data});
      });
    }
  }

  render() {
    return (
      <div className="row padding-top" id="tester">
        <CoinList coins={this.state.coins} addCoin={this.addCoin} />
        <Chart labels={this.state.dateLabels} coinData={this.state.coinData} chartData={this.state.chartData} />
        <div className="col-lg-2 no-padding-right">
          <TimeList 
          timePeriods={this.state.timePeriods} 
          changeTimePeriod={this.changeTimePeriod} 
          activeTime={this.state.activeTime} 
          classes={'btn btn-primary active fixed-width timePeriod'}
          />
        </div>
      </div>
    );
  }
}

export default App;
