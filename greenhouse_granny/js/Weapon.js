var shovel = {
	name: 'shovel',
	path: 'assets/img/Shovel_Updated.png',
	type: 'melee',
	damage: 1,
	scale: 1.0,
	anchorX: 0.0,
	anchorY: 0.0,
	cooldown: 25,
	defaultAngle: -90,
	update: function(player, shovelObj){ // called every tick
		if(player.attackCooldown > 0){
			//shovelObj.angle = -90 + 80*Math.sin((Math.PI*player.attackCooldown)/30);
			shovelObj.angle = -130 + 7*(this.cooldown-player.attackCooldown);
		}
	},
	commenceAttack: function(player, shovelObj){
		shovelObj.alpha = 1.0;
		player.attackSound.play();
	},
	attack: function(game, player, shovelObj, enemies){ // called when the player attacks	

		// Remove the 0.1 when the image skewedness is fixed
		var shovelBladeX1 = player.x + 110*Math.cos(shovelObj.rotation-0.08+0.1)*(player.facing == 'left' ? -1 : 1);
		var shovelBladeY1 = player.y + 110*Math.sin(shovelObj.rotation-0.08+0.1);
		var shovelBladeX2 = player.x + 110*Math.cos(shovelObj.rotation+0.08+0.1)*(player.facing == 'left' ? -1 : 1);
		var shovelBladeY2 = player.y + 110*Math.sin(shovelObj.rotation+0.08+0.1);

		// Draws two lines from the player's center to each side of the shovel blade
		var hitLine1 = new Phaser.Line(player.x, player.y, shovelBladeX1, shovelBladeY1);
		var hitLine2 = new Phaser.Line(player.x, player.y, shovelBladeX2, shovelBladeY2);

		// Why in God's name do we need to use extended lines if the player and enemy are both facing left???
		var hitLine1LL = new Phaser.Line(player.x, player.y, shovelBladeX1-25, shovelBladeY1);
		var hitLine2LL = new Phaser.Line(player.x, player.y, shovelBladeX2-25, shovelBladeY2);

		// For some reason we it's hard for the player to can hit normal enemies from the back when facing left,
		// but even stretching the hit lines in this case had no effect... or did it?

		// Tests for an intersection between the lines and each enemy
		enemies.forEachAlive(function(enemy){
			
			// if theyre both facing left
			if(enemy.facing == 'left' && player.facing == 'left'){
				if (Phaser.Line.intersectsRectangle(hitLine1LL, enemy) || Phaser.Line.intersectsRectangle(hitLine2LL, enemy)){
					if(player.enemiesDamagedThisAttack.some(e => e === enemy)) return; // skip this enemy if it was already damaged
					player.enemiesDamagedThisAttack.push(enemy); // otherwise add it to the list...
					enemy.takeDamage(this.damage); // ...and deal damage to it
				}
				return;
			}
			

			// otherwise
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