/**
 * Common functions for constructing queries
 */
'use strict';

var moment = require('moment');

var queryBuilder = (function() {
    
    function startWithRegExp(fieldValue) {
        var regex = {'$regex' : '^' + fieldValue + ".*", '$options' : 'i'};
        return regex;
    }

    function containsRegExp(fieldValue) {
        var regex = {'$regex' : '.*' + fieldValue + ".*", '$options' : 'i'};
        return regex;
    }

    function dateRange(date) {
        var startDate = moment(date, 'YYYY-MM-DD').utc();
        startDate.hours(0);
        startDate.minutes(0);
        startDate.seconds(0);
        startDate.milliseconds(0);
        var endDate = moment(date, 'YYYY-MM-DD').utc();
        endDate.hours(23);
        endDate.minutes(59);
        endDate.seconds(59);
        endDate.milliseconds(0);
        return {"$gte" : startDate ,"$lte" : endDate};
    }
    
    function parseDateWithoutTime(dateStr) {
        var d = moment(dateStr, 'YYYY-MM-DD').utc();
        d.hours(0);
        d.minutes(0);
        d.seconds(0);
        d.milliseconds(0);
        //console.log('parseDateWithoutTime:' + dateStr + '>>>' + d.toISOString());
        return d;
    }
    
     function dateWithoutTime(date) {
        var d = moment(date).utc();
        d.hours(0);
        d.minutes(0);
        d.seconds(0);
        d.milliseconds(0);
        //console.log('dateWithoutTime:' + date + '>>>' + d.toISOString());
        return d;
    }
    
    function withinDateRange(jsDate, start, end) {
        var result = false;
        var date = dateWithoutTime(jsDate);
        if (date.diff(start, 'days') >= 0 && date.diff(end, 'days') <= 0) {
            result = true;
        }
        //console.log('inDateRange:' + date.toISOString() 
        //   +  ' compared to: []' + start.toISOString() + ',' + end.toISOString() + ']'
        //   + ' >>>>' + result);   
        return result;
    }
    
	return {
		startWithRegExp: startWithRegExp,
		containsRegExp: containsRegExp,
        dateRange: dateRange,
        parseDateWithoutTime : parseDateWithoutTime,
        dateWithoutTime : dateWithoutTime,
        withinDateRange : withinDateRange
	};

}());

module.exports = queryBuilder;