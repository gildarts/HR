hr.controller('calendar', function ($scope, $window, hrGlobal, hrDal) {
    $scope.auth = function () {
        var w = 640, h = 640;

        $window.open('/google/oauth2', '', getWindowPositionString(w, h));
    }

    $scope.renewToken = function () {
        var w = 640, h = 640;

        $window.open('/google/refresh_token', '', getWindowPositionString(w, h));
    }

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