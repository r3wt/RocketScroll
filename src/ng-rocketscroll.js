angular
.module('ng-rocketscroll',[])
.directive('ngRocketScroll',function($timeout){
	return {
		restrict: 'A',
		link: function(scope,element,attrs){
			var instance = new RocketScroll(angular.element(element)[0],{ wrapContents: false });// dont wrap element in template. well do it manually
			var timeout = null;
			scope.$watch(function(){
				
				return element.find('.rs-content')[0].offsetHeight;
				
			},
			function(){
				if(timeout != null){
					$timeout.cancel(timeout);
					timeout = null;
				}
				$timeout(function(){
					instance.refresh();
				},100);
			});
		},
		transclude: true,
		template: '<div class="rs-container"><div class="rs-content" ng-transclude></div></div><div class="rs-scrollbar"><div class="rs-handle"></div>'
	}
});