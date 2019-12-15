var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _window = window,
    React = _window.React,
    ReactDOM = _window.ReactDOM;


'use strict';

var InventoryContainer = function (_React$Component) {
	_inherits(InventoryContainer, _React$Component);

	function InventoryContainer(props) {
		_classCallCheck(this, InventoryContainer);

		//Set default inventory state
		var _this = _possibleConstructorReturn(this, (InventoryContainer.__proto__ || Object.getPrototypeOf(InventoryContainer)).call(this, props));

		_this.state = { open: false, playerInvSize: 0, playerinv: [], otherInvSize: 0, otherinv: [] };

		//Bind events
		_this.receiveNuiMessage = _this.receiveNuiMessage.bind(_this);
		_this.handleKeyUp = _this.handleKeyUp.bind(_this);
		_this.handleKeyDown = _this.handleKeyDown.bind(_this);
		_this.handleMouseMove = _this.handleMouseMove.bind(_this);
		_this.handleMouseUp = _this.handleMouseUp.bind(_this);

		//Bind click handlers
		_this.clickItem = _this.clickItem.bind(_this);
		_this.clickSlot = _this.clickSlot.bind(_this);
		_this.amountMouseEnter = _this.amountMouseEnter.bind(_this);
		_this.amountMouseLeave = _this.amountMouseLeave.bind(_this);

		_this.stopDragging = _this.stopDragging.bind(_this);
		_this.startDragging = _this.startDragging.bind(_this);

		//Handle variables
		_this.isDragging = false;
		_this.dragItem = null;
		_this.toSlot = null;
		_this.fromSlot = null;
		_this.shiftPressed = false;
		_this.didSplit = false;
		_this.ctrlPressed = false;
		_this.isOverAmount = false;
		_this.amountEdit = "";
		return _this;
	}

	_createClass(InventoryContainer, [{
		key: "render",
		value: function render() {
			//Load state variables
			var guiOpen = this.state.open;
			var playerInvSize = this.state.playerInvSize;
			var otherInvSize = this.state.otherInvSize;
			var playerItems = this.state.playerinv;
			var otherItems = this.state.otherinv;

			var rowItems = 5;

			//Child Components
			var player;
			var other;
			var classes;

			if (guiOpen) {
				//Create child components
				if (playerInvSize >= rowItems) {
					player = React.createElement(Inventory, { invName: "player", invSize: playerInvSize, itemsPerRow: rowItems, items: playerItems, clickItem: this.clickItem, clickSlot: this.clickSlot });
				} else {
					player = null;
				}
				if (otherInvSize >= rowItems) {
					other = React.createElement(Inventory, { invName: "other", invSize: otherInvSize, itemsPerRow: rowItems, items: otherItems, clickItem: this.clickItem, clickSlot: this.clickSlot });
				} else {
					other = null;
				}
				classes = "overlay";
			} else {
				//Hide child components/remove them
				player = null;
				other = null;
				classes = "hidden";
			}
			return React.createElement(
				"div",
				{ className: classes },
				React.createElement(
					"div",
					{ className: "container" },
					player,
					React.createElement(
						"div",
						{ id: "functions" },
						React.createElement("input", { type: "number", placeholder: "Amount", id: "amount", min: "0", onMouseEnter: this.amountMouseEnter, onMouseLeave: this.amountMouseLeave, onChange: this.changeAmount, onClick: this.clickAmount })
					),
					other,
					React.createElement(
						"div",
						{ id: "desc" },
						React.createElement("div", { className: "desc-title" }),
						React.createElement("hr", { className: "divider" }),
						React.createElement("span", { className: "desc-content" })
					)
				)
			);
		}
	}, {
		key: "componentDidMount",
		value: function componentDidMount() {
			//Add event listeners for keyboard/mouse events
			window.addEventListener("message", this.receiveNuiMessage);
			window.addEventListener("keyup", this.handleKeyUp);
			window.addEventListener("keydown", this.handleKeyDown);
			window.addEventListener("mousemove", this.handleMouseMove);
			window.addEventListener("mouseup", this.handleMouseUp);
		}
	}, {
		key: "receiveNuiMessage",
		value: function receiveNuiMessage(event) {
			var updateArray = {};
			if (event.data.openGui != null) {
				//set gui opened or closed
				updateArray["open"] = event.data.openGui;
			}
			if (event.data.playerInvSize) {
				//load player inventory size
				updateArray["playerInvSize"] = event.data.playerInvSize;
			}
			if (event.data.playerinv) {
				//Load player items from message
				updateArray["playerinv"] = event.data.playerinv;
			}
			if (event.data.otherInvSize) {
				//load other inventory size
				updateArray["otherInvSize"] = event.data.otherInvSize;
			}
			if (event.data.otherinv) {
				//Load other items from message
				updateArray["otherinv"] = event.data.otherinv;
			}
			this.setState(updateArray);
		}
	}, {
		key: "handleKeyUp",
		value: function handleKeyUp(e) {
			if (e.key === "Escape") {
				//Exit gui/hide
				this.setState({ open: false });
				closeGui();
			}
			if (e.key === "Shift") {
				this.shiftPressed = false;
			}
			if (e.key === "Ctrl") {
				this.ctrlPressed = false;
			}
		}
	}, {
		key: "handleKeyDown",
		value: function handleKeyDown(e) {
			//For shift clicking items
			if (e.key === "Shift") {
				this.shiftPressed = true;
			}
			if (e.key === "Ctrl") {
				this.ctrlPressed = true;
			}
			if (this.isOverAmount) {
				if (event.keyCode >= 48 && event.keyCode <= 57) {
					this.amountEdit += e.key.toString();
					$("#amount").val(this.amountEdit);
				} else {
					this.amountEdit = "0";
					$("#amount").val(this.amountEdit);
				}
			}
		}
	}, {
		key: "handleMouseMove",
		value: function handleMouseMove(e) {
			if (this.isDragging) {
				this.dragItem.css("top", e.clientY - 50);
				this.dragItem.css("left", e.clientX - 50);
			}
		}
	}, {
		key: "handleMouseUp",
		value: function handleMouseUp(e) {
			if (this.isDragging) {
				switch (e.which) {
					case 1:
						//Dropping itemstack
						this.stopDragging();
						break;
					case 2:
						this.stopDragging();
						break;
					case 3:
						/* REMOVED FOR TIME BEING, IT'S BAD
      //Place one item unless amount = 1
      let item = this.dragItem;
      if(Number(item.find(".item-amount").text()) <= 1){
      //Itemstack is already delpleted, stop placing and return back to original spot ?
      //this.toSlot = this.fromSlot;
      this.stopDragging();
      }else {
      if(this.toSlot == null || this.fromSlot == null || this.didSplit){
      	this.didSplit = false;
      	break;
      }
      //find which inventory we're placing in
      var toInvName = this.toSlot.attr("id").split("slot")[0];
      var fromInvName = this.fromSlot.attr("id").split("slot")[0];
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
      		//get the slot of the new item
      var slot = getSlotNumFromId(this.toSlot.attr("id")) + 1;
      		//get the slot element
      var slotElement = toinv.find(function(e){
      	return e.slot == slot;
      })
      		var fslot = getSlotNumFromId(this.dragItem.attr("id")) + 1;
      		//get the slot element
      var fSlotElement = frominv.find(function(e){
      	return e.slot == fslot;
      })
      		//if there is an element is found
      if(fSlotElement != undefined){
      	//Check item ids and stackable, if they are then add one to the slot and remove one from drag
      	if(slotElement != undefined){
      		if(fslot != slot && slotElement.id == this.dragItem.data("itemid")){
      			toinv.splice(toinv.indexOf(slotElement), 1);
      			//frominv.splice(frominv.indexOf(fSlotElement), 1);
      			//fSlotElement.amount -= 1;
      			slotElement.amount += 1;
      		}else {
      			break;
      		}
      	}else {
      		var slotElement = JSON.parse(JSON.stringify(fSlotElement));
      		slotElement.slot = slot;
      		slotElement.amount = 1;
      		fSlotElement.amount -= 1;
      		frominv.push(fSlotElement);
      	}
      	//this.toSlot.find(".item-amount").text(slotElement.amount);
      	//this.fromSlot.find(".item-amount").text(fSlotElement.amount);
      	
      	
      	toinv.push(slotElement);
      			var updateArray = {};
      			if(toInvName == "player") {
      		//update playerinv
      		updateArray["playerinv"] = toinv;
      	}else {
      		//update otherinv
      		updateArray["otherinv"] = toinv;
      	}
      	if(toInvName != fromInvName){
      		if(fromInvName == "player"){
      			updateArray["playerinv"] = frominv;
      		}else {
      			updateArray["otherinv"] = frominv;
      		}
      	}else {
      		toinv[toinv.indexOf(fSlotElement)].amount = fSlotElement.amount;
      	}
      	this.setState(updateArray);
      }else {
      }
      	}
      */
						break;
					default:
						console.log("oops");break;
				}
			}
		}
	}, {
		key: "clickItem",
		value: function clickItem(e, uid, invName) {
			//Handle when a user clicks on an item
			if (!this.isDragging) {
				var item = $("#" + uid);
				var mouseX = e.clientX;
				var mouseY = e.clientY;
				switch (e.button) {
					case 0:
						//Left click
						this.dragItem = item;
						this.fromSlot = item.parent();

						//handle shift clicking items
						if (this.shiftPressed) {
							var slot = null;

							//get Available slot in opposite inventory
							var opposite, inv;
							if (invName == "player") {
								opposite = "other";
								inv = this.state.otherinv;
							} else {
								opposite = "player";
								inv = this.state.playerinv;
							}
							var instance = findFirstInstanceOf(item.data("itemid"), inv);
							var slotNum;
							if (instance != null) {
								slotNum = instance.slot - 1;
							} else {
								slotNum = this.findFirstAvailableSlotInInv(opposite);
							}
							if (slotNum != null) {
								slot = getSlotIdFromNum(slotNum, opposite);
							}

							//make sure inventory is not full
							if (slot != null) {
								this.toSlot = $("#" + slot);
								//prevent sticky shift
								this.shiftPressed = false;
								this.stopDragging();
							}
						} else {
							//start drag
							this.startDragging(mouseX, mouseY);
						}
						break;
					case 1:
						//Middle click
						break;
					case 2:
						//Right CLick
						if (Number(item.find(".item-amount").text()) <= 1) {
							//do regular click
							this.dragItem = item;
							this.fromSlot = item.parent();
							this.startDragging(mouseX, mouseY);
						} else {
							//Create new itemstack

							//get the inventory we're in
							var inv;
							if (invName == "player") {
								inv = this.state.playerinv.slice();
							} else {
								inv = this.state.otherinv.slice();
							}

							//get the slot of the current item
							var slot = getSlotNumFromId(item.attr("id")) + 1;

							//get the slot element
							var slotElement = inv.find(function (e) {
								return e.slot == slot;
							});

							//if the element is found
							if (slotElement != undefined) {
								this.didSplit = true;
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
								if (newSlot != null) {
									newElement.slot = newSlot + 1;
								} else {
									//if inventory is full
									this.dragItem = item;
									this.fromSlot = item.parent();
									this.startDragging(mouseX, mouseY);
									break;
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
								if (invName == "player") {
									updateArray["playerinv"] = inv;
								} else {
									updateArray["otherinv"] = inv;
								}
								this.setState(updateArray, function () {
									//callback after render, set the new item to be dragged and set fromslot
									var ele = inv[inv.length - 1];
									var slotId = getSlotIdFromNum(ele.slot - 1, invName);
									var newItem = $("#" + slotId).find(".item").eq(0);
									this.dragItem = newItem;
									this.fromSlot = newItem.parent();
									this.startDragging(mouseX, mouseY);
								});
							}
						}
						break;
					default:
						break;
				}
			}
		}
	}, {
		key: "clickSlot",
		value: function clickSlot(e, slotId) {
			var slot = $("#" + slotId);
			if (this.isDragging) {
				//set toSlot
				this.toSlot = slot;
			}
		}
	}, {
		key: "clickAmount",
		value: function clickAmount(e) {
			e = e || window.event;
			e.preventDefault();
		}
	}, {
		key: "changeAmount",
		value: function changeAmount(e) {
			var value = $("#amount").val();
			if (value == "") {
				$("#amount").val(0);
			}
		}
	}, {
		key: "amountMouseEnter",
		value: function amountMouseEnter(e) {
			this.isOverAmount = true;
		}
	}, {
		key: "amountMouseLeave",
		value: function amountMouseLeave(e) {
			this.isOverAmount = false;
			this.amountEdit = "";
		}
	}, {
		key: "stopDragging",
		value: function stopDragging() {
			this.isDragging = false;
			this.dragItem.css("position", "relative");
			this.dragItem.css("top", 0);
			this.dragItem.css("left", 0);
			this.dragItem.css("opacity", 1);
			$(".item").removeClass("stop-clicks");

			if (this.toSlot == null) {
				//send this back to nikea
				this.fromSlot.append(this.dragItem);
			} else {
				var frominv, toinv;
				//Update slots
				toInvName = this.toSlot.attr("id").split("slot")[0];
				fromInvName = this.fromSlot.attr("id").split("slot")[0];

				if (toInvName == "player") {
					toinv = this.state.playerinv.slice();
				} else {
					toinv = this.state.otherinv.slice();
				}
				if (fromInvName == "player") {
					frominv = this.state.playerinv.slice();
				} else {
					frominv = this.state.otherinv.slice();
				}

				var oldSlot = getSlotNumFromId(this.fromSlot.attr("id")) + 1;
				var slotNum = getSlotNumFromId(this.toSlot.attr("id")) + 1;

				var updateElement = frominv.find(function (ele) {
					return ele.slot == oldSlot;
				});

				if (updateElement != undefined) {
					//when in same inventory, remove old element

					//find old element in current inventroy
					var newElement = toinv.find(function (ele) {
						return ele == updateElement;
					});

					//if element is in inventory, delete it, or merge
					if (newElement != undefined) {
						var index = toinv.indexOf(newElement);
						toinv.splice(index, 1);
					}
					//remove element from opposite inventory
					var index2 = frominv.indexOf(updateElement);
					frominv.splice(index2, 1);

					if (this.didSplit && this.fromSlot == undefined) {
						//Did a split in a full inventory, prevent swapping

					}

					var swapElement = toinv.find(function (ele) {
						return ele.slot == slotNum;
					});

					if (swapElement != undefined) {
						//remove element from inventory
						var index3 = toinv.indexOf(swapElement);
						toinv.splice(index3, 1);
						if (updateElement.id == swapElement.id && swapElement.stack) {
							//diff itemstack, same itemid
							updateElement.amount += swapElement.amount;
							this.toSlot.find(".item-amount").text(updateElement.amount);
						} else {
							//diff itemid
							swapElement.slot = oldSlot;
							if (toInvName == fromInvName) {
								toinv.push(swapElement);
							} else {
								frominv.push(swapElement);
							}
						}
					}

					//update new slot
					updateElement.slot = slotNum;
					toinv.push(updateElement);

					var updateState = {};

					if (toInvName == "player") {
						//update playerinv
						updateState["playerinv"] = toinv;
					} else {
						//update otherinv
						updateState["otherinv"] = toinv;
					}
					if (toInvName != fromInvName) {
						if (fromInvName == "player") {
							//we swapped, update playerinv as well
							updateState["playerinv"] = frominv;
						} else {
							//we swapped, update otherinv as well
							updateState["otherinv"] = frominv;
						}
					}
					this.setState(updateState);
				}
			}

			this.dragItem = null;
			this.fromSlot = null;
			this.didSplit = false;
			this.toSlot = null;
		}
	}, {
		key: "startDragging",
		value: function startDragging(mouseX, mouseY) {
			this.dragItem.css("position", "fixed");
			this.dragItem.css("opacity", 0.5);
			$(".item").addClass("stop-clicks");
			this.isDragging = true;
			this.dragItem.css("top", mouseY - 50);
			this.dragItem.css("left", mouseX - 50);
		}
	}, {
		key: "findFirstAvailableSlotInInv",
		value: function findFirstAvailableSlotInInv(invName) {
			var invSize, inv;
			if (invName == "player") {
				invSize = this.state.playerInvSize;
				inv = this.state.playerinv.slice();
			} else {
				invSize = this.state.otherInvSize;
				inv = this.state.otherinv.slice();
			}
			if (invSize == 0 || invSize == inv.length) {
				return null;
			}
			if (inv.length == 0) {
				return 0;
			}

			for (var i = 0; i < invSize; i++) {
				var slotElement = inv.find(function (e) {
					return e.slot == i + 1;
				});
				if (slotElement == undefined) {
					return i;
				}
			}
			return null;
		}
	}]);

	return InventoryContainer;
}(React.Component);

var Inventory = function (_React$Component2) {
	_inherits(Inventory, _React$Component2);

	function Inventory(props) {
		_classCallCheck(this, Inventory);

		var _this2 = _possibleConstructorReturn(this, (Inventory.__proto__ || Object.getPrototypeOf(Inventory)).call(this, props));

		_this2.clickSlot = _this2.clickSlot.bind(_this2);
		_this2.clickItem = _this2.clickItem.bind(_this2);
		_this2.props.clickItem.bind(_this2);
		_this2.props.clickSlot.bind(_this2);
		return _this2;
	}

	_createClass(Inventory, [{
		key: "render",
		value: function render() {
			var invName = this.props.invName;
			var invSize = this.props.invSize;
			var inventoryClasses = "inventory " + invName;
			var slots = [];
			var slot = 0;
			var itemsPerRow = this.props.itemsPerRow;

			var invRows = invSize / itemsPerRow;

			//Load inventory items
			var items = this.props.items;

			for (var i = 0; i < invRows; i++) {
				var cols = [];
				for (var j = 0; j < itemsPerRow; j++) {
					var slotId = invName + "slot" + (i * itemsPerRow + j);

					var uid, itemValues;
					if (items != undefined && items.length != 0) {
						uid = invName + "item" + (i * itemsPerRow + j);
						itemValues = items.find(function (e) {
							return e.slot == slot + 1;
						});
					} else {
						itemValues = {};
						uid = null;
					}

					cols.push(React.createElement(Slot, { key: j, slotNumber: slot, slotId: slotId, uid: uid, itemValues: itemValues, clickItem: this.clickItem, clickSlot: this.clickSlot }));
					slot++;
				}
				slots.push(React.createElement(
					"tr",
					{ key: i },
					cols
				));
			}

			return React.createElement(
				React.Fragment,
				null,
				React.createElement(
					"div",
					{ className: inventoryClasses },
					React.createElement(
						"h2",
						{ className: "title" },
						Capitalize(invName),
						" Inventory"
					),
					React.createElement(
						"table",
						{ className: "slots" },
						React.createElement(
							"tbody",
							null,
							slots
						)
					)
				)
			);
		}
	}, {
		key: "clickSlot",
		value: function clickSlot(e, slotId) {
			this.props.clickSlot(e, slotId);
		}
	}, {
		key: "clickItem",
		value: function clickItem(e, uid) {
			this.props.clickItem(e, uid, this.props.invName);
		}
	}]);

	return Inventory;
}(React.Component);

var Slot = function (_React$PureComponent) {
	_inherits(Slot, _React$PureComponent);

	function Slot(props) {
		_classCallCheck(this, Slot);

		var _this3 = _possibleConstructorReturn(this, (Slot.__proto__ || Object.getPrototypeOf(Slot)).call(this, props));

		_this3.clickHandler = _this3.clickHandler.bind(_this3);
		_this3.clickItem = _this3.clickItem.bind(_this3);
		_this3.props.clickItem.bind(_this3);
		_this3.props.clickSlot.bind(_this3);
		return _this3;
	}

	_createClass(Slot, [{
		key: "render",
		value: function render() {
			var uid = this.props.uid;
			var itemValues = this.props.itemValues;
			var slotId = this.props.slotId;
			var item;

			if (uid != null && itemValues != null) {
				item = React.createElement(Item, { itemValues: itemValues, uid: uid, clickItem: this.clickItem });
			} else {
				item = null;
			}

			return React.createElement(
				React.Fragment,
				null,
				React.createElement(
					"td",
					{ className: "slot", id: slotId, onMouseUp: this.clickHandler },
					item
				)
			);
		}
	}, {
		key: "clickHandler",
		value: function clickHandler(e) {
			this.props.clickSlot(e, this.props.slotId);
		}
	}, {
		key: "clickItem",
		value: function clickItem(e, uid) {
			this.props.clickItem(e, uid);
		}
	}]);

	return Slot;
}(React.PureComponent);

var Item = function (_React$Component3) {
	_inherits(Item, _React$Component3);

	function Item(props) {
		_classCallCheck(this, Item);

		var _this4 = _possibleConstructorReturn(this, (Item.__proto__ || Object.getPrototypeOf(Item)).call(this, props));

		_this4.clickHandler = _this4.clickHandler.bind(_this4);
		_this4.props.clickItem.bind(_this4);
		_this4.mouseEnterHandler = _this4.mouseEnterHandler.bind(_this4);
		_this4.mouseOutHandler = _this4.mouseOutHandler.bind(_this4);
		return _this4;
	}

	_createClass(Item, [{
		key: "render",
		value: function render() {
			var itemId = this.props.itemValues.id;
			var uid = this.props.uid;
			var itemName = this.props.itemValues.name;
			var itemAmount = this.props.itemValues.amount;
			var itemImage = this.props.itemValues.image;

			var imgSrc = "img/" + itemName + ".gif";

			return React.createElement(
				"div",
				{ className: "item", id: uid, "data-itemid": itemId, onMouseDown: this.clickHandler, onMouseEnter: this.mouseEnterHandler, onMouseLeave: this.mouseOutHandler },
				React.createElement(
					"div",
					{ className: "item-amount" },
					itemAmount
				),
				React.createElement(
					"div",
					{ className: "item-image" },
					React.createElement("img", { src: imgSrc })
				),
				React.createElement(
					"div",
					{ className: "item-name" },
					itemName
				)
			);
		}
	}, {
		key: "clickHandler",
		value: function clickHandler(e) {
			this.props.clickItem(e, this.props.uid);
		}
	}, {
		key: "mouseEnterHandler",
		value: function mouseEnterHandler(e) {
			var itemName = this.props.itemValues.name;
			var itemDesc = this.props.itemValues.desc;
			$("#desc .desc-title").text(itemName);
			$("#desc .desc-content").text(itemDesc);
			$("#desc .divider").show();
			if (e.relatedTarget != null) {
				if (!$(e.relatedTarget).hasClass("item")) {
					$("#desc").fadeIn(2000);
				}
			}
		}
	}, {
		key: "mouseOutHandler",
		value: function mouseOutHandler(e) {
			$("#desc .desc-content").text("");
			$("#desc .desc-title").text("");
			$("#desc .divider").hide();
		}
	}]);

	return Item;
}(React.Component);

var domContainer = document.getElementById("root");
ReactDOM.render(React.createElement(InventoryContainer, null), domContainer);

//Helper/Static functions
function closeGui() {
	var xhr = new XMLHttpRequest();
	xhr.addEventListener('load', function () {
		console.log(xhr.responseText);
	});
	xhr.open('POST', 'http://react-inventory/closeGui');
	xhr.send(JSON.stringify({}));
}

function Capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function getSlotNumFromId(id) {
	var slots = Number(id.replace(/\D/g, ""));
	return slots;
}

function getSlotIdFromNum(num, invName) {
	if (num == null) {
		return null;
	}
	return invName + "slot" + num;
}

function findFirstInstanceOf(itemid, inv) {
	var ele = inv.find(function (e) {
		return e.id == itemid;
	});
	if (ele != undefined && ele.stack) {
		return ele;
	}
	return null;
}

document.oncontextmenu = function (e) {
	var evt = new Object({ keyCode: 93 });
	stopEvent(e);
};
function stopEvent(event) {
	if (event.preventDefault != undefined) event.preventDefault();
	if (event.stopPropagation != undefined) event.stopPropagation();
}