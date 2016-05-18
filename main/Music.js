Music = (function() {
	var S = createjs.Sound;
	var Music = {};
	
	var musics = [
		"ocean",
		"new-ocean",
		"cavern",
		"preboss",
		"boss",
		"ending",
	];
	
	Music.volume = 0.5;
	
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
		currentMusic.volume = Music.volume;
	}
	
	Music.paused = function(paused) {
		if (currentMusic) {
			currentMusic.paused = paused;
		}
	}
	
	Music.stop = function() {
		if (!currentMusic) {
			return;
		}
		
		currentMusic.stop();
		currentMusic.destroy();
		currentMusic = undefined;
		Music.current = undefined;
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
				Music.current = undefined;
				
				return;
			}
			
			currentMusic.volume -= Music.volume/16;
			
			window.setTimeout(fade, time/16);
		}
	}
	
	return Music;
})();