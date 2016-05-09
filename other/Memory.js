Memory = (function() {
	var Memory = {};
	
	var data;
	
	Memory.clear = function() {
		data = {
			stages: {},
			lastStage: "NONE",
			
			global: Memory.global = {
				keys: [],
			},
		};
	}
	
	Memory.clear();
	
	Memory.stage = function(name) {
		data.lastStage = name;
		
		if (!data.stages[name]) {
			data.stages[name] = {
				keys: {}
			};
		}
		
		return data.stages[name];
	}
	
	return Memory;
})();