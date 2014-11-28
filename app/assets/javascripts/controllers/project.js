//
// project controller
//
hr.controller('project', function($scope, hrGlobal, hrDal) {
    /*
    處理 Selected 相關變數。
    */
    $scope.selectedItems = [];
    $scope.selectedItem = {}; //Form 的 Binding Source> 
    $scope.selectedItemRef = undefined; //undefined 代表未選擇任何項目。

    hrGlobal.then(function(data){
        $scope.global = data ;
    });
    $scope.gridOptions = {
        data: 'global.projects',
        selectedItems: $scope.selectedItems,
        multiSelect: false,
        showSelectionCheckbox: true,
        afterSelectionChange: function(rowItem, event) {
            angular.copy($scope.selectedItems[0], $scope.selectedItem);
            $scope.selectedItemRef = $scope.selectedItems[0];
        },
        columnDefs: [{
            field: 'contributor.name',
            displayName: '頭目',
            enableCellEdit: false,
            width: '15%'
        }, {
            field: 'projectCategory.name',
            displayName: '分類',
            enableCellEdit: false,
            width: '15%'
        }, {
            field: 'name',
            displayName: '名稱',
            enableCellEdit: false,
            width: '20%'
        }, {
            field: 'description',
            displayName: '說明',
            enableCellEdit: false,
        }]
    };

    $scope.newItem = function() {
        //把畫面上的 Selection 去掉，雖然是個怪方法，但是目前找不到其他方法。
        $scope.gridOptions.selectRow(0, true);
        $scope.gridOptions.selectRow(0, false);

        $scope.selectedItem = {}
        $scope.selectedItemRef = undefined; //未指定值代表要新增。
    }

    $scope.saveItem = function() {

        hrDal.saveProject($scope.selectedItem).success(function(data) {
            /*
            data.result
                id, ref_contributor_id, name, description, created_at, updated_at
                */

            if (data.error)
                alert(angular.toJson(data.error))

            if ($scope.selectedItemRef) { //如果是已存在的項目。
                $scope.global.fillRefContributor([$scope.selectedItem]);
                $scope.global.fillRefProjectCategory([$scope.selectedItem]);
                angular.copy($scope.selectedItem, $scope.selectedItemRef)
            } else //如果項目不存在。
            {
                var newData = data.result;

                //填入 Reference 的資料！
                $scope.global.fillRefContributor([newData]);
                $scope.global.fillRefProjectCategory([newData]);

                //將 selectedContribute 整個蓋過去。
                angular.copy(newData, $scope.selectedItem);

                /*
                如果馬上又進行資料編輯，需要指向正確的資料記錄。
                */
                $scope.selectedItemRef = newData;
                $scope.global.projects.push(newData); //將資料放進 Binding List 中。
            }
        }).error(function(data) {
            alert("Serve Bomb：\n\n" + angular.toJson(data, true));
        });
    }

    $scope.deleteItem = function() {
        hrDal.deleteProject($scope.selectedItem.id).success(function() {
            angular.forEach($scope.global.projects, function(val, key) {
                if ($scope.selectedItem.id === val.id) {
                    $scope.global.projects.splice(key, 1);

                    $scope.selectedItemRef = undefined; //undefined 代表未選擇任何項目。
                    $scope.selectedItem = {};
                }
            });
        });
    }

    

});
