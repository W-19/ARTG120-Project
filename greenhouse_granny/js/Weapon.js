var shovel = {
	name: 'shovel',
	path: 'assets/img/shovel.png',
	type: 'melee',
	damage: 1,
	scale: 0.14,
	cooldown: 30,
	update: function(player, shovelObj){ // called every tick
		shovelObj.angle = (player.attackCooldown > 0 ? -50 : -90);
	},
	attack: function(game, player, shovelObj, enemies){ // called when the player attacks
		player.attackCooldown = this.cooldown;
		enemies.forEachAlive(function(enemy){
			if (Math.abs(enemy.x-(player.x+(player.facing == 'left' ? -20 : 20))) < 100 && enemy.y-60 <= player.y){
				enemy.health -= this.damage;
				if(enemy.health <= 0) enemy.destroy(); // maybe replace with kill?
				else enemy.body.velocity.y -= 100;
			}
		}, this, true);

		/* doesn't work for some strange reason so we have to do the above instead
		game.physics.arcade.overlap(shovelObj, enemies, function(shovelObj, enemy){
			console.log("hit enemy");
			enemy.health -= this.damage;
			if(enemy.health <= 0) enemy.destroy(); // maybe replace with kill?
		});
		*/
	}
}