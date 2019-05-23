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
		var title = game.add.text(game.width/2, 220, "v0.1", { fontSize: '32px', fill: '#000' })

		//background and text for play, controls, and credits
		var back = game.add.sprite(60, 300, 'buttonbackground');
		game.add.text(125, 315, 'Play', {font: '40px Sabon', fill: '#fffff'});

		back = game.add.sprite(60, 380, 'buttonbackground');
		game.add.text(90, 395, 'Controls', {font: '40px Sabon', fill: '#fffff'});

		back = game.add.sprite(60, 460, 'buttonbackground');
		game.add.text(100, 475, 'Credits', {font: '40px Sabon', fill: '#fffff'});

		this.instructions = game.add.text(320, 380, 'Use up and down arrow to change\nselection and use spacebar to select',
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

		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && this.SELECT == 1){
			game.state.start('Play');
		}
		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && this.SELECT == 2){
			if(this.SHOW == 2){
				this.credits.alpha = 0;
			}
			this.controlQ.alpha = 1;
			this.controlS.alpha = 1;
			this.controlA.alpha = 1;
			this.SHOW = 1;
		}
		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && this.SELECT == 3){
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

var Play = function(game){};
Play.prototype = {
	preload: function(){
		//game.load.image('granny', 'assets/img/Gardener.png'); // replace with spritesheet/texture atlas
		// an old background that we should get rid of soon
		//game.load.image('background', 'assets/img/pixel background.png');
		game.load.image('platform', 'assets/img/platform.png');
		game.load.image('shovel', shovel.path);
		game.load.image('seed projectile', 'assets/img/Seed_Projectile.png');
		game.load.image('spitter plant', 'assets/img/Spitter_Plant.png');
		game.load.spritesheet('granny', 'assets/img/SpriteSheets/Gardener_SpriteSheet.png', 113, 148);

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

		//Adding text to keep score at the top left of screen
    	this.healthBar = game.add.text(16, 16, 'Health: ' + this.player.health * 10 + '%', { fontSize: '32px', fill: '#ffffff' });
    	this.healthBar.fixedToCamera = true;
    	this.healthBar.cameraOffset.setTo(16, 16);

    	this.score = 0;

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

		// Terrain collisions
		game.physics.arcade.collide(this.player, this.mapLayer);
		game.physics.arcade.collide(this.enemies, this.mapLayer);
		game.physics.arcade.collide(EnemyTree.acorns, this.mapLayer);
		game.physics.arcade.collide(this.enemyProjectiles, this.mapLayer, this.bulletContactTerrain, null, this);
		// probably check for enemyProjectiles too, but we can implement that later on

		// The various collisions which cause the player to take damage
		// this logic should probably be moved into the enemy prefab eventually

		game.physics.arcade.collide(this.player, this.enemies, function(player, enemy){
			player.takeDamage(3, enemy);
		});
		game.physics.arcade.collide(this.player, EnemyTree.acorns, function(player, enemy){
			player.takeDamage(3, enemy);
		});

		game.physics.arcade.overlap(this.player, this.enemyProjectiles, this.bulletContact, null, this);

		// For now just updating the health bar every tick is the way to go because I don't want to deal with wrapper objects
		this.healthBar.text = "Health: " + this.player.health * 10 + "%";

		// ------------------------------------ AUDIO -------------------------------------

		// Loop the audio
		if(!currentTrack.isPlaying){
			currentTrack.play();
		}

		// ------------------------------- STATES & SUCH ----------------------------------
		
		// If all the enemies are dead, trigger the game over state
		if (this.enemies.count == 0) {
			game.state.start('GameOver', true, false, 1); // 1 means you win
		}
		if (EnemyJumper.growthReady == true) {
			this.enemies.add(new EnemyTree(game, EnemyJumper.x, EnemyJumper.y - 100, this.player, this.enemyProjectiles));
			EnemyJumper.growthReady = false;
		}
		
	},

	//Function for when a plant projectile contacts player
	bulletContact: function(player, bullet) {
		this.player.takeDamage(1, bullet);
		bullet.kill();
	},

	bulletContactTerrain: function(bullet, terrain) {
		bullet.kill();
	}

}

var GameOver = function(game){};
GameOver.prototype = {
	init: function(score){
		this.score = score;
	},
	create: function(){
		// background color already set in MainMenu
		game.add.text(16, 16, "Game over\nScore: " + this.score + "\nPress r to play again", { fontSize: '32px', fill: '#000' });
		if(currentTrack.isPlaying){
			currentTrack.stop();
		}
	},
	update: function(){
		if(game.input.keyboard.isDown(Phaser.Keyboard.R)){
			game.state.start("Play");
		}
	}
}

// Start the game
game.state.add("MainMenu", MainMenu);
game.state.add("Play", Play);
game.state.add("GameOver", GameOver);
game.state.start("MainMenu");
