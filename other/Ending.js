Ending = function() {
	var ending = Scene();
	
	var fade;
	
	ending.init = function() {
		ending.stage.addChild(PIXI.Sprite.fromImage("assets/cutscene/ending.png"));
		ending.stage.addChild(Renderer.text("Your adventure is now over.", 250, 220));
		fade = new PIXI.Graphics();
		fade.beginFill(0xFFFFFF);
		fade.drawRect(0, 0, 500, 280);
		fade.endFill();
		ending.stage.addChild(fade);
		
		Music.fadeout(3000);
	}
	
	ending.think = function() {
		fade.alpha -= 0.005;
	}
	
	return ending;
};