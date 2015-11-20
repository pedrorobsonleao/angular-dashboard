/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
// $Id: Data.js 100 2014-08-13 13:13:02Z leaope $
function Data() {
    var data = [];

    this.header = function() {
        return [
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
    }

    this._idx = function(key) {
        return this.header().indexOf(key);
    }

    this.code = function(data = null) {
        var d = [];

        if( ! data ) {
            data = this.data;
        }

        var idx = this._idx('solution');

        for (var i=0; i<data.length; i++) {
            var line = [];

            for(var x=0; x<data[i].length; x++) {
                line.push(data[i][x]);
                if((i>0) && (x == idx)) {
                    if((data[i][x] != 'Unresolved')  &&
                    (data[i][x] != 'Defeito em código')) {
                        line[x] = 'Outros';
                    }
                }
            }
            d.push(line);
        }
        return d;
    }

    this.apps = function(data = null) {
        var d = [];

        if( ! data ) {
            data = this.data;
        }

        var idx = this._idx('solution');

        for (var i=0; i<data.length; i++) {
            var line = [];

            for(var x=0; x<data[i].length; x++) {
                if((i>0) && (x == idx)) {
                    if (data[i][x] != 'Defeito em código') {
                        break;
                    }
                }
                line.push(data[i][x]);
            }

            if(line.length == data[0].length) {
                d.push(line);
            }
        }
        return d;
    }

    this.others = function(data = null) {
        var d = [];

        if( ! data ) {
            data = this.data;
        }

        var idx = this._idx('solution');

        for (var i=0; i<data.length; i++) {
            var line = [];

            for(var x=0; x<data[i].length; x++) {
                if((i>0) && (x == idx)) {
                    if((data[i][x] == 'Unresolved') ||
                       (data[i][x] == 'Defeito em código') ){
                        break;
                    }
                }
                line.push(data[i][x]);
            }

            if(line.length == data[0].length) {
                d.push(line);
            }
        }
        return d;
    }

    this.stock = function(data = null) {

        var d = [];

        if( ! data ) {
            data = this.data;
        }

        //d[0] = ['date','closed','stock'];

        var idx_status = this._idx('status');
        var idx_created = this._idx('created');

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
    }

    this.openPerDay = function(data = null) {


        var d = [];

        if( ! data ) {
            data = this.data;
        }

        var idx_created = this._idx('created');

        for(var i=1; i<data.length; i++) {
            var x = 0;

            var dt =new Date(Date.parse(data[i][idx_created].substring(0,10) + 'T00:00:00.000'));

            for(x=0; x<d.length; x++) {
                if(d[x][0].getTime() == dt.getTime()) {
                    break;
                }
            }

            var ct_open = 0;
            if(d[x]) {
                ct_open = d[x][1];
            }

            ct_open++;

            d[x] = [dt, ct_open];
        }

        var out = new google.visualization.DataTable();
        out.addColumn('date', 'date');
        out.addColumn('number', 'open');
        out.addRows(d);
        return out;
    }

    this.stockdown = function(data = null) {

        if( ! data ) {
            data = this.data;
        }

        var d = [];
        var ct_closed = 0;
        var ct_open = 0;
        var totalo = data.length;
        var totalc = 0;

        var idx_status = this._idx('status');
        var idx_created = this._idx('created');

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
    }

    this.country = function(data = null) {

        var d = [];

        if( ! data ) {
            data = this.data;
        }

        d[0] = ['country','tickets'];

        idx = this._idx('country');

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
    }

    this.count = function(fields, data = null) {

        if( ! data ) {
            data = this.data;
        }

        var idx = [];

        var dt = [];
        var fdt = [];
        var cdt = [];

        for (var i = 0; i < fields.length; i++) {
            pos = data[0].indexOf(fields[i]);

            if (pos >= 0) {
                idx.push(pos);
            }
        }

        for (var i = 0; i < data.length; i++) {
            var k = [];
            for (x = 0; x < idx.length; x++) {
                k.push(data[i][idx[x]]);
            }

            if (i === 0) {
                k.push('Total');
                dt.push(k);
            } else {
                pos = fdt.indexOf(k.join(','));

                if (pos < 0) {
                    fdt.push(k.join(','));
                    cdt.push(1);
                } else {
                    cdt[pos]++;
                }
            }
        }

        for (var i = 0; i < fdt.length; i++) {
            k = fdt[i].split(',');
            k.push(cdt[i]);

            dt.push(k);
        }

        return dt;
    }
}
