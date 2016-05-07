Level = function(levelName) {
	var level = Scene();
	
	var camera = {
		x: 0,
		y: 0,
		z: 0,
		angle: 0
	};
	
	level.map = LevelDatabase[levelName];
	
	// A set of 512x512 blocks that entities are contained in.
	// Blocks two grid spaces away (in a square, corners excluded) from the camera
	// are thunk and rendered in a frame.
	var entityGrid = {};
	
	function getGridIndex(x, y) {
		return Math.floor(x/512) + Math.floor(y/512)*512;
		// If a map is bigger than 200k pixels one way then you have other problems.
	}
	
	var dolphin;
	
	level.init = function() {
		dolphin = Dolphin(level, level.map.spawn.axis, level.map.spawn.position, level.map.spawn.z);
		placeEntityInGrid(dolphin);
		
		level.map.rocks.forEach(function(rock) {
			placeEntityInGrid(Rock(level, rock.x, rock.y, rock.z, rock.type));
		});
	}
	
	level.think = function() {
		eachEntity(function(entity) {
			if (entity.think) {
				entity.think();
			}
			placeEntityInGrid(entity);
		});
		
		// Camera thinker.
		var targetX, targetY;
		
		targetX = dolphin.position.x - 250*Math.cos(dolphin.angle);
		targetY = dolphin.position.y - 250*Math.sin(dolphin.angle);
		
		camera.x += (targetX - camera.x) / 4;
		camera.y += (targetY - camera.y) / 4;
		camera.z = dolphin.position.z;
		camera.angle = Math.atan2(dolphin.position.y - camera.y, dolphin.position.x - camera.x);
	}
	
	level.render = function(frames) {
		eachEntity(function(entity) {
			if (!entity.activeSprite) {
				return;
			}
			
			var sprite = entity.activeSprite;
			
			sprite.visible = false;
			
			// Start with the angle and distance for the entity.
			var xdist, ydist,
			    angle, distance;
			xdist = entity.position.x - camera.x;
			ydist = entity.position.y - camera.y;
			angle = (Math.atan2(ydist, xdist) - camera.angle + Math.PI) % (2 * Math.PI) - Math.PI;
			distance = Math.sqrt(ydist*ydist + xdist*xdist);
			
			if (distance > 1024 || distance < 16 || Math.abs(angle) > Math.PI/3) {
				// Not in the viewport.
				return;
			}
			
			// In the viewport.
			sprite.visible = true;
			
			distance *= Math.cos(angle);
			
			// Get screen position and scale.
			var scrX, scrY, scrScale;
			scrX = (angle * 1000 / Math.PI) + 250;
			scrScale = 250/distance;
			scrY = (entity.position.z - camera.z)*scrScale + 150;
			
			// Set sprite position.
			sprite.position.set(scrX, scrY);
			sprite.scale.set(scrScale, scrScale);
			sprite.alpha = Math.min(4 - (distance/256), 1);
			
			// Use distance to sort.
			sprite.ZINDEX = Math.round(distance/8);
			
			var index = level.stage.getChildIndex(sprite);
			try {
				while (index > 0 && level.stage.getChildAt(index-1).ZINDEX < sprite.ZINDEX) {
					index--;
				}
				while (level.stage.getChildAt(index+1).ZINDEX > sprite.ZINDEX) {
					index++;
				}
			} catch (e) {}
			level.stage.setChildIndex(sprite, index);
		});
	}
	
	level.end = function() {
		
	}
	
	function placeEntityInGrid(entity) {
		var grid;
		var gridpos = getGridIndex(entity.position.x, entity.position.y);
		if (entity.gridPosition != gridpos) {
			// Remove from old.
			if (entity.gridPosition !== undefined) {
				grid = entityGrid[entity.gridPosition];
				var pos = grid.indexOf(entity);
				grid.splice(pos, 1);
			}
			
			// Add to new.
			grid = (entityGrid[gridpos] || (entityGrid[gridpos] = []));
			entity.gridPosition = gridpos;
			grid.push(entity);
		}
	}
	
	function eachEntity(callback) {
		const offsets = [
			      -1025, -1024, -1023,
			-514,  -513,  -512,  -511, -510,
			  -2,    -1,     0,     1,    2,
			 510,   511,   512,   513,  514,
			       1023,  1024,  1025
		];
		var pos = getGridIndex(camera.x, camera.y); // todo use camera position
		
		// Build up an array separately so that we can modify the entity arrays during the callback.
		var objs = [];
		offsets.forEach(function(offset) {
			if (entityGrid[pos+offset]) {
				entityGrid[pos+offset].forEach(function(entity) {
					objs.push(entity);
				});
			}
		});
		
		objs.forEach(callback);
	}
	
	return level;
}