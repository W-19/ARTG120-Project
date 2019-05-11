/*
 * This is the main file for the Greenhouse Granny game.
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

// Define states
var MainMenu = function(game){};
MainMenu.prototype = {
	create: function(){
		game.stage.backgroundColor = "#AFAFAF";
		game.add.text(16, 16, "Welcome to Greenhouse Granny v0.0.0.0.1", { fontSize: '32px', fill: '#000' })
		game.add.text(16, 100,
				"Eventually the main menu screen will look fancier than this.\n" +
				"Press space to start and use the arrow keys to move the granny.",
				{ fontSize: '16px', fill: '#000' });
	},
	update: function(){
		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
			game.state.start("Play");
		}
	}
}

var Play = function(game){
	this.ALPHA = .2;
};
Play.prototype = {
	preload: function(){
		game.load.image('granny', 'assets/img/60 second granny.png'); // replace with spritesheet
		game.load.image('sky', 'assets/img/sky.png');
		game.load.image('platform', 'assets/img/platform.png');

		//Load in tilemap and spritesheet
		game.load.tilemap('level', 'assets/tilemaps/tempTileMap.json', null, Phaser.Tilemap.TILED_JSON);
		game.load.spritesheet('tilesheet', 'assets/img/Tilesheet.png', 64, 64);
	},
	create: function(){
		// We're going to be using physics, so enable the Arcade Physics system
		game.physics.startSystem(Phaser.Physics.ARCADE);

		// Add audio to the game

		// Draw the background
		this.background = game.add.tileSprite(0, 0, game.width, game.height, "sky");

		//Tilemap creation
		this.map = game.add.tilemap('level');
		this.map.addTilesetImage('TempTileSet', 'tilesheet');
		this.mapLayer = this.map.createLayer('Tile Layer 1');
		this.mapLayer.resizeWorld();

		// Set up the player
		this.player = new Granny(game, 100, 400);
		game.add.existing(this.player);
		game.camera.follow(this.player);
		this.player.health = 5;

		// A group that holds all the platforms. It isn't used right now.
		this.platforms = game.add.group();
		this.platforms.enableBody = true;

		//Collison platforms for tilemap *Temp solution*
		var ground = this.platforms.create(85, 730, 'platform');
		ground.alpha = this.ALPHA;
		ground.anchor.set(.5, .5);
		ground.body.immovable = true;
		ground.scale.x = 2.75;

		//Side wall falling from starting platform
		ground = this.platforms.create(640, 780, 'platform');
		ground.alpha = this.ALPHA;
		ground.body.immovable = true;
		ground.scale.y = 50;
		ground.scale.x = .15;
		//ground.angle += 90;

		//ground below starting platform
		ground = this.platforms.create(500, 1860, 'platform');
		ground.alpha = this.ALPHA;
		ground.body.immovable = true;

		//Stairs to go down to bottom
		ground = this.platforms.create(900, 1935, 'platform');
		ground.anchor.set(.5);
		ground.alpha = this.ALPHA; 
		ground.body.immovable = true;
		ground.scale.x = .25;

		ground = this.platforms.create(950, 1975, 'platform');
		ground.anchor.set(.5);
		ground.alpha = this.ALPHA; 
		ground.body.immovable = true;
		ground.scale.x = .25;

		//Bottom
		ground = this.platforms.create(900, 1985, 'platform');
		ground.alpha = this.ALPHA; 
		ground.body.immovable = true;
		ground.scale.x = 10;

		//stairs to go up hill
		ground = this.platforms.create(2535, 1955, 'platform');
		ground.alpha = this.ALPHA; 
		ground.body.immovable = true;
		ground.scale.x = 3.5;

		ground = this.platforms.create(2575, 1920, 'platform');
		ground.alpha = this.ALPHA; 
		ground.body.immovable = true;
		ground.scale.x = 3.3;

		ground = this.platforms.create(2615, 1870, 'platform');
		ground.alpha = this.ALPHA; 
		ground.body.immovable = true;
		ground.scale.x = 3.1;

		ground = this.platforms.create(2650, 1830, 'platform');
		ground.alpha = this.ALPHA; 
		ground.body.immovable = true;
		ground.scale.x = 2.9;

		ground = this.platforms.create(2685, 1790, 'platform');
		ground.alpha = this.ALPHA; 
		ground.body.immovable = true;
		ground.scale.x = 2.75;

		ground = this.platforms.create(2735, 1745, 'platform');
		ground.alpha = this.ALPHA; 
		ground.body.immovable = true;
		ground.scale.x = 2.5;

		ground = this.platforms.create(2535, 1955, 'platform');
		ground.alpha = this.ALPHA; 
		ground.body.immovable = true;
		ground.scale.x = 2.3;

		//top of hill
		ground = this.platforms.create(2755, 1730, 'platform');
		ground.alpha = this.ALPHA; 
		ground.body.immovable = true;
		ground.scale.x = 2.4;

		//wall after hill
		ground = this.platforms.create(4610, 1200, 'platform');
		ground.anchor.x = 0;
		ground.alpha = this.ALPHA; 
		ground.body.immovable = true;
		ground.scale.y = 16;
		ground.scale.x = .25;

		//Floating this.platforms
		ground = this.platforms.create(1027, 325, 'platform');
		ground.alpha = this.ALPHA; 
		ground.body.immovable = true;
		ground.scale.y = 1;
		ground.scale.x = 1.1;

		ground = this.platforms.create(1730, 645, 'platform');
		ground.alpha = this.ALPHA; 
		ground.body.immovable = true;
		ground.scale.y = 1;
		ground.scale.x = 1.1;	

		ground = this.platforms.create(2436, 325, 'platform');
		ground.alpha = this.ALPHA; 
		ground.body.immovable = true;
		ground.scale.y = 1;
		ground.scale.x = 1.1;	

		ground = this.platforms.create(3140, 645, 'platform');
		ground.alpha = this.ALPHA; 
		ground.body.immovable = true;
		ground.scale.y = 1;
		ground.scale.x = 1.1;

		// A group that holds all the enemy projectiles
		this.enemyProjectiles = game.add.group();
		this.enemyProjectiles.enableBody = true;

		// Set up the enemy
		this.plant = new Enemy(game, 350, 400, this.player, this.enemyProjectiles);
		game.add.existing(this.plant);

	},
	update: function(){

		//Check to see if player collides with platforms
		game.physics.arcade.collide(this.player, this.platforms);

		//Check to see if Enemies collides with platforms\
		game.physics.arcade.collide(this.plant, this.platforms);

		//Checking to see if player overlaps with plant
		game.physics.arcade.overlap(this.player, this.plant, enemyContact, null, this);

		//Check to see if player and bullet overlap
		game.physics.arcade.overlap(this.player, this.enemyProjectiles, bulletContact, null, this);

		//If player is out of health game ends
		if (this.player.health == 0) {
			game.state.start('GameOver');
		}
	} 
}

//On contact with enemy player loses health
function enemyContact () {
   --this.player.health;
}

//Function for when a plant projectile contacts player
function bulletContact (player, bullet) {
	bullet.kill();
	--this.player.health;
}

var GameOver = function(game){};
GameOver.prototype = {
	init: function(score){
		this.score = score;
	},
	create: function(){
		// background color already set in MainMenu
		game.add.text(16, 16, "Game over\nScore: " + "[placeholder]" + "\nPress r to play again", { fontSize: '32px', fill: '#000' });
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
