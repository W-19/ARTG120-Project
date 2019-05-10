//Creating Granny function
Platform = function(game, x, y) {

	Phaser.Sprite.call(this, game, x, y, 'platform');

	//Setting some attributes for the platform
	this.anchor.set(0.5);
	game.physics.enable(this);
	this.scale.setTo(6, 1);
	
}

//Creating a prototype for granny
Platform.prototype = Object.create(Phaser.Sprite.prototype);
Platform.prototype.constructor = Platform;