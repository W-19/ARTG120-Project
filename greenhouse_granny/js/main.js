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

var Play = function(game){
	this.ALPHA = 0.0;
};
Play.prototype = {
	preload: function(){
		game.load.image('granny', 'assets/img/Gardener.png'); // replace with spritesheet/texture atlas
		// an old background that we should get rid of soon
		//game.load.image('background', 'assets/img/pixel background.png');
		game.load.image('platform', 'assets/img/platform.png');
		game.load.image('shovel', 'assets/img/shovel.png');
		game.load.image('seed projectile', 'assets/img/Seed_Projectile.png');
		game.load.image('spitter plant', 'assets/img/Spitter_Plant.png');

		//Load in tilemap and spritesheet
		game.load.tilemap('level', 'assets/tilemaps/tempTileMap.json', null, Phaser.Tilemap.TILED_JSON);
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
		this.map.addTilesetImage('TempTileSet', 'tilesheet');
		this.mapLayer = this.map.createLayer('Tile Layer 1');
		this.mapLayer.resizeWorld();

		// Set up the player
		this.player = new Granny(game, 100, 400);
		game.add.existing(this.player);
		game.camera.follow(this.player);
		this.player.health = 5;

		//Creating a shovel weapon as a child of player
		shovel = this.player.addChild(game.make.sprite(1, -5, 'shovel'));
		shovel.scale.setTo(0.14);
		shovel.angle = -90;
		//Something weird is happening when I try to access the shovels body, potentially due to it being a child sprite
		shovel.enableBody = true;
		shovelCooldown = 0;

		//Adding text to keep score at the top left of screen
    	this.healthBar = game.add.text(16, 16, 'Health: 5', { fontSize: '32px', fill: '#ffffff' });
    	this.healthBar.fixedToCamera = true;
    	this.healthBar.cameraOffset.setTo(16, 16);

		// A group that holds all the platforms. It's a wonky workaround for now.
		this.platforms = game.add.group();
		this.platforms.enableBody = true;

		//Collison platforms for tilemap *Temp solution*
		var ground = this.platforms.create(85, 730, 'platform');
		ground.anchor.set(.5, .5);
		ground.scale.x = 2.75;

		//Side wall falling from starting platform
		ground = this.platforms.create(640, 780, 'platform');
		ground.scale.y = 50;
		ground.scale.x = .15;
		//ground.angle += 90;

		//ground below starting platform
		ground = this.platforms.create(500, 1860, 'platform');

		//Stairs to go down to bottom
		ground = this.platforms.create(900, 1935, 'platform');
		ground.anchor.set(.5);
		ground.scale.x = .25;

		ground = this.platforms.create(950, 1975, 'platform');
		ground.anchor.set(.5);
		ground.scale.x = .25;

		//Bottom
		ground = this.platforms.create(900, 1985, 'platform');
		ground.scale.x = 10;

		//stairs to go up hill
		ground = this.platforms.create(2535, 1955, 'platform');
		ground.scale.x = 3.5;

		ground = this.platforms.create(2575, 1920, 'platform');
		ground.scale.x = 3.3;

		ground = this.platforms.create(2615, 1870, 'platform');
		ground.scale.x = 3.1;

		ground = this.platforms.create(2650, 1830, 'platform');
		ground.scale.x = 2.9;

		ground = this.platforms.create(2685, 1790, 'platform');
		ground.scale.x = 2.75;

		ground = this.platforms.create(2735, 1745, 'platform');
		ground.scale.x = 2.5;

		ground = this.platforms.create(2535, 1955, 'platform');
		ground.scale.x = 2.3;

		//top of hill
		ground = this.platforms.create(2755, 1730, 'platform');
		ground.scale.x = 2.4;

		//wall after hill
		ground = this.platforms.create(4610, 1200, 'platform');
		ground.anchor.x = 0;
		ground.scale.y = 16;
		ground.scale.x = .25;

		//Floating this.platforms
		ground = this.platforms.create(1027, 325, 'platform'); 
		ground.scale.y = 1;
		ground.scale.x = 1.1;

		ground = this.platforms.create(1730, 645, 'platform');
		ground.scale.y = 1;
		ground.scale.x = 1.1;	

		ground = this.platforms.create(2436, 325, 'platform');
		ground.scale.y = 1;
		ground.scale.x = 1.1;	

		ground = this.platforms.create(3140, 645, 'platform');
		ground.scale.y = 1;
		ground.scale.x = 1.1;

		this.platforms.forEach(function(platform){
			platform.body.immovable = true;
			platform.alpha = this.ALPHA;		
		}, this, true);

		// A group that holds all the enemy projectiles
		this.enemyProjectiles = game.add.group();
		this.enemyProjectiles.enableBody = true;

		// Set up the enemy
		this.plant = new Enemy(game, 475, 550, this.player, this.enemyProjectiles);
		game.add.existing(this.plant);
    	
	},

	update: function(){
		// ---------------------------------- COLLISIONS ----------------------------------
		// Keep in mind that collide repels the objects, while overlap does not

		// Terrain collisions
		game.physics.arcade.collide(this.player, this.platforms);
		game.physics.arcade.collide(this.plant, this.platforms);
		// probably check for enemyProjectiles too, but we can implement that later on

		// The various collisions which cause the player to take damage
		if(game.physics.arcade.collide(this.player, this.plant)){
			this.takeDamage(1);
		}
		game.physics.arcade.overlap(this.player, this.enemyProjectiles, this.bulletContact, null, this);

		// ------------------------------------ AUDIO -------------------------------------

		// Loop the audio
		if(!currentTrack.isPlaying){
			currentTrack.play();
		}

		// ------------------------------ INPUT & ATTACKING -------------------------------

		//Creating Q key input
		var qkey = game.input.keyboard.addKey(Phaser.Keyboard.Q);

		//If q is pressed down and shovel is ready to use, granny attacks with her shovel
		if (qkey.isDown && shovelCooldown == 0) {
			shovel.angle = -50;
			shovelCooldown = 25;
			//Same sort of logic that is in the enemy prefab for detecting when player is in range,
			//but now acting as a weapon hitbox detector of sorts
			if (this.plant.x - this.player.x < 100 && this.plant.x - this.player.x > 0 && this.plant.y - 60 <= this.player.y) {
				this.plant.x += 50;
				--this.plant.health;
			}
			if (this.player.x - this.plant.x < 100 && this.player.x - this.plant.x > 0 && this.plant.y - 60 <= this.player.y) {
				this.plant.x -= 50;
				--this.plant.health;
			}
		}
		if (shovelCooldown > 0) {
			--shovelCooldown;
		}
		//When shovel is ready to be used again for an attack, reset shovel angle
		if (shovelCooldown == 0) {
			shovel.angle = -90;
		}

		// ------------ THIS'LL PROBABLY GET MOVED INTO THE PREFAB EVENTUALLY -------------
		
		//If the plant enemy is at zero health it gets removed from game
		if (this.plant.health == 0) {
			this.plant.destroy();
			//For now killing the enemy will also trigger the game over state
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
