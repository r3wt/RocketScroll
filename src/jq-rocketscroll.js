!function($){
	var k = 'rs.instance';
	$.fn.rocketScroll = function(){
		var args = Array.prototype.slice.call(arguments);
		if(typeof this.data(k) != 'undefined'){
			this.data(k, new RocketScroll(this.get(0),args[0] ) );
		}else{
			if(args.length){
				var instance = this.data(k);
				if(args[0] == 'getInstance'){
					return instance;//just let the user call functions on the instance if they need to. keep it simple.
				}
			}
		}
		return this;
	};
}(jQuery);
