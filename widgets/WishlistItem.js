define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/WishlistItem.html",
	"dojo/_base/lang",
	"dojo/dom-attr",
    "dojo/dom-style",
    "dojo/dom-class"
], function(
	declare,
	_WidgetBase, 
	_TemplatedMixin, 
	template, 
	lang, 
	domAttr, 
	domStyle, 
	domClass) {

    return declare("widgets.WishlistItem", [_WidgetBase, _TemplatedMixin], {
        templateString: template,
		
		value: null,
		wishlist: null,
		
		constructor: function(/*Object*/ kwArgs){
		  lang.mixin(this, kwArgs);
		},
		
		_onClick_Delete: function(evt){
			this.wishlist.removeItem(this);
			this.destroy();
		},
		
		_setValueAttr: function(valueObject){
			if(valueObject == null){
				return;
			}
			
			this.value = valueObject;
			
			domAttr.set(this.displayTextNode, "innerHTML", this.value.dispname );			
			domAttr.set(this.descriptionTextNode, "innerHTML", this.value.number + ' ' + this.value.color + '<br/>' + this.value.size  );			
			domAttr.set(this.imgNode, "src", this.value.imgThumb );			
			
		},
		
		_getValueAttr: function(){
			return this.value;
		},
		
		postMixInProperties: function () {
            this.inherited(arguments);
        },

        postCreate: function () {
            this.inherited(arguments);
			
			this.set("value", this.value );
		}
    });

});