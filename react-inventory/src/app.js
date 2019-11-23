const {React, ReactDOM} = window;

'use strict';

class InventoryContainer extends React.Component {
  	constructor(props) {
	    super(props);
	    //Set default inventory state
	    this.state = { open: false, playerInvSize: 0, playerinv: [], otherInvSize: 0, otherinv: [] };

	    //Bind events
		this.receiveNuiMessage = this.receiveNuiMessage.bind(this);
		this.handleKeyUp = this.handleKeyUp.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handleMouseUp = this.handleMouseUp.bind(this);
		
		//Bind click handlers
		this.clickItem = this.clickItem.bind(this);
		this.clickSlot = this.clickSlot.bind(this);

		this.stopDragging = this.stopDragging.bind(this);
		this.startDragging = this.startDragging.bind(this);

		//Handle dragging
		this.isDragging = false;
		this.dragItem = null;
		this.toSlot = null;
		this.fromSlot = null;
		this.shiftPressed = false;
		this.didSplit = false;
  	}

  	render() {
  		//Load state variables
  		let guiOpen = this.state.open;
  		let playerInvSize = this.state.playerInvSize;
  		let otherInvSize = this.state.otherInvSize;
		let playerItems = this.state.playerinv;
		let otherItems = this.state.otherinv;

		//Child Components
  		var player;
  		var other;
  		var classes;
  		
  		if(guiOpen){
			//Create child components
			if(playerInvSize != 0){
				player = <Inventory invName="player" invSize={playerInvSize} items={playerItems} clickItem={this.clickItem} clickSlot={this.clickSlot}/>;
			}
			if(otherInvSize != 0){
				other = <Inventory invName="other" invSize={otherInvSize} items={otherItems} clickItem={this.clickItem} clickSlot={this.clickSlot}/>;
			}
			classes = "container";
  		}else {
  			//Hide child components/remove them
  			player = null;
  			other = null;
  			classes = "";
  		}
		return(
			<div className={classes}>
				{player}
				{other}
			</div>
		);
	}
  
	componentDidMount() {
		//Add event listeners for keyboard/mouse events
		window.addEventListener("message", this.receiveNuiMessage);
		window.addEventListener("keyup", this.handleKeyUp);
		window.addEventListener("keydown", this.handleKeyDown);
		window.addEventListener("mousemove", this.handleMouseMove);
		window.addEventListener("mouseup", this.handleMouseUp);
	}
	
	receiveNuiMessage(event) {
		var updateArray = {};
		if(event.data.openGui != null){
			//set gui opened or closed
			updateArray["open"] = event.data.openGui;
		}
		if(event.data.playerInvSize){
			//load player inventory size
			updateArray["playerInvSize"] = event.data.playerInvSize;
		}
		if(event.data.playerinv){
			//Load player items from message
			updateArray["playerinv"] = event.data.playerinv;
		}
		if(event.data.otherInvSize){
			//load other inventory size
			updateArray["otherInvSize"] = event.data.otherInvSize;
		}
		if(event.data.otherinv){
			//Load other items from message
			updateArray["otherinv"] = event.data.otherinv;
		}
		this.setState(updateArray);
	}
	
	handleKeyUp(e) {
		if(e.key === "Escape") {
			//Exit gui/hide
			this.setState({ open: false });
			closeGui();
		}
		if(e.key === "Shift") {
			this.shiftPressed = false;
		}
	}
	handleKeyDown(e) {
		//For shift clicking items
		if (e.key === "Shift") {
			this.shiftPressed = true;
		}
	}

	handleMouseMove(e) {
		if(this.isDragging){
			this.dragItem.css("top", e.clientY - 50);
			this.dragItem.css("left", e.clientX - 50);
		}
	}

	handleMouseUp(e) {
		if(this.isDragging){
			switch (e.which) {
			 	case 1: 
			 		//Dropping itemstack
					this.stopDragging();
			 		break;
			 	case 2: 
					this.stopDragging();
			 		break;
			 	case 3:
			 		//Place one item unless amount = 1

			 		break;
			 	default: console.log("oops"); break;
			 }
		}
	}

	clickItem(e, uid, invName) {
		//Handle when a user clicks on an item
		if(!this.isDragging){
			var item = $("#" + CSS.escape(uid));
			let mouseX = e.clientX;
			let mouseY = e.clientY;
			switch(e.button){
				case 0:
					//Left click
					this.dragItem = item;
					this.fromSlot = item.parent();

					//handle shift clicking items
					if(this.shiftPressed){
						var slot;

						//get Available slot in opposite inventory
						var opposite, inv;
						if(invName == "player"){
							opposite = "other";
							inv = this.state.otherinv;
						}else {
							opposite = "player";
							inv = this.state.playerinv;
						}
						var instance = findFirstInstanceOf(item.data("itemid"), inv);
						var slotNum;
						if(instance != null){
							slotNum = instance.slot - 1;
						}else {
							slotNum =  this.findFirstAvailableSlotInInv(opposite);
						}
						if(slotNum != null){
							slot = getSlotIdFromNum(slotNum, opposite);
						}

						//make sure inventory is not full
						if(slot != null){
							this.toSlot = $("#" + CSS.escape(slot));
							this.stopDragging();
						}	
					}else {
						//start drag
						this.startDragging(mouseX, mouseY);
					}
					break
				case 1:
					//Middle click
					break;
				case 2:
					//Right CLick
					if(Number(item.find(".item-amount").text()) <= 1){
						//do regular click
						this.dragItem = item;
						this.fromSlot = item.parent();
						this.startDragging(mouseX, mouseY);
					}else {
						//Create new itemstack
						
						//get the inventory we're in
						var inv;
						if(invName == "player"){
							inv = this.state.playerinv.slice();
						}else {
							inv = this.state.otherinv.slice();
						}

						//get the slot of the current item
						var slot = getSlotNumFromId(item.attr("id")) + 1;

						//get the slot element
						var slotElement = inv.find(function(e){
							return e.slot == slot;
						})

						//if the element is found
						if(slotElement != undefined){
							//duplicate the element
							var newElement = JSON.parse(JSON.stringify(slotElement));
							
							//calculate amounts
							oldAmount = slotElement.amount;
							halfAmount = Math.ceil(oldAmount / 2);
							oldHalfAmount = oldAmount - halfAmount;

							//set new element amount
							newElement.amount = halfAmount;

							//find closest spot in inventory to place right click stack in case of failure
							var newSlot = this.findFirstAvailableSlotInInv(invName);
							if(newSlot != null){
								newElement.slot =  newSlot + 1;
							}else {
								//if inventory is full, set it to our current slot
								//this is worst case, since it can cause items to be stacked on each other
								newElement.slot = slotElement.slot;
							}


							//Update old element
							var oldIndex = inv.indexOf(slotElement);
							slotElement.amount = oldHalfAmount;
							inv.splice(oldIndex, 1);
							//hacky workaround for purecomponent not updating the amount visually.
							item.find(".item-amount").text(oldHalfAmount);

							//Push new elements
							inv.push(slotElement);
							inv.push(newElement);

							var updateArray = {};
							if(invName == "player") {
								updateArray["playerinv"] = inv;
							}else {
								updateArray["otherinv"] = inv;
							}
							this.setState(updateArray, function() {
								//callback after render, set the new item to be dragged and set fromslot
								var ele = inv[inv.length-1];
								var slotId = getSlotIdFromNum(ele.slot-1, invName);
								var newItem = $("#" + CSS.escape(slotId)).find(".item");
								this.dragItem = newItem;
								this.fromSlot = newItem.parent();
								this.startDragging(mouseX, mouseY);
							});
							
						}
					}
					break
				default: break;
			}
			
		}
	}

	clickSlot(e, slotId) {
		var slot =  $("#" + CSS.escape(slotId));
		if(this.isDragging){
			//set toSlot
			this.toSlot = slot;
		}
	}

	stopDragging() {
		this.isDragging = false;
		this.dragItem.css("position", "relative");
		this.dragItem.css("top", 0);
		this.dragItem.css("left", 0);
		this.dragItem.css("opacity", 1);
		$(".item").removeClass("stop-clicks");

		if(this.toSlot == null) {
			//send this back to nikea
			this.fromSlot.append(this.dragItem);
		}else {
			var frominv, toinv;
			//Update slots
			toInvName = this.toSlot.attr("id").split("slot")[0];
			fromInvName = this.fromSlot.attr("id").split("slot")[0];

			if(toInvName == "player"){
				toinv = this.state.playerinv.slice();
			}else {
				toinv = this.state.otherinv.slice();
			}
			if(fromInvName == "player"){
				frominv = this.state.playerinv.slice();
			}else {
				frominv = this.state.otherinv.slice();
			}

			let oldSlot = getSlotNumFromId(this.fromSlot.attr("id")) + 1;			
			let slotNum = getSlotNumFromId(this.toSlot.attr("id")) + 1;

			var updateElement = frominv.find(function(ele){
				return ele.slot == oldSlot;
			});

			if(updateElement != undefined){
				//when in same inventory, remove old element

				//find old element in current inventroy
				var newElement = toinv.find(function(ele){
					return ele == updateElement;
				});

				//if element is in inventory, delete it, or merge
				if(newElement != undefined){
					var index = toinv.indexOf(newElement);
					toinv.splice(index, 1);
				}
				//remove element from opposite inventory
				var index2 = frominv.indexOf(updateElement);
				frominv.splice(index2, 1);

				var swapElement = toinv.find(function (ele){
					return ele.slot == slotNum;
				})

				if(swapElement != undefined){
					//remove element from inventory
					var index3 = toinv.indexOf(swapElement);
					toinv.splice(index3, 1);
					if(updateElement.id == swapElement.id && swapElement.stack){
						//diff itemstack, same itemid
						updateElement.amount += swapElement.amount;
						this.toSlot.find(".item-amount").text(updateElement.amount);
					}else {
						//diff itemid
						swapElement.slot = oldSlot;
						if(toInvName == fromInvName){
							toinv.push(swapElement);
						}else {
							frominv.push(swapElement);
						}
					}
					
				}
				
				//update new slot
				updateElement.slot = slotNum;
				toinv.push(updateElement)

				var updateState = {};

				if(toInvName == "player") {
					//update playerinv
					updateState["playerinv"] = toinv;
				}else {
					//update otherinv
					updateState["otherinv"] = toinv;
				}
				if(toInvName != fromInvName){
					if(fromInvName == "player"){
						//we swapped, update playerinv as well
						updateState["playerinv"] = frominv;
					}else {
						//we swapped, update otherinv as well
						updateState["otherinv"] = frominv;
					}
				}
				this.setState(updateState);
			}
		}
		
		this.dragItem = null;
		this.fromSlot = null;
		this.toSlot = null;
	}

	startDragging(mouseX, mouseY) {
		this.dragItem.css("position", "fixed");
		this.dragItem.css("opacity", 0.5);
		$(".item").addClass("stop-clicks");
		this.isDragging = true;
		this.dragItem.css("top", mouseY- 50);
		this.dragItem.css("left", mouseX - 50);
	}

	findFirstAvailableSlotInInv(invName) {
		var invSize, inv;
		if(invName == "player"){
			invSize = this.state.playerInvSize;
			inv = this.state.playerinv.slice();
		}else {
			invSize = this.state.otherInvSize;
			inv = this.state.otherinv.slice();
		}
		if(invSize == 0 || invSize == inv.length){
			return null;
		}
		if(inv.length == 0){
			return 0;
		}

		for(var i = 0;i < invSize;i++){
			var slotElement = inv.find(function(e){
				return e.slot == (i + 1);
			});
			if(slotElement == undefined){
				return i;
			}
		}
		return null;
	}
}

class Inventory extends React.Component {
	constructor(props) {
    	super(props);
    	this.clickSlot = this.clickSlot.bind(this);
    	this.clickItem = this.clickItem.bind(this);
    	this.props.clickItem.bind(this);
		this.props.clickSlot.bind(this);
  	}

  	render() {
  		let invName = this.props.invName;
  		let invSize = this.props.invSize;
  		const inventoryClasses = "inventory " + invName;
		let slots = [];
		let slot = 0;

		let invRows = invSize / 5;

		//Load inventory items
		let items = this.props.items;

		for (let i = 0; i < invRows; i++) {
      		let cols = []
      		for (let j = 0; j < 5; j++) {
      			let slotId = invName + "slot["+i+"]["+j+"]";

				var uid, itemValues;
				if(items != undefined && items.length != 0){
					uid = invName + "item["+i+"]["+j+"]";
					itemValues = items.find(function(e){
						return e.slot == slot+1;
					});
				}else {
					itemValues = {};
					uid = null;
				}

        		cols.push(<Slot key={j} slotNumber={slot} slotId={slotId} uid={uid} itemValues={itemValues} clickItem={this.clickItem} clickSlot={this.clickSlot} />);
        		slot++;
      		}
      		slots.push(<tr key={i}>{cols}</tr>);
    	}

		return(
			<React.Fragment>
				<div className={inventoryClasses}>
					<h2 className="title">{Capitalize(invName)} Inventory</h2>
					<table className="slots">
						<tbody>{slots}</tbody>
					</table>
				</div>
			</React.Fragment>
		);
	}

	clickSlot(e, slotId){
		this.props.clickSlot(e, slotId);
	}

	clickItem(e, uid){
		this.props.clickItem(e, uid, this.props.invName);
	}

}

class Slot extends React.PureComponent {
	constructor(props) {
    	super(props);
		this.clickHandler = this.clickHandler.bind(this);
		this.clickItem = this.clickItem.bind(this);
		this.props.clickItem.bind(this);
		this.props.clickSlot.bind(this);
  	}

  	render() {
  		let uid = this.props.uid;
  		let itemValues = this.props.itemValues;
  		let slotId = this.props.slotId;
		var item;

		if(uid != null && itemValues != null){
			item = <Item itemValues={itemValues} uid={uid} clickItem={this.clickItem}/> 
		}else {
			item = null;
		}
		
  		return(
			<React.Fragment>
				<td className="slot" id={slotId} onMouseUp={this.clickHandler}>
					{item}
				</td>
			</React.Fragment>
  		);
  	}

  	clickHandler(e){
		this.props.clickSlot(e, this.props.slotId);
  	}

  	clickItem(e, uid) {
		this.props.clickItem(e, uid);
  	}
}

class Item extends React.Component {
	constructor(props) {
    	super(props);
		this.clickHandler = this.clickHandler.bind(this);
		this.props.clickItem.bind(this);
  	}

  	render() {
  		let itemId = this.props.itemValues.id;
  		let uid = this.props.uid;
		let itemName = this.props.itemValues.name;
		let itemAmount = this.props.itemValues.amount;
		let itemImage = this.props.itemValues.image;
		let itemSplit = this.props.itemValues.split;
		if(itemSplit){
			//uid += "[1]";
		}
  		return (
  			<div className="item" id={uid} data-itemid={itemId} onMouseDown={this.clickHandler}>
				<span className="item-name">{itemName}</span>
				<div className="item-amount">{itemAmount}</div>
  			</div>
  		);
  	}

  	clickHandler(e) {
  		this.props.clickItem(e, this.props.uid);
  	}
}

let domContainer = document.getElementById("root");
ReactDOM.render(<InventoryContainer />, domContainer);



//Helper/Static functions
function closeGui() {
	var xhr = new XMLHttpRequest();
	xhr.addEventListener('load', () => {
    	console.log(xhr.responseText);
    })
    xhr.open('POST', 'http://react-inventory/closeGui');
    xhr.send(JSON.stringify({}));
}


function Capitalize(str){
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function getSlotNumFromId(id) {
	let splitId =  id.split("[");
	let rowNum = Number(splitId[1].charAt(0));
	let colNum = Number(splitId[2].charAt(0));
	return (rowNum * 5) + colNum;
}

function getSlotIdFromNum(num, invName) {
	if(num == null){
		return null
	}
	var cols = num % 5;
	var rows = Math.floor(num / 5);
	return invName + "slot["+rows+"]["+ cols +"]";
}

function findFirstInstanceOf(itemid, inv) {
	var ele = inv.find(function(e){
		return e.id == itemid;
	});
	if(ele != undefined && ele.stack){
		return ele;
	}
	return null;
}

document.oncontextmenu = function(e) {
	var evt = new Object({keyCode:93});
		stopEvent(e);
	}
function stopEvent(event) {
	if(event.preventDefault != undefined)
		event.preventDefault();
	if(event.stopPropagation != undefined)
		event.stopPropagation();
}