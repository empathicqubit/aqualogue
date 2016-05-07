Level = function() {
	var level = Scene();
	
	// A set of 512x512 blocks that objects are contained in.
	// Blocks two grid spaces away (in a square, corners excluded) from the camera
	// are thunk and rendered in a frame.
	var objectGrid = {};
	
	function getGridIndex(x, y) {
		return Math.floor(x/512) + Math.floor(y/512)*512;
		// If a map is bigger than 200k pixels one way then you have other problems.
	}
	
	var sprite;
	level.init = function() {
		sprite = Renderer.animation([
			"dolphin3",
			"dolphin2",
			"dolphin1",
			"dolphin2",
			"dolphin3",
			"dolphin4",
			"dolphin5",
			"dolphin4"
		]).speed(20);
		sprite.position.set(200,200);
		level.addSprite(sprite);
	}
	
	level.think = function() {
		sprite.x = Math.cos(level.ticCount/40)*100+250;
	}
	
	level.show = function(frames) {
		
	}
	
	level.end = function() {
		
	}
	
	return level;
}