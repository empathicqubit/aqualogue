Rescuee = function(level, data, dolphin) {
	var rescuee = Entity(level, data.position.x, data.position.y, data.position.z);
	
	rescuee.addSprite("spr", Renderer.sprite(data.sprite));
	rescuee.currentSprite("spr");
	
	if (data.dead) {
		rescuee.activeSprite.rotation = Math.PI;
	} else {
		rescuee.bubble = Entity(level, data.position.x, data.position.y, data.position.z);
		rescuee.bubble.addSprite("spr", Renderer.sprite("bubble"));
		rescuee.bubble.currentSprite("spr");
		
		rescuee.barrier = Entity(level, dolphin.position.x, dolphin.position.y, 20);
		rescuee.barrier.addSprite("spr", Renderer.animation([
			"barrier1","barrier2","barrier3","barrier2"
		]).speed(10));
		rescuee.barrier.currentSprite("spr");
		rescuee.barrier.think = function() {
			rescuee.barrier.position.x = dolphin.position.x;
			rescuee.barrier.position.y = dolphin.position.y;
		}
		rescuee.barrier.bbox = {
			x: 200,
			y: 200,
			z: 6,
			tag: "geometry"
		};
	}
	
	var flt = 0;
	
	rescuee.think = function() {
		flt += Math.PI / 90;
		
		var bob = Math.cos(flt);
		
		rescuee.position.z += bob/9;
		
		if (!data.dead) {
			rescuee.activeSprite.rotation = bob/7;
		}
		
		// Check burst
		var xd, yd, zd;
		xd = dolphin.position.x - data.position.x;
		yd = dolphin.position.y - data.position.y;
		zd = dolphin.position.z - data.position.z;
		
		if (xd * xd + yd * yd + zd * zd < 40*40) {
			rescuee.bubble.position.x = -99999;
			rescuee.bubble.activeSprite.visible = false;
			
			rescuee.think = cutscene;
			
			level.saveData.rescued = true;
		}
	}
	
	var cutsceneLine = -1;
	var cutsceneTimer = 250;
	var text;
	
	function cutscene() {
		flt += Math.PI / 90;
		
		var bob = Math.cos(flt);
		
		rescuee.position.z += bob/9;
		
		if (!data.dead) {
			rescuee.activeSprite.rotation = bob/7;
		}
		
		cutsceneTimer++;
		
		if (cutsceneTimer >= 300) {
			cutsceneTimer = 0;
			cutsceneLine++;
			
			var line = data.lines[cutsceneLine];
			
			if (text) {
				level.stage.removeChild(text);
			}
			
			if (line) {
				text = Renderer.typewriterText(line, 30, 220);
				level.stage.addChild(text);
			} else {
				rescuee.barrier.position.x = -99999;
				rescuee.barrier.activeSprite.visible = false;
				rescuee.barrier.think = undefined;
			}
		}
	}
	
	return rescuee;
}