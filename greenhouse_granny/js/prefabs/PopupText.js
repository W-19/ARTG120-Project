// Based on the code from https://webcache.googleusercontent.com/search?q=cache:I-0a1Apdna4J:https://blog.jwiese.eu/en/2017/03/11/phaser2-prefab-clickable-link/+&cd=4&hl=en&ct=clnk&gl=us&client=firefox-b-1-d
class PopupText extends Phaser.Text {
    constructor(game, x, y, text, style, riseFastAndScaleWhileFading) {
        super(game, x, y, text, style);

        this.anchor.set(0.5);
		this.age = 0;
		this.rfaswf = riseFastAndScaleWhileFading;

        // Add custom objects to the game
        this.game.add.existing(this);
    }

    update(){

    	if(this.age > 60) this.destroy();
		else this.age++;

		this.y -= (this.rfaswf ? 0.5 : 0.25);
		if(this.rfaswf){
			if(this.age < 10 || this.age > 50){
				this.fontSize += 1;
			}
		}
		if(this.age > 50){
			this.alpha -= 0.1;
		}
		
    }
}

// This is the prefab I tried to create initially. If I can't get it to work I'll remove it eventually.
/*
PopupText= function(game, x, y, message, color) {

	Phaser.Text.call(this, game, x, y, message, {font: '10px Sabon', color: color});

	this.anchor.set(0.5);
	this.age = 0;

	console.log(this);
}

//Creating a prototype for enemy
PopupText.prototype = Object.create(Phaser.Text.prototype);
PopupText.prototype.constructor = PopupText;

//Update funtion for enemy
PopupText.prototype.update = function() {

	if(this.age > 60) this.destroy();
	else this.age++;

	this.y += 0.5;
	if(this.age > 10){
		this.fontSize ++;
	}
	else if(this.age > 50){
		this.fontSize += 1;
		this.alpha -= 0.1;
	}
}
*/