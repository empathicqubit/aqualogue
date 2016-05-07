Dolphin = function(level, x, y, z) {
	var dolphin = Entity(level, x, y, z);
	
	var sprite = Renderer.animation([
		"dolphin3",
		"dolphin2",
		"dolphin1",
		"dolphin2",
		"dolphin3",
		"dolphin4",
		"dolphin5",
		"dolphin4"
	]).speed(20);
	
	dolphin.addSprite("normal", sprite);
	dolphin.currentSprite("normal");
	
	dolphin.think = function() {
		dolphin.position.x = Math.cos(level.ticCount/100)*600 + 500;
	};

	return dolphin;
};