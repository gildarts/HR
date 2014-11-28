hr.controller('calendar', function ($scope, $filter, $window, hrDal, hrGlobal) {

    $scope.g_datetime_pattern = 'YYYY-MM-DDTHH:mm:ss+08:00';

    $scope.start_date = moment().format();

    $scope.last_days = 1;

    $scope.getting_data = false;
    hrGlobal.then(function(data){
        $scope.global = data ;
    });
    /*
     處理 Selected 相關變數。
     */
    $scope.events = [];
    $scope.selectedItems = [];
    $scope.selectedItem = {}; //Form 的 Binding Source>
    $scope.selectedItemRef = undefined; //undefined 代表未選擇任何項目。

    $scope.gridOptions = {
        data: 'events',
        selectedItems: $scope.selectedItems,
        multiSelect: false,
        showSelectionCheckbox: true,
        enableCellEditOnFocus: true,
        afterSelectionChange: function (rowItem, event) {
            $scope.selectedItem = $scope.selectedItems[0];
//            angular.copy($scope.selectedItems[0], $scope.selectedItem);
//            $scope.selectedItemRef = $scope.selectedItems[0];
        },
        columnDefs: [
            {
                field: 'summary',
                displayName: '概述',
                enableCellEdit: true,
                width: '40%'
            },
            {
                field: 'start',
                displayName: '開始時間',
                enableCellEdit: false,
                width: '20%'
            }, {
                field: 'estimate',
                displayName: '預計',
                enableCellEdit: false,
            }, {
                field: 'period',
                displayName: '時數',
                enableCellEdit: false,
                width: '10%'
            },
            {
                field: 'project_name',
                displayName: '專案',
                enableCellEdit: false
            }
        ]
    };

    $scope.$watch('selectedItem.ref_project_id', function (newVal, oldVal) {
        if ($scope.selectedItem) {
            $scope.global.fillRefProject([$scope.selectedItem]);

            if ($scope.selectedItem.project)
                $scope.selectedItem.project_name = "(" + $scope.selectedItem.project.projectCategory.name + ")" + $scope.selectedItem.project.name;
        }
    });

    $scope.getEvents = function () {
        if ($scope.events.length > 0) {
            if (!confirm('確定？將蓋掉目前畫面資料喔！'))
                return;
        }

        $scope.init_data();
    };

    $scope.import_events = function () {
        if (!confirm('將匯入有專案的事件，確定要匯入？\n\n 注意：重覆匯入同一天，會產生一筆以上資料。'))
            return;

        var records = [];

        angular.forEach($scope.events, function (val, key) {
            if (!val.ref_project_id)
                return;

            var record = {};

            var dt = moment(val.start);

            record.ref_project_id = val.ref_project_id;
            record.date = dt.format();
            record.amount = val.period;
            record.start_time = dt.format('HH:mm:ss');
            record.title = val.summary;
            record.description = val.description;

            records.push(record);
        });

        if (records.length <= 0) {
            alert('沒有資料可匯入。');
            return;
        }

        hrDal.import_CPContribute(records).success(function (rsp) {
            alert('完成！');
        }).error(function (data) {
            alert("發生錯誤：\n\n" + angular.toJson(data, true));
        });
    };

//    $scope.selectAll = function(){
//        angular.forEach($scope.events, function(event, index){
//            $scope.gridOptions.selectItem(index, true);
//        });
//    };

    $scope.init_data = function () {
        $scope.getting_data = true;

        $scope.events.splice(0, $scope.events.length); //刪除全部元素。

        hrDal.get_calendar_list().success(function (data) {
            if (data.error) {
                alert('授權過期或未授權，請重新取得「行事曆授權」：\n\n' + angular.toJson(data, true));
                return;
            }

            var filter = $filter('filter');

            //取得 Primary 行事曆。
            var filtered = filter(data.items, {primary: true}, true);

            var sd = moment($scope.start_date);

            hrDal.get_event_list(filtered[0].id, $scope.last_days, sd.year(), sd.month() + 1, sd.date()).success(function (data) {
                angular.forEach(data.items, function (val, key) {

                    if (!val.start.dateTime)
                        return;

                    var start = moment(val.start.dateTime, $scope.g_datetime_pattern);
                    var end = moment(val.end.dateTime, $scope.g_datetime_pattern);

                    var duration = end - start;

                    var event = {};
                    event.summary = val.summary;
                    event.start = start.format('YYYY/MM/DD HH:mm');
                    event.end = end.format('YYYY/MM/DD HH:mm');
                    event.period = moment.duration(duration).asHours();
                    event.description = val.description;

                    $scope.events.push(event);
                });
                $scope.getting_data = false;
            }).error(function (data) {
                $scope.getting_data = false;
                alert("發生錯誤：\n\n" + angular.toJson(data, true));
            });
        }).error(function (data) {
            $scope.getting_data = false;
            alert("發生錯誤：\n\n" + angular.toJson(data, true));
        });
    };

    $scope.auth = function () {
        var w = 640, h = 640;

        var authwin = $window.open('/google/oauth2', '', getWindowPositionString(w, h));

        var closechk = $window.setInterval(function () {
            if (authwin.closed) {
                $window.clearInterval(closechk);
                $scope.init_data();
            }
        }, 500);
    };

    var getWindowPositionString = function (w, h) {
        var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
        var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

        var width = ((window.innerWidth) ? window.innerWidth : document.documentElement.clientWidth) ?
            document.documentElement.clientWidth : screen.width;

        var height = ((window.innerHeight) ? window.innerHeight : document.documentElement.clientHeight) ?
            document.documentElement.clientHeight : screen.height;

        var left = ((width / 2) - (w / 2)) + dualScreenLeft;
        var top = ((height / 2) - (h / 2)) + dualScreenTop;

        return 'width=' + w + ', height=' + h + ', top=' + top + ', left=' + left;
    }
});