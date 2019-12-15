
var isOpen = false;

var playerInventory = new Array(40);
var otherInventory = new Array(5);

RegisterCommand('loadInventory', function(){
	loadInventory();
}, false);

RegisterCommand('close', function(){
	isOpen = false;
	SendNuiMessage(JSON.stringify({"openGui" : false}));
	SetNuiFocus(false, false);
}, false);


setTick(() => {
	if (!isOpen && IsControlPressed(0, 311)) {
		isOpen = true;
		SetNuiFocus(true, true);
		msg = loadInventoryMessage();
		SendNuiMessage(JSON.stringify(msg));
	}
});

RegisterNuiCallbackType("closeGui");
on("__cfx_nui:closeGui", (data, cb) => {
	cb("ok");
	isOpen = false;
	SendNuiMessage(JSON.stringify({"openGui" : false}));
	SetNuiFocus(false, false);
})

function loadInventory(){
	//Order doesn't matter, it loads based on slot anyways
	playerInventory[0] = {"id" : 1, "name" : "Pepega", "amount" : 25, "slot" : 1, "use" : null, "stack" : true};
	playerInventory[1] = {"id" : 2, "name" : "KEKW", "amount" : 125, "slot" : 2, "use" : null, "stack" : true};
	playerInventory[2] = {"id" : 3, "name" : "LULW", "amount" : 5, "slot" : 3, "use" : null, "stack" : true};
	playerInventory[3] = {"id" : 5, "name" : "TwitchChat", "amount" : 1, "slot" : 6, "use" : null, "stack" : false, "desc": "This is a really long description, I hope it works for you smile. If it doesn't, then get good smile :)"};
	
	//testing duplicate slots, may need to add prevention in client script
	playerInventory[4] = {"id" : 1, "name" : "Pepega", "amount" : 1, "slot" : 1, "use" : null, "stack" : true};
}

function loadInventoryMessage(){
	var msg = { "openGui": true };
	if (playerInventory != null) {
		var inv = [];
		for(var i = 0;i < playerInventory.length;i++){
			if(playerInventory[i] != null){
				inv[i] = playerInventory[i];
			}
		}
		msg['playerinv'] = JSON.stringify(inv);
	}
	if(otherInventory != null){
		var inv = [];
		for(var i = 0;i < otherInventory.length;i++){
			if(otherInventory[i] != null){
				inv[i] = otherInventory[i];
			}
		}
		msg['otherinv'] = JSON.stringify(inv);
	}
	msg['playerInvSize'] = playerInventory.length;
	msg['otherInvSize'] = otherInventory.length;
	console.log(msg);
	return msg;
}