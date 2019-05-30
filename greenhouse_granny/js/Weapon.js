var shovel = {
	name: 'shovel',
	path: 'assets/img/shovel.png',
	type: 'melee',
	damage: 1,
	scale: 0.14,
	cooldown: 25,
	defaultAngle: -90,
	enemiesDamagedThisAttack: [], // I guess we can tie this property to shovel and not shovelObj since there's only one granny
	update: function(player, shovelObj){ // called every tick
		if(player.attackCooldown > 0){
			//shovelObj.angle = -90 + 80*Math.sin((Math.PI*player.attackCooldown)/30);
			shovelObj.angle = -130 + 7*(this.cooldown-player.attackCooldown);
		}
	},
	commenceAttack: function(shovelObj){
		shovelObj.alpha = 1.0;
	},
	attack: function(game, player, shovelObj, enemies){ // called when the player attacks	

		// A new function that draws lines and checks them for collision with each enemy. Seems to have issues with hitting trees from the rear.
		// Why does 90 work better than 65? Who knows.	
		
		var shovelBladeX = player.x + 90*Math.cos(shovelObj.rotation+(Math.PI/4))*(player.facing == 'left' ? -1 : 1);
		var shovelBladeY = player.y + 90*Math.sin(shovelObj.rotation+(Math.PI/4));

		// Draws two lines from the player's center to just above and below the shovel blade
		var hitLine1 = new Phaser.Line(player.x, player.y, shovelBladeX, shovelBladeY + 10);
		var hitLine2 = new Phaser.Line(player.x, player.y, shovelBladeX, shovelBladeY - 10)		

		// Tests for an intersection between the lines and each enemy
		enemies.forEachAlive(function(enemy){
			if (Phaser.Line.intersectsRectangle(hitLine1, enemy) || Phaser.Line.intersectsRectangle(hitLine2, enemy)){
				if(player.enemiesDamagedThisAttack.some(e => e === enemy)) return; // skip this enemy if it was already damaged
				player.enemiesDamagedThisAttack.push(enemy); // otherwise add it to the list...
				enemy.takeDamage(this.damage); // ...and deal damage to it
			}
		}, this, true);
		
		

		
		// Hitbox: a simple rectangle in front of the player
		/*
		enemies.forEachAlive(function(enemy){
			//This logic badly needs an update
			if(Math.abs((enemy.x-enemy.width/2)-((player.x+player.width/2)+(player.facing == 'left' ? -25 : 25))) < 50 && Math.abs(enemy.y-player.y) < (player.height/2 + enemy.height/2)){
				if(player.enemiesDamagedThisAttack.some(e => e === enemy)) return; // skip this enemy if it was already damaged
				player.enemiesDamagedThisAttack.push(enemy); // otherwise add it to the list...
				enemy.takeDamage(this.damage); // ...and deal damage to it
			}
		}, this, true);
		*/
		
		
		// The old function. Doesn't work. I think it's because child objects can't have functional physics bodies
		/*
		game.physics.arcade.overlap(shovelObj, enemies, function(shovelObj, enemy){
			// If we've aready camaged an enemy this attack, don't damage it again
			if(this.enemiesDamagedThisAttack.some(e => e === enemy)) return;
			else this.enemiesDamagedThisAttack.push(enemy);
			enemy.takeDamage(this.damage);
		}, null, this);
		*/
		
		
	},
	rearm: function(player, shovelObj){
		player.enemiesDamagedThisAttack = [];
		shovelObj.alpha = 0.0;
	}
}