import React, { Component } from 'react';
import TimePeriodItem from './time_period_item';

const TimeList = (props) => {
    const TimeListItems = props.timePeriods.map((time) => {
        var currentPeriod = props.activeTime === time ? ' currentPeriod' : '';
        return <TimePeriodItem 
                key={time}
                time={time}
                changeTimePeriod={props.changeTimePeriod}
                activeTime={props.activeTime}
                classes={props.classes + currentPeriod}
                />
    });

    return (
        <div className="col-lg-2 no-padding-right">
            <div className="float-right">
                {TimeListItems}
            </div>
        </div>
    );
}

export default TimeList;