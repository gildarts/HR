// 提供全域常用資料快取與功能。
hr.factory('hrGlobal', function(hrDal, $filter, $q) {
    var deferred = $q.defer();

    function before_now(num) {
        return (moment().subtract('days', num).format());
    }

    function getProject(conf) {
        return $filter('filter')(r.projects, conf, true);
    }

    function getProjectCategory(conf) {
        return $filter('filter')(r.project_categories, conf, true);
    }

    function getContributor(conf) {
        return $filter('filter')(r.contributors, conf, true);
    }

    function getProjectMap() {
        var map = {};
        angular.forEach(r.projects, function(val) {
            map[val.id] = val;
        })
        return map;
    }

    function getProjectCategoryMap() {
        var map = {};
        angular.forEach(r.project_categories, function(val) {
            map[val.id] = val;
        })
        return map;
    }

    function ProjectCategoryProjectNameRule(p)
    {   
        return p.projectCategory.name +'/'+ p.name;
    }

    function fillRefProject(arr) {
        var map = getProjectMap();

        angular.forEach(arr, function(val) {
            if (map[val.ref_project_id]) {
                val.project = map[val.ref_project_id];
            } else
                val.project = undefined;
        });
    }

    function fillRefProjectCategory(arr) {
        var map = getProjectCategoryMap();

        angular.forEach(arr, function(val) {
            if (map[val.ref_category_id]) {
                val.projectCategory = map[val.ref_category_id];
                val.full_name = ProjectCategoryProjectNameRule(val);
            } else
                val.projectCategory = undefined;
        });
    }

    function fillRefContributor(arr) {
        var map = getContributorMap();
        angular.forEach(arr, function(val) {
            if (map[val.ref_contributor_id]) {
                val.contributor = map[val.ref_contributor_id];
            } else
                val.contributor = undefined;
        });
    }

    function getContributorMap() {
        var map = {};
        angular.forEach(r.contributors, function(val) {
            map[val.id] = val;
        });
        return map;
    }
    var r = {
        user : undefined,
        projects : undefined, //所有 projects。
        project_categories : undefined,
        contributors : undefined, //所有 contributors。
        google_calendar_authed: false, //指示 google calendar 是否已授權。
        before_now: before_now,
        getProject: getProject,
        getProjectCategory: getProjectCategory,
        getContributor: getContributor,
        getProjectMap: getProjectMap,
        getProjectCategoryMap: getProjectCategoryMap,
        fillRefProject: fillRefProject,
        fillRefProjectCategory: fillRefProjectCategory,
        fillRefContributor: fillRefContributor,
        getContributorMap: getContributorMap,
        ProjectCategoryProjectNameRule:ProjectCategoryProjectNameRule,
    };
    hrDal.listContributor()
        .then(function(res) {
            r.contributors = res.data;
        }).then(hrDal.listProjectCategory)
        .then(function(res) {
            r.project_categories = res.data;
        }).then(hrDal.listProject)
        .then(function(res) {
            r.projects = res.data;
            r.fillRefContributor(r.projects);
            r.fillRefProjectCategory(r.projects);
        }).then(hrDal.getCurrentUser)
        .then(function(res) {
            r.user = res.data ;
            deferred.resolve(r);
        });
    return deferred.promise;
});
