Key = function(level, x, y, z, color) {
	var key = Collectible(level, x, y, z);
	
	key.addSprite("spr", Renderer.sprite("key-" + color));
	key.currentSprite("spr");
	
	key.collect = function() {
		
	}
	
	return key;
};