/*
	Base.js, version 1.1
	Copyright 2006-2007, Dean Edwards
	License: http://www.opensource.org/licenses/mit-license.php
*/

(function(){
	//定义全局变量
var hs, s, el, fixed,
	cookie, cookieChecker,
	ie6 = navigator.userAgent.indexOf("MSIE 6") >= 0;

var secret = "";

//预先定义已有API
var buddyList, userList, buddyAccept,statusChanged,userSearch,buddyRequest,buddyReject,buddyRemove,
	addable, needRequest, buddyAddDirectly;
//存为内部变量
for( var m in _zi.config){
	eval( "var " + m + " = _zi.config['" + m + "'];");
}
var cookie = _zi.cookie;
var cookieChecker = _zi.cookieChecker;
delete _zi;

var me = {
	getName: function(){
		return nick || login;
	}
};
			
var _Base = function() {
	// dummy
};

_Base.extend = function(_instance, _static) { // subclass
	var extend = _Base.prototype.extend;
	
	// build the prototype
	_Base._prototyping = true;
	var proto = new this;
	extend.call(proto, _instance);
	delete _Base._prototyping;
	
	// create the wrapper for the constructor function
	//var constructor = proto.constructor.valueOf(); //-dean
	var constructor = proto.constructor;
	var klass = proto.constructor = function() {
		if (!_Base._prototyping) {
			if (this._constructing || this.constructor == klass) { // instantiation
				this._constructing = true;
				constructor.apply(this, arguments);
				delete this._constructing;
			} else if (arguments[0] != null) { // casting
				return (arguments[0].extend || extend).call(arguments[0], proto);
			}
		}
	};
	
	// build the class interface
	klass.ancestor = this;
	klass.extend = this.extend;
	klass.prototype = proto;
	klass.valueOf = function(type) {
		//return (type == "object") ? klass : constructor; //-dean
		return (type == "object") ? klass : constructor.valueOf();
	};
	extend.call(klass, _static);

	return klass;
};

_Base.prototype = {	
	extend: function(source, value) {
		if (arguments.length > 1) { // extending with a name/value pair
			var ancestor = this[source];
			if (ancestor && (typeof value == "function") && // overriding a method?
				// the valueOf() comparison is to avoid circular references
				(!ancestor.valueOf || ancestor.valueOf() != value.valueOf()) &&
				/\bbase\b/.test(value)) {
				// get the underlying method
				var method = value.valueOf();
				// override
				value = function() {
					var previous = this.base || _Base.prototype.base;
					this.base = ancestor;
					var returnValue = method.apply(this, arguments);
					this.base = previous;
					return returnValue;
				};
				// point to the underlying method
				value.valueOf = function(type) {
					return (type == "object") ? value : method;
				};
			}
			this[source] = value;
		} else if (source) { // extending with an object literal
			var extend = _Base.prototype.extend;

			var proto = {toSource: null};
			// do the "toString" and other methods manually
			var hidden = ["constructor", "toString", "valueOf"];
			// if we are prototyping then include the constructor
			var i = _Base._prototyping ? 0 : 1;
			while (key = hidden[i++]) {
				if (source[key] != proto[key]) {
					extend.call(this, key, source[key]);

				}
			}
			// copy each of the source object's properties to this object
			for (var key in source) {
				if (!proto[key]) extend.call(this, key, source[key]);
			}
		}
		return this;
	},

	base: function() {
		// call this method from any other method to invoke that method's ancestor
	}
};

// initialise
_Base = _Base.extend({
	constructor: function() {
		this.extend(arguments[0]);
	}
}, {
	ancestor: Object
});

