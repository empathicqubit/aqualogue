ScrollPlane = function(x, z, height, moveFactor, turnFactor, driftFactor, graphic, zIndex) {
	var scrollPlane = {};
	
	scrollPlane.plane = PIXI.extras.TilingSprite.fromImage("assets/tiles/"+graphic+".png",
						500/moveFactor, height);
	scrollPlane.z = z;
	scrollPlane.moveFactor = moveFactor;
	scrollPlane.turnFactor = turnFactor;
	scrollPlane.driftFactor = driftFactor;
	scrollPlane.plane.tilePosition.x = x;
	scrollPlane.plane.ZINDEX = zIndex;
	scrollPlane.plane.scale.set(moveFactor, moveFactor);
	
	return scrollPlane;
};