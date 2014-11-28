/**
 * Created by Aaron on 2014/11/18.
 */

hr.controller('contributeLook', function($scope, $filter, $tooltip, hrDal, hrGlobal, hrConstant) {

    $scope.selectedContributes = [];
    $scope.selectedContribute = {};
    $scope.selectedContributeRef = undefined;
    $scope.currentDate = undefined ;
    $scope.lastSummary = [];
    $scope.selectedSummary = undefined;
    hrGlobal.then(function(data){
        $scope.global = data ;
        $scope.contributors = $scope.global.getContributor();
        init();
    });
    $scope.setCurrentCtor = function(ctor) {
        $scope.currentCtor = ctor;
        $scope.refreshLastSummary();
        $scope.selectedContributes = [];
        $scope.selectedContribute = {};
        $scope.selectedContributeRef = undefined;
        $scope.currentDate = undefined ;
    };

    $scope.setCurrentDate = function(date){
        $scope.selectedContributes = [] ;
        $scope.currentDate = date ;
        if ($scope.currentCtor) {
            hrDal.getUserContribute($scope.currentCtor.id,date).success(
                function(data){
                    var hash = $scope.global.getProjectMap();
                    data = [].concat(data);
                    for (var i = 0; i < data.length; i++) {
                        data[i].project = hash[data[i].ref_project_id] ;
                    };
                    $scope.selectedContributes = data;
                });
        }
    };
    
    $scope.gridOptions = {
        data: 'selectedContributes',
        selectedItems: $scope.selectedContributes,
        multiSelect: false,
        afterSelectionChange: function(rowItem, event) {
            angular.copy($scope.selectedContributes[rowItem.rowIndex], $scope.selectedContribute);
            $scope.selectedContributeRef = $scope.selectedContributes[rowItem.rowIndex];
        },
        columnDefs: [{
            field: 'date',
            displayName: '日期',
            enableCellEdit: false,
            visible: false
        }, {
            field: 'estimate',
            displayName: '預計',
            enableCellEdit: false,
            width: '18%'
        }, {
            field: 'amount',
            displayName: '時數',
            enableCellEdit: false,
            width: '18%'
        }, {
            field: 'project.name',
            displayName: '專案',
            enableCellEdit: false,
            width: '25%'
        }, {
            field: 'title',
            displayName: 'Title',
            enableCellEdit: false
        }, {
            field: 'description',
            displayName: '說明',
            enableCellEdit: false
        }]
    };

    $scope.newContribute = function() {
        //把畫面上的 Selection 去掉，雖然是個怪方法，但是目前找不到其他方法。
        $scope.gridOptions.selectRow(0, true);
        $scope.gridOptions.selectRow(0, false);

        $scope.selectedContribute = {
            date: moment().format(hrConstant.MomentDatePattern)
        };
        $scope.selectedContributeRef = undefined; //未指定值代表要新增。
    };

    $scope.errorHandle = function(result) {
        alert("爆炸：\n" + angular.toJson(result.config, true));
    };

    $scope.refreshLastSummary = function() {
        if ($scope.currentCtor) {
            hrDal.getUserLastSummary($scope.currentCtor.id,7).success(function(data) {
                $scope.lastSummary = data;
            }).error($scope.errorHandle);
        }
    };

    var init = function() {
        //先將全域共用資料放到 scope，以便存取。
        $scope.refreshLastSummary();
    };

    init();
});
