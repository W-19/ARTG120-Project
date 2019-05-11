// Each enemy is created using paramaters for the game, its x and y position, the player object, and the group
// its projectiles will be created in
Enemy = function(game, x, y, player, enemyProjectiles) {

	Phaser.Sprite.call(this, game, x, y, 'granny');

	//Setting some attributes for the enemy
	this.anchor.set(0.5);
	game.physics.enable(this);
	this.body.collideWorldBounds = true;
	this.scale.setTo(1, 1);
	this.body.gravity.y = 800;
	this.body.velocity.x = -50;
	var health;

	this.player = player;
	this.enemyProjectiles = enemyProjectiles;
	this.facing = 'left';
	Enemy.BULLET_COOLDOWN_BASE = 45;
	this.bulletCooldown = 0;
	Enemy.AGGRO_RANGE = 500;
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
			bullet = this.enemyProjectiles.create(this.x, this.y-25, "granny");
			bullet.body.velocity.x = (this.facing == 'left' ? -200 : 200);
			this.bulletCooldown = Enemy.BULLET_COOLDOWN_BASE;
		}
	}
	// If the player's not in range, keep patrolling
	else {
		this.body.velocity.x = this.facing == 'left' ? -50 : 50;
	}

	if (this.x < 20) {
		this.facing = 'right';
	}
	else if (this.x > 580) {
		this.facing = 'left';
	}
	
}
