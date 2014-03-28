/**
 * Created by Yaoming on 2014/3/26.
 */

hr.controller('recentHistory', function ($scope, hrDal, hrGlobal, hrConstant) {

//    var strdate = "2014/3/5";
//    $scope.weekday = moment(strdate).day(1).format() + " : " + moment(strdate).day(5).format();
//    $scope.weekofyear = moment().day(1).week(12).format();
    $scope.data = [];

    $scope.cellFormatRange1 = function (value, row, col) {
        return value;
    }

    $scope.getStyle = function (value, row, col) {
        return 'color: red';
    }

    hrDal.week_summary_by_contributor().success(function (data) {

        var weeklist = function () { //找出過去五週的週數。
            var weeks = [];
            var now = moment().day(0);
            for (var i = 1; i <= 15; i++) {
                var week = now.week();
                weeks.push({week: week, year: now.year()});
                now = now.day(-7);
            }
            return weeks;
        };

        var contributor = function (name, id) {
            var cls = {
                name: name,
                ref_contributor_id: undefined,
                weeks: undefined,
                getWeek: function (filter) {
                    var found = undefined;
                    angular.forEach(this.weeks, function (val) {
                        var each = val.year.toString() + val.week.toString();

                        if (filter === each) {
                            found = val;
                        }
                    });
                    return found;
                }
            };

            cls.weeks = weeklist();

            return cls;
        };

        var weekdata = [];

        var fields = ['姓名'];
        angular.forEach(weeklist(), function (val, key) {
            var weekFirst = moment().year(val.year).day(0).week(val.week);
            fields.push(val.week + '<br/>' + weekFirst.format());
        });
        weekdata.push(fields);

        //轉換資料格式成物件模式便於計算。
        var contributors = {};
        angular.forEach(data, function (val, key) {

            if (!contributors[val.ref_contributor_id]) {
                contributors[val.ref_contributor_id] = contributor(val.name, val.ref_contributor_id);
            }

            var weekFilter = val.year.toString() + val.week.toString();
            var week = contributors[val.ref_contributor_id].getWeek(weekFilter);

            if (week)
                week.total_amount = val.total_amount;

        });

        //轉換成 ng-cells 適合的資料結構。
        angular.forEach(contributors, function (ctor) {
            var record = [ctor.name];
            angular.forEach(ctor.weeks, function (week) {
                record.push(week.total_amount);
            })
            weekdata.push(record);
        });

        //console.log(angular.toJson(contributors, true));

        $scope.data = weekdata;
    });
});
