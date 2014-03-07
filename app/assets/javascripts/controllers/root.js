// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
// root
// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
hr.controller('root', function($scope, $filter, hrDal, hrGlobal, hrConstant) {

    // 在 init 中指定。
    $scope.global = undefined; //全域資料

    $scope.filterTooltip = {
        "title": "例：<br>「2012/12/21」指定日期<br>「2012/12/21 7」列出指定日期的過去七天"
    };

    $scope.$watch('selectedSummary', function(newVal, oldVal) {
        if(newVal){
            $scope.global.getCPContributes(newVal);
        }
    });

    /*
    處理 Selected Contribute 相關變數。
    */
    $scope.selectedContributes = []; //ng-grid 的 Binding Source，畫面上會被選擇的項目
    $scope.selectedContribute = {}; //Form 的 Binding Source> 
    $scope.selectedContributeRef = undefined; //undefined 代表未選擇任何項目。

    $scope.gridOptions = {
        data: 'global.contributes',
        selectedItems: $scope.selectedContributes,
        multiSelect: false,
        showSelectionCheckbox: true,
        afterSelectionChange: function(rowItem, event) {
            angular.copy($scope.selectedContributes[0], $scope.selectedContribute);
            $scope.selectedContributeRef = $scope.selectedContributes[0];
        },
        columnDefs: [{
            field: 'date',
            displayName: '日期',
            enableCellEdit: false
        }, {
            field: 'amount',
            displayName: '時數',
            enableCellEdit: false
        }, {
            field: 'project.name',
            displayName: '專案',
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
            date: new moment().format(hrConstant.MomentDatePattern)
        };
        $scope.selectedContributeRef = undefined; //未指定值代表要新增。
    }

    $scope.saveContribute = function() {

        hrDal.saveContribute($scope.selectedContribute).success(function(data) {
            /*
            data.result
                id, ref_project_id, ref_contributor_id, date, amount, description,
                created_at, update_at
                */

            if (data.error)
                alert(angular.toJson(data.error))

            if ($scope.selectedContributeRef) { //如果是已存在的項目。
                hrGlobal.fillRefProject([$scope.selectedContribute]);
                angular.copy($scope.selectedContribute, $scope.selectedContributeRef)
            } else //如果項目不存在。
            {
                var newData = data.result;

                //填入 Reference 的資料！
                hrGlobal.fillRefProject([newData]);

                //將 selectedContribute 整個蓋過去。
                angular.copy(newData, $scope.selectedContribute);

                /*
                如果馬上又進行資料編輯，需要指向正確的資料記錄。
                */
                $scope.selectedContributeRef = newData;
                hrGlobal.contributes.push(newData); //將資料放進 Binding List 中。
                $scope.selectedContributes.push(newData); //叫 ngGrid 選擇項目。
            }

            $scope.refreshLastSummary();

        }).error(function(data) {
            alert("Serve Bomb：\n\n" + angular.toJson(data, true));
        });
    }

    $scope.deleteContribute = function() {
        hrDal.deleteContribute($scope.selectedContribute.id).success(function() {
            angular.forEach(hrGlobal.contributes, function(val, key) {
                if ($scope.selectedContribute.id === val.id) {
                    hrGlobal.contributes.splice(key, 1);

                    $scope.selectedContributeRef = undefined; //undefined 代表未選擇任何項目。
                    $scope.selectedContribute = {};
                }
            });

            $scope.refreshLastSummary();
        });
    }

    $scope.lastSummary = [];
    $scope.selectedSummary = undefined;

    $scope.errorHandle = function(result) {
        alert("爆炸：\n" + angular.toJson(result.config, true));
    }

    $scope.refreshLastSummary = function(){
        hrDal.lastSummary().success(function(data) {
            $scope.lastSummary = data;
        }).error($scope.errorHandle);
    }

    var init = function() {
        //先將全域共用資料放到 scope，以便存取。
        $scope.global = hrGlobal;

        $scope.refreshLastSummary();
        $scope.selectedSummary = $scope.global.before_now(0);
    }

    init();
});
