/* (c) 2009, TaleStudio, Valera Chevtaev, http://chupakabr.ru */
/* © 2012, Avatar Blueray*/


var  vk_player_ext = {
	
	keyMap: {
			"play": "vk_player_ext_style-play",
			"prev": "vk_player_ext_style-prev",
			"next": "vk_player_ext_style-next",
			"add": "vk_player_ext_style-add",
			"pause": "vk_player_ext_style-pause",
			"repeat": "vk_player_ext_style-repeat",
			"shuffle": "vk_player_ext_style-shuffle",
			"return": "vk_player_ext_style-return"
	},
	
	init:function(extensions){
		var extension = extensions.get("vk_player_ext_panel@hvoynov.net");
		if (extension.firstRun)
			vk_player_ext.installButton();
	},
	
	onclick:function(event){
		var patt=/vk\.com|vkontakte\.ru/g;
		var doc = event.view.document;
		if (doc.location.href.match(patt)){
			vk_player_ext.setActiveTab();
		};
	},
	
	injectJS: function(eventString, doc){
	    var controlId = "vkControlPanelForFirefox";
	    var control = doc.getElementById(controlId);
    	var codeString = eventString;
	    if(!control){
	        control = doc.createElement("div");
	        control.setAttribute("id", controlId);
	        //doc.getElementById('head_play_btn').click();
	        doc.body.appendChild(control);
	        control.setAttribute("onclick", "javascript:if(audioPlayer){"+codeString+"}else{document.getElementById('head_play_btn').click()}");
		    control.click();
	    }else if(eventString == "toggle"){
	    	doc.getElementById('head_play_btn').click();
	    }else{
	        control.setAttribute("onclick", "javascript:if(audioPlayer){"+codeString+"}");
		    control.click();
	    }
	},
	
	checkPlayButton: function(doc){
		var rtr = false;
		var controlId = "head_play_btn";
		var control = doc.getElementById(controlId);
		if(control && control.getAttribute('class') && control.getAttribute('class').match(/playing/)){
			rtr = true;
		}
		return rtr;
	},
	
	activeTab: null,
	setActiveTab: function(){
		var patt=/vk\.com|vkontakte\.ru/g;
		var tabbrowser = gBrowser;
		var current = gBrowser.selectedTab;
		var pauseGefunden = false;
		var doc = window.content.document;
		if(doc.location.href.match(patt) && !vk_player_ext.vk_player_ext){
			if(vk_player_ext.checkPlayButton(doc)){
				vk_player_ext.activeTab = current;
			}
		}else if(!vk_player_ext.activeTab){
			var numTabs = tabbrowser.browsers.length;
			var firstTab = null;
			for (var index = 0; index < numTabs; index++) {
				var currentBrowser = tabbrowser.getBrowserAtIndex(index);
				var s = currentBrowser.currentURI.spec;
				if(s.match(patt)){
					tabbrowser.selectedTab = tabbrowser.tabContainer.childNodes[index];
					doc = window.content.document;
					if(!firstTab){
						firstTab = tabbrowser.selectedTab;
					}
					if(vk_player_ext.checkPlayButton(doc)){
						vk_player_ext.activeTab = tabbrowser.selectedTab;
						break;
					}
				};
			};
			if(!vk_player_ext.activeTab && firstTab){
				vk_player_ext.activeTab = firstTab;
			}
		};
		
		var timeout = setTimeout(initPlayButton, 300);
		function initPlayButton(){
			tabbrowser.selectedTab = vk_player_ext.activeTab;
			doc = window.content.document;
			var playId = vk_player_ext.keyMap["play"];
			var pauseId = vk_player_ext.keyMap["pause"];
			var button = document.getElementById(playId);
			if ( button == null ) {
				button = document.getElementById(pauseId);
			};
			var playHead = doc.getElementById("head_play_btn");
			if(vk_player_ext.checkPlayButton(doc) && button){
				button.setAttribute ("id", pauseId);
			}else if(button){
				button.setAttribute ("id", playId);
			}
			tabbrowser.selectedTab = current;
		}
		tabbrowser.selectedTab = current;
	},
	
	dispatch: function(eventString){
		if(!vk_player_ext.activeTab){
			vk_player_ext.setActiveTab();
		}
		var tabbrowser = gBrowser;
		var current = gBrowser.selectedTab;
		tabbrowser.selectedTab = vk_player_ext.activeTab;
		var doc = window.content.document;
		vk_player_ext.injectJS(eventString, doc);
		tabbrowser.selectedTab = current;
		vk_player_ext.setActiveTab();
	},
	
	prev: function () {
		vk_player_ext.dispatch("audioPlayer.prevTrack()");
	},
	
	next: function(){
		vk_player_ext.dispatch("audioPlayer.nextTrack()");
	},
	
	add: function(){
		vk_player_ext.dispatch("audioPlayer.addCurrentTrack()");
	},
	
	stop: function(){
		vk_player_ext.dispatch("audioPlayer.stop()");
	},
	
	play: function(){
		vk_player_ext.dispatch("audioPlayer.playTrack()");
	},
	
	repeat: function(){
		vk_player_ext.dispatch("audioPlayer.toggleRepeat()");
	},
	
	shuffle: function(){
		vk_player_ext.dispatch("audioPlayer.shuffleAudios()");
	},
	
	"return": function() {
		vk_player_ext.dispatch("audioPlayer.prevTrack();audioPlayer.nextTrack()");
	},
	
	toggle: function() {
		vk_player_ext.dispatch("toggle");
	},
	
	test:function(){
		var toolbarId = "nav-bar";
		var toolbar = document.getElementById(toolbarId);
		var child = toolbar.firstChild;
		while (child) {
			alert(child.id);
			child = child.nextSibling;
		}
	},
		
	installButton:function (){ //DEPRECATED
		var toolbarId = "nav-bar";
		var toolbar = document.getElementById(toolbarId);
		var before = toolbar.lastChild;
        var elem = document.getElementById('search-container');
        if (elem && elem.parentNode == toolbar)
            before = elem.previousElementSibling;
	
		//add the button at the end of the navigation toolbar	
		//toolbar.insertItem("vk_player_panel-prev", toolbar.lastChild);
		var keyMap = vk_player_ext.keyMap;
		for(suffix in keyMap){
			toolbar.insertItem(keyMap[suffix], before);
		}

		toolbar.setAttribute("currentset", toolbar.currentSet);
		document.persist(toolbar.id, "currentset");
	
		//if the navigation toolbar is hidden, 
		//show it, so the user can see your button
		toolbar.collapsed = false;
	},

	/** Invoke option dialog */
	keyset: function(evt) {
		window.openDialog("chrome://vk_player_ext_panel/content/options.xul", "keyconfig-options-dialog", "centerscreen,chrome,modal,resizable");
		keyconfig.getPreferences();
	}
		
}


