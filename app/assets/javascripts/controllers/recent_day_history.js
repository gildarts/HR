/**
 * Created by Yaoming on 2014/3/26.
 */

hr.controller('recentDayHistory', function ($scope, hrDal, hrGlobal, hrConstant) {

    $scope.dangerValue = 8;

    $scope.data = [];

    $scope.$watch('dangerValue', function (newVal, oldVal) {
    });

    $scope.getStyle = function (value, row, col) {
        if (parseInt(value) > $scope.dangerValue)
            return 'background-color: red';
        else
            return '';
    };

    hrDal.day_summary_by_contributor().success(function (data) {

        var daylist = function () { //找出過去本週日期清單。
            var days = [];
            var now = moment().subtract('day', 7 + 1).day(0);
            for (var i = 0; i <= 13; i++) {
                days.push({date: now.format()});
                now = now.subtract('day', -1);
            }
            return days.reverse();
        };

        var contributor = function (name, id) {
            var cls = {
                name: name,
                ref_contributor_id: undefined,
                days: undefined,
                getDay: function (filter) {
                    var found = undefined;
                    angular.forEach(this.days, function (val) {
                        if (filter == val.date) {
                            found = val;
                        }
                    });
                    return found;
                }
            };

            cls.days = daylist();

            return cls;
        };

        var weekdata = [];

        var fields = ['姓名'];
        angular.forEach(daylist(), function (val) {
            fields.push(val.date);
        });
        weekdata.push(fields);

        //轉換資料格式成物件模式便於計算。
        var contributors = {};
        angular.forEach(data, function (val, key) {

            if (!contributors[val.ref_contributor_id]) {
                contributors[val.ref_contributor_id] = contributor(val.name, val.ref_contributor_id);
            }

            var filter = moment(val.date).format();
            var day = contributors[val.ref_contributor_id].getDay(filter);

            if (day)
                day.total_amount = val.total_amount;

        });

        //轉換成 ng-cells 適合的資料結構。
        angular.forEach(contributors, function (ctor) {
            var record = [ctor.name];
            angular.forEach(ctor.days, function (day) {
                record.push(day.total_amount);
            })
            weekdata.push(record);
        });

        console.log(angular.toJson(contributors, true));

        $scope.data = weekdata;
    });
});
