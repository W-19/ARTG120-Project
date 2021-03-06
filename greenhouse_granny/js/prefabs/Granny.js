// used by immuneTo
function EnemyCountdown(enemyObj, ticksRemaining){
	this.enemyObj = enemyObj;
	this.ticksRemaining = ticksRemaining;
}

var blockKeyDown = false; // doesn't need to be a member of Granny, just saves a little performance

//Creating Granny function
Granny = function(game, x, y, enemies, enemyProjectiles, audio, damage) {

	Phaser.Sprite.call(this, game, x, y, 'granny');

	//Setting some attributes for granny
	game.physics.enable(this);
	this.body.collideWorldBounds = true;
	this.facing = 'right';
	this.scale.setTo(0.5, 0.5);
	this.anchor.set(0.5);
	this.anchorScale = this.scale.x;
	this.body.gravity.y = 1800;
	this.body.maxVelocity.x = 1000;
	this.body.maxVelocity.y = 1000;

	Granny.MAX_HEALTH = 100;
	this.health = Granny.MAX_HEALTH;
	this.blockTime = 0; // time spent shielding herself
	this.onGround = false;
	Granny.score = 0;
	Granny.MAX_AIR_JUMPS = 1;
	Granny.ACCELERATION_SPEED = 40;
	Granny.MOVE_SPEED = 500;
	Granny.JUMP_HEIGHT = 875;
	Granny.DAMAGE = damage;
	Granny.BLOCK_COOLDOWN = 50;
	this.airJumps = 1;
	this.currentWeapon = null; // the variable from the weapons file
	this.currentWeaponObj = null; // the actual object associated with said variable
	this.attackCooldown = 0; // she can't attack unless it's 0
	this.enemies = enemies;
	this.enemyProjectiles = enemyProjectiles;
	this.immuneTo = []; // holds all the enemies that recently damaged the player and the number of ticks until they can do so again
	this.enemiesDamagedThisAttack = []; // holds all the enemies she's damaged this attack

	// The weapon displayed at the top of the screen
	this.currentWeaponImage = game.add.sprite(game.width/2, 30.5, shovel.name);

	//Adding input keys to game
	this.keyRight = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
	this.keyLeft = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
	this.keyUp = game.input.keyboard.addKey(Phaser.Keyboard.UP);
	this.keyAttack = game.input.keyboard.addKey(Phaser.Keyboard.E);
	this.keyBlock = game.input.keyboard.addKey(Phaser.Keyboard.Q);
	this.keySwitchWeapon = game.input.keyboard.addKey(Phaser.Keyboard.W);

	//Adding animations and setting current frame to idle
	/* old spritesheet
	this.animations.add('walking', [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], 15, true);
	this.animations.add('blocking', [8, 9, 10, 11, 12, 13], 30, false);
	this.animations.add('unblocking', [14, 0], 30, false);
	*/
	this.animations.add('walking', [9, 12, 15], 20, true);
	this.animations.add('blocking', [1, 2, 3, 4, 5, 6], 30, false);
	this.animations.add('unblocking', [6, 5, 4, 3, 2, 1], 60, false);
	this.frame = 0;

	// Audio references
	Granny.AUDIO = audio;

	// Granny's hitbox
	this.hitbox = game.add.graphics(0,0);
	this.hitbox.beginFill(0xFF0000, 1);
    this.hitbox.drawRect(0, 0, 30, 63);
    this.hitbox.alpha = 0.0;
    game.physics.arcade.enable(this.hitbox);

    this.jumpPad = game.add.sprite(955, 3090, 'jump leaf');
	this.jumpPad.animations.add('pressed', [0, 1, 2, 3, 4], 20, false);

	// Leafblower overheating
	this.leafblowerTint = 0xffffff;
}

//Creating a prototype for granny
Granny.prototype = Object.create(Phaser.Sprite.prototype);
Granny.prototype.constructor = Granny;

//Update function for granny
Granny.prototype.update = function() {
	blockKeyDown = this.keyBlock.isDown;

	// Update Granny's hitbox with her position. We need to take velocity into account otherwise it'll lag behind her.
	this.hitbox.x = this.x - (this.facing == 'right' ? 25 : 6) + this.body.velocity.x/60;
	this.hitbox.y = this.y - 25 + this.body.velocity.y/60;

	// ----------------------------------- ANIMATIONS -------------------------------------

	// It's simplest if we do all the animation logic right here
	if(blockKeyDown && this.blockTime > 0){
		if(this.animations.name != 'blocking' || this.animations.isPlaying == false){
			this.animations.play('blocking');
		}
	}
	else if(this.blockTime < -Granny.BLOCK_COOLDOWN + 20){
		//this.animations.play('unblocking'); // why won't this work??
		this.animations.stop(7);
	}
	else if (this.onGround && (this.keyLeft.isDown || this.keyRight.isDown)){
		this.animations.play('walking');
	}
	else{
		this.animations.play('walking'); // to remove the shielding animation if she stopped shielding in the air
		this.animations.stop();
	}

	// -------------------------------- MOVEMENT &  JUMPING--------------------------------
	this.onGround = this.body.blocked.down;

	//Basic movement handling if statements
	if (this.keyRight.isDown && !(blockKeyDown && this.blockTime >= 0 && this.onGround)) {
		this.facing = 'right';
		this.scale.x = this.anchorScale;
		this.body.velocity.x = Math.min(this.body.velocity.x+Granny.ACCELERATION_SPEED, Granny.MOVE_SPEED);
		//play move right animation
	}
	else if (this.keyLeft.isDown && !(blockKeyDown && this.blockTime >= 0 && this.onGround)) {
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
		if (!this.keyBlock.isDown) {
			this.frame = 0;
		}
	}
	
    //Double jumping logic
    if(this.onGround){
    	this.airJumps = Granny.MAX_AIR_JUMPS;
    	this.body.maxVelocity.y = 1000;
    }
	if (this.keyUp.justDown && (this.onGround || this.airJumps > 0)) {
		if (this.x < 1337 && this.x > 984 && this.y > 3000) {
			this.body.maxVelocity.y = 10000;
			this.body.velocity.y = -3000;
			this.jumpPad.animations.play('pressed');
		}
		else {
			this.body.velocity.y = -Granny.JUMP_HEIGHT;
		}
		Granny.AUDIO.playerJump.play();
		if(!this.onGround){
			this.airJumps--;
		}
	}

	// ------------------------------------ ATTACKING -------------------------------------
	
	// do whatever the weapon does passively when it's equipped
	this.currentWeapon.update(this, this.currentWeaponObj);

	if(this.attackCooldown == 0){
		if(this.keyAttack.isDown && this.blockTime <= 0){
			this.currentWeaponObj.alpha = 1.0;
			this.attackCooldown = this.currentWeapon.cooldown;
			this.currentWeapon.commenceAttack();
		}
		else{
			if(this.keySwitchWeapon.justDown){
				this.switchWeapon(this.currentWeapon == shovel ? leafblower : shovel);
				Granny.AUDIO.switchWeapon.play();
			}
			this.currentWeaponObj.alpha = 0.0;
		}
	}
	else{
		this.attackCooldown--;
		if(this.attackCooldown == 0){
			this.currentWeapon.rearm(this, this.currentWeaponObj);
		}
	}

	// Another statement down here so the attack will hit on the first tick but not on the last, rather than vice versa
	if(this.attackCooldown > 0){
		this.currentWeapon.attack(game, this, this.currentWeaponObj, this.enemies, this.enemyProjectiles);
	}

	// Finally, update the leafblower tint
	if(this.leafblowerTint < 0xffffff){
		this.leafblowerTint = Math.min(0xffffff, this.leafblowerTint + 0x000202);
	}
	

	// ----------------------------------- BLOCKING ---------------------------------------

	if(blockKeyDown && !(this.blockTime < 0)) { // she's blocking
		this.blockTime++;
	}
	else{
		if (this.blockTime > 0){ // called when the block key is lifted. We could also use "if(this.keyBlock.onUp)"
			this.blockTime = -Granny.BLOCK_COOLDOWN;
		}
		else if (this.blockTime < 0){
			this.blockTime++;
		}
	}

	// --------------------------------- MISCELLANEOUS -------------------------------------

	// fade the red tint from getting hit
	if(this.tint < 0xffffff && this.tint >= 0xff0000) this.tint += 0x001111;
	// fade the green tint from getting healed
	else if(this.tint < 0xffffff) this.tint += 0x110011;
	
	// update the list of enemies that recently damaged the player
	for(var i = 0; i < this.immuneTo.length; i++){
		if(this.immuneTo[i].ticksRemaining == 0){
			this.immuneTo.splice(i, 1); // delete the element
		}
		else{
			this.immuneTo[i].ticksRemaining--;
		}
	}
}

Granny.prototype.takeDamage = function(amount, source){
	
	// Immunity works per parent object, for now
	while(source.owner != null){
		source = source.owner;
	}

	// If we were recently damaged by this enemy, we take no damage; otherwise, add the enemy to the list,
	// unless we're damaging ourselves with an overheated leafblower
	if(this.immuneTo.some(elem => elem.enemyObj == source)) return;
	else if(source != this) this.immuneTo.push(new EnemyCountdown(source, 30)); // We'll be immune to this object for 30 ticks

	if(this.blockTime <= 0){ // no block
		this.health -= amount;
		new PopupText(game, this.x, this.y, amount, {font: 'Palatino', fontSize: 15+Math.ceil(amount/10), stroke: '#000000', strokeThickness: 3, fill: '#ff6666'}, false)
		this.tint = 0xff4444;
		Granny.AUDIO.playerHurt.play();
	}
	else if(this.blockTime > 50){ // partial block
		game.add.text(new PopupText(game, this.x, this.y-50, "Partial block!", {font: 'Palatino', fontSize: 10, stroke: '#000000', strokeThickness: 3, fill: '#ffffff'}, true));
		game.add.text(new PopupText(game, this.x, this.y, amount/2, {font: 'Palatino', fontSize: 13, stroke: '#000000', strokeThickness: 3, fill: '#ff8888'}, false));
		this.health -= amount/2;
		this.tint = 0xffbbbb;
		Granny.AUDIO.playerHurt.play();
	}
	else{ // full block
		game.add.text(new PopupText(game, this.x, this.y-50, "Blocked!", {font: 'Palatino', fontSize: 10, stroke: '#000000', strokeThickness: 3, fill: '#ffffff'}, true));
		Granny.AUDIO.block.play();
		return;
	}

	//if(this.health <= 0) game.state.start('GameOver', true, false, 0);
	// apply knockback
	this.body.velocity.x = (480 + (4 * amount)) * -Math.cos(game.physics.arcade.angleBetween(this, source));
	this.body.velocity.y = -80 + ((16 * amount) * -Math.sin(game.physics.arcade.angleBetween(this, source))); // vertical knockback is always positive for now
}

Granny.prototype.heal = function(amount){
	this.health = Math.min(this.health + amount, Granny.MAX_HEALTH);
	game.add.text(new PopupText(game, this.x, this.y, Math.min(amount, Granny.MAX_HEALTH-amount), {font: 'Palatino', fontSize: 15, stroke: '#000000', strokeThickness: 3, fill: '#aaffaa'}, false));
	this.tint = 0x44ff44;
}

Granny.prototype.switchWeapon = function(weapon){
	this.removeChildren();
	this.currentWeapon = weapon;
	this.currentWeaponObj = this.addChild(game.make.sprite(1, -5, weapon.name));
	this.currentWeaponObj.anchor.setTo(weapon.anchorX, weapon.anchorY);
	this.currentWeaponObj.scale.setTo(weapon.scale);
	this.currentWeaponObj.angle = weapon.defaultAngle;
	this.currentWeaponObj.enableBody = true;
	game.add.text(new PopupText(game, this.x, this.y, this.currentWeapon.name, {font: 'Palatino', fontSize: 13, stroke: '#000000', strokeThickness: 3, fill: '#7777ff'}, true));

	if(this.currentWeaponImage != null) this.currentWeaponImage.destroy();
	this.currentWeaponImage = game.add.sprite(game.width/2, 30.5, weapon.name);
	this.currentWeaponImage.scale.set(weapon.scale/2);
	this.currentWeaponImage.anchor.set(0.5);
	this.currentWeaponImage.fixedToCamera = true;
	this.currentWeaponImage.cameraOffset.setTo(game.width/2 + 0.5, 30.5);

}
