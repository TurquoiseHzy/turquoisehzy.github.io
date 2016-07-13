//global var
var active = true;			//the move admittion
var gameStart = false;		//new game admittion

//func : make a map point
function placeMaker(){
	//place : OBJ{movable[0...3],thing}
	var place = new Object();
	
	//movable : movable for diretions
	place.movable = [];
	for(var i = 0 ;i < 4; i ++)
		place.movable[i] = true;
	
	//thing : thing on point , 0 : space ; >0 : enemy ; <0 : chest
	place.thing = 0;
	return place;
}


//func : make a map enemy randomly
//pos : the position of enemy
function enemyMaker(pos,i){
	//set enemy
	var newEnemy = new Object();
	newEnemy.atk = 2 + Math.floor(i / 10);
	newEnemy.hp = 1 + Math.floor(i / 5);
	newEnemy.spd = 2 + Math.floor(Math.random() * 10) / 10;
	newEnemy.pos = pos ; 
	newEnemy.exp = Math.floor(Math.random()*50);
	newEnemy.stat = 0;
	return newEnemy;
}


//func : make a map chest randomly
//pos : the position of chest
function chestMaker(pos){
	//set chest
	var newChest = new Object();
	
	//seed
	var s = Math.random();
	
	if(s > 0.5){
		newChest.exp = Math.floor(Math.random()*100);
		newChest.hp = 0;
	}
	else{
		newChest.hp = Math.floor(Math.random()*10);
		newChest.exp = 0;
	}
	newChest.pos = pos ; 
	newChest.stat = 0;
	return newChest;
}


//func : make a random map *logic
//size : length	
//enemyAmont : amout of enemy
//chestAmount : amount of chest
function makeRandomMapData(size,enemyAmont,chestAmount){
	//gameMap : OBJ{[...],enemyInfo[],chestInfo[],size}
	var gameMap = new Object();		
	gameMap.size = size;
	//making point
	for(var i = 0;i < size * size ; i ++){
		gameMap[i] = placeMaker();
		if(i % size == 0){
			gameMap[i].movable[1] = false;	//left bound
		}
		if(i % size == size - 1){
			gameMap[i].movable[0] = false;	//right bound
		}
		if(i < size){
			gameMap[i].movable[3] = false;	//top bound
		}
		if(i >= size * (size - 1)){
			gameMap[i].movable[2] = false;	//bottom bound
		}
	}
	
	//record for enemy , for each : OBJ{pos,exp,hp,stat}
	gameMap.enemyInfo = [];
	//record for chest , for each :	OBJ{pos,exp,hp,atk,spd,stat}
	gameMap.chestInfo = [];
	
	var toPut = 0;
	//making chest
	for(var i = 0;i < chestAmount ;i++)
	{
		toPut = Math.floor(Math.random() * size * size) % (size * size - 2) + 1 ;
		if(gameMap[toPut].thing == 0){
			var newChest = chestMaker(toPut);
			//put on map
			gameMap.chestInfo[gameMap.chestInfo.length] = newChest;
			gameMap[toPut].thing = -gameMap.chestInfo.length;
		}
	}
	
	//makint enemy
	for(var i = 0;i < enemyAmont ;i++)
	{
		toPut = Math.floor(Math.random() * size * size) % (size * size - 2) + 1 ;
		if(gameMap[toPut].thing  == 0){
			var newEnemy = enemyMaker(toPut,i);
			//put on map
			gameMap.enemyInfo[gameMap.enemyInfo.length] = newEnemy;
			gameMap[toPut].thing = gameMap.enemyInfo.length;
		}
	}
	return gameMap;
}


//func : make a pc randomly
function pcMaker(){
	//pc OBJ{atk,spd,hp,exp,sex}
	var newPC = new Object();
	newPC.atk = 1 + Math.floor(Math.random()*5);
	newPC.spd = 1 + Math.floor(Math.random()*10)/10;
	newPC.hp = 3 + Math.floor(Math.random()*5);
	newPC.exp = 0;
	//seed
	var s = Math.random();
	if(s <= 0.5){
		newPC.sex = 0;
		newPC.atk += 3;
		newPC.hp += 5;
	}
	else{
		newPC.sex = 1;
		newPC.spd += 1;
	}
	return newPC;
}


//func : draw a map
//map : logic map
//bg : background
function drawMap(map,bg){
	var mapDoc = $(".map");
	for(var i = 0 ; i < map.size * map.size ; i ++){
		if(i % map.size == 0){
			var newLine = $("<div></div>").attr("class","map-row");
			mapDoc.append(newLine);
		}
		//use function to avoid error
		(function(thing,pos){
			if(thing > 0)
				var block = $("<div></div>").attr("class","map-block map-block-enemy enemy3");
			else if(thing < 0)
				var block = $("<div></div>").attr("class","map-block map-block-chest-close");
			else
				var block = $("<div></div>").attr("class","map-block map-block-space");
			block.attr("id",pos);
			newLine.append(block);
		})(map[i].thing , i);
	}
	$("#" + (map.size * map.size - 1)).attr("class","map-block map-block-nextstage");
}


//func : draw a pc
//sex : sex
function drawPC(sex){
	var player = $("<div></div>").attr("id","player");
	player.attr("class",(sex ? "fe" : "")+"male0");
	$("#0").append(player);
}


//func : playGame
//map : map
//pc : pc
//isResart : is restart ?
function playGame(map,pc,isRestart){
	if(gameStart)
		return ;
	
	//init
	//game stat : everything in game
	var stat = new Object();
	stat.pc = pcMaker();
	stat.pos = 0;
	stat.gameScreen = {x : 0,y : 0};//block area's lefttop
	if(!isRestart){
		stat.map = makeRandomMapData(10,30,10);
	}
	else{
		stat.map = map;
	}
	
	//draw
	drawMap(stat.map,"cave");
	drawPC(stat.pc.sex);
	
	//func : flash game-stat div
	function flash_stat(){
		stat.pc.atk = Math.floor(stat.pc.atk);
		stat.pc.spd = Math.floor(stat.pc.spd*10)/10;
		$(".game-stat").html("atk: " + stat.pc.atk + " spd: " + stat.pc.spd + " hp: " + stat.pc.hp + " exp: " + stat.pc.exp);
	}
	flash_stat();
	
	//start
	gameStart = true;
	active = true;
	
	//func : move event
	//dir: 0:(1,0) 1:(-1,0) 2:(0,1) 3:(0,-1); RLDU
	function move_event(dir){
		// crash wall
		if( stat.map[stat.pos].movable[dir] == false){
			return 0;
		}
		
		//dir
		var x = [1,-1,0,0];
		var y = [0,0,1,-1];
		
		//target
		var targetPoint = stat.pos + x[dir] + y[dir] * stat.map.size;
		
		if(targetPoint == stat.map.size * stat.map.size - 1){
			var enemy = {atk : 20,
						hp : 100,
						spd : 3,
						exp : 0,
						pos : targetPoint,
						stat : 0,
						boss : true};
			fighting(enemy,stat,dir);
			stat.pos = targetPoint ;
			return 2;
		}
		
		// space
		else if( stat.map[targetPoint].thing == 0 ){ 
			stat.pos = targetPoint ;
			return 1;
		}
		
		// enemy
		else if( stat.map[targetPoint].thing > 0) {
			var enemy = stat.map.enemyInfo[stat.map[targetPoint].thing - 1];
			// exist
			if( enemy.stat == 0){ 
				fighting(enemy,stat,dir);
				stat.pos = targetPoint;
				return 2;
			}
			else {
				stat.pos = targetPoint ;
				return 1;
			}
		}
		else if( stat.map[targetPoint].thing < 0){
			var chest = stat.map.chestInfo[-stat.map[targetPoint].thing - 1];
			// exist	
			if( chest.stat == 0 ){ 
				ItemGet(stat.pc,chest);
				stat.pos = targetPoint ;
				return 3;
			}
			else {
				stat.pos = targetPoint ;
				return 1;
			}
		}
	};
	
	
	//func : move
	function move(dir){
		if(!active)
			return ;
		active = false ;
		var p = 0;
		if(p = move_event(dir))
		{
			var player = $("#player");
			player.remove();
			player.attr("class",(stat.pc.sex ? "fe" : "")+"male"+dir);
			$("#" + stat.pos).append(player);
			
			
			//adjust screen
			if( stat.pos % stat.map.size <= stat.gameScreen.x && stat.gameScreen.x > 0){
				$(".map").animate({left:'+=90px'},300,function(){
					if(p == 1){
						active = true;
						}
					});
				stat.gameScreen.x -- ;
			}
			else if( stat.pos % stat.map.size >= stat.gameScreen.x + 5 && stat.gameScreen.x < 4){
				$(".map").animate({left:'-=90px'},300,function(){
					if(p == 1){
						active = true;
						}
					});
				stat.gameScreen.x ++ ;
			}
			else if(	Math.floor(stat.pos / stat.map.size) <= stat.gameScreen.y && stat.gameScreen.y > 0){
				$(".map").animate({top:'+=90px'},300,function(){
					if(p == 1){
						active = true;
						}
					});
				stat.gameScreen.y -- ;
			}
			else if( Math.floor(stat.pos / stat.map.size) >= stat.gameScreen.y + 6 && stat.gameScreen.y < 3){
				$(".map").animate({top:'-=90px'},300,function(){
					if(p == 1){
						active = true;
						}
					});
				stat.gameScreen.y ++ ;
			}
			else if(p == 1){
				active = true;
				}
				
			flash_stat();
		}
	}

	window.onkeydown = function(){
		if(window.event.keyCode <=40 && window.event.keyCode >=37)
		return false;
	}
	window.onkeyup = function(){
		switch(window.event.keyCode){
			case 38:
			case 87:
			move(3);
			break;
			case 83:
			case 40:
			move(2);
			break;
			case 37:
			case 65:
			move(1);
			break;
			case 39:
			case 68:
			move(0);
			break;
			case 66:
			if(window.event.ctrlKey && window.event.altKey){
				stat.pc.atk =10000;
				stat.pc.spd = 5;
				stat.pc.hp = 10000;
			}
			break;
		}
	}
}


//func : pc get item
function ItemGet(pc,item){
	$("#"+item.pos).attr("class","map-block map-block-chest-open");
	var itemOpeningModal = $("<div></div>").attr("class","item-opening");
	$(".game-screen-block").prepend(itemOpeningModal);
	
	setTimeout(function(){
		var shining = $("<div></div>").attr("class","shining");
		$("body").append(shining);
		shining.fadeOut(400,
					function(){
						itemOpeningModal.css("background-image","url(chest-show2.png)");
					});
			},400);

	setTimeout(function(){
		itemOpeningModal.css("background","black");
		if(item.hp > 0)
			var itemInfo = $("<p></p>").html("You get a item with hp!<br>");
		else
			var itemInfo = $("<p></p>").html("You get a item with exp!<br>");
		itemOpeningModal.css("height","200px");
		itemInfo.css({
			"color":"white",
			"font-size":"20px"
		});
		itemOpeningModal.append(itemInfo);
		itemOpeningModal.fadeOut(3000,function(){ 
			active = true;
			itemOpeningModal.remove();
		});
	},2000);
	
	item.stat = 1;
	pc.exp += item.exp;
	pc.hp += item.hp;
	if(pc.exp >= 100){
		pc.atk += 1 + Math.floor(Math.random()*3);;
		pc.spd += 0.1 + Math.floor(Math.random()*3)/10;;
		pc.hp += 5 ;
		pc.exp -= 100;
	}
}

function fighting(enemy,stat,dir){
	var pc = stat.pc;
	if(!("boss" in enemy))
	$("#" + enemy.pos).attr("class","map-block map-block-enemy enemy" + dir);
	var permittion = false;
	
	var fightModal = $("<div></div>").attr("class","fight-bg");
	var pcModal = $("<div></div>").attr("class","fighting-pc fight-"+ (pc.sex ? "fe" : "") + "male");
	var enemyModal = $("<div></div>").attr("class","fighting-enemy");
	var pchpModal = $("<div></div>").attr("class","fighting-hp pchp");
	var emhpModal = $("<div></div>").attr("class","fighting-hp emhp");
	
	$(".game-screen-block").prepend(fightModal);
	fightModal.append(pcModal);
	fightModal.append(enemyModal);
	fightModal.append(pchpModal);
	fightModal.append(emhpModal);
	pchpModal.html("HP:"+ pc.hp);
	emhpModal.html("HP:"+ enemy.hp);
	pchp = pc.hp;
	emhp = enemy.hp;
	pcWait = 10 - pc.spd;
	emWait = 10 - enemy.spd;
	var anime = false;
	var fightTimer = setInterval(function(){
		pcWait --;
		emWait --;
		//pc atk
		if(pcWait <= 0){
			pcWait = 10 - pc.spd;
			pcModal.css("z-index","3");
			anime = true; 
			pcModal.animate({
				left:"+=200px"

			},100);
			pcModal.animate({
				left:"-=200px"
			},
			100,
			function(){
				pcModal.css("z-index","2")
				});
			enemyModal.animate({
				left:"+=20",
				opacity:"0.3"
			},100);
			enemyModal.animate({
				left:"-=20",
				opacity:"1"
			},100,function(){anime = false});
			emhp -= pc.atk;
			emhpModal.html("HP:"+emhp);
			if(emhp <= 0){
				permittion = true;
				clearInterval(fightTimer);
			}
		}
		//enemy atk
		if(emhp > 0 && emWait <= 0)
		{
			emWait = 10 - pc.spd;
			enemyModal.css("z-index","3");
			anime = true;
			enemyModal.animate({
				left:"-=200px"

			},100);
			enemyModal.animate({
				left:"+=200px"
			},
			100,
			function(){
				enemyModal.css("z-index","2")
				});
			pcModal.animate({
				left:"+=20",
				opacity:"0.3"
			},100);
			pcModal.animate({
				left:"-=20",
				opacity:"1"
			},100,function(){anime = false});
			pchp -= enemy.atk;
			pchpModal.html("HP:"+pchp);
			if(pchp <= 0){
				permittion = true;
				clearInterval(fightTimer);
			}
		}
	},200);
	var killer = setInterval(function(){
		if(permittion&&!anime){
			console.log("act");
			if(pchp > 0){
				fightModal.fadeOut(3000,function(){
					pc.exp += enemy.exp;
					$("#"+enemy.pos).css({backgroundImage:"url(background-cave.jpg)"});
					if(!("boss" in enemy)){
						active = true;
						console.log("release");
					}
					fightModal.remove();
				});
				if("boss" in enemy){
						$("#player").fadeOut(10000,function(){
							active = false;
							$(".game-stat").html("YOU WIN !CLICK TO RESTART");
							$(".game-stat").attr("onclick","fstart()");
							$(".map").empty();
							$(".map").animate({left:'+=' + 90 * stat.gameScreen.x + 'px'},100);
							$(".map").animate({top:'+=' + 90 * stat.gameScreen.y + 'px'},100);
							gameStart = false;
						});
				}
				if(pc.exp >= 100){
					pc.atk += 1 + Math.floor(Math.random()*3);;
					pc.spd += 0.1 + Math.floor(Math.random()*3)/10;;
					pc.hp += 5 ;
					pc.exp -= 100;
				}
			}
			else{
				fightModal.fadeOut(3000,function(){
					$("#player").fadeOut(5000,function(){
							active = false;
							$(".game-stat").html("YOU ARE DEAD! CLICK TO RESTART");
							$(".game-stat").attr("onclick","fstart()");
							$(".map").empty();
							$(".map").animate({left:'+=' + 90 * stat.gameScreen.x + 'px'},100);
							$(".map").animate({top:'+=' + 90 * stat.gameScreen.y + 'px'},100);
							gameStart = false;
					});
					fightModal.remove();
				});
			}
			clearInterval(killer);
		}
	},100);
	enemy.stat = 1;
}


//func : first start
function fstart(){
	playGame({},pcMaker(),false);
};

$(".game-stat").attr("onclick","fstart();");