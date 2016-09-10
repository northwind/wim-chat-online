//获得宿主页面传递过来的随机数,并保存到window.name里
var randKey = Request.QueryString("randKey");

randKey = randKey || window.name || (+new Date()+"z");
window.name = randKey;

Ext.onReady(function(){

	//设置登录按钮
	$("#btnLogin").click(function(){
		var b = $( this ).addClass("active");
		setTimeout( function(){
			b.removeClass("active")
		},300);
		
//		WIM.WinMgr.add( WIM.loginWindowUrl, "Login", undefined, {
//			fn : function( name, psw, succ, error ){
//				WIM.loginMethod( name, psw, function(){
//					setTimeout(initUser, 0);
//					if (succ) succ();
//					this.close();
//					self.focus();
//				}, error, this);
//			}
//		} );
	});

	$("#btnReg").click(function(){
		var b = $( this ).addClass("active");
		setTimeout( function(){
			b.removeClass("active")
		},300);
				
//		WIM.WinMgr.add( WIM.regWindowUrl, "regWindow", {
//			width : 600, height : 450
//		}, {
//			fn : function( user ){
//				WIM.NewUser( user );
//				this.close();
//				self.focus();
//				setTimeout(initUser, 0);
//			}
//		} );
	});
	
	var lg = $("#lg"), ch = 0;
	
	WIM.Init();
	
	WIM.loginMethod("login2","123", function(){
		setTimeout(initUser, 0);
	});
	function initUser(){

		WIM.Bubble = Bubble;
				
		lg.fadeTo(1000, 0.66).children().remove();
		var wait = $("<div/>").addClass("waiting").prependTo( lg );
		new self.WIM.Builder({
			renderTo : $("#WIM_BODY")[0],
			resizeTo : $("body"),
			callback : function(){
				lg.fadeOut( 500, function(){
					$( this ).remove();
				});
			}
		}).load();
				
		//加载onbeforeunload事件
		window.onbeforeunload = function(){
			if (WIM._me) {
				if (!WIM.Quit) {
					if ( g.msgTool.remains() > 0 ) 
						return g.TextMsg;
					else 
						if (WIM.Bubble.isOpen()) {
							WIM.Paint( g.TextList );
							WIM.Bubble.prepareData();
						}
				}
			}
		}
	}
	
	//当窗口缩小时，并有新消息时生成DIV并修改背景图片进行提示
	var msgEl, showed = false;
	function showMsg(){
		if (!showed) {
			showed = true;			
			msgEl = $("<div/>").prependTo("body").addClass("newmsg");
		}
	}
	function hideMsg(){
		showed = false;
		if ( msgEl )
			msgEl.remove();
	}
	
	$( window ).resize( function(){
		var w = window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth;
		if ( w >= 50 && w <= 80 ){
			$("body").children().hide();
			window.miniature = true;
			if ( g && g.msgTool && !g.isWin )
				g.msgTool.handler = showMsg;
		}else if ( w >= 150 ){
			window.miniature = false;
			hideMsg();
			$("#lg").show();
			$("#WIM_BODY").show();
			$("#fix-ie-resize").show();
			
			if ( g && g.msgTool && !g.isWin )
				g.msgTool.handler = null;
		}
	} );
	
	if ( lg )
		lg.css("zoom", 1 );
});
