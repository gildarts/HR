// 提供全域常用資料快取與功能。
hr.factory('hrGlobal', function(hrConstant, hrDal, $filter, $q) {

    g = {
        modalResult: undefined,
        projects: [], //所有 projects。
        contributors: [], //所有 contributors。
        contributes: [], //目前登入者的所有 contribute。
        user: undefined, //目前登入者資訊。
        sourceComplete: [], //用於待等是否所有 Row Source 都好了！
        before_now: function(num) {
            return (new moment().subtract('days', num).format(hrConstant.MomentDatePattern));
        },
        log: function(obj) {
            console.log(angular.toJson(obj, true));
        },
        getProject: function(conf) {
            return $filter('filter')(this.projects, conf, true);
        },
        getContributor: function(conf) {
            return $filter('filter')(this.contributors, conf, true);
        },
        getCPContributes: function(dateStr) {

            var errorHandle = function(result) {
                alert("爆炸：\n" + angular.toJson(result.config, true));
            }

            $q.all([this.sourceComplete]).then(function(result) {
                //預設讀取最近 14 天的資料。
                var start = dateStr;

                hrdal.listCPContribute(start, start).success(function(data) {
                    g.fillRefProject(data);
                    g.contributes = data;
                }).error(errorHandle);
            }, errorHandle);
        },
        fillRefProject: function(arr) {
            var map = {};
            angular.forEach(this.projects, function(val) {
                map[val.id] = val;
            })

            angular.forEach(arr, function(val) {
                if (map[val.ref_project_id]) {
                    val.project = map[val.ref_project_id];
                } else
                    val.project = undefined;
            });
        }
    }

    var init = function() {

        var errorHandle = function(result) {
            alert("爆炸：\n" + angular.toJson(result.config, true));
        }

        var prj = hrDal.listProject().success(function(data) {
            g.projects = data;
        }).error(errorHandle);

        var cutes = hrDal.listContributor().success(function(data) {
            g.contributors = data;
        }).error(errorHandle);

        g.sourceComplete.push(prj, cutes);

        hrDal.getCurrentContributor().success(function(data) {
            g.user = data;
        }).error(errorHandle);
    };

    init();

    return g;
});
