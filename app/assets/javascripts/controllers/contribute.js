/**
 * Created by Aaron on 2014/11/18.
 */

hr.
filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
})
.directive('contribute', function(hrDal) {
    return {
        restrict : 'E',
        //replace : true,
        //transclude : true,
        scope : {
           //contribute : '=drag', T^T
           contribute : '=ngModel',
           hideEstimate : '=hideEstimate',
           hideDescription : '=hideDescription',
           hideAction : '=hideAction',
           deleteCallback : '=deleteCallback',
        },
        templateUrl : '/ngpages/contribute.html',
        link : function(scope, element, attrs) {
            if ( scope.contribute.saveDirectly === true )
            {
                hrDal.saveContribute(scope.contribute).then(function(res) {
                    scope.contribute.id = res.data.id;
                    scope.onEdit = false ; 
                });
            }
            scope.editing = function(event) {
                if (event.keyCode == 27) scope.onEdit = false;
                if (event.keyCode !== 13) return;
                hrDal.saveContribute(scope.contribute).then(function(res) {
                    scope.contribute.id = res.data.id;
                    scope.onEdit = false ; 
                });
            };
            scope.onEdit = scope.contribute.onEdit ;
            //scope.contribute.delete = 
            scope.delete = function(event) {
                if (!confirm('sure?'))
                    return;
                if (!scope.contribute.id)
                    scope.deleteCallback(scope.contribute);
                hrDal.deleteContribute(scope.contribute.id).then(function(){
                    if ( scope.deleteCallback )
                        scope.deleteCallback(scope.contribute); 
                });
            };
        }
    }
})
.controller('contributes', function($scope, $filter, $tooltip, hrDal, hrGlobal, hrConstant) {
    $scope.titles = {};
    $scope.days = {} ;
    $scope.data = {};
    $scope.hideAction = true;
    hrGlobal.then(function(data){
        $scope.global = data ;
        $scope.contributors = $scope.global.getContributor();
    });
    $scope.setCurrentCtor = function(ctor) {
        $scope.currentCtor = ctor;
        hrDal.getUserContributes($scope.currentCtor.id,
                //$scope.global.before_now(2),
                $scope.global.before_now(10),
                $scope.global.before_now(-3)
            ).success(
        function(data){
            var ProjectMap = $scope.global.getProjectMap();
            var tmp_data = {}, tmp_titles ={}, tmp_days ={};
            data = [].concat(data);

            var offset , title_key ;
            var today = moment(moment().format('L'));
            for (var i = 0; i < data.length; i++) {
                offset = moment.duration(moment(data[i].date)-today).days();
                title_key = data[i].ref_project_id+'#'+data[i].title;
                tmp_days[offset] = tmp_days[offset] || {
                    date : data[i].date,
                    offset : offset,
                    day_of_week : moment(data[i].date).format('ddd'),
                };
                tmp_titles[title_key] = tmp_titles[title_key] || {
                    ref_project : ProjectMap[data[i].ref_project_id] ,
                    ref_project_id: data[i].ref_project_id,
                    title: data[i].title,
                    title_key:title_key,
                };
                if (!tmp_data[title_key+'@'+offset]) {
                    tmp_data[title_key+'@'+offset] = [] ;
                }
                //#TODO really?
                //data[i].ref_title = tmp_titles[title_key];
                tmp_data[title_key+'@'+offset].push(data[i]);
            };
            $scope.titles =tmp_titles;
            for (i of [-3,-2,-1,0,1,2,3]) {
                tmp_days[i] = {
                    date : moment().add(i, 'days').format(),
                    offset : i,
                    day_of_week : moment().add(i, 'days').format('ddd'),
                };
            }
            $scope.days = tmp_days ;
            $scope.data = tmp_data ;
        });
    };
    $scope.createContribute = function(title,day,value) {
        var entity = {
            amount: 0,
            description: '',
            estimate: 0,
            date: day.date,
            ref_project_id: title.ref_project_id,
            title: title.title,
            onEdit:true,
        };
        if ( value ) {
            entity.amount = value.amount || entity.amount;
            entity.description = value.description || entity.description;
            entity.estimate = value.estimate || entity.estimate;
            //if is true will save directly
            entity.saveDirectly = true;
        }
        if (!$scope.data[title.title_key+'@'+day.offset]) {
            $scope.data[title.title_key+'@'+day.offset] = [] ;
        }
        $scope.data[title.title_key+'@'+day.offset].push(entity);
        // hrDal.saveContribute(entity)
        //     .then(function(res) {
        //         $scope.data[title.title_key+'@'+offset].push(res.data);
        //     });
    };
    $scope.contributeDeleteCallback = function(entity) {
        if(entity)
        {
            var today = moment(moment().format('L'));
            offset = moment.duration(moment(entity.date)-today).days();
            title_key = entity.ref_project_id+'#'+entity.title;
            var data = $scope.data[title_key+'@'+offset];
            for (var i = 0; i < data.length; i++) {
                if ( data[i].id === entity.id ) {
                    data.splice(i, 1);
                }
            };
        }
    };
    $scope.onDrop = function(event,data,title,day) {
        title_key = data.ref_project_id+'#'+data.title;
        if ( data.date == day.date && title_key == title.title_key )
            return;
        $scope.createContribute(title,day,{
            amount : data.amount,
            description : data.description,
            estimate : data.estimate,
        });
        if ( !event.ctrlKey ) {
            //data.delete();
            hrDal.deleteContribute(data.id).then(function(){
                $scope.contributeDeleteCallback(data); 
            });
        }      
    };
    /*$scope.titles = {
        //ref_project_id#title
        '1#1know安裝版': {
        //1 : {
            ref_project : {},
            ref_project_id: '',
            title: '',
        }
    };
    $scope.days = { 
        '-2' : {
            date : '2014/12/1',
            offset : '-2',
        },
        // '2014/12/1' : {
        //     //same as -2
        // }
    }
    $scope.data = {
        //title_key@day
        '1#1know安裝版1@-2' : [{
                    ...
                }
            ]
        },
        ...
    }*/
});
