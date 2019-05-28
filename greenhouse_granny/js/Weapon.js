var shovel = {
	name: 'shovel',
	path: 'assets/img/shovel.png',
	type: 'melee',
	damage: 1,
	scale: 0.14,
	cooldown: 30,
	duration: 30,
	defaultAngle: -90,
	enemiesDamagedThisAttack: [], // I guess we can tie this property to shovel and not shovelObj since there's only one granny
	update: function(player, shovelObj){ // called every tick
		if(player.attackCooldown > 0){
			shovelObj.angle = -90 + 80*Math.sin((Math.PI*player.attackCooldown)/30);
		}
	},
	attack: function(game, player, shovelObj, enemies){ // called when the player attacks
		player.attackCooldown = this.cooldown;
		
		enemies.forEachAlive(function(enemy){
			if (Math.abs(enemy.x-(player.x+(player.facing == 'left' ? -50 : 50))) < 100 && Math.abs(enemy.y-player.y) < 50){
				if(player.enemiesDamagedThisAttack.some(e => e === enemy)) return; // skip this enemy if it was already damaged
				else player.enemiesDamagedThisAttack.push(enemy); // otherwise add it to the list and deal damage to it
				enemy.takeDamage(1);
			}
		}, this, true);
		
		
		
		// doesn't work for some strange reason so we have to do the above instead
		// this is probably because child objects can't have physics bodies
		/*
		game.physics.arcade.overlap(shovelObj, enemies, function(shovelObj, enemy){
			// If we've aready camaged an enemy this attack, don't damage it again
			if(this.enemiesDamagedThisAttack.some(e => e === enemy)) return;
			else this.enemiesDamagedThisAttack.push(enemy);
			console.log("hit enemy");
			
			enemy.takeDamage(1);
		}, null, this);
		*/
		
		
	},
	rearm : function(player){
		player.enemiesDamagedThisAttack = [];
	}
}