/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
// $Id: Data.js 100 2014-08-13 13:13:02Z leaope $

Data = function() {

    // private
    var header  = [
         'key',
         'status',
         'created',
         'updated',
         'summary',
         'country',
         'solution',
         'versions',
         'impediment',
         'application'
        ];

    var data = [];

    var getIndex = function(key) {

        if(data.length) {
            var idx = data[0].indexOf(key);

            if(idx<0) {
                throw "can't found key:[" + key + "]";
            }
            return idx;
        }
        throw "data is empty";
    };

    var countFields = function(parameters) {
        var field = parameters.field;
        var values = parameters.values;
        var exclude = parameters.exclude;
        var dt = (parameters.data) ? parameters.data:data;

        var lines = {};

        var idx = dt[0].indexOf(field);

        for(var i=1; i<dt.length; i++) {

            var key = dt[i][idx];

            if(values) {
                for(var x=0; x<values.length; x++) {
                    if(values[x] == key) {
                        if(!exclude) {
                            lines[key] = (lines[key] == null ) ? 1 : lines[key]+1;
                        }
                    } else if(exclude) {
                        lines[key] = (lines[key] == null ) ? 1 : lines[key]+1;
                    }
                }
            } else {
                lines[key] = (lines[key] == null ) ? 1 : lines[key]+1;
            }
        }

        var d = [];
        var bool = true;
        for(var k in lines) {
            if(bool) {
                d.push([field, "Total"]);
                bool = false;
            }
            d.push([k,lines[k]]);
        }

        return (d.length > 1) ? d : [];
    };

    var getIssueByFields = function(parameters) {
        var values = parameters.values;
        var field = parameters.field;
        var d = [];

        try {
            var idx = getIndex(field);

            for (var i = 0; data && i < data.length; i++) {

                var bool_push = false;

                if (i == 0) {
                    bool_push = true;
                } else {
                    for (var x = 0; x < values.length; x++) {
                        if (data[i][idx] == values[x]) {
                            bool_push = true;
                        }
                    }
                }

                if (bool_push) {
                    d.push(data[i]);
                }
            }
            return d;
        } catch(e) {
            console.log((new Date()) + ' Exception:' + e);
        }
    };

    // public
    this.assigne = function(d) {
        if( d[0][0] != header[0] ) {
            data = [].concat([header], d);
        } else {
            data = d;
        }
    };

    this.getHeader = function() {
        return header;
    };

    this.getClosedIssues = function() {
        return getIssueByFields({values: ['Closed', 'Cancelled'], field: 'status'});
    };

    this.getOthersIssues = function() {
        var d = [];

        var idx =getIndex('solution');

        for (var i=0; i<data.length; i++) {
            if(i==0 || data[i][idx] != 'Defeito em código') {
                d.push(data[i]);
            }
        }
        return d;
    };

    this.getCodeIssues = function() {

        var d = [];

        var idx =getIndex('solution');

        for (var i=0; i<data.length; i++) {
            if (i == 0 || data[i][idx] == 'Defeito em código') {
                d.push(data[i]);
            }
        }
        return d;
    };

    this.inAccept = function() {
        var d=[];

        d.push(['status']);

        var idx =getIndex('status');
        for (var i=0;i<data.length;i++) {
            if(data[i][idx].match('To Do|Reopened|Doing|In Progress|Done')) d.push(['service']);
            else if(data[i][idx].match('Pending Info|Pending Information|Pending Support Area')) d.push(['pending']);
            else if(data[i][idx].match('Delivered|Retesting')) d.push(['acceptance']);
            else if(data[i][idx].match('Closed|Cancelled')) d.push(['closed']);
        }

        return countFields({
            field: 'status',
            values: ['service', 'pending', 'acceptance', 'closed'],
            exclude: false,
            data: d
        });
    };

    this.byCodeOthers = function() {
        var d = [];

        var idx =getIndex('solution');
        d.push('solution');

        for (var i=0;i<data.length;i++) {
            if     (data[i][idx].match('Defeito em código')) d.push(['Alteração em Código']);
            else   d.push(['Outros']);
        }
        return countFields({field: 'solution', values: null, exclude: false, data:d});
    };

    this.closedAndOpened = function() {
        var d = [];

        var idx_status = getIndex('status');
        var idx_created = getIndex('created');

        for(var i=1; i<data.length; i++) {
            var x = 0;
            var status = (data[i][idx_status]==='Closed'||data[i][idx_status]==='Cancelled')?'Closed':'Opened';

            //var date = data[i][1].substring(0,10).replace(/-/g,"");
            var dt =new Date(Date.parse(data[i][idx_created].substring(0,10) + 'T00:00:00.000'));

            for(x=0; x<d.length; x++) {
                if(d[x][0].getTime() == dt.getTime()) {
                    break;
                }
            }

            var ct_open = 0;
            var ct_closed = 0;
            if(d[x]) {
                ct_open = d[x][1];
                ct_closed = d[x][2];
            }

            if(status==="Opened") ct_open++;
            if(status==="Closed") ct_closed++;

            d[x] = [dt, ct_open, ct_closed];
        }

        var out = new google.visualization.DataTable();
        out.addColumn('date', 'date');
        out.addColumn('number', 'stock');
        out.addColumn('number', 'closed');
        out.addRows(d);
        return out;
    };

    this.stockDown = function() {

        var d = [];
        var ct_closed = 0;
        var ct_open = 0;
        var totalo = data.length;
        var totalc = 0;

        var idx_status = getIndex('status');
        var idx_created = getIndex('created');

        for(var i=1; i<data.length; i++) {
            var x = 0;
            var status = (data[i][idx_status]==='Closed'||data[i][idx_status]==='Cancelled')?'Closed':'Opened';

            var dt =new Date(Date.parse(data[i][idx_created].substring(0,10) + 'T00:00:00.000'));

            for(x=0; x<d.length; x++) {
                if(d[x][0].getTime() == dt.getTime()) {
                    break;
                }
            }

            if ( ! d[x] ) {
                ct_closed = 0;
                ct_open = 0;
            }

            totalo -= ct_closed;
            totalc += ct_open;
            if(status=='Opened') ct_open++;
            if(status=='Closed') ct_closed++;

            d[x] = [dt, totalo, totalc];
        }

        var out = new google.visualization.DataTable();
        out.addColumn('date', 'date');
        out.addColumn('number', 'stock');
        out.addColumn('number', 'opened');
        out.addRows(d);
        return out;
    };

    this.byApplication = function() {
        return countFields(
            {field: 'application', values: null, exclude: false}
        );
    };

    this.bySolution = function() {
        return countFields(
            {field: 'solution', values: null, exclude: false}
        );
    };

    this.byVersion = function() {
        var d = [];

        var idx =getIndex('versions');
        for (var i=0;i<data.length;i++) {
            if(i==0) {
                d.push([data[i][idx]]);
            } else {
                if(data[i][idx].length) {
                    d.push([data[i][idx].slice(-1)[0].replace(/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+).+/, "$1")]);
                } else {
                    d.push(['None']);
                }
            }
        }

        return countFields(
            {field: 'versions', values: null, exclude: false, data: d}
        );
    };

    this.byVersionA = function() {
        return this.byVersion();
    };

    this.byVersionO = function() {
        return this.byVersion();
    };

    this.inService = function() {
        return countFields(
                    {
                        field: 'status', values: ['To Do',
                        'Reopened',
                        'Doing',
                        'In Progress',
                        'Done'], exclude: false
                    });
    };

    this.inAcceptance = function() {
        return countFields(
                    {
                        field: 'status', values: ['Delivered',
                        'Retesting'], exclude: false
                    });
    };

    this.inPending = function() {
        return countFields(
                    {
                        field: 'status', values: ['Pending Info',
                        'Pending Information',
                        'Pending Support Area'], exclude: false
                    });
    };

    this.inClosed = function() {
        return countFields(
                    {
                        field: 'status', values: ['Closed',
                        'Cancelled'], exclude: false
                    });
    };

    this.byCountry = function() {

        var d = [];

        d[0] = ['country','tickets'];

        var idx =getIndex('country');

        for(var i=1; i<data.length; i++) {
            var x = 0;
            var country = ((data[i][idx]==='LAM')?'França':data[i][idx]);
            for(x=0; x<d.length; x++) {
                if(d[x][0] == country) {
                    break;
                }
            }

            var ct = 0;
            if(d[x]) {
                ct = d[x][1];
            }

            d[x] = [country,ct+1];
        }
        return d;
    };
};
