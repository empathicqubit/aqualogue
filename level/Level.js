Level = function(levelName) {
	var level = Scene();
	
	var camera = {
		x: 0,
		y: 0,
		z: 0,
		angle: 0,
		fwdX: 0,
		fwdY: 0,
		momx: 0,
		momy: 0,
		oldangle: 0
	};
	
	level.map = LevelDatabase[levelName];
	
	// Scroll planes
	var waterBack = ScrollPlane(0, 20, 1, 1, 0, 0, "waterback", 130);
	var waves = [];
	
	for (var i = 1024; i > 150; i *= 0.85) {
		waves.push(ScrollPlane(
			i, -3000/i, 40, 250/i, (i-420)/2, (Math.random()*300-150)/i, "water", Math.round(i/8) 
		));
	}
	
	// A set of blocks that entities are contained in.
	// Blocks two grid spaces away (in a square, corners excluded) from the camera
	// are thunk and rendered in a frame.
	var entityGrid = {};
	
	function getGridIndex(x, y) {
		return Math.floor(x/600) + Math.floor(y/600)*512;
		// If a map is bigger than 200k pixels one way then you have other problems.
	}
	
	var dolphin;
	
	level.init = function() {
		level.stage.addChild(waterBack.plane);
		waves.forEach(function(p) {
			level.stage.addChild(p.plane);
		});
		
		dolphin = Dolphin(level, level.map.spawn.axis, level.map.spawn.position, level.map.spawn.z);
		placeEntityInGrid(dolphin);
		initParaloop();
		
		level.map.rocks.forEach(function(rock) {
			placeEntityInGrid(Rock(level, rock.x, rock.y, rock.z, rock.type));
		});
		
		level.map.keys.forEach(function(key) {
			placeEntityInGrid(Key(level, key.x, key.y, key.z, key.color));
		});
	}
	
	level.think = function() {
		eachEntity(function(entity) {
			if (entity.think) {
				entity.think();
			}
			placeEntityInGrid(entity);
		});
		
		doParaloop();
		
		cameraThinker();
	}
	
	function cameraThinker() {
		// Camera thinker.
		var targetX, targetY;
		
		camera.fwdX += (dolphin.momentum.x/30 - camera.fwdX) / 32;
		camera.fwdY += (dolphin.momentum.y*8 - camera.fwdY) / 32;
		
		targetX = dolphin.position.x - 250*Math.cos(dolphin.angle);
		targetY = dolphin.position.y - 250*Math.sin(dolphin.angle);
		
		camera.x += camera.momx = (targetX - camera.x) / 4;
		camera.y += camera.momy = (targetY - camera.y) / 4;
		camera.z = dolphin.position.z + camera.fwdY;
		camera.angle = Math.atan2(dolphin.position.y - camera.y, dolphin.position.x - camera.x)
			+ camera.fwdX;
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
			angle = (Math.atan2(ydist, xdist) - camera.angle + Math.PI * 3) % (2 * Math.PI) - Math.PI;
			distance = Math.sqrt(ydist*ydist + xdist*xdist);
			
			if (distance > 1024 || distance < 16 || Math.abs(angle) > Math.PI/3) {
				// Not in the viewport.
				return;
			}
			
			if ((entity.position.z > 0) != (camera.z > 0)
				&& Math.abs(camera.z) > 120 && distance > 300) {
				// On the wrong side of the water.
				return;
			}
			
			// In the viewport.
			sprite.visible = true;
			sprite.alpha = Math.min(4 - (distance/256), 1);
			
			distance *= Math.cos(angle);
			
			// Get screen position and scale.
			var scrX, scrY, scrScale;
			scrX = (Math.tan(angle) * 250) + 250;
			scrScale = 250/distance;
			scrY = (entity.position.z - camera.z)*scrScale + 150;
			
			// Set sprite position.
			sprite.position.set(scrX, scrY);
			sprite.scale.set(scrScale, scrScale);
			
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
		
		// Scroll planes
		var xScroll = Math.sqrt(camera.momx*camera.momx + camera.momy*camera.momy)
			* Math.sin(Math.atan2(camera.momy, camera.momx)-camera.angle);
		
		var turn = camera.angle - camera.oldangle;
		camera.oldangle = camera.angle;
		turn = (turn + Math.PI * 3) % (2 * Math.PI) - Math.PI;
		
		waves.forEach(function(p) {
			p.plane.tilePosition.x -= (xScroll*p.moveFactor) + (turn*p.turnFactor) - p.driftFactor;
			
			p.plane.position.y = 150 - camera.z*p.moveFactor + p.z;
		});
		
		waterBack.plane.position.y = Math.max(0, Math.min(150-(camera.z/4), 170-(camera.z*1.5)));
		waterBack.plane.scale.y = 280 - waterBack.plane.position.y;
	}
	
	level.end = function() {
		
	}
	
	level.colliding = function(object, tag, excludes) {
		excludes = excludes || [];
		var xoffs = object.position.x % 600 > 300 ? 1 : -1;
		var yoffs = object.position.y % 600 > 300 ? 512 : -512;
		var start = getGridIndex(object.position.x, object.position.y);
		
		try {
			([start, start+xoffs, start+yoffs, start+xoffs+yoffs]).forEach(function(pos) {
				if (entityGrid[pos]) {
					entityGrid[pos].forEach(function(target) {
						if (!target.bbox || target.bbox.tag != tag) {
							return;
						}
						
						if (Math.abs(target.position.x - object.position.x)
						  > target.bbox.x + object.bbox.x) {
							return;
						}
						
						if (Math.abs(target.position.y - object.position.y)
						  > target.bbox.y + object.bbox.y) {
							return;
						}
						
						if (Math.abs(target.position.z - object.position.z)
						  > target.bbox.z + object.bbox.z) {
							return;
						}
						
						if (excludes.indexOf(target) != -1) {
							return;
						}
						
						throw target;
					});
				}
			});
		} catch (toucher) {
			return toucher;
		}
		
		return false;
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
		var pos = getGridIndex(camera.x, camera.y);
		
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
	
	// Paraloop stuff starts here
	var paraloopObjs = [];
	var paraloopLength = 42;
	var paraloopPos = 0;
	
	function initParaloop() {
		for (var i = 0; i < paraloopLength; i++) {
			var obj = Entity(level, -99999, -99999, -99999);
			obj.addSprite("spr", Renderer.sprite("loopstar"));
			obj.currentSprite("spr");
			paraloopObjs.push(obj);
		}
	}
	
	function doParaloop() {
		if (level.ticCount % 4) {
			return;
		}
		
		var obj = paraloopObjs[paraloopPos];
		obj.position.x = dolphin.position.x;
		obj.position.y = dolphin.position.y;
		obj.position.z = dolphin.position.z;
		placeEntityInGrid(obj);
		
		var check = paraloopPos;
		do {
			check = (check+1) % paraloopLength;
			
			var star = paraloopObjs[check];
			if (
				Math.abs(star.position.x - dolphin.position.x) < 36 &&
				Math.abs(star.position.y - dolphin.position.y) < 36 &&
				Math.abs(star.position.z - dolphin.position.z) < 36
			) {
				checkParaloop(check);
				break;
			}
		} while (check != paraloopPos);
		
		paraloopPos++; paraloopPos %= paraloopLength;
	}
	
	function checkParaloop(pos) {
		var loopLen = (paraloopPos - pos + paraloopLength) % paraloopLength;
		
		if (loopLen < 4) {
			return;
		}
		
		var origPos = pos;
		var minX, maxX, minY, maxY, minZ, maxZ;
		minX = maxX = paraloopObjs[pos].position.x;
		minY = maxY = paraloopObjs[pos].position.y;
		minZ = maxZ = paraloopObjs[pos].position.z;
		
		while (pos != paraloopPos) {
			pos = (pos+1) % paraloopLength;
			var p = paraloopObjs[pos].position;
			
			if (minX > p.x) minX = p.x;
			if (maxX < p.x) maxX = p.x;
			if (minY > p.y) minY = p.y;
			if (maxY < p.y) maxY = p.y;
			if (minZ > p.z) minZ = p.z;
			if (maxZ < p.z) maxZ = p.z;
		}
		
		// Enforce a minimum loop size.
		if (
			(maxX - minX < 40 ? 1 : 0) +
			(maxY - minY < 40 ? 1 : 0) +
			(maxZ - minZ < 40 ? 1 : 0) > 1
		) {
			return;
		}
		
		// Loop again to find the radius.
		var dist = 0, distnum = 0;
		pos = origPos;
		minX = (minX+maxX)/2;
		minY = (minY+maxY)/2;
		minZ = (minZ+maxZ)/2;
		
		while (pos != paraloopPos) {
			pos = (pos+1) % paraloopLength;
			var p = paraloopObjs[pos].position;
			
			var newDist = (p.x-minX)*(p.x-minX)
			            + (p.y-minY)*(p.y-minY)
			            + (p.z-minZ)*(p.z-minZ);
			
			dist += Math.sqrt(newDist);
			distnum++;
		}
		
		dist /= distnum;
		
		// Enforce a minimum radius of 40 pixels.
		if (dist < 40) {
			return;
		}
		
		// Attract and clear out the paraloop.
		paraloopObjs.forEach(function(obj) {
			obj.position.x = -99999;
			obj.position.y = -99999;
			obj.position.z = -99999;
		});
		attractCollectiblesToDolphin(minX, minY, minZ, dist*dist);
	}
	
	function attractCollectiblesToDolphin(x, y, z, sqdist) {
		sqdist *= 0.7;
		
		eachEntity(function(obj) {
			if (!obj.attract) {
				return;
			}
			
			var p = obj.position;
			
			if (
				(p.x-x)*(p.x-x) +
				(p.y-y)*(p.y-y) +
				(p.z-z)*(p.z-z) < sqdist
			) {
				obj.think = obj.attract;
				obj.attractTarget = dolphin;
			}
		});
	}
	
	return level;
}