EasyChart = function(parameters) {

    var CHART_NAME = 0;
    var CHART_TYPE = 1;
    var CHART_CLASS = 2;
    var DATA_KEY_PREFIX = "D_";

    var options = parameters.options;
    var parameters = parameters.parameters;

    this.update = function($scope) {
        for(var i=0; i<parameters.keys.length; i++) {

            var key = parameters.keys[i][CHART_NAME];
            var dt = parameters.keys[i][CHART_CLASS];

            $scope[DATA_KEY_PREFIX + key].data = dt[key]();
        }
    };

    this.draw = function($scope) {

        for(var i=0; i<parameters.keys.length; i++) {

            var key = parameters.keys[i][CHART_NAME];
            var type = parameters.keys[i][CHART_TYPE];

            var dkey = DATA_KEY_PREFIX + key;

            $scope[dkey] = {};

            $scope[dkey].type = type;
            $scope[dkey].options = (options[type])?options[type]:{};

            $scope[key] = $scope[dkey];
        }

    };

};

