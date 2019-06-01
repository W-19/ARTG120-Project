// Each enemy is created using paramaters for the game, its x and y position, the player object, and the group
// its projectiles will be created in
EnemyTree = function(game, x, y, player, enemyProjectiles, hurtSound, deathSound) {

	Phaser.Sprite.call(this, game, x, y, 'spitter plant');

	//Setting some attributes for the enemy
	this.anchor.set(0.5);
	game.physics.enable(this);
	this.body.collideWorldBounds = true;
	this.body.immovable = true;
	this.body.setSize(90, 120, 0, 0);
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
	this.acornSpawnDelay = 150;

	EnemyTree.hurtSound = hurtSound;
	EnemyTree.deathSound = deathSound;
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
	if(this.acornSpawnDelay > 0) this.acornSpawnDelay--;

	//Attacking
	if(this.hitStunDuration == 0){
		// Checking to see if player is in range of plant to be shot at, and handling plant movement in this scenario
		if( Phaser.Math.distance(this.x, this.y, this.player.x, this.player.y) < 500/* && (
			this.facing == 'left' && this.x - this.player.x < EnemyTree.AGGRO_RANGE && this.x - this.player.x > 0 && (this.player.y + 100) - this.y >= 0 ||
			this.facing == 'right' && this.player.x - this.x < EnemyTree.AGGRO_RANGE && this.player.x - this.x > 0 && (this.player.y + 100) - this.y >= 0
		)*/){
			//Attack her
			if (this.bulletCooldown == 0) {
				this.bulletCooldown = EnemyTree.BULLET_COOLDOWN_BASE;
				this.burstShooting = true;
				this.burstCooldown = 22;
			}
			if (this.acornCooldown == 0 && this.acornSpawnDelay == 0) {
				EnemyTree.acorns.add(new EnemyJumper(game, this.x, this.y - 50, this.player, 545, 1050, 'left', this.enemyHurt, this.enemyDeath));
				EnemyTree.acorns.add(new EnemyJumper(game, this.x + 50, this.y - 50, this.player, 545, 1050, 'right', this.enemyHurt, this.enemyDeath));
				this.acornCooldown = 500;
			}
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

	if (this.x < this.player.x) {
		this.facing = 'right';
		this.scale.x = 1;
	}
	else {
		this.facing = 'left';
		this.scale.x = -1;
	}

	if(this.tint < 0xffffff) this.tint += 0x001111; // fade the red tint from getting hit
}

EnemyTree.prototype.takeDamage = function(amount){
	amount += Granny.DAMAGE;
	this.health -= amount;
	game.add.text(new PopupText(game, this.x, this.y-50, amount, {font: 'Palatino', fontSize: 20, fill: '#ff8800'}, false));
	if(this.health <= 0) {
		Granny.score += 5;
		EnemyTree.deathSound.play();
		this.destroy(); // maybe replace with kill?
	}
	else{
		this.hitStunDuration = 30;
		EnemyTree.hurtSound.play();
		this.tint = 0xff4444;
	}
}
