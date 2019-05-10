//Creating Enemy function
Enemy = function(game, x, y) {

	Phaser.Sprite.call(this, game, x, y, 'granny');

	//Setting some attributes for enemy
	this.anchor.set(0.5);
	game.physics.enable(this);
	this.body.collideWorldBounds = true;
	this.scale.setTo(1, 1);
	this.body.gravity.y = 800;
	this.body.velocity.x = -50;
	var isMovingLeft = true;
}

//Creating a prototype for enemy
Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

//Update funtion for enemy
Enemy.prototype.update = function() {

	/*if (this.body.x < 2 || this.body.x > 580) {
		this.body.velocity.x = -this.body.velocity.x;
	}*/
	
}
