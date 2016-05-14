Dolphin = function(level, axis, position, z) {
	var dolphin = Entity(level, 0, 0, z);
	
	dolphin.angle = 0;
	
	dolphin.momentum = { x: 10, y: 0 };
	
	dolphin.axis = {
		current: axis,
		position: position
	};
	
	dolphin.bbox = {
		x: 12,
		y: 12,
		z: 12,
		tag: "player"
	};
	
	axisMove();
	
	dolphin.addSprite("normal", Renderer.animation([
		"dolphin3",
		"dolphin2",
		"dolphin1",
		"dolphin2",
		"dolphin3",
		"dolphin4",
		"dolphin5",
		"dolphin4"
	]).speed(20));
	dolphin.addSprite("flipped", Renderer.animation([
		"dolphinu3",
		"dolphinu2",
		"dolphinu1",
		"dolphinu2",
		"dolphinu3",
		"dolphinu4",
		"dolphinu5",
		"dolphinu4"
	]).speed(20));
	dolphin.addSprite("nf1", Renderer.sprite("dolphinf"));
	dolphin.addSprite("nf2", Renderer.sprite("dolphinuf"));
	dolphin.addSprite("fn1", Renderer.sprite("dolphinub"));
	dolphin.addSprite("fn2", Renderer.sprite("dolphinb"));
	
	dolphin.currentSprite("normal");
	
	dolphin.think = function() {
		doCharge();
		doFlips();
		
		if (dolphin.position.z < 0 && !(level.editor && !Input.held("dash"))) {
			doFalling();
		} else {
			doControls();
		}
		
		axisMove();
		vMove();
		
		var collectible;
		if (collectible = dolphin.colliding("collectible")) {
			collectible.think = collectible.attract;
			collectible.attractTarget = dolphin;
		}
	};
	
	dolphin.fliptimer = 0;
	
	function doCharge() {
		if (Input.held("dash")) {
			dolphin.charging = true;
			dolphin.fliptimer = 99;
		} else {
			dolphin.charging = false;
		}
	}
	
	function doFlips() {
		if (dolphin.flipping) {
			dolphin.flipping--;
			dolphin.fliptimer = 59;
			
			if (dolphin.flipping == 4) {
				dolphin.currentSprite(dolphin.flipped ? "flipped" : "normal");
			} else if (dolphin.flipping == 8) {
				dolphin.currentSprite(dolphin.flipped ? "nf2" : "fn2");
			}
		} else if (dolphin.fliptimer > 60) {
			dolphin.flipping = 12;
			dolphin.flipped = !dolphin.flipped;
			dolphin.fliptimer = 0;
			
			dolphin.currentSprite(dolphin.flipped ? "nf1" : "fn1");
		} else if ((!!dolphin.flipped) != (Math.abs(dolphin.activeSprite.rotation) > Math.PI/2)) {
			dolphin.fliptimer++;
		} else {
			dolphin.fliptimer = 0;
		}
	}
	
	function doFalling() {
		dolphin.momentum.y += 0.2;
		dolphin.activeSprite.rotation = Math.atan2(dolphin.momentum.y, dolphin.momentum.x);
	}
	
	function doControls() {
		var moveX, moveY;
		var moveStr, turnStr;
		moveStr = 0.2;
		turnStr = 0.05;
		
		if (dolphin.charging) {
			turnStr /= 5;
			moveStr = 0;
		}
		
		moveX = Input.held("left") ? -1 : Input.held("right") ? 1 : 0;
		moveY = Input.held("up") ? -1 : Input.held("down") ? 1 : 0;
		
		dolphin.momentum.x += moveX*moveStr;
		dolphin.momentum.y += moveY*moveStr + (level.editor ? 0 : 0.001);
		
		dolphin.momentum.x *= 0.99;
		dolphin.momentum.y *= 0.99;
		
		if (dolphin.momentum.x || dolphin.momentum.y) {
			var oldAngle = Math.atan2(dolphin.momentum.y, dolphin.momentum.x);
			
			var dist = Math.sqrt(
				dolphin.momentum.x * dolphin.momentum.x +
				dolphin.momentum.y * dolphin.momentum.y
			);
			
			if (!dolphin.charging && dist > 7) {
				dist -= 0.13;
			}
			
			if (dolphin.charging) {
				dist += 0.16;
			}
			
			if (moveX || moveY) {
				
				var delta = Math.atan2(moveY, moveX);
				delta = (delta - oldAngle + Math.PI * 3) % (2 * Math.PI) - Math.PI;
				
				if (Math.abs(delta) < Math.PI * 4/5) {
					oldAngle += delta > turnStr ? turnStr : delta < -turnStr ? -turnStr : delta;
				}
			}
			
			dolphin.momentum.x = dist * Math.cos(oldAngle);
			dolphin.momentum.y = dist * Math.sin(oldAngle);
			
			dolphin.activeSprite.rotation = oldAngle;
			
			if (!dolphin.flipping) {
				dolphin.activeSprite.speed(dist*2+3);
			}
		}
	}
	
	function axisMove() {
		var oldCurrent = dolphin.axis.current;
		var oldPosition = dolphin.axis.position;
		
		dolphin.axis.position += dolphin.momentum.x;
		
		var axis = level.map.axes[dolphin.axis.current];
		if (dolphin.axis.position < 0) {
			newAxis(axis.left);
			
			axis = level.map.axes[dolphin.axis.current];
			
			var end = axis.length;
			if (axis.radius != 0) {
				end *= Math.abs(axis.radius)*Math.PI/180;
			}
			
			dolphin.axis.position += end;
		} else {
			var end = axis.length;
			if (axis.radius != 0) {
				end *= Math.abs(axis.radius)*Math.PI/180;
			}
			if (dolphin.axis.position >= end) {
				newAxis(axis.right);
				dolphin.axis.position -= end;
			}
		}
		
		positionOnAxis();
		
		if (collide()) {
			dolphin.momentum.x /= -1.5;
			dolphin.axis.current = oldCurrent;
			dolphin.axis.position = oldPosition;
			positionOnAxis();
		}
	}
	
	function vMove() {
		dolphin.position.z += dolphin.momentum.y;
		
		if (collide()) {
			dolphin.position.z -= dolphin.momentum.y;
			dolphin.momentum.y /= -1.5;
		}
	}
	
	function newAxis(transitionList) {
		var i = 1;
		dolphin.axis.current = transitionList[0];
		
		while (transitionList[i] !== undefined && dolphin.position.z >= transitionList[i]) {
			i++;
			dolphin.axis.current = transitionList[i];
			i++;
		}
	}
	
	function collide() {
		var block = dolphin.colliding("geometry");
		
		if (block && block.door) {
			var check = Memory.global.keys.indexOf(block.door);
			
			if (check != -1) {
				Memory.global.keys.splice(check, 1);
				block.position.x = -99999;
				level.saveData.doors[block.index] = true;
				
				return;
			}
		}
		
		return block;
	}
	
	function positionOnAxis() {
		var axis = level.map.axes[dolphin.axis.current];
		dolphin.position.x = axis.x;
		dolphin.position.y = axis.y;
		
		if (axis.radius != 0) {
			dolphin.angle = (axis.angle * Math.PI / 180) + dolphin.axis.position / axis.radius;
			dolphin.position.x += Math.cos(dolphin.angle) * axis.radius;
			dolphin.position.y += Math.sin(dolphin.angle) * axis.radius;
		} else {
			dolphin.angle = (axis.angle - 90) * Math.PI / 180;
			dolphin.position.x -= Math.sin(dolphin.angle) * dolphin.axis.position;
			dolphin.position.y += Math.cos(dolphin.angle) * dolphin.axis.position;
		}
	}

	return dolphin;
};