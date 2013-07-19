/******************************************
* Modal Delete View
*/
app.Views.ModalDeleteView = app.Views.GenericModalView.extend({


	templateHTML: 'modals/modalDelete',

	
	// The DOM events //
	events: function(){
		return _.defaults({
			'click .btnDelete' : 'deleteModel',
		}, 
			app.Views.GenericModalView.prototype.events
		);
	},



	/** View Initialization
	*/
	initialize : function() {
		this.modal = $(this.el);
	},



	/** Display the view
	*/
	render : function() {
		var self = this;

		// Retrieve the template // 
		$.get("templates/" + this.templateHTML + ".html", function(templateData){
		 
			var template = _.template(templateData, {
				lang  : app.lang,
				model : self.options.model
			});

			self.modal.html(template);
			self.modal.modal('show');
		});

		return this;
	},



	/** Delete the model pass in the view
	*/
	deleteModel: function(e){
		var self = this;

		console.log('delete Model');

		this.model.delete({
			success: function(data){
				if(data.error){
					app.notify('', 'error', app.lang.errorMessages.unablePerformAction, app.lang.errorMessages.sufficientRights);
				}
				else{
					app.collections.places.remove(self.options.model);
					self.modal.modal('hide');
					//Backbone.history.loadUrl(Backbone.history.fragment);
				}
			},
			error: function(e){
				alert("Impossible de contacter le serveur");
			}

		});
	}

});