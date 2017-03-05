!function($){
	
	var k = 'rocketScroll';
	
	function getOrSetInstance( element ){
		var instance = element.data(k);
		
		//todo: handle multiple instances
		if(instance === 'undefined'){
			
			var instance = new RocketScroll( element.get(0),arguments );
			
			//convenience methods for teh noobz
			//these should be implemented in respective plugins/modules to take advantage of 
			instance.scrollTo = function( position,duration, cb ){
				$(instance.container).animate({ scrollTop: position||instance.content.clientHeight }, duration||0, cb || function(){});
			};
			
			element.data(k,  instance);
			
		}
		
		return instance;
	}
	
	$.fn.rocketScroll = function(){
		
		var instances = [];
		
		this.each(function(index){
			
			instances[index] = getOrSetInstance(this);
			
		});
		
		if(!instances.length){
			return this;// spec? not sure
		}
		
		return instances.length > 1 ? instances : instances[0];
		
	};
}(jQuery);
