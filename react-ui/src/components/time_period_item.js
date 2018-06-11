import React, { Component } from 'react';

class TimePeriodItem extends Component {
    constructor(props) {
        super(props);
        this.callParent = this.callParent.bind(this);
    }

    callParent(event) {
        event.preventDefault();
        this.props.changeTimePeriod(this.props.time);
    }

    render() {
        return (
            <button type="button" className={this.props.classes} aria-pressed="true" onClick={this.callParent}>{this.props.time}</button>
        );
    }
}

export default TimePeriodItem;