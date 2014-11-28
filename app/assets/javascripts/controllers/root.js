hr.filter('mapProject', function(hrGlobal) {
        var hash = {};
        var nameRule;
        hrGlobal.then(function(data) {
            hash = data.getProjectMap();
            nameRule = data.ProjectCategoryProjectNameRule;
        });
        return function(input) {
            if (!input) {
                return '';
            } else {
                return nameRule(hash[input]);
            }
        };
    })
    .controller('root', function($scope, $filter, $tooltip, hrDal, hrGlobal, uiGridConstants, hrConstant, $q, $interval) {
        $scope.filterTooltip = {
            "title": "例：<br>「2012/12/21」指定日期<br>「2012/12/21 7」列出指定日期的過去七天"
        };
        //先將全域共用資料放到 scope，以便存取。
        $scope.contributes = [];
        $scope.global = undefined;

        $scope.projects = [];
        hrGlobal.then(function(data) {
            $scope.global = data;
            init();
        });
        $scope.$watch('selectedSummary', function(newVal, oldVal) {
            if (newVal) {
                $scope.contributes = [];
                hrDal.listCPContribute(newVal, newVal).then(function(r) {
                    $scope.contributes = r.data;
                    $scope.contributes.push({
                        date: $scope.global.before_now(0)
                    });
                });
            }
        });

        /*
        處理 Selected Contribute 相關變數。
        */
        //$scope.selectedContributes = []; //ng-grid 的 Binding Source，畫面上會被選擇的項目
        //$scope.selectedContribute = {}; //Form 的 Binding Source> 
        //$scope.selectedContributeRef = undefined; //undefined 代表未選擇任何項目。

        $scope.lastSummary = [];
        $scope.selectedSummary = undefined;
        var init = function() {
            $scope.refreshLastSummary();
            $scope.selectedSummary = $scope.global.before_now(0);
            $scope.gridOptions.columnDefs[2].editDropdownOptionsArray = $scope.global.getProject();
        };
        $scope.gridOptions = {
            data: 'contributes',
            selectedItems: $scope.selectedContributes,
            showFooter: true,
            //multiSelect: false,

            //enableColumnResizing : true,
            //showSelectionCheckbox: true,
            // afterSelectionChange: function(rowItem, event) {
            //     angular.copy($scope.selectedContributes[0], $scope.selectedContribute);
            //     $scope.selectedContributeRef = $scope.selectedContributes[0];
            // },
            //enableCellEditOnFocus :true,
            rowEditWaitInterval: 300,
            columnDefs: [{
                field: 'id',
                displayName: '#',
                enableCellEdit: false,
                visible : false,
                width: '5%',
            }, {
                field: 'date',
                displayName: '日期',
                enableCellEdit: true,
                visible : false,
                //type: 'date',
                width: '5%',
            }, {
                field: 'ref_project_id',
                displayName: '專案',
                enableCellEdit: true,
                editableCellTemplate: 'ui-grid/dropdownEditor',
                cellFilter: 'mapProject',
                editDropdownValueLabel: 'full_name',
                editDropdownOptionsArray: [],
                width: '15%',
            }, {
                field: 'title',
                displayName: 'Title',
                enableCellEdit: true,
                width: '15%',
            }, {
                field: 'estimate',
                displayName: '預計',
                enableCellEdit: true,
                type: 'number',
                width: '5%',
                aggregationType: uiGridConstants.aggregationTypes.sum,
            }, {
                field: 'amount',
                displayName: '時數',
                enableCellEdit: true,
                type: 'number',
                width: '5%',
                aggregationType: uiGridConstants.aggregationTypes.sum,
            }, {
                field: 'description',
                displayName: '說明',
                enableCellEdit: true,
                width: '20%',
            }]
        };
        $scope.saving = 0;
        $scope.deleteSelectedRows = function() {
            if ($scope.gridApi.selection.getSelectedRows().length) {
                if (!confirm('確定要刪除？'))
                    return;
                var selectedRows = $scope.gridApi.selection.getSelectedRows();
                for (var i = 0; i < selectedRows.length; i++) {
                    if (selectedRows[i].id) {
                        hrDal.deleteContribute(selectedRows[i].id).then(function(res) {
                            var id = res.data.id;
                            for (var i = 0; i < $scope.contributes.length; i++) {
                                if ($scope.contributes[i].id == id) {
                                    $scope.contributes.splice(i, 1);
                                }
                            };
                        });
                    }
                };
            }
        }
        $scope.copyToToday = function() {

            if ($scope.gridApi.selection.getSelectedRows().length) {
                if (!confirm('確定要複製？'))
                    return;
                var records = [];
                var selectedRows = $scope.gridApi.selection.getSelectedRows();
                for (var i = 0; i < selectedRows.length; i++) {
                    val = selectedRows[i];
                    if (!val.id)
                        continue;
                    var record = {};
                    var dt = moment();
                    record.ref_project_id = val.ref_project_id;
                    record.date = dt.format();
                    record.estimate = val.estimate - val.amount;
                    record.title = val.title;
                    record.description = val.description;
                    records.push(record);
                };
                hrDal.import_CPContribute(records).success(function(rsp) {
                    alert('完成！');
                }).error(function(data) {
                    alert("發生錯誤：\n\n" + angular.toJson(data, true));
                });
            }
        };
        $scope.gridOptions.onRegisterApi = function(gridApi) {
            $scope.gridApi = gridApi;
            gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
        };
        $scope.saveRow = function(rowEntity) {
            var promise = $q.defer();
            $scope.saving = $scope.saving + 1;
            hrDal.saveContribute(rowEntity)
                .then(function(res) {
                    $interval(function() {
                        if (!rowEntity.id) {
                            $scope.contributes.push({
                                date: $scope.global.before_now(0)
                            });
                            rowEntity.id = res.data.id;
                        }
                        $scope.saving = $scope.saving - 1;
                        promise.resolve();
                    }, 500, 1);
                }, function(reason) {
                    promise.reject();
                    $scope.saving = $scope.saving - 1;
                });
            $scope.gridApi.rowEdit.setSavePromise($scope.gridApi.grid, rowEntity, promise.promise);
        };

        $scope.refreshLastSummary = function() {
            hrDal.lastSummary(10).success(function(data) {
                $scope.lastSummary = data;
            }).error($scope.errorHandle);
        };
    });
