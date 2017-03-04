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

	// If selector return node list apply scroll to each node
	if(this.el instanceof NodeList){
		this.elements = [];
		for(var i = 0; i < this.el.length; i++){
			this.elements.push( new RocketScroll(this.el.item(i) , true) );
		}
		this.multiple = true;
		return;
	}
	
	this.multiple = false;

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
	
	//main els we worry about.
	this.container = query('#' + this.el.id + ' .rs-container');
	this.content = query('#' + this.el.id + ' .rs-content');
	this.scrollbar = query('#' + this.el.id + ' .rs-scrollbar');
	this.handle = query('#' + this.el.id + ' .rs-handle');
	
	this.refresh();
	this.bindEvents();
	this.SELECTION_TIMEOUT = false;
	
};

var RocketScrollPrototype = {
	
	bindEvents : function(){
		
		var self = this;

		// Move handle on mouse scroll
		this.container.onscroll = function(){
			self.handle.style.marginTop = self.ratio * this.scrollTop + 'px';
		};

		// Just stop propagating click to scrollbar
		this.handle.onclick = function(e){
			e.stopPropagation();
		};

		// Detect when mouse is pressed
		this.handle.onmousedown = function(e){

			e.stopPropagation();
			self.content.classList.add('rs-unselectable');
			enableSelection(false);
			self.clientY = e.clientY;
			self.scrollTop = self.container.scrollTop;
			self.mouseDown = true;

		};
		this.el.onmouseup = function(){
			self.setMouseUpAndEnableSelection(self);
		};

		this.el.onmouseleave = function(){
			self.setMouseUpAndEnableSelection(self);
		};

		// Handles mouse move, only when mouse is pressed
		this.el.onmousemove = function(e){
			// User is not holding mouse button
			if(!self.mouseDown){
				return;
			}

			self.container.scrollTop = ((e.clientY - self.clientY) / self.ratio) + self.scrollTop;
		};

		// Handles click on the scrollbar
		this.scrollbar.onclick = function(e){

			e.stopPropagation(e);

			// Moves center of the handle to the cursor
			var layerY = getOffset(e) - self.handle.clientHeight / 2;

			self.container.scrollTop = layerY / self.totalHandle * self.totalScrollable;
		};

		// Dirty fix for chrome/webkit browsers where you can scroll left by selecting text
		this.el.onscroll = function(e){
			e.preventDefault();
			self.el.scrollLeft = 0;
		};
		
		var _self = this;
		var observer = new MutationObserver(function(){
			self.refresh();
		});
		observer.observe(this.el,{
			childList: true,
			subtree: true,
			attributes: false,
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
	
	setWidth: function(){
		this.container.style.width = this.el.clientWidth + 50 + 'px';
		this.content.style.width = this.el.clientWidth + 'px';
	},

	refresh: function(){

		var i;

		// Refresh multiple elements
		if(this.multiple){
			for(i in this.elements){
				this.elements[i].refresh();
			}
			return;
		}

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
		this.setWidth();
		this.refreshImages();
	},

	refreshImages: function() {
		var images, self, i;

		// Refresh after every image load
		images = query('#' + this.el.id + ' .rs-content img');

		if(images.length > 0){
			self = this;
			for(i = 0; i < images.length; i++){
				images.item(i).onload = function(){
					self.refresh();
					// removing onload event
					this.onload = null;
				};
			}
		}
	}
	
};
	
RocketScroll.prototype = RocketScrollPrototype;

window.RocketScroll = RocketScroll;

}(window,document);