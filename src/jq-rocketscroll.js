!function($){
	var k = '__rs.instance';
	$.fn.rocketScroll = function(){
		
		//todo: handle multiple instances
		if(typeof this.data(k) === 'undefined'){
			
			var instance = new RocketScroll( this.get(0),arguments );
			
			//convenience methods for teh noobz
			instance.scrollTo = function( position,duration, cb ){
				$(instance.container).animate({ scrollTop: position||instance.content.clientHeight }, duration||500, cb || function(){});
			};
			
			this.data(k,  instance);
			
		}else{
			if(arguments.length){
				var instance = this.data(k);
				if(arguments[0] == 'getInstance'){
					return instance;//just let the user call functions on the instance if they need to. keep it simple.
				}
			}
		}
		return this;
		
	};
}(jQuery);
