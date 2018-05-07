import React, { Component } from 'react';

class CoinListItem extends Component {
    constructor(props) {
        super(props);
        this.callParent = this.callParent.bind(this);
        this.state = {
            clicked: false,
            activeClass: 'btn btn-primary active color-override nullClass ' + this.props.coin  
        }
    };

    callParent(event) {
        event.preventDefault();
        this.props.addCoin(this.props.symbol);
        if (!this.state.clicked) {
            this.setState({
                        activeClass: 'btn btn-primary active color-override showing ' + this.props.symbol,
                        clicked: true
                    });
        }

        else {
            this.setState({
                activeClass: 'btn btn-primary active color-override nullClass ' + this.props.symbol ,
                clicked: false
            });
        }
        
    }
    
    render() {
        return (
            <button type="button" className={this.state.activeClass} aria-pressed="true" onClick={this.callParent}>{this.props.coin}</button>
        );
    }
    
}

export default CoinListItem;