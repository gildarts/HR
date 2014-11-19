//設定 moment 的預設格式化樣式。
moment.defaultFormat = 'YYYY/MM/DD';

var hr = angular.module('hr', ['ngRoute', 'ngSanitize', 'ngAnimate',
    'ngGrid', 'mgcrea.ngStrap', 'ngcTableDirective', 'checklist-model']);

hr.config(function ($routeProvider, $tooltipProvider) {
    $routeProvider
        .when('/', {
            templateUrl: '/ngpages/root.htm',
            controller: 'root'
        })
        .when('/calendar', {
            templateUrl: '/ngpages/calendar.htm',
            controller: 'calendar'
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
        .when('/recent_week_history', {
            templateUrl: '/ngpages/recent_week_history.htm',
            controller: 'recentWeekHistory'
        })
        .when('/recent_day_history', {
            templateUrl: '/ngpages/recent_day_history.htm',
            controller: 'recentDayHistory'
        })
        .when('/contribute_query', {
            templateUrl: '/ngpages/contribute_query.htm',
            controller: 'contributeQuery'
        })
        .when('/contribute_look', {
            templateUrl: '/ngpages/contribute_look.htm',
            controller: 'contributeLook'
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
    MomentDatePattern: "YYYY/MM/DD"
    //NGDatePattern: 'yyyy/M/d'
});
