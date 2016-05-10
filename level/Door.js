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
	
	if (level.editor) {
		var info = level.map.doors[index];
		
		door.editorremove = function() {
			level.map.doors.splice(level.map.doors.indexOf(info), 1);
			door.position.x = -99999;
		}
	}
	
	return door;
};