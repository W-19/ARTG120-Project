/*
 * This is the main file for the Greenhouse Granny game.
 * Developers: Simon Katzer, Jack Cuneo, Matthew Tolentino, Trystan Nguyen
 * Our repo is here: https://github.com/W-19/ARTG120-Project/tree/master/greenhouse_granny 
 */

// Set up game
var config = {
	width: 800,
	height: 600,
	renderer: Phaser.AUTO,
	antialias: true,
	multiTexture: true
}
var game = new Phaser.Game(config);

var money = 0;
var moneyCounter = 0;
var GrannyDAMAGE = 0;

var currentTrack = null; // allows us to stop the game audio when we enter the GameOver state

// Define states

var MainMenu = function(game){
	this.FLAG = true;
	this.SCREENFLAG = false;
	this.SELECT = 1;
	this.SHOW = 1;
};
MainMenu.prototype = {
	preload: function(){
		game.load.image('title', 'assets/img/GreenhouseGrannyTitle.png');
		game.load.image('select', 'assets/img/Select.png');
		game.load.image('buttonbackground', 'assets/img/Buttonbackground.png');
		game.load.image('blackScreen', 'assets/img/BlackScreen.png');
		game.load.audio('menu music', 'assets/audio/Track 1.ogg');
	},
	create: function(){

		currentTrack = game.add.audio('menu music');
		currentTrack.volume = 0.25;

		//Set background color
		game.stage.setBackgroundColor('#87CEEB');

		//Add in title sprite
		this.title = game.add.sprite(game.width/2, 120, 'title');
		this.title.anchor.set(.5);

		//Version
		var title = game.add.text(game.width/2, 220, "v1.0a", { fontSize: '32px', fill: '#000' })

		//background and text for play, controls, and credits
		var back = game.add.sprite(60, 300, 'buttonbackground');
		game.add.text(125, 315, 'Play', {font: '40px Sabon', fill: '#fffff'});

		back = game.add.sprite(60, 380, 'buttonbackground');
		game.add.text(90, 395, 'Controls', {font: '40px Sabon', fill: '#fffff'});

		back = game.add.sprite(60, 460, 'buttonbackground');
		game.add.text(100, 475, 'Credits', {font: '40px Sabon', fill: '#fffff'});

		this.instructions = game.add.text(320, 380, 'Use up and down arrow to change\nselection and use enter to select',
							{font: '30px Sabon', fill: '#fffff'});

		//Instructions for player input
		this.controlAttack = game.add.text(400, 350, "Press C to attack", {font: '30px Sabon', fill: '#fffff'});
		this.controlBlock = game.add.text(400, 400, "Hold X to block", {font: '30px Sabon', fill: '#fffff'});
		this.controlMovement = game.add.text(400, 450, "Use arrow keys to run and jump", {font: '30px Sabon', fill: '#fffff'});
		this.controlSwitchWeapon = game.add.text(400, 500, "Press Z to toggle shovel/leafblower", {font: '30px Sabon', fill: '#fffff'});

		//Make these intructions invisable
		this.controlAttack.alpha = 0.0;
		this.controlBlock.alpha = 0.0;
		this.controlMovement.alpha = 0.0;
		this.controlSwitchWeapon.alpha = 0.0;

		//Credits for game
		this.credits = game.add.text(350, 350, "            Made by: \nSimon Katzer, Jack Cuneo, \nMatthew Tolentino, \nand Trystan Nguyen",
						{font: '30px Sabon', fill: '#fffff'});

		this.credits.alpha = 0;

		this.choose = game.add.sprite(60, 300, 'select');

		//Create blackscreen for fade
		this.blackScreen = game.add.sprite(-50, -50, 'blackScreen');
		this.blackScreen.alpha = 0;
	},
	update: function(){

		// Loop the audio
		if(currentTrack.isDecoded && !currentTrack.isPlaying){
			currentTrack.play();
		}

		if(this.SCREENFLAG == true){
			if(this.blackScreen.alpha < 1){
				this.blackScreen.alpha += .02;
			}
		}

		//Show what player wants to select
		if(this.SELECT == 1) this.choose.y = 300; 
		else if(this.SELECT == 2) this.choose.y = 380;
		else if(this.SELECT == 3) this.choose.y = 460;

		//Move the selection
		if(game.input.keyboard.downDuration(Phaser.Keyboard.UP, 1)){
			if(this.SELECT == 1) this.SELECT = 3;
			else this.SELECT--;
			this.instructions.destroy();
		}
		if(game.input.keyboard.downDuration(Phaser.Keyboard.DOWN, 1)){
			if(this.SELECT == 3) this.SELECT = 1;
			else this.SELECT++;
			this.instructions.destroy();
		}
		
		//Title animaiton
		if(this.title.scale.x >= 1.10) this.FLAG = false;
		if(this.title.scale.x < 1) this.FLAG = true;

		if(this.FLAG == true){
			this.title.scale.x += .002;
		}
		else if (this.FLAG == false){
			this.title.scale.x -= .002;
		}

		//After fade to black start play state
		if(this.blackScreen.alpha >= 1){
			game.stage.setBackgroundColor('#FFFFF');
			game.state.start('Play');
		}

		//Wait for user input
		if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
			if(this.SELECT == 1){
				this.SCREENFLAG = true;
			}
			if(this.SELECT == 2){
				if(this.SHOW == 2){
					this.credits.alpha = 0;
				}
				this.controlAttack.alpha = 1.0;
				this.controlBlock.alpha = 1.0;
				this.controlMovement.alpha = 1.0;
				this.controlSwitchWeapon.alpha = 1.0;
				this.SHOW = 1;
			}
			if(this.SELECT == 3){
				if(this.SHOW == 1){
					this.controlAttack.alpha = 0.0;
					this.controlBlock.alpha = 0.0;
					this.controlMovement.alpha = 0.0;
					this.controlSwitchWeapon.alpha = 0.0;
				}
				this.credits.alpha = 1;
				this.SHOW = 2;
			}
		}
		
	}
}

var Play = function(game){
	this.SCREENFLAG = false;
};
Play.prototype = {
	preload: function(){

		game.time.advancedTiming = true; // So we can show the block cooldown in seconds

		game.load.image('shovel', shovel.path);
		game.load.image('leafblower', leafblower.path);

		game.load.image('seed projectile', 'assets/img/Seed_Projectile.png');
		game.load.image('spitter plant', 'assets/img/Spitter_Plant.png');
		game.load.image('stage', 'assets/img/Final-Stage.png');
		game.load.image('top bar', 'assets/img/UI_Bar.png');
		//game.load.spritesheet('granny', 'assets/img/SpriteSheets/Gardener_SpriteSheet.png', 113, 148);
		game.load.spritesheet('granny', 'assets/img/SpriteSheets/Gardener_NEW_SpriteSheet.png', 102, 148);
		game.load.spritesheet('plant', 'assets/img/SpriteSheets/Plant_Spitter_SpriteSheet.png', 104, 128);
		game.load.spritesheet('acorn', 'assets/img/SpriteSheets/Acorn_SpriteSheet.png', 61, 80);
		game.load.spritesheet('tree', 'assets/img/SpriteSheets/Tree_SpriteSheet.png', 357, 250);

		//Load in tilemap and spritesheet
		game.load.tilemap('level', 'assets/tilemaps/FinalTilemap2.json', null, Phaser.Tilemap.TILED_JSON);
		game.load.spritesheet('tilesheet', 'assets/img/Tilesheet3.png', 8, 8);

		game.load.audio('game music', 'assets/audio/Old GB Song.ogg');
		game.load.audio('player jump', 'assets/audio/Player Jump.ogg');
		game.load.audio('player hurt', 'assets/audio/Player Hurt.ogg');
		game.load.audio('enemy hurt', 'assets/audio/Enemy Hurt.ogg');
		game.load.audio('enemy death', 'assets/audio/Enemy Death.ogg');
		game.load.audio('weapon swing', 'assets/audio/Weapon Swing.ogg');
		game.load.audio('leafblower', 'assets/audio/Leafblower.ogg');
		// Altered from the original by user Timbre: https://freesound.org/s/103218/. License: https://creativecommons.org/licenses/by-nc/3.0/.
		game.load.audio('block', 'assets/audio/Clang.ogg');
	},
	create: function(){
		// We're going to be using physics, so enable the Arcade Physics system
		game.physics.startSystem(Phaser.Physics.ARCADE);

		//Tilemap creation
		game.physics.arcade.TILE_BIAS = 32;
		this.map = game.add.tilemap('level');
		this.map.addTilesetImage('Tilesheet3', 'tilesheet');
		this.map.setCollisionByExclusion([]);
		this.mapLayer = this.map.createLayer('Tile Layer 1');
		this.mapLayer.resizeWorld();
		
		//Far Background creation
		this.farStage = game.add.sprite(0, 0, 'farBackground');

		//Add background to game
		this.stage = game.add.sprite(0, 3200, 'stage');
		this.stage.anchor.y = 1;
		
		// Draw the background
		//this.background = game.add.tileSprite(0, 0, game.width, game.height, "background");
		game.stage.setBackgroundColor('#87CEEB');

		// A bar at the top so health and score are more visible
		this.HUDBar = game.add.sprite(0, 0, 'top bar');
		this.HUDBar.scale.setTo(2.0, 1.2); // 400x50 -> 800x60
		this.HUDBar.alpha = 0.8;
		this.HUDBar.fixedToCamera = true;

		// -------------------------------------------------------------------------------------------------------------

		// This object will hold all the audio assets that prefabs could need to use
		this.audio = {
			playerJump: game.add.audio('player jump'),
			playerHurt: game.add.audio('player hurt'),
			enemyHurt: game.add.audio('enemy hurt'),
			enemyDeath: game.add.audio('enemy death'),
			weaponSwing: game.add.audio('weapon swing'),
			leafblower: game.add.audio('leafblower'),
			block: game.add.audio('block')
		};

		this.audio.playerJump.volume = 0.1;
		this.audio.playerHurt.volume = 0.1;
		this.audio.enemyHurt.volume = 0.1;
		this.audio.enemyDeath.volume = 0.1;
		this.audio.weaponSwing.volume = 0.1;
		this.audio.block.volume = 0.1;
		this.audio.leafblower.volume = 0.45;

		if(currentTrack.isPlaying){
			currentTrack.stop();
		}
		currentTrack = game.add.audio('game music');
		currentTrack.volume = 0.25;

		// Groups (populated dynamically later on)
		this.enemies = game.add.group();
		this.enemyProjectiles = game.add.group();
		this.enemyProjectiles.enableBody = true;

		// Set up the player
		this.player = new Granny(game, 90, 1800, this.enemies, this.enemyProjectiles, this.audio, GrannyDAMAGE);
		this.player.switchWeapon(shovel);
		this.player.currentWeapon.rearm(this.player, this.player.currentWeaponObj);
		game.add.existing(this.player);
		game.camera.follow(this.player);

		// a couple variables which allow us to respond to changes in the player's health/score
		this.playerHealthPrev = this.player.health;
		this.playerScorePrev = 0;

		//Adding text to keep score at the top left of screen
    	this.healthBar = game.add.text(16, 16, 'Health: ' + this.player.health, { fontSize: 32, stroke: '#000000', strokeThickness: 3, fill: '#ffffff' });
    	this.healthBar.anchor.setTo(0.5); // for consistency with the score text
    	this.healthBar.fixedToCamera = true;
    	this.healthBar.cameraOffset.setTo(120, 30.5);

    	//Adding text to keep score at the top right of screen
    	this.scoreText = game.add.text(16, 16, 'Score: ' + Granny.score, { fontSize: 32, stroke: '#000000', strokeThickness: 3, fill: '#ffffff' });
    	this.scoreText.anchor.setTo(0.5);
    	this.scoreText.fixedToCamera = true;
    	this.scoreText.cameraOffset.setTo(700.5, 30.5); // .5s necessary for sharpness if we have a custom anchor :shrug:

		//Setting up spawn points
		this.spawnPoints = [[39, 3090], [2275, 3090], [39, 2835], [2275, 2835], [39, 2325], [2275, 2325], [39, 1815], [2275, 1815],
		[39, 1300], [2275, 1300], [39, 785], [2275, 785]];
		this.spawnCounter = 0;
		this.spawnPoint = -1;
		this.tempVal = -1;

		// Set up the enemies
		this.enemies.add(new Enemy(game, 39, 3090, this.player, this.enemyProjectiles, 39, 2275, this.audio));
		this.enemies.add(new EnemyTree(game, 2775, 0, this.player, this.enemies, this.enemyProjectiles, this.audio));

		//Black Screen
		this.blackScreen = game.add.sprite(-50, -50, 'blackScreen');
		this.blackScreen.scale.x = 5;
		this.blackScreen.scale.y = 20;

		// Block cooldown text
		this.blockCooldownText = game.add.text(0, 0, 'If this text appears ingame then something\'s wrong',
				{font: 'Palatino', fontSize: 18, stroke: '#000000', strokeThickness: 2, fill: '#bbbbbb'});
		this.blockCooldownText.anchor.setTo(0.5);
    	this.blockCooldownText.fixedToCamera = true;
    	this.blockCooldownText.cameraOffset.setTo(game.width/2 + 0.5, game.height - 39.5); // .5s necessary for sharpness if we have a custom anchor :shrug:
    	this.blockCooldownText.alpha = 0.0;
	},

	update: function(){

		// ----------------------------------- SPAWNING -----------------------------------
		//Counters
		++moneyCounter;
		++this.spawnCounter;

		//Randomly spawning enemies based on time
		if ((this.spawnCounter % 500) == 0 && this.enemies.length < 50) {
			for (i = 0; i < (this.spawnCounter / 500); i++) {i
				this.spawnPoint = game.rnd.integerInRange(0, 11);
				this.tempVal = game.rnd.integerInRange(1, 10);
				var spawnedEnemy;
				// Spawn an enemy at a random x and y from the list
				if (this.tempVal == 10) { // Tree
					spawnedEnemy = this.enemies.add(new EnemyTree(game, this.spawnPoints[this.spawnPoint][0],
					this.spawnPoints[this.spawnPoint][1], this.player, this.enemies, this.enemyProjectiles, this.audio));
				}
				else { // Spitter
					spawnedEnemy = this.enemies.add(new Enemy(game, this.spawnPoints[this.spawnPoint][0],
					this.spawnPoints[this.spawnPoint][1], this.player, this.enemyProjectiles, 39, 2275, this.audio));
				}
			}
		}

		// ---------------------------------- COLLISIONS ----------------------------------
		// Keep in mind that collide repels the objects, while overlap does not

		// Terrain collisions
		game.physics.arcade.collide(this.player, this.mapLayer);
		game.physics.arcade.collide(this.enemies, this.mapLayer);
		game.physics.arcade.collide(this.enemyProjectiles, this.mapLayer, this.bulletContactTerrain, null, this);
		// probably check for enemyProjectiles too, but we can implement that later on

		// The various collisions which cause the player to take damage
		// this logic should probably be moved into the enemy prefab eventually
		game.physics.arcade.collide(this.player.hitbox, this.enemies, this.enemyContact, null, this);

		game.physics.arcade.overlap(this.player.hitbox, this.enemyProjectiles, this.bulletContact, null, this);

		// ------------------------------------- HUD --------------------------------------

		game.world.bringToTop(this.HUDBar);
		game.world.bringToTop(this.healthBar);
		game.world.bringToTop(this.scoreText);

		// Flash the health bar when the player takes damage
		if(this.playerHealthPrev != this.player.health){
			if(this.player.health < 0){
				this.healthBar.text = "Health: 0";
			}
			else if(this.player.health >= 0){
				this.healthBar.text = "Health: " + this.player.health;
			}
			
			if(this.playerHealthPrev > this.player.health){ // the player took damage
				this.healthBar.tint = 0xff4444;
			}
			else{
				this.healthBar.tint = 0x44ff44;
			}
			this.playerHealthPrev = this.player.health;
		}
		else if(this.healthBar.tint < 0xffffff){
			if(this.healthBar.tint >= 0xff0000){
				this.healthBar.tint += 0x001111;
			}
			else{
				this.healthBar.tint += 0x110011;
			}		
		}

		// Pop the score when the player kills something
		if(this.playerScorePrev != Granny.score){
			this.scoreText.text = "Score: " + Granny.score;
			this.scoreText.fontSize = 40;
			this.playerScorePrev = Granny.score;
		}
		else if(this.scoreText.fontSize > 32){
			this.scoreText.fontSize -= 1;
		}

		// Show the cooldown for blocking, if applicable
		if(this.player.blockTime < 0){
			this.blockCooldownText.text = "Block: " + (-this.player.blockTime/game.time.fps).toFixed(2) + "s"; // round to 2 decimal places
			this.blockCooldownText.alpha = 1.0;
		}
		else{
			this.blockCooldownText.alpha = 0.0;
		}
		

		// ------------------------------------ AUDIO -------------------------------------

		// Loop the audio
		if(currentTrack.isDecoded && !currentTrack.isPlaying){
			currentTrack.play();
		}

		// ------------------------------- STATES & SUCH ----------------------------------
		// If all the enemies are dead, trigger the game over state
		if (this.enemies.length == 0) {
			this.SCREENFLAG = true; //In Screen Fade
		}
		if (EnemyJumper.growthReady == true) {
			this.enemies.add(new EnemyTree(game, EnemyJumper.x, EnemyJumper.y - 100, this.player, this.enemies, this.enemyProjectiles, this.audio));
			EnemyJumper.growthReady = false;
		}

		// ------------------------------ SCREEN FADE ------------------------------------
		if(this.player.health <= 0){
			this.SCREENFLAG = true;
		}
		if(this.SCREENFLAG == false && this.blackScreen.alpha >= 0){
			this.blackScreen.alpha -= .03;
		}
		if(this.SCREENFLAG == true && this.blackScreen.alpha <= 1){
			this.blackScreen.alpha += .03;
		}
		if(this.blackScreen.alpha >= 1){
			this.SCREENFLAG = false;
			game.stage.setBackgroundColor('#FFFFF');
			game.state.start('GameOver', true, false, 1); // 1 means you win
		}
	},

	// The render function is mostly used for debugging
	render: function(){
		// Here's my attempt to draw a debug pixel on the shovel blade. It was laggy, imprecise and involved lots of arbitrary values,
		// so ultimately I decided to just stick with the rectangle hitbox. Maybe someone can do something with this in the future.
		/*
		var xOffset = (this.player.currentWeaponObj.width-20)*Math.cos(this.player.currentWeaponObj.rotation+(Math.PI/4)); // why the last +?
		var yOffset = (this.player.currentWeaponObj.height/2)*Math.sin(this.player.currentWeaponObj.rotation+(Math.PI/4)); // ditto
		game.debug.pixel(
				this.player.x + xOffset * (4/5) * (this.player.facing == 'left' ? -1 : 1) - game.camera.x, // why is *(4/5) necessary?
				this.player.y + yOffset * (10/9) - 3 - game.camera.y, // likesise, why *(10/9) - 3
				'#ff00ff', 5
		);
		*/

		// The below code uses the arbitrary value of 65 but seems to work better, and it's much simpler	
		
		/*
		var shovelBladeX = this.player.x + 90*Math.cos(this.player.currentWeaponObj.rotation)*(this.player.facing == 'left' ? -1 : 1);
		var shovelBladeY = this.player.y + 90*Math.sin(this.player.currentWeaponObj.rotation);
		game.debug.pixel(shovelBladeX-this.camera.x-2, shovelBladeY-this.camera.y-2, '#ff00ff', 5);
		game.debug.pixel(this.player.x-this.camera.x-2, this.player.y-this.camera.y-2, '#ff00ff', 5);
		*/

		//game.debug.physicsGroup(this.enemies);
		
		
		
	},

	//Function for when a plant projectile contacts player
	bulletContact: function(player, bullet) {
		if(bullet.owner != this.player){
			this.player.takeDamage(8, bullet);
			bullet.kill();
		}
	},

	enemyContact: function(player, enemy) {
		if(enemy.MELEE_DAMAGE != null){
			this.player.takeDamage(enemy.MELEE_DAMAGE, enemy);
		}
	},

	bulletContactTerrain: function(bullet, terrain) {
		bullet.kill();
	}

}

var GameOver = function(game){
	this.SELECT = 1;
	this.SCREENFLAG = false;
};
GameOver.prototype = {
	init: function(score){
		this.score = score;
	},
	preload: function(){
		game.load.image('endscreen', 'assets/img/Endscreen.png');
		game.load.image('select', 'assets/img/Select.png');
		game.load.image('hubBackground', 'assets/img/EndscreenHubBackground.png');
	},
	create: function(){

		// background color already set in MainMenu
		tempMoney = Math.floor((moneyCounter / 100) * Granny.score);
		money += Math.floor((moneyCounter / 100) * Granny.score);

		game.add.sprite(0, 0, 'endscreen');
		this.hubBack = game.add.sprite(400, -200, 'hubBackground');
		this.hubBack.anchor.set(.5);
		this.hubBack.alpha = .95;

		this.select = game.add.sprite(400, 800, 'select');
		this.select.anchor.set(.5);
		this.select.alpha = .75;

		//text to upgrade weapon
		this.upgrade = game.add.text(400, -350, 'Upgrade Weapon', {font: '26px Sabon', fill: '#fffff'});
		this.upgrade.anchor.set(.5);
		

		//text to play again
		this.playAgain = game.add.text(400, -60, 'Continue', {font: '26px Sabon', fill: '#fffff'});
		this.playAgain.anchor.set(.5);

		//score
		this.scoreText = game.add.text(160, -250, 'Score:', {font: '26px Sabon', fill: '#fffff'});
		this.scoreText2 = game.add.text(190, -200, Granny.score, {font: '26px Sabon', fill: '#fffff'});
		this.scoreText2.anchor.set(.5);
		this.scoreText3 = game.add.text(540, -250, 'Total Cash:', {font: '26px Sabon', fill: '#fffff'});
		this.scoreText4 = game.add.text(570, -200, '$' + money, {font: '26px Sabon', fill: '#fffff'});
		this.scoreText4.anchor.set(.5);
		this.scoreText5 = game.add.text(330, -250, 'Earned Cash:', {font: '26px Sabon', fill: '#fffff'});
		this.scoreText6 = game.add.text(360, -200, '$' + tempMoney, {font: '26px Sabon', fill: '#fffff'});
		this.scoreText6.anchor.set(.5);

		if(currentTrack.isPlaying){
			currentTrack.stop();
		}

		//Create blackscreen for fade
		this.blackScreen = game.add.sprite(-50, -50, 'blackScreen');
	},
	update: function(){

		//Fade in and out
		if(this.SCREENFLAG == false && this.blackScreen.alpha >= 0){
			this.blackScreen.alpha -= .02;
		}
		if(this.SCREENFLAG == true && this.blackScreen.alpha <= 1){
			this.blackScreen.alpha += .03;
		}
		if(this.blackScreen.alpha >= 1){
			this.SCREENFLAG = false;
			game.stage.setBackgroundColor('#FFFFF');
			game.state.start("Play");
		}	

		//hub animation
		if(this.hubBack.y < game.height/2){
			this.hubBack.y += 5;
			this.upgrade.y += 5;
			this.playAgain.y += 5;
			this.scoreText.y += 5;
			this.scoreText2.y += 5;
			this.scoreText3.y += 5;
			this.scoreText4.y += 5;
			this.scoreText5.y += 5;
			this.scoreText6.y += 5;
		}

		this.scoreText4.text = "$" + money;

		//select controls
		if(game.input.keyboard.downDuration(Phaser.Keyboard.DOWN, 1)){
			if(this.SELECT == 1) this.SELECT = 2;
			else this.SELECT = 1;
		}
		else if(game.input.keyboard.downDuration(Phaser.Keyboard.UP, 1)){
			if(this.SELECT == 1) this.SELECT = 2;
			else this.SELECT = 1;
		}
		if(this.SELECT == 1 && this.hubBack.y >= game.height/2){
			this.select.y = 150;
		}
		else if(this.SELECT == 2 && this.hubBack.y >= game.height/2){
			this.select.y = 440;
		}

		if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
			if(this.SELECT == 1 && money >= 1000){
				//upgrade weapon
				money -= 1000;
				++GrannyDAMAGE;
			}
			else if(this.SELECT == 2){
				this.SCREENFLAG = true;
			}
		}
	}
}

// Start the game
game.state.add("MainMenu", MainMenu);
game.state.add("Play", Play);
game.state.add("GameOver", GameOver);
//game.state.add("UpgradeMenu", UpgradeMenu);
game.state.start("MainMenu");

