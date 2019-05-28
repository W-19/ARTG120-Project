var shovel = {
	name: 'shovel',
	path: 'assets/img/shovel.png',
	type: 'melee',
	damage: 1,
	scale: 0.14,
	cooldown: 30,
	defaultAngle: -90,
	enemiesDamagedThisAttack: [], // I guess we can tie this property to shovel and not shovelObj since there's only one granny
	update: function(player, shovelObj){ // called every tick
		if(player.attackCooldown > 0){
			shovelObj.angle = -90 + 40*Math.sin((Math.PI*player.attackCooldown)/30);
		}
	},
	attack: function(game, player, shovelObj, enemies){ // called when the player attacks
		player.attackCooldown = this.cooldown;
		
		enemies.forEachAlive(function(enemy){
			if (Math.abs(enemy.x-(player.x+(player.facing == 'left' ? -1 : 1))) < 100 && enemy.y-60 <= player.y){
				if(this.enemiesDamagedThisAttack.some(e => e === enemy)) return;
				else this.enemiesDamagedThisAttack.push(enemy);
				enemy.takeDamage(1);
			}
		}, this, true);
		
		
		
		// doesn't work for some strange reason so we have to do the above instead
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
	rearm : function(){
		this.enemiesDamagedThisAttack = [];
	}
}