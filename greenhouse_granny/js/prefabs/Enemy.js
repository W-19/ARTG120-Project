// Each enemy is created using paramaters for the game, its x and y position, the player object, and the group
// its projectiles will be created in
Enemy = function(game, x, y, player, enemyProjectiles, leftxFlag, rightxFlag, hurtSound, deathSound) {

	Phaser.Sprite.call(this, game, x, y, 'plant');

	//Setting some attributes for the enemy
	this.anchor.set(0.5);
	game.physics.enable(this);
	this.body.collideWorldBounds = true;
	this.scale.setTo(-0.5, 0.5);
	this.body.gravity.y = 1000;
	this.body.velocity.x = -50;
	this.body.immovable = true;
	
	this.health = 3;
	this.player = player;
	this.enemyProjectiles = enemyProjectiles;
	this.facing = 'left';
	Enemy.BULLET_COOLDOWN_BASE = 45;
	this.bulletCooldown = 0;
	Enemy.AGGRO_RANGE = 500;
	this.leftxFlag = leftxFlag;
	this.rightxFlag = rightxFlag;
	this.hitStunDuration = 0;

	Enemy.hurtSound = hurtSound;
	Enemy.deathSound = deathSound;

	this.animations.add('moving', [5, 6, 7, 8, 9, 10], 7, true);
	this.animations.add('shooting', [0, 1, 2, 3, 4], 8, false);
	this.animations.play('moving');
}

//Creating a prototype for enemy
Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

//Update funtion for enemy
Enemy.prototype.update = function() {

	if(this.bulletCooldown > 0) this.bulletCooldown--;
	if(this.hitStunDuration > 0) this.hitStunDuration--;

	// Attacking & patrolling
	if(this.hitStunDuration == 0){
		// Checking to see if player is in range of plant to be shot at, and handling plant movement in this scenario
		if( Phaser.Math.distance(this.x, this.y, this.player.x, this.player.y) < 1100 && (
			this.facing == 'left' && this.x - this.player.x < Enemy.AGGRO_RANGE && this.x - this.player.x > 0 && this.y - this.player.y <= 30 && this.y - this.player.y >= 0 ||
			this.facing == 'right' && this.player.x - this.x < Enemy.AGGRO_RANGE && this.player.x - this.x > 0 && this.y - this.player.y <= 30 && this.y - this.player.y >= 0
		)){
			this.body.velocity.x = 0;
			this.animations.play('shooting');
			// Shoot her
			if (this.bulletCooldown == 0) {
				bullet = this.enemyProjectiles.create(this.x + (this.facing == 'left' ? -42 : 42), this.y-10, 'seed projectile');
				bullet.anchor.set(0.5);
				bullet.body.velocity.x = (this.facing == 'left' ? -200 : 200);
				if (this.facing == 'left') bullet.scale.x = -bullet.scale.x;
				this.bulletCooldown = Enemy.BULLET_COOLDOWN_BASE;	
			}
		}
		// If the player's not in range, keep patrolling
		else {
			this.body.velocity.x = this.facing == 'left' ? -50 : 50;
			this.animations.play('moving');
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

	if(this.tint < 0xffffff) this.tint += 0x001111; // fade the red tint from getting hit
	
}

Enemy.prototype.takeDamage = function(amount){
	amount += Granny.DAMAGE;
	this.health -= amount;
	game.add.text(new PopupText(game, this.x, this.y-50, amount, {font: 'Palatino', fontSize: 20, fill: '#ff8800'}, false));
	if(this.health <= 0) {
		Granny.score += 3;
		Enemy.deathSound.play();
		this.destroy(); // maybe replace with kill?
	}
	else{
		this.body.velocity.y -= 150;
		Enemy.hurtSound.play();
		this.body.velocity.x = (this.player.facing == 'left' ? -80 : 80);
		this.hitStunDuration = 40;
		this.tint = 0xff4444;
	}
}
