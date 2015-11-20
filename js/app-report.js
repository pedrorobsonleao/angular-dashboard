
    var app =  angular.module('report', ['googlechart']);

    app.controller('ListController', function($scope, $http) {
        var dt = new Data();

        $scope.list = [];
        $scope.header = dt.header();

        $scope.update = function() {
            $http.get('./2.10.0.0.json').success(function(data) {
                $scope.list = data;

                $scope.draw();
            });
        };

        $scope.update();

        $scope.refreshChart = function(index) {
            if ($scope.filtered.length == index ) {
//                console.log('index:' + index + ' filtered:' + $scope.filtered.length + ' data:' + $scope.list.length);
                var d = [];
                d = d.concat([$scope.header],$scope.filtered);
                $scope.refresh(d);
//                console.log('call refresh filter ' + d );
            }
        };

        $scope.refresh = function(data = null) {

            if( ! data ) {
                data = this.data;
            }

           // if(data.length == 1) return;

            var dt = new Data();

            dt.data = data;

            $scope.chartCode.data =  dt.count(['solution'],dt.code());

            $scope.chartOthers.data = dt.count(['solution'],dt.others());

            $scope.chartStock.data = dt.stock();
            $scope.chartCountry.data = dt.country();
            $scope.chartStockDown.data = dt.stockdown();
            $scope.chartOpenPerDay.data = dt.openPerDay();

            dt.data = dt.apps(data);
            $scope.chartApps.data = dt.count(['application']);
            // console.log(data);
        }

        $scope.draw = function() {

            $scope.chartApps = {};
            $scope.chartCode = {};
            $scope.chartOthers = {};
            $scope.chartStock = {};
            $scope.chartOpenPerDay = {};
            $scope.chartCountry = {};
            $scope.chartStockDown = {};

            var options = {
                displayExactValues: true,
                width: 400,
                height: 200,
                is3D: true,
                chartArea: {left:10, top:10, bottom:0, height:'100%'}
            };

            //Stock
            $scope.chartCode.type = 'PieChart';
            $scope.chartCode.options = options;

            // Others
            $scope.chartOthers.type = 'PieChart';
            $scope.chartOthers.options = options;

            // Applications
            $scope.chartApps.type = 'PieChart';
            $scope.chartApps.options = options;

            // Stock x Closed
            options = {
                title: 'stock x closed',
                curveType: 'function'
            };

            $scope.chartStock.type = 'LineChart';
            $scope.chartStock.options = options;

            // open/day
            options = {
                title: 'stock / day',
                curveType: 'function'
            };

            $scope.chartOpenPerDay.type = 'LineChart';
            $scope.chartOpenPerDay.options = options;

            // StockDown
            options = {
                title: 'stockdown / day',
                curveType: 'function'
            };

            $scope.chartStockDown.type = 'LineChart';
            $scope.chartStockDown.options = options;

            // Country
            $scope.chartCountry.type = 'GeoChart';
            $scope.chartCountry.options = {};

            $scope.chart_apps = $scope.chartApps;
            $scope.chart_stock = $scope.chartCode;
            $scope.chart_others = $scope.chartOthers;
            $scope.chart_country = $scope.chartCountry;
            $scope.chart_stock_close = $scope.chartStock;
            $scope.chart_opened = $scope.chartOpenPerDay;
            $scope.chart_stockdown = $scope.chartStockDown;

//            $scope.refresh($scope.list);
        }
    });
