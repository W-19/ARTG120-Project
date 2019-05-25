// Each enemy is created using paramaters for the game, its x and y position, the player object, and the group
// its projectiles will be created in
EnemyJumper = function(game, x, y, player, leftxFlag, rightxFlag) {

	Phaser.Sprite.call(this, game, x, y, 'acorn');

	//Setting some attributes for the enemy
	this.anchor.set(0.5);
	game.physics.enable(this);
	this.body.collideWorldBounds = true;
	this.scale.setTo(-0.25, 0.25);
	this.body.gravity.y = 1000;
	this.body.velocity.x = -20;
	this.jumpCooldown = 0;
	this.health = 2;
	this.player = player;
	this.facing = 'left';
	EnemyJumper.AGGRO_RANGE = 300;
	this.leftxFlag = leftxFlag;
	this.rightxFlag = rightxFlag;
	this.hitStunDuration = 0;
	this.baseY = y;
	this.growthCounter = 1000;
	EnemyJumper.x;
	EnemyJumper.y;
	EnemyJumper.growthReady;

	this.animations.add('moving', [0, 1, 2, 3], 7, true);
	this.animations.play('moving');
}

//Creating a prototype for enemy
EnemyJumper.prototype = Object.create(Phaser.Sprite.prototype);
EnemyJumper.prototype.constructor = EnemyJumper;

//Update funtion for enemy
EnemyJumper.prototype.update = function() {

	if(this.hitStunDuration > 0) this.hitStunDuration--;
	if(this.jumpCooldown > 0) this.jumpCooldown--;
	if(this.growthCounter > 0) this.growthCounter--;

	if (this.growthCounter == 0) {
		this.kill();
		EnemyJumper.growthReady = true;
		EnemyJumper.y = this.y;
		EnemyJumper.x = this.x;
		this.growthCounter = -1;
	}

	// Attacking & patrolling
	if(this.hitStunDuration == 0){
		// Checking to see if player is in range of acorn to be jumped at, and handling acorn movement in this scenario
		if( this.facing == 'left' && this.x - this.player.x < EnemyJumper.AGGRO_RANGE && this.x - this.player.x > 0 && this.y - this.player.y <= 30 && this.y - this.player.y >= 0 ||
			this.facing == 'right' && this.player.x - this.x < EnemyJumper.AGGRO_RANGE && this.player.x - this.x > 0 && this.y - this.player.y <= 30 && this.y - this.player.y >= 0
		){
			if (this.jumpCooldown == 0) {
				this.baseY = this.y;
				this.body.velocity.x = (this.facing == 'left' ? -200 : 200);
				this.body.velocity.y = -550;
				this.jumpCooldown = 250;
			}
			else {
				this.body.velocity.x = this.facing == 'left' ? -30 : 30;
			}
		}
		// If the acorn is still in the air, keep velocity at jump velocity
		else {
			if (this.baseY <= this.y) {
				this.animations.play('moving');
				this.body.velocity.x = this.facing == 'left' ? -30 : 30;
			}
			else {
				this.frame = 0;
				this.body.velocity.x = (this.facing == 'left' ? -200 : 200);
			}
		}
		// Define when the acorn turns around
		if (this.x < this.leftxFlag) {
			this.facing = 'right';
			this.scale.x = 0.25;
		}
		else if (this.x > this.rightxFlag) {
			this.facing = 'left';
			this.scale.x = -0.25;
		}
	}

	if(this.tint < 0xffffff) this.tint += 0x001111; // fade the red tint from getting hit
	
}

EnemyJumper.prototype.takeDamage = function(amount){
	this.health -= amount;
	if(this.health <= 0) this.destroy(); // maybe replace with kill?
	else{
		this.body.velocity.y -= 150;
		this.body.velocity.x = (this.player.facing == 'left' ? -80 : 80);
		this.hitStunDuration = 30;
		this.tint = 0xff4444;
	}
}
