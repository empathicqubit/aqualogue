Boss = function(level, x, y, z, mode, dolphin) {
	var boss = Entity(level, x, y, z);
	
	var arms = [];
	var armBbox = {
		x: 12, y: 12, z: 12, tag: "tentacle"
	};
	for (var i = 0; i < 4; i++) {
		var arm = [];
		for (var j = 0; j < 15; j++) {
			var tentacle = Entity(level, x, y, z);
			
			tentacle.bbox = armBbox;
			
			tentacle.momentum = {x: 0, y: 0, z: 0};
			
			tentacle.addSprite("spr", Renderer.sprite("tentacle"));
			tentacle.currentSprite("spr");
			
			arm.push(tentacle);
		}
		arms.push(arm);
	}
	
	boss.arms = arms;
	
	boss.addSprite("spr", Renderer.sprite("boss"));
	boss.currentSprite("spr");
	
	var targets = [
		{x: x+150, y: y, z: z, stick: Math.floor(Math.random(80)+120)},
		{x: x, y: y+150, z: z, stick: Math.floor(Math.random(80)+120)},
		{x: x-150, y: y, z: z, stick: Math.floor(Math.random(80)+120)},
		{x: x, y: y-150, z: z, stick: Math.floor(Math.random(80)+120)},
	];
	
	function positionArm(arm, target) {
		// Figure out where the arm starts attached
		var base = {
			x: target.x - boss.position.x,
			y: target.y - boss.position.y,
			z: boss.position.z + 70
		};
		
		var dist = Math.sqrt(base.x * base.x + base.y * base.y)/70;
		base.x /= dist;
		base.y /= dist;
		base.x += boss.position.x;
		base.y += boss.position.y;
		
		// Set first link to the base, and last link to the target.
		var end = arm.length - 1;
		arm[0].position.x = base.x;
		arm[0].position.y = base.y;
		arm[0].position.z = base.z;
		arm[end].position.x = target.x;
		arm[end].position.y = target.y;
		arm[end].position.z = target.z;
		
		// Do gravity, momentum, and pulling on each link between themselves.
		while (end--) {
			var one = arm[end];
			var two = arm[end + 1];
			
			var xdist = two.position.x - one.position.x;
			var ydist = two.position.y - one.position.y;
			var zdist = two.position.z - one.position.z;
			
			dist = Math.sqrt(xdist * xdist + ydist * ydist + zdist * zdist);
			
			if (dist > 19) {
				one.momentum.x += xdist/16;
				one.momentum.y += ydist/16;
				one.momentum.z += zdist/16;
				two.momentum.x -= xdist/16;
				two.momentum.y -= ydist/16;
				two.momentum.z -= zdist/16;
			}
			
			one.position.x += one.momentum.x;
			one.position.y += one.momentum.y;
			one.position.z += one.momentum.z;
			
			one.momentum.x *= 0.9;
			one.momentum.y *= 0.9;
			one.momentum.z *= 0.9;
			one.momentum.z += 0.1;
		}
	}
	
	boss.think = function() {
		if (!Memory.global.bossClear) {
			var momx = dolphin.position.x + Math.cos(dolphin.angle) * 250 - boss.position.x;
			var momy = dolphin.position.y + Math.sin(dolphin.angle) * 250 - boss.position.y;
			var momz = dolphin.position.z - boss.position.z;
			momx /= 16;
			momy /= 16;
			momz /= 16;
		
			boss.position.x += momx;
			boss.position.y += momy;
			boss.position.z += momz;
			
			var offset = level.ticCount;
			
			targets.forEach(function(t) {
				offset += 90;
				t.stick--;
				if (t.stick < -80) {
					t.stick = Math.floor(Math.random() * 100 + 160);
				} else if (t.stick == 0) {
					var xoffs = -Math.sin(dolphin.angle) * Math.cos(dolphin.activeSprite.rotation) * 70;
					var yoffs = Math.cos(dolphin.angle) * Math.cos(dolphin.activeSprite.rotation) * 70;
					var zoffs = Math.sin(dolphin.activeSprite.rotation) * 70;
					
					t.x = boss.position.x + (dolphin.position.x + xoffs - boss.position.x) * 2;
					t.y = boss.position.y + (dolphin.position.y + yoffs - boss.position.y) * 2;
					t.z = boss.position.z + (dolphin.position.z + zoffs - boss.position.z) * 2;
				} else if (t.stick > 0) {
					momx = boss.position.x + Math.cos(offset*Math.PI/180) * 150 - t.x;
					momy = boss.position.y + Math.sin(offset*Math.PI/180) * 150 - t.y;
					momz = boss.position.z - t.z;
					
					t.x += momx/20;
					t.y += momy/20;
					t.z += momz/20;
				}
			});
		}
		
		for (var i = 0; i < 4; i++) {
			positionArm(arms[i], targets[i]);
		}
	}
	
	var flash;
	
	boss.finish = function() {
		flash = new PIXI.Graphics();
		flash.beginFill(0xFFFFFF);
		flash.drawRect(0, 0, 500, 280);
		flash.endFill();
		level.stage.addChildAt(flash, 124);
		
		flash.timer = 0;
		doFlash();
		
		var text = Renderer.typewriterText("N... N..... NO!", 180, 220);
		text.tint = 0xFF00000;
		level.stage.addChild(text);
		
		window.setTimeout(function() {
			level.stage.removeChild(text);
			text = Renderer.typewriterText("YOUR K-KINGDOM IS-", 160, 220);
			text.tint = 0xFF00000;
			level.stage.addChild(text);
		}, 3500);
		
		window.setTimeout(function() {
			level.stage.removeChild(text);
		}, 7000);
		
		window.setTimeout(function() {
			Memory.stage("Ending");
			Memory.storeDolphin(0, 200, -800, 0, -1);
			level.moveLevels();
		}, 10000);
	}
	
	function doFlash() {
		var manager = flash.timer % 50;
		
		flash.timer++;
		
		flash.alpha = 1-manager/14;
		
		if (flash.timer < 251) {
			window.setTimeout(doFlash, 30);
		}
	}
	
	return boss;
};