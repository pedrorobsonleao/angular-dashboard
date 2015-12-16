
var app =  angular.module('report', ['googlechart']);

app.directive('directive.loading', [])

    .directive('loading',   ['$http' ,function ($http)
    {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs)
            {
                scope.isLoading = function () {
                    return $http.pendingRequests.length > 0;
                };

                scope.$watch(scope.isLoading, function (v)
                {
                    if(v){
                        elm.show();
                    }else{
                        elm.hide();
                    }
                });
            }
        };

    }]);
    
app.controller('Controller', function($scope, $http, $location, googleChartApiPromise) {

    $scope.issues = new Data();
    $scope.codeIssues = new Data();
    $scope.closedIssues = new Data();
    $scope.otherIssues = new Data();

    $scope.txtFilter = '';

    $scope.chart = new EasyChart({
        'options': {
            'PieChart': {
                title: 'Chart',
                displayExactValues: true,
                width: 400,
                height: 200,
                is3D: true,
                chartArea: {left: 10, top: 10, bottom: 0, height: '100%'}
            },
            'GeoChart': {
                is3D: true,
                legend: {textStyle: {color: 'blue', fontSize: 16}}
            },
            'LineChart': {
                curveType: 'function'
            },
            'AreaChart': {
                vAxis: {minValue: 0}
            }
        },
        'parameters':{
            'keys':[
                ['inAccept', 'PieChart', $scope.issues],
                ['inClosed', 'PieChart', $scope.issues],
                ['byCountry', 'GeoChart', $scope.issues],
                ['inService', 'PieChart', $scope.issues],
                ['inPending', 'PieChart', $scope.issues],
                ['bySolution', 'PieChart', $scope.otherIssues],
                ['inAcceptance', 'PieChart', $scope.issues],
                ['byCodeOthers', 'PieChart', $scope.closedIssues],
                ['byApplication', 'PieChart', $scope.codeIssues],
                ['byVersionA', 'PieChart', $scope.codeIssues],
                ['byVersionO', 'PieChart', $scope.otherIssues],
                ['closedAndOpened','AreaChart',$scope.issues],
                ['stockDown','AreaChart',$scope.issues]
            ]
        }
    });

    $scope.list = [];
    $scope.header = $scope.issues.getHeader();

    $scope.retrieve = function(callback) {
        var uri = './data.json';

        $http.get(uri).success(function(data) {

            $scope.list = data;
            callback();
        });
    };

    $scope.refresh = function(index) {

            var sourceData;
            if($scope.txtFilter && $scope.txtFilter.length>0 && $scope.filtered) {
                sourceData = $scope.filtered;
            } else {
                sourceData = $scope.list;
            }


            var data = $scope.filtered;

            $scope.issues.assigne(sourceData);
            $scope.closedIssues.assigne($scope.issues.getClosedIssues());
            $scope.codeIssues.assigne($scope.closedIssues.getCodeIssues());
            $scope.otherIssues.assigne($scope.closedIssues.getOthersIssues());

            $scope.chart.update($scope);
    };

    googleChartApiPromise.then(function () {
            $scope.retrieve(function() {
                $scope.chart.draw($scope);
                $scope.refresh();

                $scope.$watch('txtFilter', function(newValue, oldValue){
                    if(newValue !== oldValue) {
                        $scope.refresh()
                    }
                });
            });
    });
});
