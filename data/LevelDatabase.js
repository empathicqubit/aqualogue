LevelDatabase = {

	"Test Level": {
		
		axes: [
			{
				x: 768, y: 768,
				radius: -256,
				angle: 180,
				length: 360,
				
				// Multiple switches are [bottom switch, boundary, middle switch, boundary, top switch]
				left: [4],
				right: [1]
			},
			{
				x: 1152, y: 768,
				radius: 128,
				angle: 180,
				length: 180,
				
				// Multiple switches are [bottom switch, boundary, middle switch, boundary, top switch]
				left: [0],
				right: [2]
			},
			{
				x: 1280, y: 768,
				radius: 0,
				angle: 270,
				length: 512,
				
				// Multiple switches are [bottom switch, boundary, middle switch, boundary, top switch]
				left: [1],
				right: [3]
			},
			{
				x: 1152, y: 1280,
				radius: 128,
				angle: 0,
				length: 180,
				
				// Multiple switches are [bottom switch, boundary, middle switch, boundary, top switch]
				left: [2],
				right: [4]
			},
			{
				x: 1024, y: 1280,
				radius: 0,
				angle: 90,
				length: 512,
				
				// Multiple switches are [bottom switch, boundary, middle switch, boundary, top switch]
				left: [3],
				right: [0]
			}
		],
		
		rocks: [
			{x: 768, y: 798, z: -256, type: "tall"},
			{x: 738, y: 768, z: -256, type: "short"},
			{x: 768, y: 738, z: -256, type: "tall"},
			{x: 798, y: 768, z: -256, type: "short"},
			
			{x: 1536, y: 798, z: -256, type: "tall"},
			{x: 1506, y: 768, z: -256, type: "short"},
			{x: 1536, y: 738, z: -256, type: "tall"},
			{x: 1566, y: 768, z: -256, type: "short"}
		],
		
		spawn: {
			axis: 0,
			position: 1,
			z: 0
		}
		
	}

};