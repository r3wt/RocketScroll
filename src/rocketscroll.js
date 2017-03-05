/**
 * @package RocketScroll
 * @author Garrett Morris <gmorris_89@outlook.com>
 * @license MIT
 * @version 1.0.0
 *
 * THIS PROJECT is a fork of RocketScroll by Stanko https://github.com/Stanko/rocketScroll/
 */

;!function(window,document){
	
//vars

var originalOnselectstart = false;

var __id = 0;//when autogen ids, we use a simple counter.

// the default plugin options
var defaults = {
	wrapContents: true
};

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

function query(s) {
	var r = document.querySelectorAll(s);
	return r.length === 1 ? r[0] : r;
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
		return;
	}
	
	if(!(options instanceof Object)){
		options = {};
	}
	
	this.options = extend(defaults,options);

	// Check if argument is element or selector
	if(element instanceof HTMLElement){
		this.el = element;
	}else{
		this.el = query(element);
	}

	// If selector return node list we will abort
	// It makes sense to handle multiple instances at higher levels only.
	// If we handle it here, it is incompatible with jQuery. not good.
	if(this.el instanceof NodeList){
		console.warn('RocketScroll expected HTMLElement but Got NodeList instead. You may instantiate on one element at a time only.');
		return null;
	}

	// Adds ID to the element if there is none
	if(!this.el.id){
		this.el.id = 'rs-' + (__id++);
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

var RocketScrollPrototype = {
	
	init: function(){
		this.container = query('#' + this.el.id + ' .rs-container');
		this.content = query('#' + this.el.id + ' .rs-content');
		this.scrollbar = query('#' + this.el.id + ' .rs-scrollbar');
		this.handle = query('#' + this.el.id + ' .rs-handle');
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
		var observer = new MutationObserver(function(){
			_self.refresh();
		});
		observer.observe(_self.content,{
			childList: true,
			subtree: true,
			attributes: true,
			characterData: false,
		});
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
	
RocketScroll.prototype = RocketScrollPrototype;

window.RocketScroll = RocketScroll;

}(window,document);