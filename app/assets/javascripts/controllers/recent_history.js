/**
 * Created by Yaoming on 2014/3/26.
 */

hr.controller('recentHistory', function ($scope, hrDal, hrGlobal) {

    var strdate = "2014/3/5";
    $scope.weekday = moment(strdate).day(1).format('YYYY/MM/DD') + " : " + moment(strdate).day(5).format('YYYY/MM/DD');
    $scope.weekofyear = moment().day(1).week(12).format('YYYY/MM/DD');
    $scope.data = [];

    for (var row = 0; row < 100; row++) {
        var rowContent = [];
        for (var col = 0; col < 100; col++) {
            rowContent.push(row * col + col);
        }
        $scope.data.push(rowContent);
    }

    $scope.customDataFn = function (data, row, col) {
        return data[100 - row - 1][100 - col - 1];
    }

    $scope.cellFormatRange1 = function (value, row, col) {
        return value;
    }

    $scope.getStyle = function (value, row, col) {
        return 'color: red';
    }
});
