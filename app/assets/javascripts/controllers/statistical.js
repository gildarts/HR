hr.controller('statistical', function ($scope, $filter, hrDal, hrGlobal) {

    $scope.g = hrGlobal;
    $scope.data = [];

    var g = $scope.g;

    $scope.contributors_all = true;
    $scope.contirbutor_filter = [];
    $scope.projects_all = true;
    $scope.project_filter = [];

    var init_watchs = function () {
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

        $scope.$watch('contirbutor_filter + project_filter', function () {
            var filter = $filter('filter');

            var ctorFiltered = [];
            angular.forEach($scope.contirbutor_filter, function (val) {
                var filtered = filter($scope.data, {ref_contributor_id: val.id});
                ctorFiltered = ctorFiltered.concat(filtered);
            });

            var prjFiltered = [];
            angular.forEach($scope.project_filter, function (val) {
                var filtered = filter(ctorFiltered, {ref_project_id: val.id});
                prjFiltered = prjFiltered.concat(filtered);
            });

            console.log(prjFiltered);

            init(prjFiltered);

        }, true);
    };

    $scope.g.success(function () {
        hrDal.listCPContributePower().success(function (data) {
            $scope.data = data;
            init_watchs();
            init(data);
        }).error(function (data) {
            alert(angular.toJson(data, true));
        });
    });

    var init = function (data) {
        g.fillRefProject(data);
        g.fillRefContributor(data);

        var projectMap = g.getProjectMap(); //專案 id->project 對照表。
        var contributorMap = g.getContributorMap(); //人員 id->contributor 對照表。

        var masterSerials = { //第一層資料來源。
            name: '投入量',
            colorByPoint: true,
            data: []
        };
        var detailSerials = [];

        var projectCost = {}; //每個專案的投入量。
        var projectContributorCost = {}; //專案的每人投入量。

        angular.forEach(data, function (val, key) { //計算每個專案的總量。
            if (val.project && val.contributor) { //表示沒有指定專案，或是找不到該專案的資訊。

                if (!projectCost[val.project.id])
                    projectCost[val.project.id] = 0;

                projectCost[val.project.id] += val.amount * val.contributor.unit_cost;

                if (!projectContributorCost[val.project.name]) {
                    projectContributorCost[val.project.name] = {
                        id: val.project.name,
                        name: val.project.name,
                        dataMap: {},
                        data: []
                    }
                }

                if (!projectContributorCost[val.project.name].dataMap[val.contributor.name]) {
                    projectContributorCost[val.project.name].dataMap[val.contributor.name] = 0;
                }

                projectContributorCost[val.project.name].dataMap[val.contributor.name] += val.amount;
            }
        });

        var projectData = masterSerials.data;
        angular.forEach(projectCost, function (val, key) {
            var prjName = projectMap[key].name;

            projectData.push({
                drilldown: prjName,
                name: prjName,
                y: val
            });
        });

        angular.forEach(projectContributorCost, function (val, key) {
            angular.forEach(val.dataMap, function (v, key) {
                val.data.push([key, v]);
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
            // subtitle: {
            //     text: '選擇專案，檢視詳細人員投入資訊'
            // },
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
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.0f}</b><br/>'
            },
            series: [masterSerials],
            drilldown: {
                series: detailSerials
            }
        });
    }
});