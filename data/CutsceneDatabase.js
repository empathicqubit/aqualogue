CutsceneDatabase = {};

CutsceneDatabase.intro = {
	music: "ocean",
	lines: [
		{pic: "intro1", "text": "Once upon a time, there\nwas a beautiful undersea\nkingdom."},
		{pic: "intro2", "text": "The queen ruled over her\nsubjects lovingly, and\neverything was peaceful."},
		{pic: "intro3", "text": "Soon, her son - the prince\n- was to marry a princess\nfrom far away."},
		{pic: "intro3", "text": "But on the day of her visit,\nsomething terrible\nhappened..."},
		{pic: "intro1", "text": "...And the prince woke to\nfind the entire royal guard\nmissing."},
		{pic: "intro1", "text": "The guards. The queen - his\nmother. And the princess."},
		{pic: undefined, "text": "Alone, but fearless, he set\noff to find his family."},
	],
	end: function() {
		return Level("Intro");
	}
};

CutsceneDatabase.boss = {
	music: "preboss",
	lines: [
		{pic: "boss1", "text": "HEHEHE... SO YOU\nDECIDED TO SHOW UP\nAFTER ALL, I SEE."},
		{pic: "boss1", "text": "UNFORTUNATELY FOR\nYOU, YOU'RE TOO LATE.\nTHE PRINCESS IS MINE."},
		{pic: "boss2", "text": "AND NONE OF YOU\nFILTHY SEA CREATURES\nCAN SAVE HER."},
		{pic: "boss2", "text": "YOUR ENTIRE KINGDOM\nWILL TREMBLE IN MY\nPRESENCE."},
		{pic: "boss3", "text": "BUT ENOUGH TALK.\nHAVE AT THEE!"},
	],
	end: function() {
		return Level("Boss 1");
	}
};

CutsceneDatabase.ending = {
	music: "ending",
	lines: [
		{pic: undefined, "text": "And so, the prince returned\nhome to his subjects."},
		{pic: undefined, "text": "Everyone in the royal family\ncame back safe and sound."},
		{pic: undefined, "text": "Except for the princess."
								// lol length padding
								+ "                                                                            "
								+ "                                                                            "},
	],
	end: function() {
		var title = Title();
		title.z = -50;
		title.ticCount = 650;
		return title;
	}
};