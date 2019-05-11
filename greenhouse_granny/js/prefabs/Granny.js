//Creating Granny function
Granny = function(game, x, y) {

	Phaser.Sprite.call(this, game, x, y, 'granny');

	//Setting some attributes for granny
	this.anchor.set(0.5);
	game.physics.enable(this);
	this.body.collideWorldBounds = true;
	this.facing = 'left';
	this.scale.setTo(1, 1);
	this.body.gravity.y = 800;
	var health;
	this.isJumping = false;
	this.doubleJumpReady = false;
	this.jumps = 2;
	this.anchorScale = this.scale.x;
}

//Creating a prototype for granny
Granny.prototype = Object.create(Phaser.Sprite.prototype);
Granny.prototype.constructor = Granny;

//Update funtion for granny
Granny.prototype.update = function() {

	//Creating a variable for the right key
	var rightkey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
	var leftkey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
	var upkey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
	
	//Basic movement handling if statements
	this.body.velocity.x = 0;

	if (rightkey.isDown) {
		this.facing = "right";
		this.scale.x = -this.anchorScale;
		this.body.velocity.x = 400;
		//play move right animation
	}
	else if (leftkey.isDown) {
		this.facing = 'left';
		this.scale.x = this.anchorScale;
		this.body.velocity.x = -400;
		//play move left animation
	}
	else{
		//play idle animation if on ground
	}

    //Double jumping logic
	if (upkey.isDown && this.isJumping == false) {
		if (this.jumps == 2) {
			this.body.velocity.y = -350;
			this.isJumping = true;
			//play jumping animation
			--this.jumps;
		}
	}
	if (upkey.isUp && this.isJumping == true) {
			this.doubleJumpReady = true;
			//play jumping animation
	}
	if (upkey.isDown && this.doubleJumpReady == true) {
		if (this.jumps == 1) {
			console.log("J3");
			this.body.velocity.y = -350;
			this.doubleJumpReady = false;
			//play jumping animation
			--this.jumps;
		}
	}
	//This if statement is specific to the players y positional value when on the ground
	//Will need to be changed once platforms are added
	if (this.y == 568) {
		this.isJumping = false;
		this.jumps = 2;
	}

}
