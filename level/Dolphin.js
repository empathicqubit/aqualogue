Dolphin = function(level, axis, position, z) {
	var dolphin = Entity(level, 0, 0, z);
	
	dolphin.angle = 0;
	
	dolphin.momentum = { x: 10, y: 0 };
	
	dolphin.axis = {
		current: axis,
		position: position
	};
	
	dolphin.bbox = {
		x: 20,
		y: 20,
		z: 20,
		tag: "player"
	};
	
	axisMove();
	
	var sprite = Renderer.animation([
		"dolphin3",
		"dolphin2",
		"dolphin1",
		"dolphin2",
		"dolphin3",
		"dolphin4",
		"dolphin5",
		"dolphin4"
	]).speed(20);
	
	dolphin.addSprite("normal", sprite);
	dolphin.currentSprite("normal");
	
	dolphin.think = function() {
		doControls();
		axisMove();
		vMove();
	};
	
	function doControls() {
		var moveX, moveY;
		
		moveX = Input.held("left") ? -1 : Input.held("right") ? 1 : 0;
		moveY = Input.held("up") ? -1 : Input.held("down") ? 1 : 0;
		
		dolphin.momentum.x += moveX*0.2;
		dolphin.momentum.y += moveY*0.2;
		
		dolphin.momentum.x *= 0.99;
		dolphin.momentum.y *= 0.99;
		
		var oldAngle = Math.atan2(dolphin.momentum.y, dolphin.momentum.x);
		
		if (moveX || moveY) {
			var dist = Math.sqrt(
				dolphin.momentum.x * dolphin.momentum.x +
				dolphin.momentum.y * dolphin.momentum.y
			);
			
			if (dist > 10) {
				dist -= 0.22;
			}
			
			var delta = Math.atan2(moveY, moveX);
			delta = (delta - oldAngle + Math.PI * 3) % (2 * Math.PI) - Math.PI;
			
			if (Math.abs(delta) < Math.PI * 4/5) {
				oldAngle += delta > 0.05 ? 0.05 : delta < -0.05 ? -0.05 : delta;
				
				dolphin.momentum.x = dist * Math.cos(oldAngle);
				dolphin.momentum.y = dist * Math.sin(oldAngle);
			}
		}
		
		dolphin.activeSprite.rotation = oldAngle;
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
		
		if (dolphin.colliding("geometry")) {
			dolphin.momentum.x /= -1.5;
			dolphin.axis.current = oldCurrent;
			dolphin.axis.position = oldPosition;
			positionOnAxis();
		}
	}
	
	function vMove() {
		dolphin.position.z += dolphin.momentum.y;
		
		if (dolphin.colliding("geometry")) {
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
	
	function positionOnAxis() {
		var axis = level.map.axes[dolphin.axis.current];
		dolphin.position.x = axis.x;
		dolphin.position.y = axis.y;
		
		if (axis.radius != 0) {
			dolphin.angle = (axis.angle * Math.PI / 180) + dolphin.axis.position / axis.radius;
			dolphin.position.x += Math.cos(dolphin.angle) * axis.radius;
			dolphin.position.y += Math.sin(dolphin.angle) * axis.radius;
		} else {
			dolphin.angle = (axis.angle + 90) * Math.PI / 180;
			dolphin.position.x -= Math.sin(dolphin.angle) * dolphin.axis.position;
			dolphin.position.y += Math.cos(dolphin.angle) * dolphin.axis.position;
		}
	}

	return dolphin;
};