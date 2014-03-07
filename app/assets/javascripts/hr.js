        var hr = angular.module('hr', ['ngRoute', 'ngSanitize', 'ngAnimate', 'ngGrid', 'mgcrea.ngStrap']);

        hr.config(function($routeProvider, $tooltipProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: '/ngpages/root.htm',
                    controller: 'root'
                })
                .when('/second', {
                    templateUrl: '/ngpages/second.htm',
                    controller: 'second'
                })
                .when('/3', {
                    templateUrl: '/ngpages/3.htm',
                    controller: '3'
                })
                .when('/4', {
                    templateUrl: '/ngpages/4.htm',
                    controller: '4'
                })
                .when('/5', {
                    templateUrl: '/ngpages/5.htm',
                    controller: '5'
                })
                .otherwise({
                    redirectTo: '/'
                });

            // 設定 Tooltip 的全域預設值。
            angular.extend($tooltipProvider.defaults, {
                "template": "/ngpages/tooltip.tpl.htm"
            });
        });

        hr.controller('navigation', function($scope, hrGlobal) {
            $scope.global = hrGlobal;
        });

         //HR 的相關常數資料。
        hr.constant("hrConstant", {
            MomentDatePattern: "YYYY/MM/DD",
            NGDatePattern: 'yyyy/M/d'
        });

         //HR 資料儲存。
        hr.factory('hrDal', function($http) {
            hrdal = {};

            //取得目前登入者的資訊
            hrdal.getCurrentContributor = function() {
                return $http.get('/contributor/current');
            }

            //列出目前登入者指定日期的 Contribute 記錄。
            hrdal.listCPContribute = function(start, end) {
                if (start && end)
                    return $http.get('cpcontribute/between_date?start=' + start + '&end=' + end);
                else if (start)
                    return $http.get('cpcontribute/between_date?start=' + start);
                else if (end)
                    return $http.get('cpcontribute/between_date?end=' + end);
                else
                    return undefined;
            }

            //取得所有專案的清單。
            hrdal.listProject = function() {
                return $http.get('project/index');
            }

            hrdal.listContributor = function() {
                return $http.get('contributor/index');
            }

            hrdal.saveContribute = function(data) {
                if (data.id)
                    return $http.post('/cpcontribute/edit', data);
                else
                    return $http.post('/cpcontribute/new', data);
            }

            hrdal.deleteContribute = function(data) {
                return $http.get('/cpcontribute/delete?id=' + data);
            }

            hrdal.lastSummary = function(dayCount) {
                //  [{
                //      "date": "2014-03-05",
                //      "amount_sum": 16
                //  }, {
                //      "date": "2014-03-04",
                //      "amount_sum": 2
                //  }]
                return $http.get('/contributor/last_summary?count = ' + dayCount)
            }

            return hrdal;
        });
