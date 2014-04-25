// support functions:

function playerLocationsCallback () {
	try{
		var players = Server.Players;
		var online = players.Count;

		if(online >= 1){
			var playerData = "{";
			var count = 0;
			for (var x in players){
				var location = x.Location.ToString();	
				location = location.replace("(", "");
				location = location.replace(")", "");
				location = location.replace(", ", "|");
				location = location.replace(", ", "|");
				var lastLoc = DataStore.Get(x.SteamID, "BZloc");
				if(lastLoc != undefined && location == lastLoc){
					// do nothing... player has not moved
				} else {
					count++;
					DataStore.Add(x.SteamID, "BZloc", location);
					playerData += '"' + x.SteamID+ '": "' + location + '"';
					if(count != online){
						playerData += ',';
					}
					
				}
				
			}
			playerData += "}";

			if(count >= 1){
				var data = {};
				data['action'] = "updatePlayerPositions";
				data['playerData'] = playerData;
				var response = {};
				response = sendData(data);
				//Server.Broadcast("sending data... a player moved...");
			} else {
				//Server.Broadcast("not sending... no movement...");
			}
			

			
		} 

	} catch (err) {
        Plugin.Log("Error_log", "Error Message: " + err.message + " in playerLocationsCallback");
        Plugin.Log("Error_log", "Error Description: " + err.description + " in playerLocationsCallback")
    }
}

function playersonlineCallback () {
	try{
		var players = Server.Players;
		var online = players.Count;
				
		
		var data = {};
		data['action'] = "update_online";


		if(online >= 1){
			var count = 0;
			var playerData = "{";
			for (var x in players){
				count++;
				playerData += '"' + count + '":"' + x.SteamID+ '"';
				if(count != online){
					playerData += ',';
				}	
			}
			playerData += "}";

			data['players'] = playerData;
		} else {
			data['players'] = 'nope';
		}
			
		var response = {};
		response = sendData(data);
			
	} catch (err) {
        Plugin.Log("Error_log", "Error Message: " + err.message + " in playersonlineCallback");
        Plugin.Log("Error_log", "Error Description: " + err.description + " in playersonlineCallback")
    }
}

function sendData (data, method) {
	var iniConf = Plugin.GetIni("cfg_Core");
    var server = iniConf.GetSetting("ServerInfo", "server");
    var serverID = iniConf.GetSetting("ServerInfo", "serverID");
    var serverPass = iniConf.GetSetting("ServerInfo", "serverPass");
    var serverScript = iniConf.GetSetting("ServerInfo", "serverScript");

    var chunk = "";
    for (var x in data) {
		 var key = x;
		 var value = data[x];
		 chunk = chunk + "&" + key + "=" + value;
	}

	if(method == true){
		var url= server + "/" + serverScript + "?serverID=" + serverID + "&pass=" + serverPass + chunk;
		var request = Web.GET(url);
		//Plugin.Log("SendLog", url); // ----------------------------- Remove This!
	} else {
		// default method it POST
		var url= server + "/" + serverScript;
		var chunk = "serverID=" + serverID + "&pass=" + serverPass + chunk;
		var request = Web.POST(url, chunk);
		//Plugin.Log("SendLog", request); // ----------------------------- Remove This!
	}
	//Plugin.Log("SendLog", url + " [" + chunk + "]"); // ----------------------------- Remove This!
	return eval("(function(){return " + request + ";})()");
}

function loc2web (worldObj) {
	var location = worldObj.Location.ToString();	
	location = location.replace("(", "");
	location = location.replace(")", "");
	location = location.replace(", ", "|");
	location = location.replace(", ", "|");
	return location;
}

function locator(Player) {
	try{

		var location = loc2web(Player);

		var data = {};
		data['action'] = "loc";
		data['sid'] = Player.SteamID;
		data['position'] = location;

		var response = {};
		response = sendData(data);
		
		var yaw = direcction(getAngle(Player.PlayerClient.controllable.idMain.eyesYaw));
		return "You are facing " + yaw;
		
	} catch(err){
		Server.Broadcast("Error Message: " + err.message);
		Server.Broadcast("Error Description: " + err.description);
	}
}

// Thanks to Razztak (N4 Essentials) for this function
function direcction(dir) {
    if ((dir > 337.5) || (dir < 22.5)) {
        return "North";
    } else if ((dir >= 22.5) && (dir <= 67.5)) {
        return "Northeast";
    } else if ((dir > 67.5) && (dir < 112.5)) {
        return "East";
    } else if ((dir >= 112.5) && (dir <= 157.5)) {
        return "Southeast";
    } else if ((dir > 157.5) && (dir < 202.5)) {
        return "South";
    } else if ((dir >= 202.5) && (dir <= 247.5)) {
        return "Southwest";
    } else if ((dir >247.5) && (dir < 292.5)) {
        return "West";
    } else if ((dir >= 292.5) && (dir <= 337.5)) {
        return "Northwest";
    }
}

// Thanks to Razztak (N4 Essentials) for this function
function getAngle(angle) {
    if (angle < 0 ) {
        angle += 360;
    }
    return angle;
}

// Thanks to DreTaX (DeathMSG) for this function
function BD(bodyp) {
	var ini = Bodies();
	var name = ini.GetSetting("bodyparts", bodyp);
	return name;
}

function make_message (max, file, data) {
	var d = Math.round(Math.random()*10);
	if(d < 1 || d > max){
		d = 1;
	}

	var s = sentence(d, file);
	for(var x in data){
		s = s.replace(x, data[x]);
	}
	return s;
}

function sentence(num, file) {
	var ini = sentences(file);
	var value = ini.GetSetting(file, num);
	return value;
}

// Thanks to DreTaX (DeathMSG) for this function
function Bodies() {
	if(!Plugin.IniExists("bodyparts"))
		Plugin.CreateIni("bodyparts");
	return Plugin.GetIni("bodyparts");
}

function sentences(file) {
	if(!Plugin.IniExists(file))
		Plugin.CreateIni(file);
	return Plugin.GetIni(file);
}

// Use this for logging stuff
function dataDump (fileName, eventName, dataObj, indent) {
	if(indent == undefined){
		var indent = " - ";
	}
	Plugin.Log(fileName, eventName+": ");
	Plugin.Log(fileName, "------");
	for (var x in dataObj) {
	     var output_name = x;
		 var output_value = dataObj[x];
		 if(typeof(output_value) != "function"){
		 	Plugin.Log(fileName, indent + output_name + " : " + output_value);
		 }
	}
	
	Plugin.Log(fileName, "---------------------------------------------------------------------------------------------- ");
}

// main plugin stuff:

function On_PluginInit() { 
    try {
        if (!Plugin.IniExists("cfg_Core")) {
            Plugin.CreateIni("cfg_Core");
            var iniConf = Plugin.GetIni("cfg_Core");
			iniConf.AddSetting("ServerInfo", "server", "http://rustard.com");
			iniConf.AddSetting("ServerInfo", "serverID", 0); 
            iniConf.AddSetting("ServerInfo", "serverPass", "");
            iniConf.AddSetting("ServerInfo", "serverScript", "logger");

            iniConf.AddSetting("Settings", "replaceRock", true);
            iniConf.AddSetting("Settings", "defaultWeapon", "Stone Hatchet");

            iniConf.Save();
        }

        Plugin.CreateTimer("playerLocations", 3 * 1000).Start();
        Plugin.CreateTimer("playersonline", 10 * 1000).Start();

	    var data = {};
		data['action'] = "ServerInit";
		var response = {};
		response = sendData(data);
        
    } catch (err) {
        Plugin.Log("Error_log", "Error Message: " + err.message + " in On_PluginInit");
        Plugin.Log("Error_log", "Error Description: " + err.description + " in On_PluginInit")
    }
}

function On_ServerInit() { 
	Server.server_message_name = "Rustard"; 	
}

function On_PlayerConnected(Player){

	// save steamID -> name in datastore for offline usage
	try{
		DataStore.Add(Player.SteamID, "BZName", Player.Name);
		DataStore.Add(Player.SteamID, "BZProbe", "off");
		DataStore.Save();
	} catch(err) {
		Plugin.Log("Error_log", "Error Message: " + err.message + " in On_PlayerConnected datastore name");
        Plugin.Log("Error_log", "Error Description: " + err.description + " in On_PlayerConnected datastore name")
	}
		
	// Set some defaults on player connect:
		Player.SendCommand("censor.nudity False");
		Player.SendCommand("grass.on False");
		Player.SendCommand("gui.hide_branding False");

	// log connection status to website:
		
		var data = {};
		data['action'] = "connect";
		data['name'] = Player.Name;
		data['sid'] = Player.SteamID;
		data['ip'] = Player.IP;

		var response = {};
		response = sendData(data);

	// just saving this json junk for later:
	//var response = eval("(function(){return " + strJSON + ";})()");
	//Player.Message(response.message);
}

function On_PlayerDisconnected(Player){	
	// log Disconnect to website
		//locator(Player, false);
		locator(Player);

		var data = {};
		data['action'] = "disconnect";
		data['sid'] = Player.SteamID;
		sendData(data);
}

function On_PlayerSpawned(Player, spawnEvent) {
	
	// replace rock with default weapon
		var replaceRock = Data.GetConfigValue(config, "Settings", "replaceRock");
	    
	    if (replaceRock == "true") {
	    	var defaultWeapon = Data.GetConfigValue(config, "Settings", "defaultWeapon");

	        if (spawnEvent.FreshSpawn) {
	            Player.Inventory.RemoveItemAll("Rock");
	            Player.Inventory.AddItemTo(defaultWeapon, 30, 1);
	        }

	        if (!spawnEvent.FreshSpawn) {
	            if (Player.Inventory.HasItem("Rock")) {
	                Player.Inventory.RemoveItemAll("Rock");
	            }
	        }

	        if (!((Player.Inventory.HasItem("Stone Hatchet")) || (Player.Inventory.HasItem("Hatchet")) || (Player.Inventory.HasItem("Pick Axe")))) {
	            Player.Inventory.AddItemTo(defaultWeapon, 30, 1);
	        }
	    }

	// record spawn position
		response = locator(Player);
}

function On_PlayerHurt(he) {

	
    if(he.Attacker.SteamID != he.Victim.SteamID && he.Victim.SteamID != undefined){
    	he.Attacker.InventoryNotice(parseInt(he.DamageAmount) + " damage");
    	//he.Attacker.InventoryNotice("player"); // ----------------------------- Remove This!
    }   
}

function On_PlayerKilled(DeathEvent) {

	// Determine if its murder:
	try{

		var attId = String(DeathEvent.DamageEvent.attacker.id);
		var attIdMain = String(DeathEvent.DamageEvent.attacker.idMain);

		
		if(attIdMain.indexOf(DeathEvent.Victim.SteamID, 0) >= 0){
			var murder = false;
			
		} else if(DeathEvent.Attacker.SteamID != undefined && DeathEvent.Attacker.SteamID != DeathEvent.Victim.SteamID){
			var murder = true;
			
			DeathEvent.Attacker.InventoryNotice(parseInt(DeathEvent.DamageAmount) + " damage");
		    
		} else {
			var murder = false;
			
		}
	} catch(err) {
		Plugin.Log("Error_log", "Error Message: " + err.message + " in On_PlayerKilled murder test");
        Plugin.Log("Error_log", "Error Description: " + err.description + " in On_PlayerKilled murder test")
	}
	
	

    //Server.Broadcast("COD: " + cod);

    var victim = DeathEvent.Victim.Name;

    if(murder == true){

    	if(DeathEvent.DamageType == "Melee" && DeathEvent.WeaponName == undefined){
			var weapon = "a hunting bow";
			var wweapon = 'hunting bow';
		} else if(DeathEvent.DamageType == "Explosion" && DeathEvent.WeaponName == undefined) {

			if(attIdMain.indexOf('ExplosiveCharge', 0) >= 0){
				var weapon = "C4";
				var wweapon = 'C4';
			} else if(attIdMain.indexOf('F1GrenadeWorld', 0) >= 0){
				var weapon = "a grenade";
				var wweapon = 'grenade';
			} else {
				var weapon = "explosives";
				var wweapon = 'explosives';
			}
			
		} else {
			
			if(DeathEvent.WeaponName == "M4" || DeathEvent.WeaponName == "MP54A"){
				var weapon = "an " + DeathEvent.WeaponName;
			} else {
				var weapon = "a " + DeathEvent.WeaponName;
			}
			var wweapon = DeathEvent.WeaponName;

		}

		if(DeathEvent.WeaponName != "M4" && DeathEvent.WeaponName != "MP54A" && DeathEvent.WeaponName != "P250" && weapon != "C4"){
			var weapon = Data.ToLower(weapon);
			var wweapon = Data.ToLower(wweapon);
		} 

		var distance = Util.GetVectorsDistance(DeathEvent.Attacker.Location, DeathEvent.Victim.Location);
		var part = Data.ToLower(BD(DeathEvent.DamageEvent.bodyPart));
    	
    	var killer = DeathEvent.Attacker.Name;

    	var msg = {};
    	msg['KILLER'] = killer;
    	msg['VICTIM'] = victim;
    	msg['PART'] = part;
    	msg['WEAPON'] = weapon;
    	msg['DISTANCE'] = Util.GetVectorsDistance(DeathEvent.Attacker.Location, DeathEvent.Victim.Location);


		//Server.Broadcast("⊕" + killer + " just murdered " + victim + " right in the " + part + " with " + weapon + " from " + Util.GetVectorsDistance(DeathEvent.Attacker.Location, DeathEvent.Victim.Location) + " meters!");

		Server.Broadcast(make_message(9, "pvp_messages", msg));

		var data = {};
		
		data['action'] = "kill";
		data['type'] = "playerkill";
		data['killer'] = DeathEvent.Attacker.Name;
		data['ksid'] = DeathEvent.Attacker.SteamID;
		data['kpos'] = loc2web(DeathEvent.Attacker);
		data['victim'] = victim;
		data['vsid'] = DeathEvent.Victim.SteamID;
		data['vpos'] = loc2web(DeathEvent.Victim);
		data['weapon'] = wweapon;
		data['distance'] = distance;
		data['part'] = part;
	

		var response = sendData(data);

    } else {

    	// Determine COD and death category:
		var cod = "unknown";
		var wtype = "unknown";
		var deathtype = "unknown";

		if(attIdMain.indexOf('DeployableObject', 0) >= 0){

	        if(attIdMain.indexOf('LargeWoodSpikeWall', 0) >= 0){
	        	deathtype = "item";
	        	cod = "some large spikes";
	        	wtype = 'spikes';
	        } else if(attIdMain.indexOf('WoodSpikeWall', 0) >= 0){
	        	deathtype = "item";
	        	cod = "a spike wall";
	        	wtype = 'spikes';
	        } else if(attIdMain.indexOf('ExplosiveCharge', 0) >= 0){
	        	deathtype = "explosives";
	        	cod = "C4";
	        	wtype = 'C4';
	        }

	    } else if(attId.indexOf('TimedGrenade', 0) >= 0){

	    	deathtype = "explosives";
	    	cod = "a grenade";
	    	wtype = 'grenade';

	    } else if(attIdMain.indexOf('Wolf', 0) >= 0 || attIdMain.indexOf('Bear', 0) >= 0){

	    	deathtype = "ai";

	    	if(attIdMain.indexOf('MutantWolf', 0) >= 0){
	        	cod = "a mutant wolf";
	        	wtype = 'mutant wolf';
	        } else if(attIdMain.indexOf('MutantBear', 0) >= 0){
	        	cod = "a mutant bear";
	        	wtype = 'mutant bear';
	        } else if(attIdMain.indexOf('Wolf', 0) >= 0){
	        	cod = "a wolf";
	        	wtype = 'wolf';
	        } else if(attIdMain.indexOf('Bear', 0) >= 0){
	        	cod = "a bear";
	        	wtype = 'bear';
	        }

	    } else if(attId.indexOf('Metabolism', 0) >= 0){

	    	deathtype = "environmental";
	    	if(DeathEvent.DamageAmount < 1){
	    		cod = "starvation";
	    		wtype = 'starvation';
	    	} else {
	    		cod = "radiation poisoning";
	    		wtype = 'radiation';
	    	}

	    } else if(DeathEvent.Attacker.SteamID == DeathEvent.Victim.SteamID && DeathEvent.DamageAmount == 'Infinity'){
	    	deathtype = "manual";
	    	cod = "suicide";
	    	wtype = 'suicide';
	    } else {

	    	if(DeathEvent.Victim.IsInjured == true){
	    		deathtype = "environmental";
	    		cod = 'a nasty fall';
	    		wtype = 'fall';
	    	} else if(DeathEvent.DamageAmount >= 15){
	    		deathtype = "water";
	    		cod = 'drowned';
	    		wtype = 'drowned';
	    	} else {
	    		cod = "bled out";
	    		wtype = 'bled out';
	    	}

	    }
    	
    	switch(deathtype){

    		case "item":
    			Server.Broadcast(victim + " just was gutted by " + cod + "!");
    		break;

    		case "explosives":
    			Server.Broadcast(victim + " just blew himself up with " + cod + "!");
    		break;

    		case "ai":
    			Server.Broadcast(victim + " just got jacked up by " + cod + "!");
    		break;

    		case "environmental":
    			Server.Broadcast(victim + " died from " + cod + "!");
    		break;

    		case "manual":
    			Server.Broadcast(victim + " has died from autoerotic asphyxiation!");
    		break;

    		case "water":
    			Server.Broadcast(victim + " should have taken swimming lessons.");
    		break;

    		default:
    			Server.Broadcast(victim + " has died under mysterious circumstances.");
    		break;



    	}

    	var data = {};
		
		data['action'] = "kill";

		if(deathtype == 'ai'){
			data['type'] = "aikill";
			data['killer'] = wtype;
		} else {
			data['type'] = wtype;
		}

		data['victim'] = victim;
		data['vsid'] = DeathEvent.Victim.SteamID;
		data['vpos'] = loc2web(DeathEvent.Victim);

		var response = sendData(data);
    }

    /*
	if(DeathEvent.Victim != null && DeathEvent.Attacker != null && DeathEvent.Attacker != "undefined" && DeathEvent.Victim != "undefined" ){
		// we have both a killer and a victim

		if(DeathEvent.Attacker.SteamID == DeathEvent.Victim.SteamID){
			//is a suicide
			if(DeathEvent.DamageType == "Melee"){
				Server.Broadcast(DeathEvent.Attacker.Name + " just gutted himself on a spike.");
			} else if(DeathEvent.DamageType == "Explosion") {
				Server.Broadcast(DeathEvent.Attacker.Name + " just blew himself up.");
			} else {
				Server.Broadcast(DeathEvent.Attacker.Name + " just killed himself.");
			}
		} else {
			// not a suicide
		
			var killer = DeathEvent.Attacker.Name;
			var victim = DeathEvent.Victim.Name;
			
			Server.Broadcast(killer + " just killed " + victim);
		}
	}
	*/
}

function On_NPCHurt(he) {

	he.Attacker.InventoryNotice(parseInt(he.DamageAmount) + " damage");
	//he.Attacker.InventoryNotice("npc"); // ----------------------------- Remove This!
}

function On_NPCKilled(DeathEvent) {
	try{
		DeathEvent.Attacker.InventoryNotice(parseInt(DeathEvent.DamageAmount) + " damage");

		var attacker = DeathEvent.Attacker.Name;
		var attackerSid = DeathEvent.Attacker.SteamID;
		var attackerPos = loc2web(DeathEvent.Attacker);

		if(DeathEvent.DamageType == "Melee" && DeathEvent.WeaponName == undefined){
			var weapon = "a hunting bow";
			var wweapon = 'hunting bow';
		} else if(DeathEvent.DamageType == "Explosion" && DeathEvent.WeaponName == undefined) {
			var weapon = "explosives";
			var wweapon = 'explosives';
		} else {
			
			if(DeathEvent.WeaponName == "M4" || DeathEvent.WeaponName == "MP54A"){
				var weapon = "an " + DeathEvent.WeaponName;
			} else {
				var weapon = "a " + DeathEvent.WeaponName;
			}
			var wweapon = DeathEvent.WeaponName;

		}

		if(DeathEvent.WeaponName != "M4" && DeathEvent.WeaponName != "MP54A" && DeathEvent.WeaponName != "P250"){
			var weapon = Data.ToLower(weapon);
			var wweapon = Data.ToLower(wweapon);
		} 


		
		var victim = "undefined";
		var wvictim = "undefined";
		var reward = false;
		switch(DeathEvent.Victim.Name){
			case "Chicken_A":
				victim = "a chicken";
				wvictim = "chicken";
			break;

			case "Rabbit_A":
				victim = "a bunny";
				wvictim = "bunny";
			break;

			case "Stag_A":
				victim = "a deer";
				wvictim = "deer";
			break;

			case "Boar_A":
				victim = "a pig";
				wvictim = "pig";
			break;

			case "MutantWolf":
				victim = "a mutant wolf";
				wvictim = "mutant wolf";
				reward = "reward";
			break;

			case "MutantBear":
				victim = "a mutant bear";
				wvictim = "mutant bear";
				reward = "reward";
			break;

			case "Wolf":
				victim = "a wolf";
				wvictim = "wolf";
				reward = "reward";
			break;

			case "Bear":
				victim = "a bear";
				wvictim = "bear";
				reward = "reward";
			break;
		}

		
		Server.Broadcast(attacker + " killed " + victim + " with " + weapon);

		var data = {};
		data['action'] = "kill";
		data['type'] = "animalkill";
		data['killer'] = attacker;
		data['ksid'] = attackerSid;
		data['kpos'] = attackerPos;
		data['victim'] = wvictim;
		data['weapon'] = wweapon;
		data['callback'] = reward;

		var response = sendData(data);

		if(response.reward != undefined){
			DeathEvent.Attacker.InventoryNotice(response.reward);
		}
	} catch(err) {

		Plugin.Log("Error_log", "Error Message: " + err.message + " in On_NPCKilled");
        Plugin.Log("Error_log", "Error Description: " + err.description + " in On_NPCKilled")

	}
}

function On_EntityHurt(he) {

	var OwnerSteamID = he.Entity.OwnerID.ToString();
	var OwnerName = DataStore.Get(OwnerSteamID, "BZName");

	try{

		
		var ProbeStatus = DataStore.Get(he.Attacker.SteamID, "BZProbe");
		
		if(OwnerSteamID != he.Attacker.SteamID && ProbeStatus == "on"){
			//he.Attacker.Notice("You hit " + OwnerName + "'s object!");
			if (OwnerName == undefined || OwnerName == null){
				he.Attacker.Notice("We have no idea who owns this object!");
			} else {
				he.Attacker.Notice(OwnerName + " owns this object.");
			}	
		} else if(OwnerSteamID == he.Attacker.SteamID && ProbeStatus == "on") {
			he.Attacker.Notice("You own this object.");
		}

	} catch(err) {

		Plugin.Log("Error_log", "Error Message: " + err.message + " in On_EntityHurt");
        Plugin.Log("Error_log", "Error Description: " + err.description + " in On_EntityHurt")

	}

	if (he.Entity.Name == "MaleSleeper") {
		try{
	        Server.Broadcast(he.Attacker.Name + " murdered " + OwnerName + " in his sleep!");

	        
	        var data = {};

	        data['action'] = "kill";
			data['type'] = "sleeper";
			data['killer'] = he.Attacker.Name;
			data['ksid'] = he.Attacker.SteamID;
			data['kpos'] = loc2web(he.Attacker);
			data['victim'] = OwnerName;
			data['vsid'] = OwnerSteamID;

			var posx = parseInt(he.Entity.X);
			var posy = parseInt(he.Entity.Y);
			var posz = parseInt(he.Entity.Z);

			data['vpos'] = posx+"|"+posy+"|"+posz;


			var response = sendData(data);

			if(response.reward != undefined){
				DeathEvent.Attacker.InventoryNotice(response.reward);
			}
		} catch(err) {
			Server.Broadcast("Error Message: " + err.message);
			Server.Broadcast("Error Description: " + err.description);
		}

    } else if(OwnerSteamID != he.Attacker.SteamID && he.DamageEvent.status == 1) {
    	Server.Broadcast(he.Attacker.Name + " destroyed " + OwnerName + "'s " + he.Entity.Name + "!");
    }

    dataDump ('itemstuff', 'hit', he);
    dataDump ('itemstuff', 'entity', he.Entity);

    try{
	    if(he.Attacker == he.Entity.Owner){
		    if(he.Entity.Name == "WoodCeiling" || he.Entity.Name == "MetalCeiling"){
		    	var pendingtrap = DataStore.Get(he.Attacker.SteamID, "BZTpending");
		    	if(pendingtrap != undefined && pendingtrap != "none"){
			    	he.Attacker.Message("Trap set on trigger door : " + pendingtrap + ". ");
			    	DataStore.Add("BZtraps", pendingtrap, he.Entity);
					Datastore.Remove(he.Attacker.SteamID, "BZTpending");
					DataStore.Remove(he.Attacker.SteamID, "BZpending");
					DataStore.Save();	
				}
		    }
		}
	} catch(err){
		Server.Broadcast("Error Message: " + err.message);
		Server.Broadcast("Error Description: " + err.description);
	}
    /*
    if(Player == he.Entity.Owner) {

    	

	    var pendingtrap = DataStore.Get(Player.SteamID, "BZTpending");

	    if(pendingtrap != undefined && pendingtrap != "none"){
	    	Player.Message("linked door: " + pendingtrap + ". ");
			//DataStore.Add(Player.SteamID, "BZTpending", de.Entity.InstanceID);
			//Player.Message("Trap will be set on door: " + de.Entity.InstanceID) + ". ";
			//Player.Message("Now hit the floor outside the door to mark it.";
		} 
	}
	*/
}

function On_DoorUse(Player, de) {
    
    if(Player == de.Entity.Owner) {
        

        var pendingtrap = DataStore.Get(Player.SteamID, "BZpending");

        if(pendingtrap != undefined && pendingtrap == "setTrap"){
			DataStore.Add(Player.SteamID, "BZTpending", de.Entity.InstanceID);
			Player.Message("Trap will be set on door: " + de.Entity.InstanceID + ". ");
			Player.Message("Now hit the floor outside the door to mark it.");

		} 
        //var pendingtrap = DataStore.Get("BZtraps", de.Entity.InstanceID);

        return;
    } else {
    	var trapped = DataStore.Get("BZtraps", de.Entity.InstanceID);
    	if(trapped != undefined){
    		Player.Notice("Aaaah! Its a Trap!");
    		//Player.Message("Target: " + trapped.InstanceID);
    		
    		trapped.Destroy();
    		DataStore.Remove("BZtraps", de.Entity.InstanceID);
			DataStore.Save();
    	}
    }
}

function resetTrapCallback (object, trigger) {
	//World.Spawn(";struct_wood_ceiling", object.X, object.Y, object.Z);
}

function On_Command(Player, cmd, args) { 

	cmd = Data.ToLower(cmd);
	switch(cmd) {

		case "trap":
			var pendingtrap = DataStore.Get(Player.SteamID, "BZpending");

			if(pendingtrap != undefined && pendingtrap == "setTrap"){
				DataStore.Add(Player.SteamID, "BZpending", "none");
				Player.Message("Canceled trap setting.");
			} else {
				DataStore.Add(Player.SteamID, "BZpending", "setTrap");
				Player.Message("The next door (which you own) you open will be trapped...");
				// start a timer so this will expire and notify the user.
			}

		break;

		case "test":
			
			if(!Plugin.GetTimer("playerLocations")) {
				Server.Broadcast('starting timer...');
		        Plugin.CreateTimer("playerLocations", 5 * 1000).Start();
		    } else {
		    	Server.Broadcast('timer already running!');
		    }

		break;

		case "stop":
			Server.Broadcast('killing timer');
			Plugin.KillTimer("playerLocations");
		break;

		case "probe":

			try{
				var ProbeStatus = DataStore.Get(Player.SteamID, "BZProbe");

				if(ProbeStatus == "on"){
					DataStore.Add(Player.SteamID, "BZProbe", "off");
					Player.Message("Probe is inactive.");
				} else {
					DataStore.Add(Player.SteamID, "BZProbe", "on");
					Player.Message("Probe is active. Hit an object to find out the owner name.");
				}
			} catch(err) {
				Plugin.Log("Error_log", "Error Message: " + err.message + " in probe command");
		        Plugin.Log("Error_log", "Error Description: " + err.description + " in probe command")
			}
		break;

		case "plist":

			for(var Players in Server.Players) {
				Server.Broadcast("P: " + Players.Name);
			}
		break;

		case "now":
			var gametime = World.Time;
			var hour = Math.floor(gametime);
			var tmp = gametime % 1;
			var min = Math.floor(tmp * 60);
			var players = Server.Players;
			if (hour > 0) {			
				Player.Message("◆ Rust Time : " + hour +" h "+ min +" m  ◆ Ping : " + Player.Ping);			
				Player.Message("◆ Play Time : " + parseInt(Player.TimeOnline / 60000) + " min  ◆ Players : " + players.Count +" ♟");
			}
		break;

		case "drop":
				
			try{

				
				if(args.Length < 2){
					Player.Message("usage is '/animal # type player");
					break;
				}

				var count = args[0];
				var type = args[1];

				if(args.Length < 3){
					var targetPlayer = Player;
				} else {
					var target = args[2];
					var targetPlayer = Magma.Player.FindByName(target);
				}

				switch(type){
					case "wolf":
						var animal = ':wolf_prefab';
					break;

					case "bear":
						var animal = ':bear_prefab';

					break;

					case "mbear":
						var animal = ':mutant_bear';
					break;

					case "mwolf":
						var animal = ':mutant_wolf';
					break;

					case "c4":
						var animal = ';explosive_charge';
					break;

					default:
						var animal = false;
					break;
				}
				var i = 1;
				while(i<=count){
					World.Spawn(animal, targetPlayer.X, targetPlayer.Y, targetPlayer.Z);
					i++;
				}
			} catch(err){
				Server.Broadcast("Error Message: " + err.message);
				Server.Broadcast("Error Description: " + err.description);
			}
		break

		case "location":

			Player.Message(locator(Player));
		break;

		case "msg":


			try{
				var msg = {};
	    		msg['KILLER'] = 'Natas';
		    	msg['VICTIM'] = 'Charles';
		    	msg['PART'] = 'eyeball';
		    	msg['WEAPON'] = 'his thumb';
		    	msg['DISTANCE'] = 22;

		    	Server.Broadcast(make_message(9, "pvp_messages", msg));
			} catch(err){
				Server.Broadcast("Error Message: " + err.message);
				Server.Broadcast("Error Description: " + err.description);
			}
		break;

		case "entities":
			var total = 20;
			var count = 1;
			for (var x in World.Entities) {
				if(count <= total){
					dataDump ("Entities", "object", x);
					count++;
				}
			}

			Plugin.Log("Entities", "---------------------------------------------------------------------------------------------- ");
			Plugin.Log("Entities", " . ");
			Plugin.Log("Entities", " . ");
		break;

		case "prefabs":
			for (var x in World.Prefabs) {
			     var output_name = x;
				 var output_value = World.Prefabs[x];
				 if(typeof(output_value) != "function"){
				 	Plugin.Log("Prefabs", output_name + " : " + output_value);
				 }
				 Plugin.Log("Prefabs", "---------------------------------------------------------------------------------------------- ");
			}

			Plugin.Log("Prefabs", "---------------------------------------------------------------------------------------------- ");
			Plugin.Log("Prefabs", " . ");
			Plugin.Log("Prefabs", " . ");
		break;
		
    }
}