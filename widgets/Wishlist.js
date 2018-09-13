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
			
			xhr("martini_galleries", {
				handleAs: "string"
			}).then(lang.hitch(this, function(result){
				console.log(result);
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
		},
		
		show: function(){
			domStyle.set( this.domNode, "zIndex", this._getHighestZindex() + 1 );
			M.Modal.getInstance(this.domNode).open();
			
			this._handleEmptyListMessageVisibility();
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