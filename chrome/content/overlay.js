if (Application.extensions)
    vk_player_ext.init(Application.extensions);
else
    Application.getExtensions(vk_player_ext.init);

	window.addEventListener("click", function(e){vk_player_ext.onclick(e);}, false);