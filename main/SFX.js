SFX = (function() {
	var S = createjs.Sound;
	var SFX = {};
	
	SFX.volume = 1;
	
	var sounds = [
		"dash",
	];
	
	SFX.init = function() {
		sounds.forEach(function(sound) {
			S.registerSound("assets/sfx/" + sound + ".ogg", "S_" + sound);
		});
	}
	
	var playing = {};
	
	SFX.play = function(name) {
		if (playing[name]) {
			playing[name].stop();
			playing[name].play();
		} else {
			playing[name] = S.play("S_" + name, {interrupt: createjs.Sound.INTERRUPT_ANY, loop: 0});
		}
		playing[name].volume = SFX.volume;
	}
	
	SFX.stop = function(name) {
		if (playing[name]) {
			playing[name].stop();
		}
	}
	
	return SFX;
})();