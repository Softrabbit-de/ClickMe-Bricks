// ---------------------------------------------------------------
//					Needed for clay.io services
// ---------------------------------------------------------------

// individual id and name for each game
// var leaderBoard_ID = 4652;
// var clayName = "clickmenshoot";
// var leaderboard;



// ---------------------------------------------------------------
//			All needed variables for clickMe environment
// ---------------------------------------------------------------

// this array assigns each special item a price ... needed for each game individually
var SPECIAL_PRICES = [7,8];
var SPECIAL_NAMES = ["Baaalls", "Fireball"];
var ARCHIEVEMENT_POINTS = 300;

// this describes the four badges
var badgeInfo = ["You earned this for...\nbeating the tutorial.", "You earned this for...\n10 hits in a row.", "You earned this for...\ngetting " + ARCHIEVEMENT_POINTS + "Pts.", "You earned this for...\ncompleting the game."];

var version = 1.0;
var googlePlayAppId = "com.softrabbit.clickMeBricks";

var hasLevels = true;
var levelsAvailable = 0;
var TOTAL_LEVELS = 15;

var changelog = [""];

var credits1 = "Graphics\nFonts\n\nSounds";
var credits2 = "made by Freepik.com\nPoetsenOne-Regular\nArchitectsDaughter\njobro (www.freesound.org)\nEric (www.soundimage.org)";

// ---------------------------------------------------------------
// 			These variables define the controls in the game
// ---------------------------------------------------------------
// evaluate the orientation sensor
var controls_orientation = false;

// allows to drag and drop the button along a line
var controls_llrr = true;

// allows to swype the button up,down
var controls_ud = false;
// allows to swype the button left,right
var controls_lr = false;

// if phone orientation is allowed at all
var controls_alllowSensor = false;




// ---------------------------------------------------------------
//			The initial function that loads stuff
// ---------------------------------------------------------------

function preloadGame() {
	if(logging)
		console.log("PreloadGame");

	game.load.audio('hit1', 'sounds/39200__jobro__piano-ff-052.wav', true);
	game.load.audio('hit2', 'sounds/39203__jobro__piano-ff-055.wav', true);
	game.load.audio('hit3', 'sounds/39206__jobro__piano-ff-058.wav', true);
	game.load.audio('hit5', 'sounds/39209__jobro__piano-ff-061.wav', true);
	game.load.audio('hit4', 'sounds/39212__jobro__piano-ff-064.wav', true);
	game.load.spritesheet('bricksCollection1', 'img/bricks.png', 110, 49);
	game.load.spritesheet('bricksCollection0', 'img/bricksGray.png', 110, 49);
    game.load.image('paddle', 'img/paddle.png');
    game.load.spritesheet('ball', 'img/ball.png', 40, 40);
    game.load.image('warningLine', 'img/warningLine.png');
    game.load.spritesheet('drops', 'img/drops.png', 101, 115);
	game.load.text('levels', 'js/levels.txt');

	if(logging)
		console.log("/PreloadGame");
}



// ---------------------------------------------------------------
//			The initial function that creates the scene
// ---------------------------------------------------------------

function createGame() {
	if(logging)
		console.log("CreateGame");

	// load sounds
	hits_Audio[0] = game.add.audio('hit1');
	hits_Audio[1] = game.add.audio('hit2');
	hits_Audio[2] = game.add.audio('hit3');
	hits_Audio[3] = game.add.audio('hit4');
	hits_Audio[4] = game.add.audio('hit5');

	// convert the levels once to json
	levels = game.cache.getText('levels').split(/\n\s*\n|\r\n\s*\r\n/);

	fireball = false;

	// draw warning line
	warningLine_Sprite = game.add.sprite(0, 495, 'warningLine');
	warningLine_Sprite.alpha = 0.1;

	paddle_Sprite = game.add.sprite(game.world.centerX, 540, 'paddle');
	paddle_Sprite.anchor.set(0.5);
	paddle_Sprite.scale.set(0.5);
    game.physics.enable(paddle_Sprite, Phaser.Physics.ARCADE);
	paddle_Sprite.enableBody = true;
	paddle_Sprite.body.immovable = true;

	// ball
	balls_Group = game.add.group();
	for(var l=0; l<2; ++l){
		var ball = balls_Group.create(game.world.centerX, 550-game.world.centerX*yOffsetPerPx, 'ball');
		ball.anchor.set(0.5);
		ball.scale.set(0.5);
		game.physics.enable(ball, Phaser.Physics.ARCADE);
		ball.enableBody = true;
		ball.body.collideWorldBounds = true;
		ball.body.bounce.setTo(1, 1);
		ball.isMoving = false;
		ball.kill();
	}

	// this includes all the bricks to shoot at
	targets_Group = game.add.group();
    drops_Group = game.add.group();

	// create the grid for the entire game
	// create dummy lines
	for(var j=0; j<fieldHeight; ++j) {
		for(var i=0; i<fieldWidth; ++i) {
			var idx = j*fieldWidth + i;

			var target = game.add.sprite(0, 0, 'bricksCollection' + Number(colorOn), 0);
			target.anchor.set(0.5);
			target.scale.set(0.33);
			targets_Group.add(target);
			game.physics.enable(target, Phaser.Physics.ARCADE);
			target.enableBody = true;
			target.body.immovable = true;
			target.kill();
		}
	}	
	targets_Group.alpha = 0;


	// particle emitter for exploding boxes
	emitter = game.add.emitter(0, 0, 50);
	emitter.makeParticles('bricksCollection' + Number(colorOn), 0);
    emitter.setScale(0.5, 0, 0.5, 0, 1000);
	emitter.setAlpha(0.3, 0.5);
	emitter.minParticleSpeed.setTo(-200, -200);
    emitter.maxParticleSpeed.setTo(200, 200);

	if(logging)
		console.log("/CreateGame");
}



// ---------------------------------------------------------------
//		The initial function that creates the HUD elements
// ---------------------------------------------------------------

function createHUDGame(){
	if(logging)
		console.log("CreateHUDGame");

	// this includes all the bricks to shoot at
	lives_Group = game.add.group();
	for(var l=0; l<lives; ++l){
		var life_Sprite = game.add.sprite(180 + l*35, 47 - l*35*yOffsetPerPx, 'ball');
		life_Sprite.anchor.set(0.5);
		life_Sprite.scale.set(0.75);
		lives_Group.add(life_Sprite);
		life_Sprite.kill();
	}

	hud_Group.add(lives_Group);


	if(logging)
		console.log("/CreateHUDGame");
}



// ---------------------------------------------------------------
//				This function starts the next level
// 				it needs to reset any  game parameters
// ---------------------------------------------------------------

function nextLevelGame(){
	hitCounter = 0;

	for(var b=0; b<MAXBALLS; ++b)
		balls_Group.getAt(b).kill();

	drops_Group.removeAll(true);

	paddle_Sprite.x = game.world.centerX;
	paddle_Sprite.y = 540;
	
	balls_Group.getAt(0).reset(game.world.centerX, paddle_Sprite.y - balls_Group.getAt(0).height);
	balls_Group.getAt(0).isMoving = false;
	balls_Group.getAt(0).body.velocity.set(0, 0);
	speed = SPEEDINIT + 20*level;
/*
	if(level == 1 || level == 2)
		colorCount++;

	// change game specific parameters
	if(level != 0){
		// add colors in every second level
		if(level%3==0 && startLines < 6)
			startLines++;
		if((level%3==1 && colorCount<TOTAL_TARGET_COLORS)){
			colorCount++;
			if(level != 1)
				startLines--;
		}
		if(level%11==10 && blackStones < 3){

			// archievement
			if(!badges[3].visible){
				earnArchievement(3);
			}

			blackStones++;
		}
	}

	// create dummy lines
	for(var j=0; j<fieldHeight; ++j) {
		for(var i=0; i<fieldWidth; ++i) {
			var idx = j*fieldWidth + i;

			var xOffset = 90;
			var x = xOffset + i*90;
			var y = (starting_Real) + j*30 - x*yOffsetPerPx;
			targets_Group.getAt(idx).x = x;
			targets_Group.getAt(idx).y = y;
			targets_Group.getAt(idx).hasCollided = false;

			if(j<startLines){
				totalBricks++;
				var blackDecision = game.rnd.integerInRange(0, 6);
				targets_Group.getAt(idx).loadTexture('bricksCollection' + Number(colorOn));
				if(blackDecision <= 6-blackStones)
					targets_Group.getAt(idx).frame = game.rnd.integerInRange(1,colorCount);
				else
					targets_Group.getAt(idx).frame = 0;

				targets_Group.getAt(j*fieldWidth+i).revive();
			}
		}
	}
*/
	// kill all bricks (needed for black stones)
	for(var j=0; j<fieldHeight; ++j) {
		for(var i=0; i<fieldWidth; ++i) {
			var idx = j*fieldWidth + i;
			targets_Group.getAt(idx).kill();
		}
	}

	var levelTxt = levels[level];
	var levelRows = levelTxt.split("\n");
	var levelRow;

	for(var j=0; j<fieldHeight; ++j) {
		if(j< levelRows.length)
			levelRow = levelRows[j].split(" ");
		for(var i=0; i<fieldWidth; ++i) {
			var idx = j*fieldWidth + i;

			var xOffset = 29;
			var x = xOffset + i*44;
			var y = (starting_Real) + j*20 - x*yOffsetPerPx;
			targets_Group.getAt(idx).x = x;
			targets_Group.getAt(idx).y = y;
			targets_Group.getAt(idx).hasCollided = false;

			if(j<levelRows.length){
				var frame = parseInt(levelRow[i]);
				if(!isNaN(frame)){
					if(frame != 0)
						totalBricks++;
					
					targets_Group.getAt(idx).frame = frame;
					targets_Group.getAt(j*fieldWidth+i).revive();
				}
			}
		}
	}
}



// ---------------------------------------------------------------
//		This function has all calls if the button is pressed
// ---------------------------------------------------------------

function mightyButtonPressedGame() {
	// for the initial state
	if(mightyButtonState == "init") {
		if(logging)
			console.log("INITGame");
		
		totalBricks = 0;

		// reset all gaming parameters
		lives = 3;
		
		// show targets
		targets_Group.alpha = 1;

		paddle_Sprite.visible = true;
		warningLine_Sprite.visible = true;

		for(var l=0; l<lives; ++l){
			lives_Group.getAt(l).revive();
		}

		for(var j=0; j<fieldHeight; ++j) {
			for(var i=0; i<fieldWidth; ++i) {
				var idx = j*fieldWidth + i;

				targets_Group.getAt(idx).frame = 0;
				targets_Group.getAt(idx).kill();
			}
		}

		if(logging)
			console.log("/INITGame");
	} else if(mightyButtonState == "open") {
		if(logging)
			console.log("SHOT");
	}
}



// ---------------------------------------------------------------
//		This function is always called by phaser on repaint
// ---------------------------------------------------------------

function updateGame(){
	paddle_Sprite.x = mightyButton_Sprite.x;
	paddle_Sprite.y = 540 + ( game.world.centerX - paddle_Sprite.x) * yOffsetPerPx;

	if(!paused){
		// here we connect the ball and the targets
		if(fireball){
			game.physics.arcade.overlap(targets_Group, balls_Group, collisionHandlerGame, null, this);
		}else{
			game.physics.arcade.collide(targets_Group, balls_Group, collisionHandlerGame, null, this);
		}
		game.physics.arcade.collide(paddle_Sprite, balls_Group, collisionHandlerGame, null, this);

		if(drops_Group.countLiving()){
			game.physics.arcade.overlap(paddle_Sprite, drops_Group, collisionHandlerGame, null, this);
		}

		drops_Group.forEachAlive(function(drop){if(drop.y>game.world.height) drop.kill();}, this);

		for(var b=0; b<MAXBALLS; ++b){
			var ball = balls_Group.getAt(b);
			if(ball.alive){
				if(!ball.ceilingHit && ball.body.y < starting_Block - ball.body.x*yOffsetPerPx){
					ball.ceilingHit = true;
					ball.body.velocity.y = -ball.body.velocity.y;
				}

				if(ball.y > 800){
					ball.kill();
					loseLife();
				}

				if(game.time.now - ball.lastHit > 8500 && ball.isMoving){
					ball.lastHit = game.time.now;
					ball.body.velocity.set(0);
					ball.isMoving = false;
					ball.body.enable = false;
				    game.add.tween(ball).to( { x: paddle_Sprite.x, y: paddle_Sprite.y-ball.height}, 500, Phaser.Easing.Linear.None, true);
				    setTimeout("balls_Group.getAt("+b+").ceilingHit=false;balls_Group.getAt("+b+").isMoving=false;balls_Group.getAt("+b+").body.enable = true;", 501);
				}

				if(!ball.isMoving && mightyButtonState == "open"){
					ball.x = paddle_Sprite.x;
					ball.y = paddle_Sprite.y - ball.height;
				}
			}
		}
	}
}



// ---------------------------------------------------------------
//		This function is called after official game over
// ---------------------------------------------------------------

function gameOverGame(){
	balls_Group.forEachAlive(function(ball){
		ball.body.velocity.set(0, 0);
		ball.isMoving = false;
/*		ball.x = paddle_Sprite.x;
		ball.y = paddle_Sprite.y - ball.height;*/
		ball.reset(paddle_Sprite.x, paddle_Sprite.y-balls_Group.getAt(0).height);
	}, this);
}


// ---------------------------------------------------------------
// 			This switches the upcoming item to special
// ---------------------------------------------------------------

function specialButtonPressedGame(item){
	if(item == 0){
		var ball = balls_Group.getFirstDead();
		ball.x = balls_Group.getFirstAlive().x;
		ball.y = balls_Group.getFirstAlive().y;
		ball.lastHit = balls_Group.getFirstAlive().lastHit;
		if(balls_Group.getFirstAlive().isMoving){
			ball.body.velocity.x = -balls_Group.getFirstAlive().body.velocity.x;
			ball.body.velocity.y = balls_Group.getFirstAlive().body.velocity.y;
			ball.isMoving = true;
		}else{
			ball.isMoving = false;
		}
		ball.revive();
	}
	if(item == 1){
		fireball = true;
		balls_Group.setAll('frame', 1);
		setTimeout("fireball = false;balls_Group.setAll('frame', 0);", 6000);
	}
}



// ---------------------------------------------------------------
//		This function is the listener for collisions
// ---------------------------------------------------------------

function collisionHandlerGame(target, target1){
	if(logging)
		console.log("collisionHandlerGame([" + target1.x + "," + target1.y + "], [" + target.x + "," + target.y + "])");

	if(target1.key == 'ball'){
		target1.ceilingHit = false;
		if(target == paddle_Sprite){
			hitCounter = 0;
			var xDiff = (target1.body.x + target1.body.halfWidth - (paddle_Sprite.body.x + paddle_Sprite.body.halfWidth)) / paddle_Sprite.body.halfWidth;
			target1.body.velocity.x = xDiff * speed;
			target1.lastHit = game.time.now;
		}else{
			if(!target.hasCollided && target.frame != 0 && !fireball) {
				hitCounter++;
				if(hitCounter > 10 && !badges[1].visible){
					earnArchievement(1);
				}

				target1.lastHit = game.time.now;

				target.hasCollided = true;
				var idx = 0;
				while(targets_Group.getAt(idx) != target && idx<targets_Group.length-1)
					idx++;

				targets_Group.getAt(idx).frame--;

				if(soundOn){
					hits_Audio[target.frame].play();
				}

				if(target.frame == 0){
					removeBrick(idx);
					totalBricks--;
					if(totalBricks == 0)
						nextLevel();
				}else{
					setTimeout("targets_Group.getAt(" + idx + ").hasCollided = false;", 200);
				}

				points++;
				coin_Points++;
				updatePoints();
			}
			if(fireball){
				target1.lastHit = game.time.now;

				var idx = 0;
				while(targets_Group.getAt(idx) != target && idx<targets_Group.length-1)
					idx++;

				if(target.frame != 0){
					totalBricks--;
					if(totalBricks == 0)
						nextLevel();
				}
				removeBrick(idx);

				points++;
				coin_Points++;
				updatePoints();

			}
		}
	}

	if(target1.key == 'drops'){
		if(target1.frame == 0 && paddle_Sprite.width > 40){
			game.add.tween(paddle_Sprite).to( { width: paddle_Sprite.width-40}, 300, Phaser.Easing.Linear.None, true);
			setTimeout("game.add.tween(paddle_Sprite).to( { width: paddle_Sprite.width+40}, 300, Phaser.Easing.Linear.None, true);", 6000);
		}
		if(target1.frame == 1 && speed < SPEEDINIT*4){
			for(var b=0; b<MAXBALLS; ++b){
				var ball = balls_Group.getAt(b);
				if(ball.alive){
					balls_Group.getAt(b).body.velocity.x *= 1.5;
					balls_Group.getAt(b).body.velocity.y *= 1.5;
					speed *= 1.5;
					setTimeout("balls_Group.getAt("+b+").body.velocity.x /= 1.5; balls_Group.getAt("+b+").body.velocity.y /= 1.5; speed /= 1.5", 6000);
				}
			}
		}
		if(target1.frame == 2){
			game.add.tween(paddle_Sprite).to( { width: paddle_Sprite.width+40}, 300, Phaser.Easing.Linear.None, true);
			setTimeout("game.add.tween(paddle_Sprite).to( { width: paddle_Sprite.width-40}, 300, Phaser.Easing.Linear.None, true);", 6000);
		}
		if(target1.frame == 3){
			for(var b=0; b<MAXBALLS; ++b){
				var ball = balls_Group.getAt(b);
				if(ball.alive){
					balls_Group.getAt(b).body.velocity.x /= 1.5;
					balls_Group.getAt(b).body.velocity.y /= 1.5;
					speed /= 1.5;
					setTimeout("balls_Group.getAt("+b+").body.velocity.x *= 1.5; balls_Group.getAt("+b+").body.velocity.y *= 1.5; speed *= 1.5", 6000);
				}
			}
		}
		target1.kill();
	}

	if(logging)
		console.log("/collisionHandlerGame");
}


// ---------------------------------------------------------------
// 				This toggles the preferences on/off
// ---------------------------------------------------------------

function updateColorGame(){
	for(var i=0; i<targets_Group.length; ++i){
		var tmp = targets_Group.getAt(i).frame;
		targets_Group.getAt(i).loadTexture('bricksCollection' + Number(colorOn));
		targets_Group.getAt(i).frame = tmp;
	}
}


// ---------------------------------------------------------------
// 				This is called while dragging
// ---------------------------------------------------------------

function dragStartedGame(){
}
function dragStoppedGame(){
	for(var b=0; b<MAXBALLS; ++b){
		var sign = (b%2 == 1) ? -1 : 1;
		var ball = balls_Group.getAt(b);

		if(!ball.isMoving && mightyButtonState == "open" && !paused){
			balls_Group.getAt(b).body.velocity.setTo(sign*speed, -speed);
			ball.isMoving = true;
		    ball.lastHit = game.time.now;
		}
	}
}



// ---------------------------------------------------------------
// 			This is called when the pause screen is shown
// ---------------------------------------------------------------

function pauseButtonPressedGame(){
}



// ---------------------------------------------------------------
// 			This is called when the shop screen is shown
// ---------------------------------------------------------------

function shopButtonPressedGame(){
}



// ---------------------------------------------------------------
// 		This is called when the close button is pressed
// ---------------------------------------------------------------

function closeButtonPressedGame(){
}



// ---------------------------------------------------------------
// 			This is called when a tutorial is shown
// ---------------------------------------------------------------

function hideForTutGame(time){
	targets_Group.alpha = 0.2;
	setTimeout("continueAfterTuTScreen()", time);
}
function continueAfterTuTScreen(){
	targets_Group.alpha = 1;
}



// ---------------------------------------------------------------
// 			This is called when the game is paused
// ---------------------------------------------------------------

function pauseGame(){
	paused = true;

	if(balls_Group.countLiving()){
		ballVelocity.x = balls_Group.getFirstAlive().body.velocity.x;
		ballVelocity.y = balls_Group.getFirstAlive().body.velocity.y;

		balls_Group.forEachAlive(function(ball){
			ball.body.velocity.set(0, 0);
			ball.lastHitTmp = game.time.now - ball.lastHit;
		}, this);
	}

	if(drops_Group.countLiving()){
		drops_Group.setAll('body.velocity.y', 0);
	}
}
function unpauseGame(){	
	balls_Group.forEachAlive(function(ball){
		ball.body.velocity.set(ballVelocity.x, ballVelocity.y);
		ball.lastHit = game.time.now - ball.lastHitTmp;
	}, this);

	if(drops_Group.countLiving()){
		drops_Group.setAll('body.velocity.y', 100);
	}

	paused = false;
}



// ---------------------------------------------------------------
// 			This is called when the game is paused
// ---------------------------------------------------------------

function winGame(){
	for(var b=0; b<MAXBALLS; ++b)
		balls_Group.getAt(b).kill();
	drops_Group.removeAll(true);
	paddle_Sprite.visible = false;
	warningLine_Sprite.visible = false;
}



// ---------------------------------------------------------------
// 			This checks if special is playable now
// ---------------------------------------------------------------

function itemPlayableGame(item){
	if(item == 0 && balls_Group.countLiving() >= MAXBALLS)
		return false;
	else
		return true;
}



// ---------------------------------------------------------------
// 			This does rendering features (display debug)
// ---------------------------------------------------------------

function renderGame(){
	// if(bugFound){
	// }
}