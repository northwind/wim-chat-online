/**
 * @author Norris
 */
(function(){
//	try { document.domain = "a.com";} catch (e) {}

	window.Request = {
	    QueryString: function(item){
	        var svalue = self.location.search.match(new RegExp("[\?\&]" + item + "=([^\&]*)(\&?)", "i"));
	        return svalue ? svalue[1] : svalue;
	    }
	}

	var head = document.getElementsByTagName("head")[0], theme;
	try {
		theme = window.theme = Request.QueryString("theme") || 
				(self.opener && self.opener.theme ) || 
				(window.parent && window.parent.theme );
	} catch (e) {}

	if ( !(typeof theme == "string" && theme.length > 0 && theme != "undefined" ) )
		theme = "default";
			
	//得到script标签中direct属性，并按，切分
	var script =$("head script[src$='wim_gettheme.js']"), 
		url = script.attr("url") || "css/",
		arr = script.attr("direct").split(",");
	
	//循环调用CSS函数
	for (var i=0; i<arr.length; i++) {
		css( url + theme + "/" + arr[i] )
	}

    //加载CSS文件
    function css(url){
		head.appendChild( $("<link>").attr({
			type :  "text/css",
			"rel" : "stylesheet",
			"href" : url
		})[0] );
    }	
})();
