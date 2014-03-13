//
// project controller
//
hr.controller('contributor', function($scope, hrGlobal) {

    $scope.selectedContributors = [];

    $scope.gridOptions = {
        data: 'global.contributors',
        selectedItems: $scope.selectedContributors,
        multiSelect: false,
        showSelectionCheckbox: true,
        afterSelectionChange: function(rowItem, event) {
            // angular.copy($scope.selectedContributes[0], $scope.selectedContribute);
            // $scope.selectedContributeRef = $scope.selectedContributes[0];
        },
        columnDefs: [{
            field: 'name',
            displayName: '名稱',
            enableCellEdit: false,
            width: '30%'
        }, {
            field: 'unit_cost',
            displayName: '單位',
            enableCellEdit: false,
        }]
    };

    var init = function() {
        //先將全域共用資料放到 scope，以便存取。
        $scope.global = hrGlobal;
    }

    init();

});
