var msg = { "openGui" : true, "playerInvSize": 40, "playerinv" : [
    {"id" : 1, "name" : "Pepega", "amount" : 25, "slot" : 1, "use" : null, "stack" : true},
    {"id" : 2, "name" : "KEKW", "amount" : 125, "slot" : 2, "use" : null, "stack" : true},
    {"id" : 3, "name" : "LULW", "amount" : 5, "slot" : 3, "use" : null, "stack" : true},
    {"id" : 5, "name" : "Twitch Chat", "amount" : 1, "slot" : 4, "use" : null, "stack" : false},
    {"id" : 5, "name" : "Twitch Chat", "amount" : 1, "slot" : 6, "use" : null, "stack" : false, "desc": "This is a really long description, I hope it works for you smile. If it doesn't, then get good smile :)"}],
    "otherInvSize": 5
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