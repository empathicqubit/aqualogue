Input = (function() {
	var Input = {};
	
	var keys = {};
	
	var frameThis = {};
	var frameLast = {}; 
	
	var usedKeys = {};
	
	Input.controls = {
		up: 87, // W
		down: 83, // S
		left: 65, // A
		right: 68, // D
		
		dash: 13, // Enter
		
		accept: 13, // Enter
		cancel: 8, // Backspace
	};
	
	Input.setControl = function(control, key) {
		Input.controls[control] = key;
		
		updateControls();
	}
	
	updateControls();
	
	function updateControls() {
		usedKeys = {};
		
		for (idx in Input.controls) {
			if (Input.controls.hasOwnProperty(idx)) {
				usedKeys[Input.controls[idx]] = true;
			}
		}
	}
	
	window.addEventListener("keydown", function(event) {
		if (usedKeys[event.keyCode]) {
			event.preventDefault();
			keys[event.keyCode] = true;
		}
	});
	
	window.addEventListener("keyup", function(event) {
		if (usedKeys[event.keyCode]) {
			event.preventDefault();
			keys[event.keyCode] = false;
		}
	});
	
	Input.refresh = function() {
		for (idx in Input.controls) {
			frameLast[idx] = frameThis[idx];
			frameThis[idx] = keys[Input.controls[idx]];
		}
	}
	
	Input.held = function(control) {
		return frameThis[control];
	}
	
	Input.pressed = function(control) {
		return frameThis[control] && !frameLast[control];
	}
	
	Input.released = function(control) {
		return !frameThis[control] && frameLast[control];
	}
	
	return Input;
})();