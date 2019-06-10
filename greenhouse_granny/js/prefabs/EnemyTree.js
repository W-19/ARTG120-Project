// Each enemy is created using paramaters for the game, its x and y position, the player object, and the group
// its projectiles will be created in
EnemyTree = function(game, x, y, player, enemies, enemyProjectiles, audio) {

	Phaser.Sprite.call(this, game, x, y, 'tree');

	//Setting some attributes for the enemy
	this.anchor.set(0.5);
	game.physics.enable(this);
	this.body.collideWorldBounds = true;
	this.body.immovable = true;
	this.body.setSize(180, 245, 0, 0);
	this.scale.setTo(-1, 1);
	this.body.gravity.y = 1000;
	this.body.maxVelocity.y = 1000;
	EnemyTree.BULLET_COOLDOWN_BASE = 300;
	this.enemies = enemies; // for spawned acorns
	this.enemyProjectiles = enemyProjectiles; // for spawned projectiles
	this.facing = 'left';
	this.bulletCooldown = 0;
	this.burstCooldown = 0;
	this.acornCooldown = 0;
	this.health = 100;
	this.player = player;
	EnemyTree.AGGRO_RANGE = 500;
	this.hitStunDuration = 0;
	this.acornSpawnDelay = 150;

	this.MELEE_DAMAGE = 35; // Can't be static because using typeof in main doesn't work :/

	EnemyTree.AUDIO = audio;
}

//Creating a prototype for enemy
EnemyTree.prototype = Object.create(Phaser.Sprite.prototype);
EnemyTree.prototype.constructor = EnemyTree;

//Update funtion for enemy
EnemyTree.prototype.update = function() {

	if(this.hitStunDuration > 0) this.hitStunDuration--;

	//Attacking
	if(this.hitStunDuration == 0){

		if(this.bulletCooldown > 0) this.bulletCooldown--;
		if(this.burstCooldown > 0) this.burstCooldown--;
		if(this.acornCooldown > 0) this.acornCooldown--;
		if(this.acornSpawnDelay > 0) this.acornSpawnDelay--;

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
			if (this.acornCooldown == 0 && this.acornSpawnDelay == 0 && this.enemies.length < MAX_ENEMIES) {
				this.enemies.add(new EnemyJumper(game, this.x, this.y - 50, this.player, 545, 1050, 'left', this.enemyHurt, this.enemyDeath));
				this.enemies.add(new EnemyJumper(game, this.x + 50, this.y - 50, this.player, 545, 1050, 'right', EnemyJumper.AUDIO));
				this.acornCooldown = 500;
			}
			if (this.burstShooting == true) {
				if (this.burstCooldown % 11 == 0) {	
					bullet = this.enemyProjectiles.create(this.x + (this.facing == 'left' ? -42 : 42), this.y-40, 'seed projectile');
					bullet.anchor.set(0.5);
					bullet.owner = this;
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
	game.add.text(new PopupText(game, this.x, this.y-50, amount, {font: 'Palatino', fontSize: 20, stroke: '#000000', strokeThickness: 3, fill: '#ff8800'}, false));
	if(this.health <= 0) {
		Granny.score += 5;
		this.player.heal(20);
		EnemyTree.AUDIO.enemyDeath.play();
		this.destroy(); // maybe replace with kill?
	}
	else{
		this.hitStunDuration = 60;
		this.bulletCooldown = EnemyTree.BULLET_COOLDOWN_BASE;
		EnemyTree.AUDIO.enemyHurt.play();
		this.tint = 0xff4444;
	}
}

EnemyTree.prototype.windbox = function(amountX, amountY){
	// Trees do not react to windboxes
}
