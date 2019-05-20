// Each enemy is created using paramaters for the game, its x and y position, the player object, and the group
// its projectiles will be created in
EnemyTree = function(game, x, y, player, enemyProjectiles) {

	Phaser.Sprite.call(this, game, x, y, 'spitter plant');

	//Setting some attributes for the enemy
	this.anchor.set(0.5);
	game.physics.enable(this);
	this.body.collideWorldBounds = true;
	this.body.immovable = true;
	this.scale.setTo(-1, 1);
	this.body.gravity.y = 1000;
	EnemyTree.BULLET_COOLDOWN_BASE = 300;
	this.enemyProjectiles = enemyProjectiles;
	this.facing = 'left';
	this.bulletCooldown = 0;
	this.burstCooldown = 0;
	this.acornCooldown = 0;
	this.health = 5;
	this.player = player;
	EnemyTree.AGGRO_RANGE = 500;
	this.hitStunDuration = 0;
	EnemyTree.acorns = game.add.group();
}

//Creating a prototype for enemy
EnemyTree.prototype = Object.create(Phaser.Sprite.prototype);
EnemyTree.prototype.constructor = EnemyTree;

//Update funtion for enemy
EnemyTree.prototype.update = function() {

	if(this.bulletCooldown > 0) this.bulletCooldown--;
	if(this.burstCooldown > 0) this.burstCooldown--;
	if(this.acornCooldown > 0) this.acornCooldown--;
	if(this.hitStunDuration > 0) this.hitStunDuration--;

	//Attacking
	if(this.hitStunDuration == 0){
		// Checking to see if player is in range of plant to be shot at, and handling plant movement in this scenario
		if(this.facing == 'left' && this.x - this.player.x < EnemyTree.AGGRO_RANGE && this.x - this.player.x > 0 && this.player.y - this.y >= 30 ||
			this.facing == 'right' && this.player.x - this.x < EnemyTree.AGGRO_RANGE && this.player.x - this.x > 0 && this.player.y - this.y >= 30)
		{
			//Attack her
			if (this.bulletCooldown == 0) {
				this.bulletCooldown = EnemyTree.BULLET_COOLDOWN_BASE;
				this.burstShooting = true;
				this.burstCooldown = 22;
			}
			if (this.acornCooldown == 0) {
				EnemyTree.acorns.add(new EnemyJumper(game, this.x, this.y, this.player, 545, 1050));
				this.acornCooldown = 400;
			}
			console.log("here");
			if (this.burstShooting == true) {
				if (this.burstCooldown % 11 == 0) {	
					bullet = this.enemyProjectiles.create(this.x + (this.facing == 'left' ? -42 : 42), this.y-40, 'seed projectile');
					bullet.anchor.set(0.5);
					bullet.body.velocity.x = (this.facing == 'left' ? -200 : 200);
					if (this.facing == 'left') bullet.scale.x = -bullet.scale.x;			
				}
				if (this.burstCooldown == 0) {
					this.burstShooting = false;
				}
			}
		}	
	}

	if (this.x < Granny.x) {
		this.facing = 'right';
		this.scale.x = 1;
	}
	else {
		this.facing = 'left';
		this.scale.x = -1;
	}
}

EnemyTree.prototype.takeDamage = function(amount){
	this.health -= amount;
	if(this.health <= 0) this.destroy(); // maybe replace with kill?
	else{
		this.hitStunDuration = 30;
	}
}
