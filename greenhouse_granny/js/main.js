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
		game.load.image('granny', 'assets/img/60 second granny.png'); // replace with spritesheet
		game.load.image('background', 'assets/img/pixel background.png');
		game.load.image('platform', 'assets/img/platform.png');
		game.load.image('shovel', 'assets/img/shovel.png');
	},
	create: function(){
		// We're going to be using physics, so enable the Arcade Physics system
		game.physics.startSystem(Phaser.Physics.ARCADE);

		// Add audio to the game

		// Draw the background
		this.background = game.add.tileSprite(0, 0, game.width, game.height, "background");

		// Set up the player
		this.player = new Granny(game, 100, 400);
		game.add.existing(this.player);
		game.camera.follow(this.player);
		this.player.health = 5;

		shovel = this.player.addChild(game.make.sprite(1,-5,'shovel'));
		shovel.scale.setTo(0.08);
		shovel.angle = -75;
		shovel.enableBody = true;
		shovelCooldown = 0;

		// A group that holds all the platforms. It isn't used right now.
		this.platforms = game.add.group();
		this.platforms.enableBody = true;

		// A group that holds all the enemy projectiles
		this.enemyProjectiles = game.add.group();
		this.enemyProjectiles.enableBody = true;

		// Set up the enemy
		this.plant = new Enemy(game, 350, 400, this.player, this.enemyProjectiles);
		game.add.existing(this.plant);
		this.plant.health = 3;

		//Adding text to keep score at the top left of screen
    	this.healthBar = game.add.text(16, 16, 'Health: 5', { fontSize: '32px', fill: '#ffffff' });
	},
	update: function(){

		//Checking to see if player overlaps with plant
		game.physics.arcade.collide(this.player, this.plant, enemyContact, null, this);

		//Check to see if player and bullet overlap
		game.physics.arcade.overlap(this.player, this.enemyProjectiles, bulletContact, null, this);

		this.healthBar.text = "Health: " + this.player.health;

		//If player is out of health game ends
		if (this.player.health == 0) {
			game.state.start('GameOver');
		}

		var qkey = game.input.keyboard.addKey(Phaser.Keyboard.Q);

		if (qkey.isDown && shovelCooldown == 0) {
			shovel.angle = -45;
			shovelCooldown = 25;
			if (this.plant.x - this.player.x < 100 && this.plant.x - this.player.x > 0) {
				this.plant.x += 50;
				--this.plant.health;
			}
		}
		if (shovelCooldown > 0) {
			--shovelCooldown;
		}
		if (shovelCooldown == 0) {
			shovel.angle = -75;
		}

		if (this.plant.health == 0) {
			this.plant.destroy();
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

