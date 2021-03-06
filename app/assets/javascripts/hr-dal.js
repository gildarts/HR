//HR 資料儲存。
hr.factory('hrDal', function ($http) {
    hrdal = {};

    //取得目前登入者的資訊
    hrdal.getCurrentUser = function () {
        return $http.get('/public/show_current_user');
    };
    hrdal.getUserContribute = function(user_id,date) {
        return $http.post('/cpcontribute/get_user_contribute',{user_id:user_id,date:date});
    }
    hrdal.getUserContributes = function(user_id,start_date,end_date) {
        return $http.post('/cpcontribute/get_user_contributes',{user_id:user_id,start_date:start_date,end_date:end_date});
    }
    hrdal.getUserLastSummary = function(user_id,count) {
        return $http.post('/contributor/get_user_last_summary',{user_id:user_id,count:count});
    }
    //列出目前登入者指定日期的 Contribute 記錄。
    hrdal.listCPContribute = function (start, end) {
        if (start && end)
            return $http.get('cpcontribute/between_date?start=' + start + '&end=' + end);
        else if (start)
            return $http.get('cpcontribute/between_date?start=' + start);
        else if (end)
            return $http.get('cpcontribute/between_date?end=' + end);
        else
            return $http.get('cpcontribute/between_date');
    };

    //列出所有的 Contribute 記錄。
    hrdal.listCPContributePower = function () {
        return $http.get('cpcontribute/index');
    };

    //取得所有專案的清單。
    hrdal.listProject = function () {
        return $http.get('project/index');
    };

    hrdal.saveProject = function (data) {
        if (data.id)
            return $http.post('project/edit', data);
        else
            return $http.post('project/new', data);
    };

    hrdal.deleteProject = function (data) {
        return $http.get('project/delete/' + data);
    };

    //取得所有專案的清單。
    hrdal.listProjectCategory = function () {
        return $http.get('projectcategory/index');
    };

    hrdal.saveProjectCategory = function (data) {
        if (data.id)
            return $http.post('projectcategory/edit', data);
        else
            return $http.post('projectcategory/new', data);
    };

    hrdal.deleteProjectCategory = function (data) {
        return $http.get('projectcategory/delete/' + data);
    };

    hrdal.listContributor = function () {
        return $http.get('contributor/index');
    };

    hrdal.saveContributor = function (data) {
        if (data.id)
            return $http.post('contributor/edit', data);
        else
            return $http.post('contributor/new', data);
    };

    hrdal.deleteContributor = function (data) {
        return $http.get('contributor/delete/' + data);
    };

    // 歷使記錄。
    hrdal.saveContribute = function (data) {
        if (data.id)
            return $http.post('/cpcontribute/edit', data);
        else
            return $http.post('/cpcontribute/new', data);
    };

    hrdal.deleteContribute = function (data) {
        return $http.get('/cpcontribute/delete/' + data);
    };

    hrdal.lastSummary = function (dayCount) {
        //  [{
        //      "date": "2014-03-05",
        //      "amount_sum": 16
        //  }, {
        //      "date": "2014-03-04",
        //      "amount_sum": 2
        //  }]
        return $http.get('/contributor/last_summary?count=' + dayCount);
    };

    //取得週填寫狀態。
    hrdal.week_summary_by_contributor = function () {
        //[
        //    {
        //        "name": "呂韻如",
        //        "ref_contributor_id": 4,
        //        "year": 2014,
        //        "week": 7,
        //        "total_amount": 3,
        //        "raw_total_amount": 180
        //    },
        //    {
        //        "name": "黃耀明",
        //        "ref_contributor_id": 3,
        //        "year": 2014,
        //        "week": 13,
        //        "total_amount": 6,
        //        "raw_total_amount": 360
        //    }
        //]
        return $http.get('/cpcontribute/week_summary_by_contributor');
    };

    //取得日填寫狀態。
    hrdal.day_summary_by_contributor = function () {
        //[
        //    {
        //        "name": "呂韻如",
        //        "ref_contributor_id": 4,
        //        "date": '2014-01-18',
        //        "total_amount": 3,
        //        "raw_total_amount": 180
        //    },
        //    {
        //        "name": "黃耀明",
        //        "ref_contributor_id": 3,
        //        "year": '2014-02-20',
        //        "total_amount": 6,
        //        "raw_total_amount": 360
        //    }
        //]
        return $http.get('/cpcontribute/day_summary_by_contributor');
    };

    //取得行事曆清單
    hrdal.get_calendar_list = function () {
        return $http.get('google/get_calendar_list');
    };

    //取得行事曆清單
    hrdal.get_event_list = function (calendarId, lastDays, year, month, day) {
        return $http.get('google/get_event_list?calendar_id=' + encodeURI(calendarId)
            + '&last_days=' + lastDays
            + '&year=' + year
            + '&month=' + month
            + '&day=' + day);
    };

    //取得行事曆清單
    hrdal.import_CPContribute = function (data) {
        return $http.post('cpcontribute/import', data);
    };

    return hrdal;
});
