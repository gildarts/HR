var hr = angular.module('hr', ['ngRoute', 'ngSanitize', 'ngAnimate',
    'ngGrid', 'mgcrea.ngStrap']);

hr.config(function ($routeProvider, $tooltipProvider) {
    $routeProvider
        .when('/', {
            templateUrl: '/ngpages/root.htm',
            controller: 'root'
        })
        .when('/second', {
            templateUrl: '/ngpages/second.htm',
            controller: 'second'
        })
        .when('/project', {
            templateUrl: '/ngpages/project.htm',
            controller: 'project'
        })
        .when('/project_category', {
            templateUrl: '/ngpages/project_category.htm',
            controller: 'projectCategory'
        })
        .when('/contributor', {
            templateUrl: '/ngpages/contributor.htm',
            controller: 'contributor'
        })
        .when('/statistical', {
            templateUrl: '/ngpages/statistical.htm',
            controller: 'statistical'
        })
        .otherwise({
            redirectTo: '/'
        });

    // 設定 Tooltip 的全域預設值。
    angular.extend($tooltipProvider.defaults, {
        "template": "/ngpages/tooltip.tpl.htm"
    });
});

hr.controller('navigation', function ($scope, hrGlobal) {
    $scope.global = hrGlobal;
});

//HR 的相關常數資料。
hr.constant("hrConstant", {
    MomentDatePattern: "YYYY/MM/DD",
    NGDatePattern: 'yyyy/M/d'
});

