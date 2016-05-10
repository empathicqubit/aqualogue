Collectible = function(level, x, y, z) {
	var collectible = Entity(level, x, y, z);
	
	collectible.bbox = {
		x: 15,
		y: 15,
		z: 15,
		tag: "collectible"
	};
	
	var attractTime = 0.012;
	
	collectible.attract = function() {
		attractTime *= 1.02;
		
		var x = collectible.attractTarget.position.x - collectible.position.x;
		var y = collectible.attractTarget.position.y - collectible.position.y;
		var z = collectible.attractTarget.position.z - collectible.position.z;
		
		collectible.position.x += x*attractTime;
		collectible.position.y += y*attractTime;
		collectible.position.z += z*attractTime;
		
		if (
			Math.abs(x) < 14 &&
			Math.abs(y) < 14 &&
			Math.abs(z) < 14
		) {
			collectible.collect();
			collectible.position.x = -99999;
			collectible.think = undefined;
			
			if (collectible.activeSprite) {
				collectible.activeSprite.visible = false;
			}
		}
	}
	
	return collectible;
};