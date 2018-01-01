/**
 * @package RocketScroll
 * @author Garrett Morris <gmorris_89@outlook.com>
 * @license MIT
 * @version 1.0.0
 *
 * THIS PROJECT is a fork of RocketScroll by Stanko https://github.com/Stanko/rocketScroll/
 */

;!function(window,document){
	
// this is the core package. it provides only the scrollbar component.
// no scrollto or destroy methods. 
// the reasoning is to allow people to build plugins specific to their framework's facilities ( jQuery/angular.js/react, etal )
	
//vars

var originalOnselectstart = false;
var __id = 0;//when autogen ids, we use a simple counter.
var defaults = {
	wrapContents: true,
	alwaysShow: false,
} ;// the default plugin options

//functions
function getScrollTop(){
	if(typeof pageYOffset !== 'undefined'){
		// Most browsers
		return pageYOffset;
	}
	else{
		var b = document.body, //IE 'quirks'
			d = document.documentElement; //IE with doctype
		d = (d.clientHeight) ? d : b;
		return d.scrollTop;
	}
}

// Gets Y offset of event, relative to source element
// Calculating X is commented, as this plugin is not using it
function getOffset(e) {
	var el = e.target ? e.target : e.srcElement, // IE Check
		//x = 0,
		y = 0;

	while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
		//x += el.offsetLeft - el.scrollLeft;
		y += el.offsetTop - el.scrollTop;
		el = el.offsetParent;
	}

	//x = e.clientX + getScrollLeft() - x;
	y = e.clientY + getScrollTop() - y;

	//return { x: x, y: y };
	return y;
}

function enableSelection(enable) {
	if(enable) {
		window.document.onselectstart = originalOnselectstart;
	}
	else {
		originalOnselectstart = window.document.onselectstart;
		window.document.onselectstart = function() {
			return false;
		};
	}
}

function query(needle, haystack) {
	var result = (haystack||document).querySelectorAll(needle);
	return result.length === 1 ? r[0] : r;
}

function detectIE(){
	return document.all ? true : false;
}


function extend(a,b){
	c = {};
	for(var d in a){
		c[d] = a[d];
		if(b.hasOwnProperty(d)){
			c[d] = b[d];
		}
	}
	return c;
}

//class
function RocketScroll(element,options){
	// Don't enable it on touch screens
	if('ontouchstart' in document.documentElement){
        console.log('not binding on touch device.');
		return;
	}
	
	this.options = extend(defaults,options||{});
    
    this.el = element;

	// Check if argument is element or selector
	if(!(this.el instanceof HTMLElement)){
		console.warn('invalid argument for element.');
        return;
	}

	this.el.classList.add('rs');

	this.mouseDown = false;

	var html = this.el.innerHTML;
	var template = '<div class="rs-container"><div class="rs-content">{{html}}</div></div><div class="rs-scrollbar rs-unselectable"><div class="rs-handle rs-unselectable"></div>';
	
	if(this.options.wrapContents){
		
		this.el.innerHTML = template.replace('{{html}}',this.el.innerHTML);
		
	}
	
	this.init();
	
};

RocketScroll.prototype = {
	
	init: function(){
		this.container = query('.rs-container',this.el);
		this.content = query('.rs-content',this.el);
		this.scrollbar = query('.rs-scrollbar');
		this.handle = query('.rs-handle',this.el);
		this.bind();
		this.refresh();
	},
	
	bind: function(){
		
		var _self = this;

		// Move handle on mouse scroll
		this.container.onscroll = function(){
			_self.handle.style.marginTop = _self.ratio * _self.container.scrollTop + 'px';
		};

		// Just stop propagating click to scrollbar
		this.handle.onclick = function(e){
			e.stopPropagation();
		};

		// Detect when mouse is pressed
		this.handle.onmousedown = function(e){
			e.stopPropagation();
			_self.content.classList.add('rs-unselectable');
			enableSelection(false);
			_self.clientY = e.clientY;
			_self.scrollTop = _self.container.scrollTop;
			_self.mouseDown = true;

		};
		this.el.onmouseup = function(){
			_self.setMouseUpAndEnableSelection(_self);
		};

		this.el.onmouseleave = function(){
			_self.setMouseUpAndEnableSelection(_self);
		};

		// Handles mouse move, only when mouse is pressed
		this.el.onmousemove = function(e){
			// User is not holding mouse button
			if(!_self.mouseDown){
				return;
			}

			_self.container.scrollTop = ((e.clientY - _self.clientY) / _self.ratio) + _self.scrollTop;
		};

		// Handles click on the scrollbar
		this.scrollbar.onclick = function(e){

			e.stopPropagation(e);

			// Moves center of the handle to the cursor
			var layerY = getOffset(e) - _self.handle.clientHeight / 2;

			_self.container.scrollTop = layerY / _self.totalHandle * _self.totalScrollable;
		};

		// Dirty fix for chrome/webkit browsers where you can scroll left by selecting text
		this.el.onscroll = function(e){
			e.preventDefault();
			_self.el.scrollLeft = 0;
		};
		
		var _self = this;
		this.observer = new MutationObserver(function(){
			_self.refresh();
		});
		this.observer.observe(this.content,{
			childList: true,
			subtree: true,
			attributes: true,
			characterData: false,
		});
	},
	
	destroy: function(){
		
		var _self = this;
		
		_self.observer.disconnect();
		var clone = _self.el.cloneNode();
		while (_self.el.firstChild) {
		  clone.appendChild(_self.el.lastChild);
		}
		_self.el.parentNode.replaceChild(clone, _self.el);
		_self.el = clone;
		_self.el.innerHTML = _self.content.innerHTML;
		//now delete it all.
		for(var prop in _self){
			delete _self[prop];
		}
		
	},

	setMouseUpAndEnableSelection: function(instance){
		instance.content.classList.remove('rs-unselectable');
		instance.mouseDown = false;

		// Small delay on enabling text selecting again
		clearTimeout(instance.SELECTION_TIMEOUT);
		instance.SELECTION_TIMEOUT = setTimeout(function(){
			enableSelection(true);
		}, 500);
	},

	refresh: function(){

		// If content is smaller than the container
		if(this.container.clientHeight > this.content.clientHeight){
			this.scrollbar.style.display = 'none';
		}else{
			this.scrollbar.style.display = 'block';
		}

		// Dynamic scroll handle height, as the content is smaller
		// handle gets bigger, as there is less to scroll
		this.handle.style.height = (this.container.clientHeight * (this.container.clientHeight / this.content.clientHeight)) + 'px';

		// Refreshing scroll bar position and ratio
		// Should be called on content change
		this.totalScrollable = this.content.clientHeight - this.container.clientHeight;
		this.totalHandle = this.scrollbar.clientHeight - this.handle.clientHeight;
		this.ratio = this.totalHandle / this.totalScrollable;
		this.handle.style.marginTop = this.ratio * this.container.scrollTop + 'px';
	}
	
};

window.RocketScroll = RocketScroll;

}(window,document);