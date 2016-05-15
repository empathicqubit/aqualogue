Key = function(level, x, y, z, index, color) {
	var key = Collectible(level, x, y, z);
	
	key.addSprite("spr", Renderer.sprite("key-" + color));
	key.currentSprite("spr");
	
	key.collect = function() {
		level.saveData.keys[index] = true;
		Memory.global.keys.push(color);
	}
	
	if (level.editor) {
		var info = level.map.keys[index];
		
		key.editorremove = function() {
			level.map.keys.splice(level.map.keys.indexOf(info), 1);
			key.position.x = -99999;
			key.activeSprite.visible = false;
		}
	}
	
	return key;
};