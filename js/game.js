
// ---------------------------------------------------------------
//			All needed variables for individual game
// ---------------------------------------------------------------


var warningLine_Sprite;

var MAXBALLS = 2;

// for shooting
var balls_Group;
var paddle_Sprite;
var SPEEDINIT = 300;
var speed;

var targets_Group;
var drops_Group;
// could be used to start a level further down
var starting_Block = 135;
var starting_Real = starting_Block+10;

// needed to create the entire field
var fieldWidth = 12;
var fieldHeight = 18;

// particle emitter for hits
var emitter;
var hitCounter;

// sounds
var hits_Audio = [];

var ballVelocity = new Phaser.Point();

var totalBricks;

var lives = 3;
var lives_Group;

var fireball;



// ---------------------------------------------------------------
// 				This function removes a brick at an index
// ---------------------------------------------------------------

function removeBrick(idx){
	targets_Group.getAt(idx).kill();
	targets_Group.getAt(idx).frame = 0;	

	emitter.x = targets_Group.getAt(idx).x;
	emitter.y = targets_Group.getAt(idx).y;
	emitter.start(true, 1000, null, 5);
	emitter.update();

	var dropDecision = game.rnd.integerInRange(0, 4);
	if(dropDecision == 1){
		dropItem(targets_Group.getAt(idx).x, targets_Group.getAt(idx).y);
	}
}



// ---------------------------------------------------------------
// 				This function drops a speical item
// ---------------------------------------------------------------

function dropItem(posX, posY){	
	var item = game.rnd.integerInRange(0,3);
	var drop = drops_Group.create(posX, posY, 'drops', item);
	drop.anchor.set(0.5);
	drop.scale.set(0.33);
	game.physics.enable(drop, Phaser.Physics.ARCADE);
	drop.enableBody = true;
	drop.body.velocity.y = 100;
}



// ---------------------------------------------------------------
// 				This function removes a life
// ---------------------------------------------------------------

function loseLife(){
	if(lives == 0){
		gameOver(true);
	}else{
		if(balls_Group.countLiving() == 0){
			lives--;
			balls_Group.getAt(0).reset(game.world.centerX, 550-game.world.centerX*yOffsetPerPx);
			balls_Group.getAt(0).isMoving = false;
			balls_Group.getAt(0).body.velocity.set(0, 0);
			balls_Group.getAt(0).ceilingHit = false;
			lives_Group.getAt(lives).kill();
		}
	}
}

