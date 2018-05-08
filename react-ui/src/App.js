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
      axios.get('/addCoin?coin=' + data + '&period=' + this.state.activeTime + '&n=' + newCoins.length).then(function(res) {
        if (self.state.activeCoins.length > 1) {
          var currentChartData = self.state.chartData.datasets.slice();
          currentChartData.map((coin) => {
            res.data.datasets.push(coin);
          });
          console.log(res.data);
        }
        self.setState({chartData: res.data});
      });
    }    
  }

  changeTimePeriod(data) {
    console.log(data);
    
    var comparison = this.state.activeTime;
    if (comparison === data) {
      console.log('fdsdsadsf');
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
