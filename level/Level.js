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
	level.saveData = Memory.stage(levelName);
	
	// Scroll planes
	var background = ScrollPlane(0, 0, 360, 1, level.map.background.width, 0, "bg-" + level.map.background.image, 131);
	var waterBack = ScrollPlane(0, 20, 1, 1, 0, 0, "waterback", 130);
	var waves = [];
	
	for (var i = 1024; i > 150; i *= 0.85) {
		waves.push(ScrollPlane(
			i, -3000/i, 40, 250/i, (i)/2, (Math.random()*300-150)/i, "water", Math.round(i/8) 
		));
	}
	
	// Constant level tint
	var tint;
	if (level.map.tint) {
		tint = new PIXI.Graphics();
		tint.beginFill(level.map.tint.rgb || 0);
		tint.drawRect(0, 0, 8, 8);
		tint.endFill();
		tint.alpha = level.map.tint.a || 0.25;
		tint.blendMode = PIXI.BLEND_MODES[level.map.tint.effect] || PIXI.BLEND_MODES.NORMAL;
		tint.scale.set(500/8, 280/8);
	}
	
	// Boss
	var boss;
	
	// Wipe in/out graphic
	var wipe = level.wipe = new PIXI.Graphics();
	wipe.beginFill(0x000000);
	wipe.drawPolygon([
		new PIXI.Point(0, 0),
		new PIXI.Point(-10, 28),
		new PIXI.Point(53, 28),
		new PIXI.Point(63, 0)
	]);
	wipe.endFill();
	wipe.scale.set(10, 10);
	
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
		level.stage.addChild(background.plane);
		level.stage.addChild(waterBack.plane);
		waves.forEach(function(p) {
			level.stage.addChild(p.plane);
		});
		
		var spawn = Memory.getDolphin() || level.map.spawn;
		dolphin = Dolphin(level, spawn.axis, spawn.position, spawn.z);
		if (spawn.momx || spawn.momy) {
			dolphin.momentum.x = spawn.momx;
			dolphin.momentum.y = spawn.momy;
		}
		
		placeEntityInGrid(dolphin);
		camera.x = dolphin.position.x;
		camera.y = dolphin.position.y;
		initParaloop();
		
		level.map.rocks.forEach(function(rock) {
			if (rock.bossonly && Memory.global.bossClear) {
				return; // Don't spawn this rock any more.
			}
			
			var obj = Rock(level, rock.x, rock.y, rock.z, rock.type);
			placeEntityInGrid(obj);
			
			if (level.editor) {
				var info = rock;
				
				obj.editorremove = function() {
					level.map.rocks.splice(level.map.rocks.indexOf(info), 1);
					obj.position.x = -99999;
				}
			}
		});
		
		level.map.keys.forEach(function(key, index) {
			if (level.editor || !level.saveData.keys[index]) {
				placeEntityInGrid(Key(level, key.x, key.y, key.z, index, key.color));
			}
		});
		
		level.map.doors.forEach(function(door, index) {
			if (level.editor || !level.saveData.doors[index]) {
				placeEntityInGrid(Door(level, door.x, door.y, door.z, index, door.color));
			}
		});
		
		level.map.transitions.forEach(function(trans) {
			var obj = Transition(level, trans.position, trans.bbox, trans.destination);
			placeEntityInGrid(obj);
			
			if (level.editor) {
				var info = trans;
				
				obj.editorremove = function() {
					level.map.transitions.splice(level.map.rocks.indexOf(info), 1);
					obj.position.x = -99999;
				}
			}
		});
		
		if (tint) {
			level.stage.addChild(tint);
		}
		level.stage.addChild(wipe);
		
		if (level.map.music && level.map.music != "none" && level.map.music != Music.current
			&& !(level.map.music == "boss" && Memory.global.bossClear)
		) {
			Music.play(level.map.music);
		}
		
		// Save crystal.
		if (level.map.save) {
			var crystal = Entity(level, 1000, 1000, -111);
			crystal.addSprite("spr", Renderer.sprite("save"));
			crystal.currentSprite("spr");
			crystal.save = true;
			placeEntityInGrid(crystal);
		}
		
		// Rescuee.
		if (RescueDatabase[levelName] && !level.saveData.rescued) {
			var r = Rescuee(level, RescueDatabase[levelName], dolphin);
			placeEntityInGrid(r);
			if (r.bubble) {
				placeEntityInGrid(r.bubble);
				placeEntityInGrid(r.barrier);
			}
		}
		
		// Boss.
		if (level.map.boss && !Memory.global.bossClear) {
			boss = Boss(
				level,
				dolphin.position.x + Math.cos(dolphin.angle) * 250,
				dolphin.position.y + Math.sin(dolphin.angle) * 250,
				dolphin.position.z,
				level.map.boss,
				dolphin
			);
			placeEntityInGrid(boss);
			boss.arms.forEach(function(arm) {
				arm.forEach(function(piece) {
					placeEntityInGrid(piece);
				});
			});
			
			var texts = {
				"Boss 1": "      THIS IS THE BEGINNING OF YOUR END.",
				"Boss 2": "           GIVE UP! YOUR KINGDOM IS MINE.",
				"Boss 3": "                       ABANDON HOPE.",
			};
			
			var t = Renderer.typewriterText(texts[levelName] || "", 60, 220);
			level.stage.addChild(t);
			t.tint = 0xFF0000;
			
			window.setTimeout(function() {
				level.stage.removeChild(t);
			}, 8000);
		}
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
		
		if (level.editor) {
			levelEditor();
		}
		
		if (wipe.x < 600) {
			wipe.x += 15;
			
			if (wipe.x > -30 && wipe.newlevel) {
				if (Memory.stage() == "Boss 3" && Memory.global.bossClear) {
					Memory.storeDolphin(0, 200, -800, 0, -1);
					Game.setScene(Level("Ending"));
				} else {
					Memory.loadStage();
				}
			}
		}
		
		if (level.map.save && !level.saved && dolphin.position.z < -30 && dolphin.momentum.y > 0) {
			level.saved = true;
			
			if (level.ticCount > 10) {
				Memory.storeDolphin(dolphin.axis.current, dolphin.axis.position,
					dolphin.position.z, dolphin.momentum.x, dolphin.momentum.y);
				Memory.save();
				
				var text = Renderer.text("Your adventure has been saved.", 140, 200)
				level.stage.addChild(text);
				
				var fade = new PIXI.Graphics;
				fade.beginFill(0xFFFFFF);
				fade.drawRect(0, 0, 500, 280);
				fade.endFill();
				
				function fadeout() {
					fade.alpha -= 0.01;
					
					if (fade.alpha > 0) {
						window.setTimeout(fadeout, 20);
					} else {
						window.setTimeout(function() {
							level.stage.removeChild(text);
						}, 2000);
					}
				}
				
				fadeout();
				
				level.stage.addChild(fade);
			}
		}
	}
	
	level.moveLevels = function() {
		wipe.x = -630;
		wipe.newlevel = true;
	}
	
	function cameraThinker() {
		if (camera.boss) {
			camera.angle = Math.atan2(boss.position.y - camera.y, boss.position.x - camera.x);
			return;
		}
		
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
			
			// If we're too far vertically, don't bother.
			if (Math.abs(entity.position.z - camera.z) > 700) {
				return;
			}
			
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
				while (index > 0 && (level.stage.getChildAt(index-1).ZINDEX || 0) < sprite.ZINDEX) {
					index--;
				}
				while (level.stage.getChildAt(index+1).ZINDEX > sprite.ZINDEX) {
					index++;
				}
			} catch (e) {}
			level.stage.setChildIndex(sprite, index);
			
			// Save cheating.
			if (entity.save) {
				sprite.scale.set(scrScale*2, scrScale*2);
			}
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
		
		waterBack.plane.position.y = Math.max(0, Math.min(150-(camera.z/5), 170-(camera.z*1.5)));
		waterBack.plane.scale.y = 280 - waterBack.plane.position.y;
		
		background.plane.position.y = (camera.z/-6)-160;
		background.plane.tilePosition.x = (camera.angle/(-2*Math.PI)) * background.turnFactor;
		
		// Keys
		renderKeys();
	}
	
	level.end = function() {
		
	}
	
	level.colliding = function(object, tag, excludes) {
		if (level.editor) { return; }
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
		if (level.editor) { return; }
		
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
			obj.activeSprite.visible = false;
		});
		attractCollectiblesToDolphin(minX, minY, minZ, dist*dist);
		
		// Boss cheating.
		if (levelName == "Boss 3" && Math.abs(minX) < 64 && Math.abs(minY) < 64 && !Memory.global.bossClear) {
			Music.stop();
			
			camera.boss = true;
			
			Memory.global.bossClear = true;
			
			boss.finish();
		}
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
	
	var keySprites = [];
	function renderKeys() {
		var index;
		
		// Remove/reset
		if (keySprites.length > Memory.global.keys.length) {
			keySprites.forEach(function(key) {
				level.stage.removeChild(key);
			});
			keySprites = [];
		}
		
		// Add
		for (index = keySprites.length; index < Memory.global.keys.length; index++) {
			var spr = Renderer.sprite("key-" + Memory.global.keys[index]);
			spr.position.set(20 + 15*index, 28);
			keySprites.push(spr);
			level.stage.addChild(spr);
		}
	}
	
	level.edit = function() {
		level.editor = true;
		
		if (typeof LEVELEDITORBOX == 'undefined') {
			LEVELEDITORBOX = document.createElement('div');
			LEVELEDITORBOX.style.backgroundColor = '#CCC';
			LEVELEDITORBOX.style.minHeight = '100px';
			LEVELEDITORBOX.style.whiteSpace = 'pre-wrap';
			document.body.appendChild(LEVELEDITORBOX);
		}
		
		return level;
	}
	
	function levelEditor() {
		var color = 
			Input.held("redkey") ? "red" :
			Input.held("bluekey") ? "blue" :
			Input.held("greenkey") ? "green" :
			Input.held("yellowkey") ? "yellow" : "white";
		
		if (pressOrTurbo("rocksm")) {
			spawnRock("small");
		}
		if (pressOrTurbo("rockmed")) {
			spawnRock("medium");
		}
		if (pressOrTurbo("rocklg")) {
			spawnRock("large");
		}
		if (pressOrTurbo("rockwd")) {
			spawnRock("wide");
		}
		
		function spawnRock(size) {
			var info = {
				x: Math.round(dolphin.position.x),
				y: Math.round(dolphin.position.y),
				z: Math.round(dolphin.position.z),
				type: size
			};
			level.map.rocks.push(info);
			var rock = Rock(level, info.x, info.y, info.z, info.type);
			
			rock.editorremove = function() {
				level.map.rocks.splice(level.map.rocks.indexOf(info), 1);
				rock.position.x = -99999;
			}
			
			placeEntityInGrid(rock);
		}
		
		if (Input.pressed("key")) {
			var info = {
				x: Math.round(dolphin.position.x),
				y: Math.round(dolphin.position.y),
				z: Math.round(dolphin.position.z),
				color: color
			};
			
			level.map.keys.push(info);
			
			placeEntityInGrid(Key(level, info.x, info.y, info.z, level.map.keys.length-1, color));
		}
		
		if (Input.pressed("door")) {
			var info = {
				x: Math.round(dolphin.position.x),
				y: Math.round(dolphin.position.y),
				z: Math.round(dolphin.position.z),
				color: color
			};
			
			level.map.doors.push(info);
			
			placeEntityInGrid(Door(level, info.x, info.y, info.z, level.map.doors.length-1, color));
		}
		
		if (Input.pressed("transition")) {
			var trans = {
				position: {
					x: dolphin.position.x,
					y: dolphin.position.y,
					z: dolphin.position.z
				},
				bbox: {x: 32, y: 32, z: 32}, destination: {
				stage: "STAGE",
				axis: 0,
				position: 0,
				z: 0,
				momx: 0,
				momy: 0
			}
			}
			var obj = Transition(level, dolphin.position, trans.bbox, trans.destination);
			placeEntityInGrid(obj);
			
			obj.editorremove = function() {
				level.map.transitions.splice(level.map.rocks.indexOf(trans), 1);
				obj.position.x = -99999;
			}
			
			level.map.transitions.push(trans);
		}
		
		if (Input.held("remove")) {
			eachEntity(function(obj) {
				if (
					obj.editorremove
					&& Math.abs(obj.position.x - dolphin.position.x) < 18
					&& Math.abs(obj.position.y - dolphin.position.y) < 18
					&& Math.abs(obj.position.z - dolphin.position.z) < 18
				) {
					obj.editorremove();
				}
			});
		}
		
		if (Input.held("slow")) {
			dolphin.momentum.x = Math.cos(dolphin.activeSprite.rotation)*2;
			dolphin.momentum.y = Math.sin(dolphin.activeSprite.rotation)*2;
		}
		if (Input.held("fast")) {
			dolphin.momentum.x = Math.cos(dolphin.activeSprite.rotation)*8;
			dolphin.momentum.y = Math.sin(dolphin.activeSprite.rotation)*8;
		}
		
		if (Input.pressed("export")) {
			level.map.spawn = {
				axis: dolphin.axis.current,
				position: Math.round(dolphin.axis.position),
				z: Math.round(dolphin.position.z)
			};
			
			LEVELEDITORBOX.innerText = JSON.stringify(Input.held("redkey") ? level.map.spawn : level.map, null, "\t");
		}
		
		function pressOrTurbo(key) {
			return Input.pressed(key) || (Input.held("fast") && Input.held(key) && !(level.ticCount % 4));
		}
	}
	
	return level;
}