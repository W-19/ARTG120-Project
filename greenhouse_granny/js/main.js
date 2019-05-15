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

var MainMenu = function(game){};
MainMenu.prototype = {
	create: function(){
		game.stage.backgroundColor = "#AFAFAF";
		game.add.text(16, 16, "Welcome to Greenhouse Granny v0.1", { fontSize: '32px', fill: '#000' })
		game.add.text(16, 100,
				"Eventually the main menu screen will look fancier than this.\n" +
				"Press space to start, use the arrow keys to move the granny, Q to attack.",
				{ fontSize: '16px', fill: '#000' });
	},
	update: function(){
		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
			game.state.start("Play");
		}
	}
}

var Play = function(game){};
Play.prototype = {
	preload: function(){
		game.load.image('granny', 'assets/img/Gardener.png'); // replace with spritesheet/texture atlas
		// an old background that we should get rid of soon
		//game.load.image('background', 'assets/img/pixel background.png');
		game.load.image('platform', 'assets/img/platform.png');
		game.load.image('shovel', shovel.path);
		game.load.image('seed projectile', 'assets/img/Seed_Projectile.png');
		game.load.image('spitter plant', 'assets/img/Spitter_Plant.png');

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
    	this.healthBar = game.add.text(16, 16, 'Health: ' + this.player.health, { fontSize: '32px', fill: '#ffffff' });
    	this.healthBar.fixedToCamera = true;
    	this.healthBar.cameraOffset.setTo(16, 16);

		// A group that holds all the enemy projectiles
		this.enemyProjectiles = game.add.group();
		this.enemyProjectiles.enableBody = true;

		// Set up the enemies
		this.enemies.add(new Enemy(game, 500, 1700, this.player, this.enemyProjectiles));
    	
	},

	update: function(){

		// ---------------------------------- COLLISIONS ----------------------------------
		// Keep in mind that collide repels the objects, while overlap does not

		// Terrain collisions
		game.physics.arcade.collide(this.player, this.mapLayer);
		game.physics.arcade.collide(this.enemies, this.mapLayer);
		// probably check for enemyProjectiles too, but we can implement that later on

		// The various collisions which cause the player to take damage
		// this logic should probably be moved into the enemy prefab eventually
		if(game.physics.arcade.collide(this.player, this.enemies)){
			this.takeDamage(1);
		}
		game.physics.arcade.overlap(this.player, this.enemyProjectiles, this.bulletContact, null, this);

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
		
	},

	takeDamage: function(amount){
		this.player.health -= amount;
		if (this.player.health == 0) {
			game.state.start('GameOver', true, false, 0); // 0 means you lose
		}
		this.healthBar.text = "Health: " + this.player.health;
	},

	//Function for when a plant projectile contacts player
	bulletContact: function(player, bullet) {
		bullet.kill();
		this.takeDamage(1);
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
