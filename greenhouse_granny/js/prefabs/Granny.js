//Creating Granny function
Granny = function(game, x, y) {

	Phaser.Sprite.call(this, game, x, y, 'granny');

	//Setting some attributes for granny
	game.physics.enable(this);
	this.body.collideWorldBounds = true;
	this.facing = 'left';
	this.scale.setTo(0.5, 0.5);
	this.anchor.set(0.5);
	this.body.gravity.y = 800;

	this.onGround = false;
	Granny.MAX_AIR_JUMPS = 1;
	Granny.MOVE_SPEED = 400;
	Granny.JUMP_HEIGHT = 650;
	this.airJumps = 1;
	this.anchorScale = this.scale.x;

	this.keyRight = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
	this.keyLeft = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
	this.keyUp = game.input.keyboard.addKey(Phaser.Keyboard.UP);
}

//Creating a prototype for granny
Granny.prototype = Object.create(Phaser.Sprite.prototype);
Granny.prototype.constructor = Granny;

//Update funtion for granny
Granny.prototype.update = function() {
	this.onGround = this.body.touching.down;
	
	//Basic movement handling if statements
	if (this.keyRight.isDown) {
		this.facing = 'right';
		this.scale.x = this.anchorScale;
		this.body.velocity.x = Granny.MOVE_SPEED;
		//play move right animation
	}
	else if (this.keyLeft.isDown) {
		this.facing = 'left';
		this.scale.x = -this.anchorScale;
		this.body.velocity.x = -Granny.MOVE_SPEED;
		//play move left animation
	}
	else{
		this.body.velocity.x = 0;
		//play idle animation if on ground
	}

    //Double jumping logic
    if(this.onGround){
    	this.airJumps = Granny.MAX_AIR_JUMPS;
    }
	if (this.keyUp.justDown && (this.onGround || this.airJumps > 0)) {
		this.body.velocity.y = -Granny.JUMP_HEIGHT;
		if(!this.onGround){
			this.airJumps--;
		}
	}

}
