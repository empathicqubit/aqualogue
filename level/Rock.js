Rock = function(level, x, y, z, size) {
	var rock = Entity(level, x, y, z);
	
	rock.bbox = {
		x: 12,
		y: 12,
		z: ({
			small: 12,
			medium: 31,
			large: 47,
			wide: 12,
		})[size],
		tag: "geometry"
	};
	
	if (size == "wide") {
		rock.bbox.x = rock.bbox.y = 47;
	}
	
	rock.addSprite("sprite", Renderer.sprite("rock-" + size));
	rock.currentSprite("sprite");
	
	return rock;
};