define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/Wishlist.html",
	"dojo/_base/lang",
	"widgets/WishlistItem",
	"dojo/_base/array",
	"dojo/dom-attr",
    "dojo/dom-style",
    "dojo/dom-class",
	"dojo/request/xhr"
], function(
	declare, 
	_WidgetBase, 
	_TemplatedMixin, 
	template, 
	lang, 
	WishlistItem,
	array,
	domAttr,
	domStyle,
	domClass,
	xhr) {

    return declare("widgets.Wishlist", [_WidgetBase, _TemplatedMixin], {
        templateString: template,
		
		_items: [],
		_rawItems: [],
		
		constructor: function(/*Object*/ kwArgs){
		  lang.mixin(this, kwArgs);
		  
		  this._items = [];
		  this._rawItems = [];
		},
		
		_getEmailBody: function(){
			var bodytext = "";
			var newline = "\r\n";			
			
			bodytext += "Hallo liebes BRANDSTORE.TIROL Team!" + newline + newline;
			bodytext += "Meine Wunschliste enthält folgende Artikel:" + newline + newline;
			
			for(var i = 0; i < this._items.length; i++){
				var item = this._items[i];
				
				var value = item.get("value");
				bodytext += "#" + (i+1) + ". " + value.dispname + ": " + value.number + ', ' + value.color + ', ' + value.size + newline;
			}
			
			bodytext += newline + "Bitte werft einen Blick darauf und gebt mir Bescheid." + newline + "Meine Telefonnummer für Rückfragen:" + newline + 
						"INFO von BRANDSTORE.TIROL - bitte check in Kürze deinen SPAM Ordner - falls du nichts von uns hörst, liegt unser Mail dort";
			
			return encodeURIComponent(bodytext);
		},
		
		_onClick_SendMail: function(evt){
			var email = "hallo@brandstore.tirol";
			var subject = "WUNSCHLISTE";
			var body_message = this._getEmailBody();
			
			var mailto_link = 'mailto:' + email + '?subject=' + subject + '&body=' + body_message;

			win = window.open(mailto_link, 'emailWindow');
			if (win && win.open && !win.closed) win.close();
		},
		
		_handleEmailButtonVisibility: function(){
			if(this._items.length == 0){
				domStyle.set(this.emailButtonContainer, "display", "none" );
			}else{
				domStyle.set(this.emailButtonContainer, "display", "block" );
			}
		},
		
		addItem: function(name, number, color, size, thumb){
			this.addItem_silent(name, number, color, size, thumb);
			this._saveRawItems();
			this.show();
		},
		
		addItem_silent: function(name, number, color, size, thumb){
			var newItem = {
				dispname: name,
				number: number, 
				color: color,
				size: size,
				imgThumb: thumb
			};
			
			var item = new WishlistItem({
				value: newItem,
				wishlist: this
			});
			
			this._items.push(item);
			this._rawItems.push(newItem);
			item.placeAt(this.itemCollectionNode);
			
			this._handleEmailButtonVisibility();
		},
		
		_saveRawItems: function(){
			localStorage.setItem("wishList_rawItems", JSON.stringify(this._rawItems));
		},
		
		_loadRawItems: function(){
			var storedItemsStr = localStorage.getItem("wishList_rawItems");
			if(storedItemsStr){
				var storedItems = JSON.parse(storedItemsStr);
				if(typeof(storedItems) == "object" ){
					for(var i = 0; i < storedItems.length; i++){
						var item = storedItems[i];
						
						this.addItem_silent(item.dispname, item.number, item.color, item.size, item.imgThumb);
					}
				}
			}
		},
		
		_loadGalleries: function(){
			
			xhr("/martini_galleries", {
				handleAs: "string"
			}).then(lang.hitch(this, function(result){
				domAttr.set(this.galleriesContainerNode, "innerHTML", result);
			}), function(err){
				// Handle the error condition
			});			

			
		},
		
		removeItem: function(item){
			var indexInArray = array.indexOf(this._items, item);
			this._items.splice(indexInArray, 1);
			this._rawItems.splice(indexInArray, 1);
			
			this._saveRawItems();
			
			this._handleEmptyListMessageVisibility();
			this._handleEmailButtonVisibility();
		},
		
		show: function(){
			domStyle.set( this.domNode, "zIndex", this._getHighestZindex() + 1 );
			M.Modal.getInstance(this.domNode).open();
			
			this._handleEmptyListMessageVisibility();
			
			this._handleEmailButtonVisibility();
		},
		close: function(){
			M.Modal.getInstance(this.domNode).close()
		},
		
		_handleEmptyListMessageVisibility: function(){
			if(this._items.length == 0){
				domStyle.set(this.emptyListMessageNode, "display", "");
			}else{
				domStyle.set(this.emptyListMessageNode, "display", "none");
			}
		},
		
		_getHighestZindex: function(){
			var highest_z_index = 0;
			var current_z_index = 0;

			// Loop through each div and get the highest z-index
			$('div').each(function() {

			current_z_index = parseInt($(this).css("z-index"));

			if(current_z_index > highest_z_index) {
			  highest_z_index = current_z_index+1;
			}
			});

			return highest_z_index;
		},
		
		postMixInProperties: function () {
            this.inherited(arguments);
			
        },

        postCreate: function () {
            this.inherited(arguments);
			
			this._loadRawItems();
			this._loadGalleries();
		}
    });

});