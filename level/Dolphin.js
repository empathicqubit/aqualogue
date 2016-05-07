Dolphin = function(level, axis, position, z) {
	var dolphin = Entity(level, 0, 0, z);
	
	dolphin.angle = 0;
	
	dolphin.momentum = { x: 10, y: 0 };
	
	dolphin.axis = {
		current: axis,
		position: position
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
		dolphin.position.x = Math.cos(level.ticCount/100)*600 + 500;
		axisMove();
	};
	
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
			dolphin.angle = (axis.angle - 90) * Math.PI / 180;
			dolphin.position.x += Math.sin(dolphin.angle) * dolphin.axis.position;
			dolphin.position.y -= Math.cos(dolphin.angle) * dolphin.axis.position;
		}
	}

	return dolphin;
};