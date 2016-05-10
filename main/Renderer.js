Renderer = (function() {
	var Renderer = {};
	
	var renderer;
	
	Renderer.init = function(next) {
		renderer = PIXI.autoDetectRenderer(500, 280, {
			antialias: false,
			transparent: false,
			resolution: 1
		});
		
		PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
		
		document.body.appendChild(renderer.view);
		
		PIXI.loader.add([
			"assets/sprites.json",
			
			"assets/tiles/water.png",
			"assets/tiles/waterback.png",
			
			"assets/tiles/bg-mountains.png",
			
			"assets/type.fnt"
		]).load(next);
	}
	
	Renderer.sprite = function(name) {
		var sprite = new PIXI.Sprite(PIXI.utils.TextureCache[name]);
		sprite.anchor.set(0.5, 0.5);
		return sprite;
	}
	
	Renderer.animation = function(sprites) {
		var anim = PIXI.extras.MovieClip.fromFrames(sprites);
		anim.anchor.set(0.5, 0.5);
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