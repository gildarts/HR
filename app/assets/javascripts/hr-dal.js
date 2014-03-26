//HR 資料儲存。
hr.factory('hrDal', function ($http) {
    hrdal = {};

    //取得目前登入者的資訊
    hrdal.getCurrentUser = function () {
        return $http.get('/public/show_current_user');
    }

    //列出目前登入者指定日期的 Contribute 記錄。
    hrdal.listCPContribute = function (start, end, all) {
        if (start && end)
            return $http.get('cpcontribute/between_date?start=' + start + '&end=' + end);
        else if (start)
            return $http.get('cpcontribute/between_date?start=' + start);
        else if (end)
            return $http.get('cpcontribute/between_date?end=' + end);
        else
            return $http.get('cpcontribute/between_date');
    }

    //列出目前登入者指定日期的 Contribute 記錄。
    hrdal.listCPContributePower = function () {
        return $http.get('cpcontribute/index');
    }

    //取得所有專案的清單。
    hrdal.listProject = function () {
        return $http.get('project/index');
    }

    hrdal.saveProject = function (data) {
        if (data.id)
            return $http.post('project/edit', data);
        else
            return $http.post('project/new', data);
    }

    hrdal.deleteProject = function (data) {
        return $http.get('project/delete/' + data);
    }

    //取得所有專案的清單。
    hrdal.listProjectCategory = function () {
        return $http.get('projectcategory/index');
    }

    hrdal.saveProjectCategory = function (data) {
        if (data.id)
            return $http.post('projectcategory/edit', data);
        else
            return $http.post('projectcategory/new', data);
    }

    hrdal.deleteProjectCategory = function (data) {
        return $http.get('projectcategory/delete/' + data);
    }

    hrdal.listContributor = function () {
        return $http.get('contributor/index');
    }

    hrdal.saveContributor = function (data) {
        if (data.id)
            return $http.post('contributor/edit', data);
        else
            return $http.post('contributor/new', data);
    }

    hrdal.deleteContributor = function (data) {
        return $http.get('contributor/delete/' + data);
    }

    // 歷使記錄。
    hrdal.saveContribute = function (data) {
        if (data.id)
            return $http.post('/cpcontribute/edit', data);
        else
            return $http.post('/cpcontribute/new', data);
    }

    hrdal.deleteContribute = function (data) {
        return $http.get('/cpcontribute/delete/' + data);
    }

    hrdal.lastSummary = function (dayCount) {
        //  [{
        //      "date": "2014-03-05",
        //      "amount_sum": 16
        //  }, {
        //      "date": "2014-03-04",
        //      "amount_sum": 2
        //  }]
        return $http.get('/contributor/last_summary?count=' + dayCount)
    }

    return hrdal;
});
