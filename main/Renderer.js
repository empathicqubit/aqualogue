Renderer = (function() {
	var Renderer = {};
	
	var renderer;
	
	Renderer.init = function(next) {
		renderer = PIXI.autoDetectRenderer(500, 280, {
			antialias: false,
			transparent: false,
			resolution: 1
		});
		
		document.body.appendChild(renderer.view);
		
		PIXI.loader.add("assets/sprites.json").load(next);
	}
	
	Renderer.sprite = function(name) {
		return new PIXI.Sprite(PIXI.utils.TextureCache[name]);
	}
	
	Renderer.animation = function(sprites) {
		var anim = PIXI.extras.MovieClip.fromFrames(sprites);
		anim.play();
		anim.speed = function(speed) {
			anim.animationSpeed = speed/60;
			return anim;
		}
		return anim;
	}
	
	Renderer.show = function(stage) {
		renderer.render(stage);
	}
	
	Renderer.skip = function() {
	}
	
	Renderer.frameskip = 1;
	
	return Renderer;
})();