Transition = function(level, position, bbox, destination) {
	var transition = Entity(level, position.x, position.y, position.z);
	
	transition.bbox = {
		x: bbox.x,
		y: bbox.y,
		z: bbox.z,
		
		tag: "transition"
	};
	
	if (level.editor) {
		transition.addSprite("spr", Renderer.sprite("transition"));
		transition.currentSprite("spr");
	}
	
	transition.think = function() {
		if (level.ticCount > 10 && (transition.colliding("player"))) {
			Memory.stage(destination.stage);
			Memory.storeDolphin(destination.axis, destination.position,
				destination.z, destination.momx, destination.momy);
			level.moveLevels();
			transition.think = undefined;
			
			var stage = LevelDatabase[destination.stage];
			if (stage.music && stage.music != Music.current) {
				Music.fade(666);
			}
		}
	}
	
	return transition;
};