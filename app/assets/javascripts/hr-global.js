
// 提供全域常用資料快取與功能。
hr.factory('hrGlobal', function (hrConstant, hrDal, $filter, $q) {

    var callbacks = [];
    var modelSuccess = false;
    var invokeCallback = function () {
        if (callbacks.length > 0) {
            var cb = callbacks.slice(0); // Clone array.

            angular.forEach(cb, function (val, key) {
                callbacks.pop()();
            });
        }
    }

    g = {
        modalResult: undefined,
        projects: [], //所有 projects。
        project_categories: [],
        contributors: [], //所有 contributors。
        contributes: [], //目前登入者的所有 contribute。
        user: undefined, //目前登入者資訊。
        success: function (callback) {
            callbacks.push(callback);

            if (modelSuccess)
                invokeCallback();

        }, // next member
        complete: function () {
            modelSuccess = true;
            invokeCallback();
        }, // next member
        before_now: function (num) {
            return (moment().subtract('days', num).format());
        }, // next member
        log: function (obj) {
            console.log(angular.toJson(obj, true));
        }, // next member
        getProject: function (conf) {
            return $filter('filter')(this.projects, conf, true);
        }, // next member
        getProjectCategory: function (conf) {
            return $filter('filter')(this.project_categories, conf, true);
        }, // next member
        getContributor: function (conf) {
            return $filter('filter')(this.contributors, conf, true);
        }, // next member
        getCPContributes: function (dateStr) {

            var errorHandle = function (result) {
                alert("爆炸(getCPContributes)：\n" + angular.toJson(result.config, true));
            }

            //預設讀取最近 14 天的資料。
            var start = dateStr;

            hrdal.listCPContribute(start, start).success(function (data) {
                g.fillRefProject(data);
                g.contributes = data; //重點在這，更新這個資料。
            }).error(errorHandle);

        }, // next member
        getProjectMap: function () {
            //建立 Dictionary
            var map = {};
            angular.forEach(this.projects, function (val) {
                map[val.id] = val;
            })
            return map;
        }, //next member
        getProjectCategoryMap: function () {
            //建立 Dictionary
            var map = {};
            angular.forEach(this.project_categories, function (val) {
                map[val.id] = val;
            })
            return map;
        }, //next member
        fillRefProject: function (arr) {
            //建立 Dictionary
            var map = this.getProjectMap();

            angular.forEach(arr, function (val) {
                if (map[val.ref_project_id]) {
                    val.project = map[val.ref_project_id];
                } else
                    val.project = undefined;
            });
        }, // next member
        fillRefProjectCategory: function (arr) {
            //建立 Dictionary
            var map = this.getProjectCategoryMap();

            angular.forEach(arr, function (val) {
                if (map[val.ref_category_id]) {
                    val.projectCategory = map[val.ref_category_id];
                } else
                    val.projectCategory = undefined;
            });
        }, // next member
        fillRefContributor: function (arr) {
            //建立 Dictionary
            var map = this.getContributorMap();

            angular.forEach(arr, function (val) {
                if (map[val.ref_contributor_id]) {
                    val.contributor = map[val.ref_contributor_id];
                } else
                    val.contributor = undefined;
            });
        },
        getContributorMap: function () {
            //建立 Dictionary
            var map = {};
            angular.forEach(this.contributors, function (val) {
                map[val.id] = val;
            });
            return map;
        }
    }

    var init = function () {

        var errorHandle = function (result) {
            alert("爆炸(hr-global-init)：\n" + angular.toJson(result.config, true));
        }

        hrDal.listContributor().success(function (data) {
            g.contributors = data;

            hrDal.listProjectCategory().success(function (data) {
                g.project_categories = data;

                hrDal.listProject().success(function (data) {
                    g.projects = data;
                    g.fillRefContributor(g.projects);
                    g.fillRefProjectCategory(g.projects);

                    hrDal.getCurrentUser().success(function (data) {
                        g.user = data;

                        g.complete();
                    }).error(function (data) {
                        alert('取得目前使用者資訊爆炸！');
                        g.log(data);
                    });
                }).error(errorHandle);
            }).error(errorHandle);
        }).error(errorHandle);
    };

    init();

    return g;
});
