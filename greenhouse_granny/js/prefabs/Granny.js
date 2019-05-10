//Creating Granny function
Granny = function(game, x, y) {

	Phaser.Sprite.call(this, game, x, y, 'granny');

	//Setting some attributes for granny
	this.anchor.set(0.5);
	game.physics.enable(this);
	this.body.collideWorldBounds = true;
	this.scale.setTo(1, 1);
	this.body.gravity.y = 800;
	var health = 3;
	
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
		this.body.velocity.x = 400;
		//play move right animation
	}
	else if (leftkey.isDown) {
		this.body.velocity.x = -400;
		//play move left animation
	}
	else{
		//play idle animation if on ground
	}

	if (upkey.isDown) {
		this.body.velocity.y = -350;
		//play jumping animation
	}
}
