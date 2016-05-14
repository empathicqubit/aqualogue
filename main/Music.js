Music = (function() {
	var S = createjs.Sound;
	var Music = {};
	
	var musics = [
		"ocean",
		"boss",
	];
	
	Music.init = function() {
		musics.forEach(function(m) {
			S.registerSound("assets/music/" + m + ".ogg", "M_" + m);
		});
	}
	
	var currentMusic;
	
	Music.play = function(name, noloop) {
		if (currentMusic) {
			currentMusic.stop();
			currentMusic.destroy();
		}
		
		Music.current = name;
		currentMusic = S.play("M_" + name, {interrupt: createjs.Sound.INTERRUPT_ANY, loop: noloop ? 0 : -1});
	}
	
	Music.fadeout = function(time) {
		if (!currentMusic) {
			return;
		}
		
		var m = currentMusic;
		
		fade();
	
		function fade() {
			if (m != currentMusic) {
				return;
			}
			
			if (currentMusic.volume <= 0) {
				currentMusic.stop();
				currentMusic.destroy();
				currentMusic = undefined;
				
				return;
			}
			
			currentMusic.volume -= 1/16;
			
			window.setTimeout(fade, time/16);
		}
	}
	
	return Music;
})();