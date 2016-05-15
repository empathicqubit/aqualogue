Title = function() {
	var title = Scene();
	
	// Scroll planes
	var background = ScrollPlane(0, 0, 360, 1, 3072, 0, "bg-mountains", 131);
	var waterBack = ScrollPlane(0, 20, 1, 1, 0, 0, "waterback", 130);
	var waves = [];
	var logo = Renderer.sprite("logo");
	logo.position.x = 240;
	
	var createdby = Renderer.text("Made by RedEnchilada", 324, 0);
	var jam = Renderer.text("For AdventureJam 2016", 20, 0);
	
	var fade = new PIXI.Graphics();
	
	var menu;
	
	for (var i = 1024; i > 150; i *= 0.85) {
		waves.push(ScrollPlane(
			i, -3000/i, 40, 250/i, (i)/2, (Math.random()*300-150)/i, "water", Math.round(i/8) 
		));
	}
	
	title.init = function() {
		title.stage.addChild(background.plane);
		title.stage.addChild(waterBack.plane);
		waves.forEach(function(p) {
			title.stage.addChild(p.plane);
		});
		title.stage.addChild(logo);
		title.stage.addChild(createdby);
		title.stage.addChild(jam);
		
		fade.beginFill(0x000000);
		fade.drawRect(0, 0, 500, 280);
		fade.endFill();
		title.stage.addChild(fade);
	}
	
	title.z = 600;
	
	title.think = function() {
		
		if (!menu) {
			if (title.ticCount == 700 || Input.pressed("accept")) {
				menu = [
					Renderer.text("New Game", 210, 170),
					Renderer.text("Load Game", 210, 190),
					Renderer.text("Slot: " + Memory.slot, 190, 220),
				];
				
				menu.forEach(function(m) {
					title.stage.addChild(m);
					m.tint = 0x66FF00;
				});
		
				title.menuOption = Memory.file(Memory.slot) ? 1 : 0;
				menu[1 - title.menuOption].alpha = 0.4;
				txt();
			}
		
			return;
		}
		
		if (title.leaving) {
			if (fade.alpha >= 1) {
				if (title.menuOption) {
					Memory.load(true);
				} else {
					Memory.clear();
					Game.setScene(Level("Intro"));
				}
			}
			
			return;
		}
		
		if (Input.pressed("up")) {
			title.menuOption = 0;
			menu[0].alpha = 1;
			menu[1].alpha = 0.4;
		}
		
		if (Input.pressed("down")) {
			title.menuOption = 1;
			menu[1].alpha = 1;
			menu[0].alpha = 0.4;
		}
		
		if (Input.pressed("left")) {
			Memory.slot = (Memory.slot + 3) % 5 + 1;
			txt();
		}
		
		if (Input.pressed("right")) {
			Memory.slot = Memory.slot % 5 + 1;
			txt();
		}
		
		if (Input.pressed("accept")) {
			if (title.menuOption == 0 || Memory.file(Memory.slot)) {
				title.leaving = true;
			} else {
				// Indicate that this isn't possible
			}
		}
		
		function txt() {
			var file = Memory.file(Memory.slot);
			
			var list = { // SSSPPPOOOIIILLLEEERRRSSS.
				"Save 1": "Ocean",
				"Save 2": "Cavern",
				"Save 3": "Lair",
				"Save 4": "Final",
				"Intro": "Epilogue",
				"Save 5": "Closure",
			};
			
			var playtime = "0:00";
			
			if (file && file.global.time) {
				playtime = Math.floor(file.global.time / 3600) + ":"
					+ (Math.floor(file.global.time / 600) % 6) + ""
					+ (Math.floor(file.global.time / 60) % 10);
			}
			
			menu[2].text = "Slot: " + Memory.slot + " - " + (file ? list[file.lastStage] : "EMPTY")
				+ " (" + playtime + ")";
		}
	}
	
	title.render = function() {
		waves.forEach(function(p) {
			p.plane.tilePosition.x -= p.driftFactor + 0.01;
			
			p.plane.position.y = 150 - title.z*p.moveFactor + p.z;
		});
		
		waterBack.plane.position.y = Math.max(0, Math.min(150-(title.z/5), 170-(title.z*1.5)));
		waterBack.plane.scale.y = 280 - waterBack.plane.position.y;
		
		background.plane.position.y = (title.z/-6)-160;
		background.plane.tilePosition.x -= 0.3;
		
		logo.position.y = 50 - title.z;
		createdby.position.y = Math.min(500 - title.z, 250);
		jam.position.y = 200 - title.z;
		
		if (title.z > -50) {
			title.z --;
		}
		
		if (title.leaving) {
			fade.alpha += 0.02;
		} else if (fade.alpha > 0) {
			fade.alpha -= 0.005;
		}
	}
	
	return title;
};