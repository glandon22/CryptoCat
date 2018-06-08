import React, {Component} from 'react';
import {Line} from 'react-chartjs-2';
import _ from 'lodash';
class Chart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chartData: {
                labels:['Boston', 'Dallas', 'Houston', 'Madrid', 'Moscow', 'Detroit'],
                datasets:[
                    {
                        label: 'Bitcoin',
                        data: [
                            100,
                            200,
                            300,
                            400,
                            500,
                            600
                        ],
                        backgroundColor:[
                            'rgba(255, 159, 64, 0.6)'
                        ], 
                        fill: false,
                        borderColor: 'rgba(255, 159, 64, 0.6)',
                        pointHoverBackgroundColor: 'rgba(255, 159, 64, 0.6)',
                        pointHoverBorderColor: 'grey',
                        pointRadius: 1,
                        pointHoverRadius: 1
                    }
                ]
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        var chartData = {...this.state.chartData};
        chartData.labels = nextProps.labels;
        this.setState({chartData});
        var coinPrice = this.state.chartData;
        // the zero will need to be loaded dynamically so that the correct data set is replaced. currently it only adds data for the first label
        coinPrice.datasets[0].data = nextProps.coinData;
    }

    render() {
        return (
            <div className="col-lg-8">
                <div className="jumbotron test">
                <Line
                    data={this.props.chartData}
                    options={
                        {
                            maintainAspectRatio: false,
                            
                            legend: {
                                labels: {
                                    fontColor: 'rgba(255,255,255,0.7)',
                                    fontSize: 18
                                },
                                onHover: function(e) {
                                    e.target.style.cursor = 'pointer';
                                 }
                            },
                            hover: {
                                onHover: function(e) {
                                   var point = this.getElementAtEvent(e);
                                   if (point.length) e.target.style.cursor = 'pointer';
                                   else e.target.style.cursor = 'default';
                                }
                             },
                            tooltips: {
                                mode: 'label'
                              },
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        beginAtZero:false,
                                        fontColor: 'rgba(255,255,255,0.7)'
                                    },
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'USD ($)',
                                        fontSize: 30,
                                        fontColor: 'rgba(255,255,255,0.7)'
                                    }
                                }],
                                xAxes: [{
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Date',
                                        fontSize: 30,
                                        fontColor: 'rgba(255,255,255,.7)'
                                    },
                                    ticks: {
                                        fontColor: 'rgba(255,255,255,0.7)'
                                      }
                                }],
                            },
                            elements: {
                                line: {
                                    //tension: 0, // disables bezier curves
                                }
                            }
                        }
                    }
                />
                </div>
            </div>
        );
    }
}

export default Chart;