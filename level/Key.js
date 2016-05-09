Key = function(level, x, y, z, index, color) {
	var key = Collectible(level, x, y, z);
	
	key.addSprite("spr", Renderer.sprite("key-" + color));
	key.currentSprite("spr");
	
	key.collect = function() {
		level.saveData.keys[index] = true;
		Memory.global.keys.push(color);
	}
	
	return key;
};