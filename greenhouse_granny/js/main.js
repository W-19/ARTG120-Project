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
		game.add.text(16, 16, "Welcome to Greenhouse Granny v0.0.0.0.0.1", { fontSize: '32px', fill: '#000' })
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

var Play = function(game){};
Play.prototype = {
	preload: function(){
		game.load.image('granny', 'assets/img/60 second granny.png'); // replace with spritesheet
		game.load.image('background', 'assets/img/pixel background.png');
	},
	create: function(){
		// We're going to be using physics, so enable the Arcade Physics system
		game.physics.startSystem(Phaser.Physics.ARCADE);

		// Add audio to the game

		// Draw the background
		this.background = game.add.tileSprite(0, 0, game.width, game.height, "background");

		// Set up the player
		this.player = game.add.sprite(100, 400, 'granny');
		this.player.anchor.setTo(0.5);
		game.physics.arcade.enable(this.player);
		this.player.body.collideWorldBounds = true;
		this.player.body.gravity.y = 800;

		// Add controls
		this.cursors = game.input.keyboard.createCursorKeys();
	},
	update: function(){
		// For now you just lose the game if you walk too far to the right
		if(this.player.x > game.width - 100){
			this.state.start('GameOver');
		}

		// Player movement
		if(this.cursors.left.isDown){ // move left
			this.player.body.velocity.x = -250;
		}
		else if(this.cursors.right.isDown){ // move right
			this.player.body.velocity.x = 250;
			this.player.animations.play('right');
		}
		else{ // idle
			this.player.body.velocity.x = 0;
			this.player.animations.stop();
			this.player.frame = 4;
		}

		// Player jumping. She can fly right now but w/e
		if (this.cursors.up.isDown){
			this.player.body.velocity.y = -500;
		}

	}
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

