Scene = function() {
	var scene = {};
	
	scene.stage = new PIXI.Container();
	
	scene.ticCount = 0; // How many frames has this scene run?
	
	// Base functions that a scene should overwrite.
	scene.init = function() {} // Run when the scene is switched to.
	scene.think = function() {} // Run once per thinker frame.
	scene.render = function(frames) {} // Run once per render frame before refresh and etc, for sprite positioning.
	scene.end = function() {} // Run when the scene is switched away from.
	
	// Useful functions.
	
	// Add a sprite or animation to this scene's stage.
	scene.addSprite = function(sprite) {
		scene.stage.addChild(sprite);
	}
	
	return scene;
}