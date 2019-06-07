// Each enemy is created using paramaters for the game, its x and y position, the player object, and the group
// its projectiles will be created in
EnemyJumper = function(game, x, y, player, leftxFlag, rightxFlag, facing, audio) {

	Phaser.Sprite.call(this, game, x, y, 'acorn');

	//Setting some attributes for the enemy
	this.anchor.set(0.5);
	game.physics.enable(this);
	this.body.collideWorldBounds = true;
	EnemyJumper.SCALE = 0.45;
	this.body.gravity.y = 1000;
	this.body.velocity.x = -20;
	this.body.immovable = true;
	this.jumpCooldown = 0;
	this.health = 20;
	this.player = player;
	this.facing = facing;
	EnemyJumper.AGGRO_RANGE = 300;
	this.leftxFlag = leftxFlag;
	this.rightxFlag = rightxFlag;
	this.hitStunDuration = 0;
	this.inWindbox = 0; // true if > 0
	this.baseY = y;
	this.growthCounter = 1000;
	EnemyJumper.x;
	EnemyJumper.y;
	EnemyJumper.growthReady;
	this.scale.x = (this.facing == 'left' ? -EnemyJumper.SCALE : EnemyJumper.SCALE);
	this.scale.y = EnemyJumper.SCALE;

	this.MELEE_DAMAGE = 10; // Can't be static because using typeof in main doesn't work :/

	EnemyJumper.AUDIO = audio;

	this.animations.add('moving', [0, 1, 2, 3], 7, true);
	this.animations.play('moving');
}

//Creating a prototype for enemy
EnemyJumper.prototype = Object.create(Phaser.Sprite.prototype);
EnemyJumper.prototype.constructor = EnemyJumper;

//Update funtion for enemy
EnemyJumper.prototype.update = function() {

	if(this.x <= 40 && this.y >= 3000) {
    	this.reset(30, 790);
    }
    if(this.x >= 2274 && this.y >= 3000) {
    	this.reset(2275, 790);
    }

	if(this.hitStunDuration > 0) this.hitStunDuration--;

	if(this.inWindbox > 0) this.inWindbox--;

	if (this.growthCounter == 0) {
		this.kill();
		EnemyJumper.growthReady = true;
		EnemyJumper.y = this.y;
		EnemyJumper.x = this.x;
		this.growthCounter = -1;
	}

	// Attacking & patrolling
	if(this.hitStunDuration == 0 && this.inWindbox == 0){

		if(this.jumpCooldown > 0) this.jumpCooldown--;
		if(this.growthCounter > 0) this.growthCounter--;

		// Checking to see if player is in range of acorn to be jumped at, and handling acorn movement in this scenario
		if( Phaser.Math.distance(this.x, this.y, this.player.x, this.player.y) < 1100 && (
			this.facing == 'left' && this.x - this.player.x < EnemyJumper.AGGRO_RANGE && this.x - this.player.x > 0 && this.y - this.player.y <= 30 && this.y - this.player.y >= 0 ||
			this.facing == 'right' && this.player.x - this.x < EnemyJumper.AGGRO_RANGE && this.player.x - this.x > 0 && this.y - this.player.y <= 30 && this.y - this.player.y >= 0
		)){
			if (this.body.blocked.down && this.jumpCooldown == 0) {
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
			this.scale.x = EnemyJumper.SCALE;
		}
		else if (this.x > this.rightxFlag) {
			this.facing = 'left';
			this.scale.x = -EnemyJumper.SCALE;
		}
	}

	if(this.tint < 0xffffff) this.tint += 0x001111; // fade the red tint from getting hit
	
}

EnemyJumper.prototype.takeDamage = function(amount){
	amount += Granny.DAMAGE;
	this.health -= amount;
	game.add.text(new PopupText(game, this.x, this.y-50, amount, {font: 'Palatino', fontSize: 20, stroke: '#000000', strokeThickness: 3, fill: '#ff8800'}, false));
	if(this.health <= 0) {
		++Granny.score;
		Enemy.AUDIO.enemyDeath.play();
		this.destroy(); // maybe replace with kill?
	}
	else{
		this.body.velocity.y -= 150;
		Enemy.AUDIO.enemyHurt.play();
		this.body.velocity.x = (this.player.facing == 'left' ? -80 : 80);
		this.hitStunDuration = 60;
		this.tint = 0xff4444;
	}
}

EnemyJumper.prototype.windbox = function(amountX, amountY){
	this.inWindbox = 2;
	if(amountX != null) this.body.velocity.x = amountX;
	if(amountY != null) this.body.velocity.y = amountY;
}
