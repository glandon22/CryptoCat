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
      },
      loading: true
    };
    this.addCoin = this.addCoin.bind(this);
    this.changeTimePeriod = this.changeTimePeriod.bind(this);
  }

  addCoin(data) {
    var newCoins = this.state.activeCoins;
    //check if coin is already added
    if (newCoins.indexOf(data) !== -1) {
      //prevent users from removing all coins from chart
      if (newCoins.length === 1) {
        return false;
      }
      newCoins.splice(newCoins.indexOf(data), 1);
      var updatedData;
      var newChartState;
      //then i need to remove the coin data from the chartjs piece
      for (var i = 0; i < this.state.chartData.datasets.length; i++) {
        if (this.state.chartData.datasets[i].label === data) {
          updatedData = this.state.chartData.datasets;
          updatedData.splice(i,1);
          newChartState = update(this.state.chartData, {datasets: {$set: updatedData}});
          this.setState({activeCoins: newCoins, chartData: newChartState});
          break;
        }
      }
        
      var largestDataset = [0, 0];
      for (var j = 0; j < this.state.chartData.datasets.length; j++) {
        updatedData[j].data = updatedData[j].data.filter(x=>x);
        if (updatedData[j].data.length > largestDataset[0]) {
          largestDataset = [updatedData[j].data.length, j];
        }
      } 
      
      for (var k = 0; k < this.state.chartData.datasets.length; k++) {
        if (k === largestDataset[1]) {
          continue;
        }
        var nullArray = new Array(largestDataset[0] - updatedData[k].data.length).fill(null);
        var newData = nullArray.concat(updatedData[k].data);
        updatedData[k].data = newData;
        
      }
      const trimmingDates = this.state.chartData.labels.slice(-largestDataset[0]);
      const cleanedData = {
        labels: trimmingDates,
        datasets: updatedData
      };
      this.setState({chartData: cleanedData});
      var localData = JSON.parse(localStorage.getItem('data'));
      localData.activeCoins = newCoins;
      localStorage.setItem('data', JSON.stringify(localData));
    }
    //add new coin
    else {
      newCoins.push(data);
      this.setState({activeCoins: newCoins});
      var self = this;
      axios.get('https://stock-server777.herokuapp.com//addCoin?coin=' + data + '&period=' + this.state.activeTime).then(function(res) {
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
            var difference1 = res.data.datasets[0].data.length - self.state.chartData.datasets[0].data.length;
            const nullArray = new Array(difference1).fill(null);
            var currentChartData = self.state.chartData.datasets.slice();
            currentChartData.map((coin) => {
              coin.data.unshift(nullArray);
              console.log(coin);
              coin.data = [].concat.apply([], coin.data);
              res.data.datasets.push(coin);
              self.setState({chartData: res.data});
              return false;
            });
            
          }

          var currentChartData1 = self.state.chartData.datasets.slice();
          currentChartData1.map((coin) => {
            res.data.datasets.push(coin);
          });
        }

        //first coin being added to chart
        self.setState({chartData: res.data});
      });
      var localData = JSON.parse(localStorage.getItem('data'));
      localData.activeCoins = newCoins;
      localStorage.setItem('data', JSON.stringify(localData));
    }    
  }

  changeTimePeriod(data) {    
    var comparison = this.state.activeTime;
    if (comparison === data) {
      console.log('no update to time period');
    }

    else {
      //localStorage.setItem('timePeriod', JSON.stringify(data));
      var storedData = JSON.parse(localStorage.getItem('data'));
      storedData.timePeriod = data;
      localStorage.setItem('data', JSON.stringify(storedData));
      this.setState({activeTime: data});
      var self = this;
      axios.get('https://stock-server777.herokuapp.com//changePeriod?time=' + data + '&coins=' + this.state.activeCoins).then(function(res) {
        if (res.data === 'no updates') {
          return;
        }
        self.setState({chartData: res.data});
      });
    }
  }

  componentDidMount() {
    var storedData = JSON.parse(localStorage.getItem('data'));
    if (!storedData) {
      var defaultSettings = JSON.stringify({
        timePeriod: '1W',
        activeCoins: ['btc']
      });
      localStorage.setItem('data', defaultSettings);
      var self = this;
      axios.get('https://stock-server777.herokuapp.com//addCoin?period=1W&coin=btc').then(function(res) {
        if (res.data === 'no updates') {
          return;
        }
        self.setState({chartData: res.data, activeCoins: ['btc'], loading: false});
      });
    }

    else {
      var self = this;
      if (storedData.activeCoins.length === 1) {
        axios.get('https://stock-server777.herokuapp.com//addCoin?period=' + storedData.timePeriod + '&coin=' + storedData.activeCoins).then(function(res) {
          if (res.data === 'no updates') {
            return;
          }
          self.setState({chartData: res.data, activeCoins: storedData.activeCoins, activeTime: storedData.timePeriod, loading: false});
        });
      }

      else {
        axios.get('https://stock-server777.herokuapp.com//changePeriod?time=' + storedData.timePeriod + '&coins=' + storedData.activeCoins).then(function(res) {
          if (res.data === 'no updates') {
            return;
          }
          self.setState({chartData: res.data, activeCoins: storedData.activeCoins, activeTime: storedData.timePeriod, loading: false});
        });
      }

      //this.setState({activeTime: storedData.timePeriod, activeCoins: storedData.activeCoins, loading: false});
    }
    
  }

  render() {
    const { loading } = this.state;
    if (loading) {
      return null;
    }

    return (
      <div className="row padding-top" id="tester">
        <CoinList coins={this.state.coins} addCoin={this.addCoin} selectedCoins={this.state.activeCoins} />
        <Chart chartData={this.state.chartData} />
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
