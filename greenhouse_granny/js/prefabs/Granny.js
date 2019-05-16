//Creating Granny function
Granny = function(game, x, y, enemies) {

	Phaser.Sprite.call(this, game, x, y, 'granny');

	//Setting some attributes for granny
	game.physics.enable(this);
	this.body.collideWorldBounds = true;
	this.facing = 'left';
	this.scale.setTo(0.5, 0.5);
	this.anchor.set(0.5);
	this.anchorScale = this.scale.x;
	this.body.gravity.y = 1000;
	this.health = 10;
	this.blockTime = 0; // time spent shielding herself
	this.onGround = false;
	Granny.MAX_AIR_JUMPS = 1;
	Granny.ACCELERATION_SPEED = 40;
	Granny.MOVE_SPEED = 400;
	Granny.JUMP_HEIGHT = 650;
	this.airJumps = 1;
	this.currentWeapon = null; // the variable from the weapons file
	this.currentWeaponObj = null; // the actual object associated with said variable
	this.attackCooldown = 0; // she can't attack unless it's 0
	this.enemies = enemies;

	this.keyRight = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
	this.keyLeft = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
	this.keyUp = game.input.keyboard.addKey(Phaser.Keyboard.UP);
	this.keyAttack = game.input.keyboard.addKey(Phaser.Keyboard.Q);
	this.keyBlock = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

//Creating a prototype for granny
Granny.prototype = Object.create(Phaser.Sprite.prototype);
Granny.prototype.constructor = Granny;

//Update funtion for granny
Granny.prototype.update = function() {

	// ------------------------------------ ATTACKING -------------------------------------

	this.currentWeapon.update(this, this.currentWeaponObj);

	if(this.attackCooldown == 0){
		if(this.keyAttack.isDown){
			this.currentWeapon.attack(game, this, this.currentWeaponObj, this.enemies);
		}
	}
	else this.attackCooldown--;

	// -------------------------------- MOVEMENT &  JUMPING--------------------------------

	this.onGround = this.body.blocked.down;
	
	//Basic movement handling if statements
	if (this.keyRight.isDown) {
		this.facing = 'right';
		this.scale.x = this.anchorScale;
		this.body.velocity.x = Math.min(this.body.velocity.x+Granny.ACCELERATION_SPEED, Granny.MOVE_SPEED);
		//play move right animation
	}
	else if (this.keyLeft.isDown) {
		this.facing = 'left';
		this.scale.x = -this.anchorScale;
		this.body.velocity.x = Math.max(this.body.velocity.x-Granny.ACCELERATION_SPEED, -Granny.MOVE_SPEED);
		//play move left animation
	}
	else{ // decelerate
		if(this.body.velocity.x < -Granny.ACCELERATION_SPEED){
			this.body.velocity.x += Granny.ACCELERATION_SPEED;
		}
		else if(this.body.velocity.x > Granny.ACCELERATION_SPEED){
			this.body.velocity.x -= Granny.ACCELERATION_SPEED;
		}
		else{
			this.body.velocity.x = 0;
		}
		//play idle animation if on ground
	}

    //Double jumping logic
    if(this.onGround){
    	this.airJumps = Granny.MAX_AIR_JUMPS;
    }
	if (this.keyUp.justDown && (this.onGround || this.airJumps > 0)) {
		this.body.velocity.y = -Granny.JUMP_HEIGHT;
		if(!this.onGround){
			this.airJumps--;
		}
	}

	// ----------------------------------- BLOCKING ---------------------------------------

	if (this.keyBlock.isDown) this.blockTime++;
	else if (this.blockTime > 0) this.blockTime = -50; // blocking has a 50-tick cooldown

	// --------------------------------- MISCELLANEOUS -------------------------------------

	if(this.tint < 0xffffff) this.tint += 0x001111; // fade the red tint from getting hit
}

Granny.prototype.takeDamage = function(amount, source){
	if(this.blockTime <= 0){ // no block
		this.health -= amount;
		this.tint = 0xff4444;
	}
	else if(this.blockTime > 25){ // partial block
		this.health -= amount/2;
		this.tint = 0xffbbbb;
	}
	else{ // full block
		return;
	}

	if(this.health <= 0) game.state.start('GameOver', true, false, 0);
	// apply knockback
	this.body.velocity.x = (300 + (200 * amount)) * -Math.cos(game.physics.arcade.angleBetween(this, source));
	this.body.velocity.y = -80 - (20 * amount); // vertical knockback is always positive for now
}

Granny.prototype.switchWeapon = function(weapon){
	this.removeChildren();
	this.currentWeapon = weapon;
	this.currentWeaponObj = this.addChild(game.make.sprite(1, -5, weapon.name));
	this.currentWeaponObj.scale.setTo(weapon.scale);
	this.currentWeaponObj.angle = weapon.defaultAngle;
	this.currentWeaponObj.enableBody = true;

}
