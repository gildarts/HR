hr.controller('statistical', function ($scope, $filter, hrDal, hrGlobal) {

    $scope.g = hrGlobal;
    $scope.data = [];

    var g = $scope.g;

    $scope.contributors_all = false;
    $scope.contirbutor_filter = []; //畫面上顯示的項目。
    $scope.projects_all = true;
    $scope.project_filter = []; //畫面上顯示的項目。

    var init_watchs = function () {
        $scope.$watch('contirbutor_filter + project_filter', function () {
            var filter = $filter('filter');

            var ctorFiltered = [];
            angular.forEach($scope.contirbutor_filter, function (val) {
                var filtered = filter($scope.data, {ref_contributor_id: val.id}, true);
                ctorFiltered = ctorFiltered.concat(filtered);
            });

            var prjFiltered = [];
            angular.forEach($scope.project_filter, function (val) {
                var filtered = filter(ctorFiltered, {ref_project_id: val.id}, true);
                prjFiltered = prjFiltered.concat(filtered);
            });

            //console.log(prjFiltered);

            init(prjFiltered);

        }, true);

        $scope.$watch('contributors_all', function (newVal) {
            if (newVal) {
                angular.copy(g.contributors, $scope.contirbutor_filter);
            } else {
                $scope.contirbutor_filter.splice(0, $scope.contirbutor_filter.length);
            }
        });

        $scope.$watch('projects_all', function (newVal) {
            if (newVal) {
                angular.copy(g.projects, $scope.project_filter);
            } else {
                $scope.project_filter.splice(0, $scope.project_filter.length);
            }
        });
    };

    $scope.g.success(function () {
        init_watchs();

        hrDal.listCPContributePower().success(function (data) {
            $scope.data = data;
            $scope.contirbutor_filter.push(g.user);

        }).error(function (data) {
            alert(angular.toJson(data, true));
        });
    });

    var getFullName = function (prj) {
        return "(" + prj.projectCategory.name + ")" + prj.name;
    };

    var init = function (data) {
        g.fillRefProject(data);
        g.fillRefContributor(data);

        var projectMap = g.getProjectMap(); //專案 id->project 對照表。
        //var contributorMap = g.getContributorMap(); //人員 id->contributor 對照表。

        var masterSerials = { //第一層資料來源。
            name: '投入量',
            colorByPoint: true,
            data: []
        };
        var detailSerials = [];

        var projectCost = {}; //每個專案的投入量。
        var projectContributorCost = {}; //專案的每人投入量。

        //data 裡面存放的是每一個 contribute。
        angular.forEach(data, function (val, key) { //計算每個專案的總量。
            if (val.project && val.contributor) { //表示沒有指定專案，或是找不到該專案的資訊。

                if (!projectCost[val.project.id])
                    projectCost[val.project.id] = 0;

                projectCost[val.project.id] += val.amount * val.contributor.unit_cost;

                //console.log(getFullName(val.project));

                //When item doesn't exist add them.
                if (!projectContributorCost[val.project.id]) {
                    projectContributorCost[val.project.id] = {
                        id: val.project.id,
                        name: val.project.name,
                        dataMap: {},
                        data: []
                    }
                }

                if (!projectContributorCost[val.project.id].dataMap[val.contributor.name]) {
                    projectContributorCost[val.project.id].dataMap[val.contributor.name] = 0;
                }

                projectContributorCost[val.project.id].dataMap[val.contributor.name] += val.amount;
            }
        });

        var projectData = masterSerials.data;
        angular.forEach(projectCost, function (val, key) {
            var prjName = projectMap[key].name;
            var prjId = projectMap[key].id;

            projectData.push({
                drilldown: prjId,
                name: "<a href='#/root'>" + prjName + "</a>",
                y: val
            });
        });

        angular.forEach(projectContributorCost, function (val, key) {
            angular.forEach(val.dataMap, function (v, k) {
                val.data.push([k, v]);
            });

            detailSerials.push(val);
        });

        //g.log(detailSerials);

        // Create the chart
        $('#charts').highcharts({
            credits: {enabled: false},
            chart: {
                type: 'column'
            },
            title: {
                text: ''
            },
//            subtitle: {
//                 text: '選擇專案，檢視詳細人員投入資訊'
//            },
            xAxis: {
                type: 'category'
            },
            yAxis: {
                title: {
                    text: '時數'
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.0f}</b><br/>',
                useHTML: true
            },
            series: [masterSerials],
            drilldown: {
                series: detailSerials
            },
            events: {
                drilldown: function (e) {
                    console.log(Angular.toJson(e));
                }
            }
        });
    }
});