var msg = { "openGui" : true, "playerInvSize": 40, "playerinv" : [
	{"id" : 1, "name" : "Pepega", "amount" : 5, "slot" : 1, "use" : null, "stack" : true},
	{"id" : 2, "name" : "KEKW", "amount" : 125, "slot" : 2, "use" : null, "stack" : true},
	{"id" : 3, "name" : "LULW", "amount" : 5, "slot" : 3, "use" : null, "stack" : true},
	{"id" : 5, "name" : "Twitch Chat", "amount" : 1, "slot" : 4, "use" : null, "stack" : false},
	{"id" : 5, "name" : "Twitch Chat", "amount" : 1, "slot" : 5, "use" : null, "stack" : false}],
	"otherInvSize": 5, "otherInv": []
};
RegisterCommand('inventory', function(){
	SetNuiFocus(true, true);
	SendNuiMessage(JSON.stringify(msg));
}, false);

RegisterCommand('close', function(){
	SetNuiFocus(false, false);
}, false);


setTick(() => {
	if(GetPlayerWantedLevel(PlayerId()) != 0){
		SetPlayerWantedLevel(PlayerId(), 0, false);
		SetPlayerWantedLevelNow(PlayerId(), false);
    }
});

RegisterNuiCallbackType("closeGui");
on("__cfx_nui:closeGui", (data, cb) => {
	cb("ok");
	SendNuiMessage(JSON.stringify({"openGui" : false}));
	SetNuiFocus(false, false);
})