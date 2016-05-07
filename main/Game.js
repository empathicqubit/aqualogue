Game = (function() {
	var Game = {};
	
	var currentScene, incomingScene;
	
	Game.init = function(callback) {
		Renderer.init(initScene);
		
		function initScene() {
			// Run callback to set the inital scene.
			callback();
			currentScene = incomingScene;
			currentScene.init();
			
			gameLoop();
		}
	}
	
	Game.setScene = function(scene) {
		incomingScene = scene;
	}
	
	var frameskipMonitor = 0;
	
	function gameLoop() {
		requestAnimationFrame(gameLoop);
		
		flipScenes();
		currentScene.ticCount++;
		currentScene.think();
		render();
	}
	
	function flipScenes() {
		if (currentScene != incomingScene) {
			currentScene.end();
			incomingScene.init();
			currentScene = incomingScene;
		}
	}
	
	function render() {
		frameskipMonitor++;
		if (frameskipMonitor >= Renderer.frameskip) {
			frameskipMonitor = 0;
			
			currentScene.render(Renderer.frameskip);
			Renderer.show(currentScene.stage);
		} else {
			Renderer.skip();
		}
	}
	
	return Game;
})();