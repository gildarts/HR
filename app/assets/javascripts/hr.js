//設定 moment 的預設格式化樣式。
moment.defaultFormat = 'YYYY/MM/DD';

var hr = angular.module('hr', ['ngRoute',
		'ngSanitize',
		'ngAnimate',
		'ngGrid',
		'mgcrea.ngStrap',
		'ui.grid', 
		'ui.grid.edit',
		'ui.grid.selection',
		'ui.grid.rowEdit',
		'ui.grid.cellNav', 
		'ngcTableDirective', 
		'checklist-model',
		//'ui-grid-pinning',
		'ui.grid.selection',
    ])
    .config(config)
    .run(function($rootScope, hrGlobal) {
        $rootScope.log = function(obj) {
            console.log(angular.toJson(obj, true));
        };
    })
    .constant("hrConstant", {
        //HR 的相關常數資料。
        MomentDatePattern: "YYYY/MM/DD"
        //NGDatePattern: 'yyyy/M/d'
    });
