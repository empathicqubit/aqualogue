Memory = (function() {
	var Memory = {};
	
	var data;
	
	Memory.clear = function() {
		data = {
			stages: {},
			lastStage: "Intro",
			
			global: {
				keys: [],
			},
		};
		
		Memory.global = data.global;
	}
	
	Memory.clear();
	
	Memory.stage = function(name) {
		if (!name) {
			return data.lastStage;
		}
		
		data.lastStage = name;
		
		if (!data.stages[name]) {
			data.stages[name] = {
				keys: {},
				doors: {},
			};
		}
		
		return data.stages[name];
	}
	
	Memory.storeDolphin = function(axis, position, z, momx, momy) {
		data.spawn = {
			axis: axis,
			position: position,
			z: z,
			momx: momx,
			momy: momy
		};
	}
	
	Memory.getDolphin = function() {
		return data.spawn;
	}
	
	Memory.slot = 1;
	
	Memory.save = function() {
		window.localStorage.setItem("dolphin-save-" + Memory.slot, JSON.stringify(data));
	}
	
	Memory.load = function(gotomap) {
		data = JSON.parse(window.localStorage.getItem("dolphin-save-" + Memory.slot));
		Memory.global = data.global;
		
		if (!data) { 
			Memory.clear();
		}
		
		if (gotomap) {
			Memory.loadStage();
		}
	}
	
	Memory.loadStage = function() {
		Game.setScene(Level(data.lastStage));
	}
	
	return Memory;
})();