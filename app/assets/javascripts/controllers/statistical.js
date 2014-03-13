hr.controller('statistical', function($scope, hrDal, hrGlobal) {

    $scope.g = hrGlobal;

    var g = $scope.g;

    $scope.g.success(function() {
        hrDal.listCPContributePower().success(function(data) {
            init(data);
        }).error(function(data) {
            alert(angular.toJson(data, true));
        });
    });

    var init = function(data) {
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

        angular.forEach(data, function(val, key) { //計算每個專案的總量。
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

                if(!projectContributorCost[val.project.name].dataMap[val.contributor.name]){
                    projectContributorCost[val.project.name].dataMap[val.contributor.name] = 0;
                }

                projectContributorCost[val.project.name].dataMap[val.contributor.name] += val.amount;
            }
        });

        var projectData = masterSerials.data;
        angular.forEach(projectCost, function(val, key) {
            var prjName = projectMap[key].name;

            projectData.push({
                drilldown: prjName,
                name: prjName,
                y: val
            });
        });

        angular.forEach(projectContributorCost, function(val, key){
            angular.forEach(val.dataMap, function(v, key){
                val.data.push([key, v]);
            });

            detailSerials.push(val);
        });

        g.log(detailSerials);

        // Create the chart
        $('#charts').highcharts({
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
