!function(angular){
	angular
	.module('ng-rocketscroll',[])
	.directive('ngRocketscroll',function($timeout){
		return {
			restrict: 'A',
			link:function(scope,element,attrs){
				scope.rocketscrollInstance = new RocketScroll( 
					angular.element(element)[0], 
					angular.extend({}, scope.rocketscrollOptions || {} , { wrapContents: false }) 
				);
			},
			scope: {
				rocketscrollOptions:'=',//directive doubles as an options object
				rocketscrollInstance:'=',//allow user to define a scope property they can use to retrieve plugin instance.
			},
			transclude: true,
			template: '<div class="rs-container"><div class="rs-content" ng-transclude></div></div><div class="rs-scrollbar"><div class="rs-handle"></div>'
		}
	});	
}(angular);
