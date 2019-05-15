// Each enemy is created using paramaters for the game, its x and y position, the player object, and the group
// its projectiles will be created in
Enemy = function(game, x, y, player, enemyProjectiles, leftxFlag, rightxFlag) {

	Phaser.Sprite.call(this, game, x, y, 'spitter plant');

	//Setting some attributes for the enemy
	this.anchor.set(0.5);
	game.physics.enable(this);
	this.body.collideWorldBounds = true;
	this.scale.setTo(-0.5, 0.5);
	this.body.gravity.y = 1000;
	this.body.velocity.x = -50;
	
	this.health = 3;
	this.player = player;
	this.enemyProjectiles = enemyProjectiles;
	this.facing = 'left';
	Enemy.BULLET_COOLDOWN_BASE = 45;
	this.bulletCooldown = 0;
	Enemy.AGGRO_RANGE = 500;
	this.leftxFlag = leftxFlag;
	this.rightxFlag = rightxFlag;
}

//Creating a prototype for enemy
Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

//Update funtion for enemy
Enemy.prototype.update = function() {

	if(this.bulletCooldown > 0) this.bulletCooldown--;

	// Checking to see if player is in range of plant to be shot at, and handling plant movement in this scenario
	if( this.facing == 'left' && this.x - this.player.x < Enemy.AGGRO_RANGE && this.x - this.player.x > 0 && this.player.y == this.y ||
		this.facing == 'right' && this.player.x - this.x < Enemy.AGGRO_RANGE && this.player.x - this.x > 0 && this.player.y == this.y
	){
		this.body.velocity.x = 0;
		// Shoot her
		if (this.bulletCooldown == 0) {
			bullet = this.enemyProjectiles.create(this.x + (this.facing == 'left' ? -42 : 42), this.y-10, 'seed projectile');
			bullet.anchor.set(0.5);
			bullet.body.velocity.x = (this.facing == 'left' ? -200 : 200);
			this.bulletCooldown = Enemy.BULLET_COOLDOWN_BASE;
		}
	}
	// If the player's not in range, keep patrolling
	else {
		this.body.velocity.x = this.facing == 'left' ? -50 : 50;
	}

	// Define when the plant turns around
	if (this.x < this.leftxFlag) {
		this.facing = 'right';
		this.scale.x = 0.5;
	}
	else if (this.x > this.rightxFlag) {
		this.facing = 'left';
		this.scale.x = -0.5;
	}
	
}
