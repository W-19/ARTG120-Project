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

var currentTrack; // allows us to stop the game audio when we enter the GameOver state

// Define states

var MainMenu = function(game){
	this.FLAG = true;
	this.SELECT = 1;
	this.SHOW = 1;
};
MainMenu.prototype = {
	preload: function(){
		game.load.image('title', 'assets/img/GreenhouseGrannyTitle.png');
		game.load.image('select', 'assets/img/Select.png');
		game.load.image('buttonbackground', 'assets/img/Buttonbackground.png')
	},
	create: function(){

		//Set background color
		game.stage.setBackgroundColor('#87CEEB');

		//Add in title sprite
		this.title = game.add.sprite(game.width/2, 120, 'title');
		this.title.anchor.set(.5);

		//Version
		var title = game.add.text(game.width/2, 220, "v0.6", { fontSize: '32px', fill: '#000' })

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
		this.controlQ = game.add.text(400, 350, "Press Q to attack", {font: '30px Sabon', fill: '#fffff'});
		this.controlS = game.add.text(400, 400, "Hold Spacebar to block", {font: '30px Sabon', fill: '#fffff'});
		this.controlA = game.add.text(400, 450, "Use arrow keys to run and jump", {font: '30px Sabon', fill: '#fffff'});

		//Make these intructions invisable
		this.controlQ.alpha = 0;
		this.controlS.alpha = 0;
		this.controlA.alpha = 0;

		//Credits for game
		this.credits = game.add.text(350, 350, "            Made by: \nSimon Katzer, Jack Cuneo, \nMatthew Tolentino, \nand Trystan Nguyen",
						{font: '30px Sabon', fill: '#fffff'});

		this.credits.alpha = 0;

		this.choose = game.add.sprite(60, 300, 'select');
	},
	update: function(){

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

		if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
			if(this.SELECT == 1){
				game.state.start('Play');
			}
			if(this.SELECT == 2){
				if(this.SHOW == 2){
					this.credits.alpha = 0;
				}
				this.controlQ.alpha = 1;
				this.controlS.alpha = 1;
				this.controlA.alpha = 1;
				this.SHOW = 1;
			}
			if(this.SELECT == 3){
				if(this.SHOW == 1){
					this.controlQ.alpha = 0;
					this.controlS.alpha = 0;
					this.controlA.alpha = 0;
				}
				this.credits.alpha = 1;
				this.SHOW = 2;
			}
		}
		
	}
}

var Play = function(game){};
Play.prototype = {
	preload: function(){
		game.load.image('shovel', shovel.path);
		game.load.image('seed projectile', 'assets/img/Seed_Projectile.png');
		game.load.image('spitter plant', 'assets/img/Spitter_Plant.png');
		game.load.spritesheet('granny', 'assets/img/SpriteSheets/Gardener_SpriteSheet.png', 113, 148);
		game.load.spritesheet('plant', 'assets/img/SpriteSheets/Plant_Spitter_SpriteSheet.png', 104, 128);
		game.load.spritesheet('acorn', 'assets/img/SpriteSheets/Acorn_SpriteSheet.png', 61, 80);

		//Load in tilemap and spritesheet
		game.load.tilemap('level', 'assets/tilemaps/Level1Tilemap.json', null, Phaser.Tilemap.TILED_JSON);
		game.load.spritesheet('tilesheet', 'assets/img/Tilesheet.png', 64, 64);

		game.load.audio('track01', 'assets/audio/Track 1.ogg');
		//game.load.audio('track02', 'Track 02.ogg'); // unused rn
	},
	create: function(){
		// We're going to be using physics, so enable the Arcade Physics system
		game.physics.startSystem(Phaser.Physics.ARCADE);

		// Add audio to the game
		this.track01 = game.add.audio('track01');
		this.track01.volume = 0.25;
		//load track 2 when we need it
		currentTrack = this.track01;

		// Draw the background
		//this.background = game.add.tileSprite(0, 0, game.width, game.height, "background");
		game.stage.setBackgroundColor('#87CEEB');

		//Tilemap creation
		this.map = game.add.tilemap('level');
		this.map.addTilesetImage('tempTileset', 'tilesheet');
		this.map.setCollisionByExclusion([]);
		this.mapLayer = this.map.createLayer('Tile Layer 1');
		this.mapLayer.resizeWorld();

		// A group which holds all the enemies (but not their projectiles!). We'll populate it later
		this.enemies = game.add.group();

		// Set up the player
		this.player = new Granny(game, 90, 1800, this.enemies);
		this.player.switchWeapon(shovel);
		game.add.existing(this.player);
		game.camera.follow(this.player);

		// a couple variables which allow us to respond to changes in the player's health/score
		this.playerHealthPrev = this.player.health;
		this.playerScorePrev = 0;

		//Adding text to keep score at the top left of screen
    	this.healthBar = game.add.text(16, 16, 'Health: ' + this.player.health * 10 + '%', { fontSize: 32, fill: '#ffffff' });
    	this.healthBar.anchor.setTo(0.5); // for consistency with the score text
    	this.healthBar.fixedToCamera = true;
    	this.healthBar.cameraOffset.setTo(120, 36.5);

    	//Adding text to keep score at the top right of screen
    	this.scoreText = game.add.text(16, 16, 'Score: ' + Granny.score, { fontSize: 32, fill: '#ffffff' });
    	this.scoreText.anchor.setTo(0.5);
    	this.scoreText.fixedToCamera = true;
    	this.scoreText.cameraOffset.setTo(700.5, 36.5); // .5s necessary for sharpness if we have a custom anchor :shrug:

		// A group that holds all the enemy projectiles
		this.enemyProjectiles = game.add.group();
		this.enemyProjectiles.enableBody = true;

		// Set up the enemies
		//this.enemies.add(new Enemy(game, 1050, 1700, this.player, this.enemyProjectiles, 545, 1050));
		this.enemies.add(new Enemy(game, 1464, 1500, this.player, this.enemyProjectiles, 1290, 1464));
		this.enemies.add(new Enemy(game, 2016, 1700, this.player, this.enemyProjectiles, 1761, 2014));
		this.enemies.add(new Enemy(game, 1695, 1240, this.player, this.enemyProjectiles, 1477, 1695));
		this.enemies.add(new Enemy(game, 1145, 1180, this.player, this.enemyProjectiles, 993, 1145));
		this.enemies.add(new Enemy(game, 762, 855, this.player, this.enemyProjectiles, 417, 762));
		this.enemies.add(new Enemy(game, 351, 190, this.player, this.enemyProjectiles, 212, 351));
		this.enemies.add(new Enemy(game, 2015, 410, this.player, this.enemyProjectiles, 1031, 2015));
		this.enemies.add(new Enemy(game, 1031, 410, this.player, this.enemyProjectiles, 1031, 2015));
		this.enemies.add(new EnemyTree(game, 870, 1700, this.player, this.enemyProjectiles));
		this.enemies.add(new EnemyTree(game, 2000, 100, this.player, this.enemyProjectiles));

	},

	update: function(){

		// ---------------------------------- COLLISIONS ----------------------------------
		// Keep in mind that collide repels the objects, while overlap does not
		++moneyCounter;

		// Terrain collisions
		game.physics.arcade.collide(this.player, this.mapLayer);
		game.physics.arcade.collide(this.enemies, this.mapLayer);
		game.physics.arcade.collide(EnemyTree.acorns, this.mapLayer);
		game.physics.arcade.collide(this.enemyProjectiles, this.mapLayer, this.bulletContactTerrain, null, this);
		// probably check for enemyProjectiles too, but we can implement that later on

		// The various collisions which cause the player to take damage
		// this logic should probably be moved into the enemy prefab eventually
		game.physics.arcade.collide(this.player.hitbox, this.enemies, this.enemyContact, null, this);

		game.physics.arcade.collide(this.player.hitbox, EnemyTree.acorns, this.enemyAcornContact, null, this);

		game.physics.arcade.overlap(this.player.hitbox, this.enemyProjectiles, this.bulletContact, null, this);

		// ------------------------------------- HUD --------------------------------------

		// Flash the health bar when the player takes damage
		if(this.playerHealthPrev != this.player.health){
			this.healthBar.text = "Health: " + this.player.health * 10 + "%";
			this.healthBar.tint = 0xff4444;
			this.playerHealthPrev = this.player.health;
		}
		else if(this.healthBar.tint < 0xffffff){
			this.healthBar.tint += 0x001111;
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
		

		// ------------------------------------ AUDIO -------------------------------------

		// Loop the audio
		if(!currentTrack.isPlaying){
			currentTrack.play();
		}

		// ------------------------------- STATES & SUCH ----------------------------------
		// If all the enemies are dead, trigger the game over state
		if (this.enemies.length == 0) {
			game.state.start('GameOver', true, false, 1); // 1 means you win
		}
		if (EnemyJumper.growthReady == true) {
			this.enemies.add(new EnemyTree(game, EnemyJumper.x, EnemyJumper.y - 100, this.player, this.enemyProjectiles));
			EnemyJumper.growthReady = false;
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
		var shovelBladeX = this.player.x + 65*Math.cos(this.player.currentWeaponObj.rotation+(Math.PI/4))*(this.player.facing == 'left' ? -1 : 1);
		var shovelBladeY = this.player.y + 65*Math.sin(this.player.currentWeaponObj.rotation+(Math.PI/4));
		game.debug.pixel(shovelBladeX-this.camera.x-2, shovelBladeY-this.camera.y-2, '#ff00ff', 5);
		game.debug.pixel(this.player.x-this.camera.x-2, this.player.y-this.camera.y-2, '#ff00ff', 5);
		game.debug.physicsGroup(this.enemies);
		*/
		
		
	},

	//Function for when a plant projectile contacts player
	bulletContact: function(player, bullet) {
		this.player.takeDamage(1, bullet);
		bullet.kill();
	},

	enemyContact: function(player, enemy) {
		this.player.takeDamage(3, enemy);
	},

	enemyAcornContact: function(player, enemy) {
		this.player.takeDamage(3, enemy);
	},

	bulletContactTerrain: function(bullet, terrain) {
		bullet.kill();
	}

}

var GameOver = function(game){
	this.SELECT = 1;
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
		this.playAgain = game.add.text(400, -60, 'Play Again', {font: '26px Sabon', fill: '#fffff'});
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
	},
	update: function(){

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
			if(this.SELECT == 1){
				//upgrade weapon
			}
			else if(this.SELECT == 2){
				game.state.start("Play");
			}
		}
	}
}

// Start the game
game.state.add("MainMenu", MainMenu);
game.state.add("Play", Play);
game.state.add("GameOver", GameOver);
game.state.start("MainMenu");
