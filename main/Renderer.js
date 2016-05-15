Renderer = (function() {
	var Renderer = {};
	
	var renderer;
	
	Renderer.init = function(next) {
		renderer = PIXI.autoDetectRenderer(500, 280, {
			antialias: false,
			transparent: false,
			resolution: 1
		});
		
		document.addEventListener("unload", function() {
			renderer.destroy(true);
		});
		
		PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
		
		document.body.appendChild(renderer.view);
		
		PIXI.loader.add([
			"assets/sprites.json",
			
			"assets/tiles/water.png",
			"assets/tiles/waterback.png",
			
			"assets/tiles/bg-mountains.png",
			"assets/tiles/bg-save.png",
			"assets/tiles/bg-cavern.png",
			
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
	
	Renderer.text = function(txt, x, y) {
		var txt = new PIXI.extras.BitmapText(txt, {font: 'TYPE_FONT'});
		txt.position.set(x, y);
		return txt;
	}
	
	Renderer.typewriterText = function(text, x, y) {
		var txt = Renderer.text("", x, y);
		
		var spot = 0;
		type();
		
		return txt;
		
		function type() {
			spot++;
			
			txt.text = text.substring(0, spot);
			
			if (spot < text.length) {
				window.setTimeout(type, 40);
			}
		}
	}
	
	Renderer.show = function(stage) {
		renderer.render(stage);
	}
	
	Renderer.skip = function() {
	}
	
	Renderer.frameskip = 1;
	
	return Renderer;
})();