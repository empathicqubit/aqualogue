Door = function(level, x, y, z, index, color) {
	var door = Entity(level, x, y, z);
	
	door.bbox = {
		x: 16,
		y: 16,
		z: 33,
		tag: "geometry"
	};
	
	door.index = index;
	
	door.addSprite("sprite", Renderer.sprite("door-" + color));
	door.door = color;
	door.currentSprite("sprite");
	
	return door;
};