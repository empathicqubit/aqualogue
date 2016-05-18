Cutscene = function(name) {
	var data = CutsceneDatabase[name];
	
	var image, text, currentLine = "";
	
	var lineNumber = -1;
	var lineTimer = 0;
	
	var cutscene = Scene();
	
	var fade;
	
	cutscene.init = function() {
		if (data.music) {
			Music.play(data.music, name != "intro");
		}
	}
	
	cutscene.think = function() {
		if (!lineTimer) {
			lineNumber++;
			
			currentLine = data.lines[lineNumber];
			
			if (!currentLine) {
				cutscene.think = fadeout;
				cutscene.stage.setChildIndex(fade, cutscene.stage.children.length - 1);
				return;
			}
			
			lineTimer = 200;
			
			if (text) {
				cutscene.stage.removeChild(text);
				text = undefined;
			}
			
			var imagechange = lineNumber == 0 || (data.lines[lineNumber - 1].pic != currentLine.pic);
			
			if (imagechange) {
				if (image) {
					var oldimg = image;
					out();
					
					function out() {
						oldimg.alpha -= 0.05;
						if (oldimg.alpha) {
							window.setTimeout(out, 20);
						}
					}
				}
				
				if (currentLine.pic) {
					image = PIXI.Sprite.fromImage("assets/cutscene/" + currentLine.pic + ".png");
					cutscene.stage.addChild(image);
					image.alpha = 0;
					unout();
					
					function unout() {
						image.alpha += 0.05;
						if (image.alpha < 1) {
							window.setTimeout(unout, 20);
						}
					}
				}
			}
			
			var delay;
			
			if (lineNumber == 0) {
				delay = 1100;
			} else if (imagechange) {
				delay = 400;
			} else {
				delay = 0;
			}
			
			window.setTimeout(function() {
				text = Renderer.typewriterText(currentLine.text, 290, 11);
				cutscene.stage.addChild(text);
				
				if (name == "boss") {
					text.tint = 0xFF0000;
				}
			}, delay);
		}
		
		if (text) {
			if (text.spot >= currentLine.text.length) {
				lineTimer--;
				
				if (Input.pressed("accept")) {
					lineTimer = 0;
				}
				
			} else if (Input.pressed("accept")) {
				text.spot = currentLine.text.length - 1;
			}
		}
		
		if (!fade) {
			fade = new PIXI.Graphics();
			fade.beginFill(0);
			fade.drawRect(0, 0, 500, 280);
			fade.endFill();
			cutscene.stage.addChild(fade);
		} else if (fade.alpha > 0) {
			fade.alpha -= 0.01;
		}
	}
	
	function fadeout() {
		if (fade.alpha < 1) {
			fade.alpha += 0.01;
		} else {
			Game.setScene(data.end());
		}
	}
	
	return cutscene;
};