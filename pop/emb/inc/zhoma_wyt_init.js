( function(){
//简易的jquery
var $ = function( selector, context ) {
	if ( !selector )
		return;
	
	if ( selector.tQuery )
		return selector;
				
	return new $.fn( selector, context );
}, 
	defaultView = document.defaultView || {},
	quickExpr = /(^[<])(\S*)([>])|(^#|(^[.]))(\S+)/;  //正确的表达式

$.fn = function( selector, context ){
	this.init( selector, context );
}
$.fn.prototype = {
	tQuery : 0.00001,
	
	init : function(selector, context){
		this.context = context  = context || document;
		if ( selector.nodeType ) {
			this.dom = selector;
			return this;
		}
		
		if (typeof selector === "string") {
			var match = quickExpr.exec( selector );
			if ( match ){
				if ( match[1] && match[3] ){ //<div>
					this.dom = document.createElement( match[2] || "div" );
				}else if( match[5] ){ //.class  先判断
				
					var elems = context.getElementsByTagName("*"),
					    reg = new RegExp("\\b"+match[6]+"\\b");	
				    for ( var elem, i = 0; ( elem = elems[i] ); i++ ){
						if (reg.test(elem.className || elem.getAttribute("class"))) {
							this.dom = elem;
							break;
						}
				    }					
				}else if( match[4])	{ //#id
					this.dom = document.getElementById( match[6] );
					
				}
			}else{ // div tag
				this.dom = context.getElementsByTagName( selector )[0];
			}
		}
		
		return this;
	},
	
	find	: function( selector ){
		return $( selector, this.dom );
	},
	
	css  : function(key, value){	
		return this.attr( key, value, "style");
	},
	
	attr  : function( key, value, type ){
		if (typeof key == "object") {
			for( var m in key ){
				this.attr( m, key[m], type )
			}
		}
		else 
			if (value === undefined) {
				return type == "style" ? curCSS(this.dom, key) : this.dom[key] ;
			}else{
				if ( /^\d+$/.test( value ) && !/^(zIndex|opacity|cellspacing)$/i.test( key ) ){
					value += "px";
				}
				
				type ? this.dom[ type ][key] = value : this.dom[key] = value;
			}
		
		return this;
	},
	
	className    : function( value ){
		return this.attr( "className", value )
	},
	addClass	: function( cls ){
		this.dom.className += " " + cls;
		return this;
	},
	removeClass	: function( cls ){
		(this.dom.className || "").replace( cls, "" );
		return this;
	},	
	
	appendTo : function( parent ){
		$( parent ).append( this.dom );
		return this;
	},
	
	append : function( child ){
		this.dom.appendChild( $(child).dom );
		return this;
	},
	
	html   : function( str ){
		if( str ){
			this.dom.innerHTML = str;
				
			return this;
		}else
			return this.dom.innerHTML;
	},
	
	hide : function(){
		this.css("display","none")
	},
	
	show : function(){
		this.css("display","block")
	},
	
	remove : function(){
		if (this.dom.parentNode) {
			try {
				this.dom.parentNode.removeChild(this.dom);
			} 
			catch (e) {
			}
		}
	},
	
	//直接覆盖ONCLICK事件
	click : function( fn, scope ){
		this.dom.onclick = function( e ){
			e = fixE( e );
			if ( fn.call( scope, e ) === false ){
				stopEvent( e )
			}
		};
		return this;
	}	
}
	
var Drag = {
	init : function( handler, aimDom ){
		var params = ["handler", "aimDom", "minY", "maxY", "minX", "maxX" ];
		//复制属性
		for (var i=0; i<arguments.length; i++) {
			this[ params[i] ] = arguments[ i ]
		}
		
		handler.onmousedown	= Drag.start;
	},
	
	drag : function( e ){
		e = fixE(e);

		var ey	= e.clientY,
			ex	= e.clientX,
			nl  = Drag.oldL - ( Drag.oldMouseX - ex ),
			nt  = Drag.oldT - ( Drag.oldMouseY - ey );

		if ( typeof Drag.minY == "number" )
			nt = Math.max( Drag.minY, nt );
		if ( typeof Drag.maxY == "number" && nt + Drag.oldH > Drag.maxY )
			nt = Drag.maxY - Drag.oldH;
			
		if ( typeof Drag.minX == "number" )
			nl = Math.max( Drag.minX, nl );
		if ( typeof Drag.maxX == "number" && nl+Drag.oldW > Drag.maxX )
			nl = Drag.maxX - Drag.oldW;						

		Drag.aimDom.style.left = nl + "px";
		Drag.aimDom.style.top = nt + "px";

		stopEvent( e );
		return false;	
	},	
	
	start: function( e ){
		e = fixE(e);

		//获取resizeDom的高度并存储
		Drag.oldL = curCSS( Drag.aimDom, "left");
		Drag.oldT = curCSS( Drag.aimDom, "top");
		Drag.oldW = Math.max( parseInt( curCSS( Drag.aimDom, "width" ) ) || 0, Drag.aimDom.offsetWidth );
		Drag.oldH = Math.max( parseInt( curCSS( Drag.aimDom, "height" ) ) || 0, Drag.aimDom.offsetHeight );
		
		Drag.oldMouseX	= e.clientX;
		Drag.oldMouseY	= e.clientY;
		
		addEvent( document, "mousemove", Drag.drag );
		addEvent( Drag.handler, "mousemove", Drag.drag );
		addEvent( document, "mouseup", Drag.end );
//		if ( zhoma_wyt.ie6 )
		addEvent( document, "mouseout", Drag.end );

		stopEvent( e );	
		return false;		
	},
	
	end: function( e ){
		e = fixE(e);
		
		//IE6必须强制刷新
//		var style = Drag.aimDom.style;
//		if (zhoma_wyt.browser.msie) {
//			style.zoom != 1 ? style.zoom = 1 : style.zoom= 0;
//		}
		
		removeEvent( document, "mousemove", Drag.drag );
		removeEvent( Drag.handler, "mousemove", Drag.drag );
		removeEvent( document, "mouseup", Drag.end );	
		removeEvent( document, "mouseout", Drag.end );		
		
		stopEvent( e );
		return false;
	}	
};

var Resize = {
	init : function( handler, resizeDom ){
		var params = ["handler", "resizeDom", "minY", "maxY", "minX", "maxX" ];
		//复制属性
		for (var i=0; i<arguments.length; i++) {
			this[ params[i] ] = arguments[ i ]
		}
		
		handler.onmousedown	= Resize.start;
	},
	
	drag : function( e ){
		e = fixE(e);

		var ey	= e.clientY;
		var ex	= e.clientX;
		var ny = Resize.oldH - ( Resize.oldMouseY - ey );

		if ( typeof Resize.minY == "number" )
			ny = Math.max( Resize.minY, ny );
		if ( typeof Resize.maxY == "number" )
			ny = Math.min( Resize.maxY, ny );			

		Resize.resizeDom.style["height"] = ny + "px";
		
		Resize.lastMouseX	= ex;
		Resize.lastMouseY	= ey;

		stopEvent( e );
		return false;	
	},	
	
	start: function( e ){
		e = fixE(e);

		//获取resizeDom的高度并存储
		Resize.oldH = parseInt( curCSS( Resize.resizeDom, "height") );

		Resize.oldMouseX	= e.clientX;
		Resize.oldMouseY	= e.clientY;
		
		addEvent( document, "mousemove", Resize.drag );
		addEvent( document, "mouseup", Resize.end );
		addEvent( document, "mouseout", Resize.end );
//		addEvent( Resize.resizeDom, "mouseup", Resize.end );

		stopEvent( e );	
		return false;		
	},
	
	end: function( e ){
		e = fixE(e);
		
		//IE6必须强制刷新
		var style = Resize.resizeDom.style;
		if (zhoma_wyt.browser.msie) {
			style.zoom != 1 ? style.zoom = 1 : style.zoom= 0;
		}
		
		removeEvent( document, "mousemove", Resize.drag );
		removeEvent( document, "mouseup", Resize.end );	
		removeEvent( document, "mouseout", Resize.end );		
//		removeEvent( Resize.resizeDom, "mouseup", Resize.end );
		
		stopEvent( e );
		return false;
	}	
};

function scrollX(){
	var de = document.documentElement;
	return self.pageXOffset || ( de && de.scrollLeft ) || document.body.scrollLeft;
}
function scrollY(){
	var de = document.documentElement;
	return self.pageYOffset || ( de && de.scrollTop ) || document.body.scrollTop;
}

var TitleMgr = {
	oldTitle : document.title,
	interval : 1000,
	
	change	 : function(){
		
	},
	
	set		: function( msg, blank ){
		this.msg = msg;
		this.blank = blank;
		return this;
	},
	
	start   : function(){
		if ( !this.timer ){
			var _self = this, odd = false ;
			function changeTitle(){
				if (_self.timer) { //stop后,_self.timer为false,不能更改标题
					if (odd) {
						odd = false;
						
						document.title = _self.blank + _self.oldTitle;
					}
					else {
						odd = true;
						
						document.title = _self.msg + _self.oldTitle;
					}
				}
			}
			this.timer = setInterval( changeTitle, this.interval );
		}
	},
	
	stop	: function(){
		if ( this.timer )
			clearInterval( this.timer );
		
		this.timer = null;
		document.title = this.oldTitle;
	}
}

function addEvent( element, type, handler ){
	zhoma_wyt.browser.msie ?
		element.attachEvent( "on" + type, handler ) :
		element.addEventListener( type, handler, false);
}

function removeEvent( element, type, handler){
	zhoma_wyt.browser.msie ?
		element.detachEvent( "on" + type, handler ) :
		element.removeEventListener( type, handler, false);	
}

function stopEvent( e )
{
	if (e) {
		e.returnValue = false;
		if (e.preventDefault) 
			e.preventDefault();
		
		e.cancelBubble = true;
		if (e.stopPropagation) 
			e.stopPropagation();
	}
}
function fixE(e)
{
	if (typeof e == 'undefined') e = window.event;
	if (typeof e.layerX == 'undefined') e.layerX = e.offsetX;
	if (typeof e.layerY == 'undefined') e.layerY = e.offsetY;
	return e;
}
function curCSS( dom, name ){
	var ret;
	if ( dom.currentStyle )
		ret = dom.currentStyle[ name ];
	else if ( defaultView.getComputedStyle ){
		var computedStyle = defaultView.getComputedStyle( dom, null );
		if ( computedStyle )
			ret = computedStyle.getPropertyValue( name );			
	}
	return /^\d+px$/i.test( ret ) ? parseInt( ret ) : ret;
}
	
function container( Options ){
	this.init( Options )
}
container.prototype = {
	rx : 0,
	ry : 0,
	draggable : true,
	resizeable: true,
	theme : 'default',
	prefix : 'z-w-',
	title : "Chat any where",
	top : 40,
	left : 800,
	width : 200,
	minY : 400,
	height: 400,
	url : '../puzzle.html',
	titleUrl : '../post.html?m=getCrossDomainMsg',
	first : true,
	interval : 1000 * 30, //每隔半分钟检查是否有新消息
	
	init	: function( options ){
		for (var m in options) {
			this[m] = options[ m ]
		}

		//必须满足最小高度
		this.height = Math.max( this.minY, this.height );
		//生成一个小于8个字节的随机整数,传递给加载页面
		this.randKey = Math.round( Math.random() * Math.pow( 10, 8 ) );	
		this.titleUrl += "&p=" + this.randKey;

		this.ct = $( $("<div>").html(['<table cellSpacing="0" class="z-w-wrap">',
			'<tr class="z-w-header">',
                '<td class="z-w-left z-w-nw"><samp class="z-w-icon"></samp></td>',
                '<td class="z-w-mid z-w-n">',
                    '<samp class="z-w-bar"><kbd href="javascript:void(0)" title="Fix Panel" class="z-w-fix"></kbd>',
                        '<kbd href="javascript:void(0)" title="Hide Panel" class="z-w-mini"></kbd></samp>',
                    '<strike class="z-w-title"></strike></td>',
                '<td class="z-w-right z-w-ne"></td></tr>',
            '<tr class="z-w-body"><td class="z-w-w"></td>',
                '<td class="z-w-c"><iframe allowTransparency="true" scrolling="no" border="0" frameBorder="0"></iframe></td>',
                '<td class="z-w-e"></td></tr>',
            '<tr class="z-w-footer"><td class="z-w-sw"></td><td class="z-w-s"></td><td class="z-w-se"></td></tr></table>']
			.join('') ).dom.firstChild )
			.css({ left: this.left, top: this.top }).appendTo( "body" );
		
		this.iconEl = this.ct.find(".z-w-icon");
		this.head = this.ct.find(".z-w-title").html( this.title );
		this.header = this.ct.find(".z-w-header");
		this.footer = this.ct.find(".z-w-footer");
		this.leftTd = this.ct.find(".z-w-w");
		this.rightTd = this.ct.find(".z-w-e");		
		this.content = this.ct.find(".z-w-c"); 
		this.iframe = this.content.find("iframe").attr("src", this.url + "?randKey=" + this.randKey + "&theme=" + this.theme );
		this.fixIcon = this.ct.find(".z-w-fix").click( this.toggleFix, this );
		this.miniIcon = this.ct.find(".z-w-mini").click( this.collapse, this );
		this.initIcon();

		this.initStamp();
		
		this.expand();
		this.initPlugin();
	},
	
	initPlugin  : function(){
		this.initDrag();
		this.initResize();		
		this.initEvents();							
	},
	
	initEvents	: function(){
		var _self = this;
		//当window失去焦点时 开启轮训
		//当鼠标滑过window时,立即停止轮训
		function trackOver(){
			_self.loadable = false;
			_self.stopTimer();
			
			removeEvent( document, "mouseover", trackOver );
		}

		addEvent( document, "mouseout", function(){
			_self.loadable = true;
			_self.createTimer();
			
			addEvent( document, "mouseover", trackOver );
		} );
	},
	
	createTimer : function(){
		if (!this.timer) {
			var _self = this;
			this.timer = setInterval(function(){
				if (_self.loadable) 
					_self.loadScript();
			}, this.interval);
		}
	},
	
	stopTimer  : function(){
		if ( this.timer )
			clearInterval( this.timer );
		
		this.timer = null;
		TitleMgr.stop();	
	},
	
	loadScript : function(){
		if (this.titleLoader) {
			this.titleLoader.remove();
			this.titleLoader = null;
		}
		
		var loader = this.titleLoader = $("<script>").attr({
			"type" : "text/javascript",
			"defer": "true",
			"src"  : this.titleUrl + "&_=" + (+new Date()),
			"charset" : "utf-8"
		}).appendTo( "head" );
		
		var script = this.titleLoader.dom, _self = this;
		// Attach handlers for all browsers
		script.onload = script.onreadystatechange = function(){
			if ( (!this.readyState ||
					this.readyState == "loaded" || this.readyState == "complete") ) {
				var config;
				try {
					eval("config = window.__" + _self.randKey );
				} catch (e) {}
				
				if ( config && config.msg && config.blank ){
					_self.loadable = false;
					TitleMgr.set(config.msg, config.blank).start();
				}else{
					_self.loadable = true
				}
				// Handle memory leak in IE
				script.onload = script.onreadystatechange = null;
				loader.remove();
				//置空
				eval("config = window.__" + _self.randKey +"=null;" );
			}
		};				
	},
	
	//更改主题
	setTheme  : function( type ){
		this.theme = type
	},
	
	expand : function(){
		if (!this.expanded) {
			this.hideMsg();
			
			this.expanded = true;
			this.checkFix(); //检查是否显示FIX ICON
			
			this.ct.css({
				top : (this.t == undefined ? this.top : this.t) + scrollY() - this.ry,
				left: (this.l == undefined ? this.left : this.l) + scrollX() - this.rx
			});
			
			//在IE6下保证长宽正常	
			var style = this.ct.dom.style;
			if (zhoma_wyt.browser.msie) {
				style.zoom != 1 ? style.zoom = 1 : style.zoom= 0;
			}
			
			this.hideStamp();
			this.iconEl.show();
			
			this.content.css({
				width: this.width
			});			
			//取消IE6动画显示  IFRAME大小的变化会导致内部页面元素重新绘制
			if (!zhoma_wyt.ie6){
				//动画显示
				var content = this.content, t = 0,oh = this.height, c = oh - 26, d = 40, b = 26;
				content.css( "height", b );
				
				function easeOutBounce(t, b, c, d){
					if ((t /= d) < (1 / 2.75)) {
						return c * (7.5625 * t * t) + b;
					}
					else 
						if (t < (2 / 2.75)) {
							return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
						}
						else 
							if (t < (2.5 / 2.75)) {
								return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
							}
							else {
								return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
							}
				}
				
				var timer = setInterval(function(){
					t++;
					if (t < d) {
						content.css("height", Math.ceil(easeOutBounce(t, b, c, d)) );
					}
					else {
						content.css("height", oh);
						clearInterval(timer);
					}
				}, 13);
			}else{
				this.content.css( "height", this.height );			
			}
		}	
	},
	
	save	  : function(){
		this.h = this.ct.css("height") || this.ct.attr("clientHeight");
        this.w = parseInt( this.ct.css("width") ) || this.ct.attr("clientWidth");
        this.t = this.ct.css("top");
        this.l = this.ct.css("left");
		
		this.rx = scrollX();
		this.ry = scrollY();
		
		this.height =this.content.css("height");
		this.orgPosition = this.ct.css("position");
	},
		
	collapse : function( e ){
		stopEvent( fixE(e) );
		if (this.expanded) {
			this.expanded = false;

			this.save();

			//回调函数
			function callback(){
				this.showStamp();
				this.showMsg();
			}
			//取消IE6动画显示
			if ( zhoma_wyt.ie6 ){
				callback.call(this);
				return false;
			}
			//动画显示
			var _ = this, content=this.content, ct = this.ct, b=this.l,
				t=0, d=20, c = scrollX() + this.sl - b - this.w + 30, 
				 ow = this.width, oh=this.height, ot=this.t, tc= scrollY() + this.st - ot;

			function Quad( t,b,c,d ){
				return c*(t/=d)*t + b;
			}
			
			var timer = setInterval( function(){
				t++;
				if (t < d) {
					content.css("height", Math.ceil( oh - Quad(t, 0, oh, d ) ) );
					ct.css({
						left : Math.ceil( Quad(t, b, c, d ) ),
						top : Math.ceil( Quad(t, ot, tc, d ) )
					});

				}
				else {
					clearInterval(timer);
					callback.call(_);
				}
			}, 13);
		}
		return false;
	},
	
	showMsg : function(){
		if ( !this.showed ) {
			this.showed = true;

			this.header.hide();
			this.footer.hide();
			this.leftTd.hide();
			this.rightTd.hide();
		
			this.ct.css({ //更改IFRAME在IE下不刷新
				position: curCSS( this.stamp.dom, "position" ),
				left: this.sl + 5, 
				top : this.st + this.stamp.css("height")				
			});
			
			this.content.css({
				width: 60,
				height: 20
			}).addClass("z-w-trans");
		}
	},
	
	hideMsg	: function(){
		if ( this.showed ) {
			this.showed = false;

			this.header.css("display", "");
			this.footer.css("display", "");
			this.leftTd.css("display", "");
			this.rightTd.css("display", "");

			this.ct.css({
				position: this.orgPosition || "absolute"
			}).removeClass("z-w-trans");
		}
	},
	
	toggle : function(){
		this.expanded ? this.expand() : this.collapse();
	},	
	
	setTitle : function( title ){
		this.head.html( this.title || title );
	},
	
	hideStamp : function(){
		if (this.stamp) {
			this.sl = this.stamp.css("left") || this.stamp.attr("offsetLeft");
			this.st = this.stamp.css("top");
			
			this.stamp.hide();
		}
	},

	showStamp : function(top,left){
		if (this.stamp) {
			this.stamp.show();
			zhoma_wyt.recover();
		}
	},
	
	initStamp : function(){
		this.stamp = $("#" + this.stamp ).click( this.expand, this );
	},

	initIcon: function(){
		if ( this.icon )
			this.iconEl.css("backgroundImage",  "url(" + this.icon + ")" );
	},
	
	checkFix  : function(){
		var body = document.getElementsByTagName("body")[0],
			scrollable = (body.scrollHeight + 24 > zhoma_wyt.winH ) ||
						 (body.scrollWidth + 15 > zhoma_wyt.winW ); //粗略的判断是否出现滚动条,没有找到更好的方法
		( !zhoma_wyt.ie6 && scrollable ) ? this.fixIcon.css("display",'inline-block') 
				   : this.fixIcon.hide();
	},
	
	toggleFix : function( e ){
		stopEvent( fixE(e) );
		if ( this.fixed ){
			this.fixed = false;
			this.fixIcon.className("z-w-fix");
			this.ct.css("position", "absolute");
		}else{
			this.fixed = true;
			this.fixIcon.className("z-w-unfix");
			this.ct.css("position", "fixed");
		}
		return false;
	},
	
	initResize : function(){
		if ( this.resizeable && Resize ) {
			Resize.init( this.ct.find(".z-w-footer").dom, this.content.dom, 
				this.minY, Math.max(document.body.scrollWidth, zhoma_wyt.winW), 
				200, Math.max(document.body.scrollHeight, zhoma_wyt.winH) 
			);
		}
	},	
	initDrag : function(){
		if ( this.draggable && Drag ) {
			Drag.init( this.ct.find(".z-w-n").dom, this.ct.dom, 
				0, Math.max(document.body.scrollHeight, zhoma_wyt.winH),
				0, Math.max(document.body.scrollWidth, zhoma_wyt.winW)
			);
		}
	}				
}

	var id = zhoma_wyt.id; 

	window.ZM_WYT_Container = (function(){
		var o = zhoma_wyt.option.container || {};
		o.stamp = zhoma_wyt.id;
		o.theme	= zhoma_wyt.theme;

		var g = new container( o );
		//回复图标显示项
		zhoma_wyt.recover(); 
		return {
			expand : function(){
				g.expand()
			},
			
			collapse : function(){
				g.collapse()
			},
			
			toggle : function(){
				g.toggle()
			},
			
			theme  : g.theme
		}
	})();

})();
