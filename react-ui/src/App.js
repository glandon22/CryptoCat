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
      //then i need to remove the coin data from the chartjs piece
      for (var i = 0; i < this.state.chartData.datasets.length; i++) {
        if (this.state.chartData.datasets[i].label == data) {
          var updatedData = this.state.chartData.datasets;
          updatedData.splice(i,1);
          var newChartState = update(this.state.chartData, {datasets: {$set: updatedData}});
          this.setState({activeCoins: newCoins, chartData: newChartState});
          console.log(updatedData);
          break;
        }
      }
    }
    //add new coin
    else {
      newCoins.push(data);
      this.setState({activeCoins: newCoins, chartOperation: 'Add Coin'});
      var self = this;
      axios.get('/addCoin?coin=' + data + '&period=' + this.state.activeTime).then(function(res) {
        if (self.state.activeCoins.length > 1) {
          //check to see if current coin history length is longer, shorter, or the same length as the incoming coin history

            //if current coin history is longer than new, i need to add the appropriate amount of null values **at the beginning** of the new data set

            //if the current coin history is shorter than the new, i need to add null values **to the beginning** to all the current coins data AND update the date labels from the new coin

            //if the data sets are the same length i need to add them to the master data holder as usual
          if (self.state.chartData.datasets[0].data.length > res.data.datasets[0].data.length) {
            var difference = self.state.chartData.datasets[0].data.length - res.data.datasets[0].data.length;
            //this is creating an aray of null values within my array of data, so i need to find a way to flatten it out 
            const nullArray = new Array(difference).fill(null);
            res.data.datasets[0].data.unshift(nullArray);
            console.log(nullArray.length);
            console.log(self.state.chartData.datasets[0].data.length);
            console.log(res.data.datasets[0].data);
          }

          else if (self.state.chartData.datasets[0].data.length < res.data.datasets[0].data.length) {
            console.log('here1');
          }

          //equal data length 
          else {
            console.log('here8');
          }

          var currentChartData = self.state.chartData.datasets.slice();
          console.log(currentChartData);
          currentChartData.map((coin) => {
            res.data.datasets.push(coin);
          });
          console.log(res.data);
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
