(function(){
    //检查BODY元素是否已经加载了
    var checker = setInterval(init, 300);
    
    function init(){
        var body = document.getElementsByTagName("body")[0];
        if (!body) 
            return;
        else 
            clearInterval(checker);
        
        //增加卓马命名空间
        window.zhoma_wyt = {};
		var userAgent = navigator.userAgent.toLowerCase();
		// Figure out what browser is being used
		zhoma_wyt.browser = {
			version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1],
			safari: /webkit/.test( userAgent ),
			opera: /opera/.test( userAgent ),
			msie: /msie/.test( userAgent ) && !/opera/.test( userAgent ),
			mozilla: /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent )
		};
				
        var option, _script = document.getElementById("zhoma_wyt"), ie6 = zhoma_wyt.ie6 = /MSIE (5\.5|6)/ig.test(navigator.appVersion);
        
        //从SCRIPT标签中获得OPTION
        try {
            eval('option=' + _script.getAttribute("option"));
        } 
        catch (e) {
            option = {
                title: '点开即聊天'
            }
        }
        var theme = zhoma_wyt.theme = option.theme || "default", 
		normal = "url(css/" + theme + "/images/normal.gif)", 
		click = "url(css/" + theme + "/images/loading.gif)", 
		hover = "url(css/" + theme + "/images/hover.gif)";
        
        zhoma_wyt.winH = winH();
        var sw = zhoma_wyt.winW = winW();
        var s = option.style = applyIf(option.style, {
            position: "fixed",
            "zIndex": 2147483647,
            top: 50,
            left: sw - 75,
            border: 'none',
            padding: '0',
            margin: '0',
            display: 'block',
            cursor: "pointer",
            width: "50px",
            height: "50px",
            "backgroundColor": "transparent",
            "backgroundPosition": "top left",
            "backgroundImage": normal,
            "backgroundRepeat": "no-repeat",
            overflow: "hidden",
			
			behavior: "none",
			blockDirection : "ltr",
			bottom: "auto",
			right : "auto",
			clear : "none",
			filter: "none",
			styleFloat : "none",
			zoom : 1
        });
		//处理container		
		if ( option.container ){
			var c = option.container
			//计算相对位移
			if (typeof c.x == "number") {
				switch (c.position) {
					case 1:
						//居左
						s.left = c.x;
						break;
					case 3:
						//居右
						s.left = sw - c.x;
						break;
					case 2:
					default:
						//居中
						s.left = c.x + sw/2;
						break;
				}
			}
			//设置top
			if ( typeof c.y == "number" )
				s.top = c.y;			
		}
		//增加单位
		s.top += "px";
		s.left += "px";		
		
        //存入全局变量中
        zhoma_wyt.option = option;
		
        var head = document.getElementsByTagName("head")[0] || document.documentElement, div = document.createElement("samp"), id = zhoma_wyt.id = "zhoma_wyt_" + (new Date().getMonth()); //IE下 ELEMENT.STYLE为只读
        for (var m in option.style) {
            div.style[m] = option.style[m];
        }
		
		//生成HTML
        div.setAttribute("id", id);
        div.className = id;
		body.insertBefore( div, body.firstChild );
        
		//不支持fixed属性
		if (ie6 || (div.currentStyle && div.currentStyle["position"] == "static")) {
			div.style.position = option.style = "absolute";		
		}
		
		//处理鼠标事件	
        var clicked = loading = over = false;
        div.onclick = function(){
            if (!clicked) {
                clicked = loading = true;
                div.style["backgroundImage"] = click;

                css("css/" + theme + (ie6 ? "/tableIE.css" : "/table.css"));
                script("inc/zhoma_wyt_init.js");
            }
        }
        div.onmousemove = function(){
            if (!loading && !over) 
                div.style["backgroundImage"] = hover;
            
            over = true;
        }
        div.onmouseout = function(){
            if (!loading && over) 
                div.style["backgroundImage"] = normal;
            
            over = false;
        }
        zhoma_wyt.recover = function(){
            loading = false;
            div.style["backgroundImage"] = normal;
        }
        
        //加载script文件
        function script(url){
            var add = document.createElement("script");
            add.setAttribute("type", "text/javascript");
            add.setAttribute("src", url);
            add.setAttribute("charset", "utf-8");
            head.appendChild(add);
        }
        
        //加载CSS文件
        function css(url){
            var add = document.createElement("link");
            add.setAttribute("type", "text/css");
            add.setAttribute("rel", "stylesheet");
            add.setAttribute("media", "screen");
            add.setAttribute("href", url);
            head.appendChild(add);
        }
		
		div.onclick();
    }
    
    function applyIf(obj, add){
        obj = obj || {};
        
        for (var m in add) {
            if (!obj.hasOwnProperty(m)) 
                obj[m] = add[m];
        }
        return obj;
    }
    
    function winH(){
        var de = document.documentElement; //用在IE6/7的严格模式
        return self.innerHeight || (de && de.clientHeight) || document.body.clientHeight;
    }
    
    function winW(){
        var de = document.documentElement; //用在IE6/7的严格模式
        return self.innerWidth || (de && de.clientWidth) || document.body.clientWidth;
    }
})();
