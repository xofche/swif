define([	
	
	'inputFieldView',
	'dateFieldView',
	'dynamicAdvancedSelectBoxView',
	
], function(InputFieldView, DateFieldView, DynamicAdvancedSelectBoxView){

	'use strict';


	/******************************************
	* Advanced Filter Bar View
	*/
	var FieldContainerView = Backbone.View.extend({
		
		el         : '.fields-container',
		
		components : [],
		
		// The DOM events //
		events: {
		},


		/** View Initialization
		*/
		initialize: function(options){
			this.searchableFields = options.searchableFields
			
			this.render();
		},



		/** View Render
		*/
		render: function(){
			var self = this;
			
			// Retrieve the template //				
			self.components = [];
			
			_.each(self.searchableFields, function(field, i){

					//Add widget corresponding to field's type
					switch (field.type) {
						case 'text':
						case 'char':
							var inputFieldView = new InputFieldView({ field: field })
							$(self.el).append(inputFieldView.render().el);
							self.components.push(inputFieldView);
						break;

						case 'date':
						case 'datetime':
							var dateFieldView = new DateFieldView({ field: field })	
							$(self.el).append(dateFieldView.render().el);
							self.components.push(dateFieldView);
						break;

						case 'many2one':
							var dynamicAdvancedSelectBoxView = new DynamicAdvancedSelectBoxView({ field: field, url: field.url })					
							$(self.el).append(dynamicAdvancedSelectBoxView.render().el);								
							self.components.push(dynamicAdvancedSelectBoxView);
						break;

						case 'selection':
							var selectionModel  = Backbone.Model.extend({});
							var selectionCollection = Backbone.Collection.extend({
							    model: selectionModel,
							    initialize: function(){}
							});
							var statesCollection = new selectionCollection();
							statesCollection.reset(field.selection)
							var dynamicAdvancedSelectBoxView = new DynamicAdvancedSelectBoxView({ field: field, collection: statesCollection })					
							$(self.el).append(dynamicAdvancedSelectBoxView.render().el);
							self.components.push(dynamicAdvancedSelectBoxView);
						break;				
					}
			});
		}

	});

	return FieldContainerView;

});