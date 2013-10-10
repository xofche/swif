/******************************************
* Claimer Type Modal View
*/
app.Views.ModalClaimerTypeView = app.Views.GenericModalView.extend({


	templateHTML : 'modals/modalClaimerType',



	// The DOM events //
	events: function(){
		return _.defaults({
			'submit #formSaveClaimerType'  : 'saveClaimerType'
		}, 
			app.Views.GenericModalView.prototype.events
		);
	},



	/** View Initialization
	*/
	initialize : function() {

		this.modal = $(this.el);

		// Check if it's a create or an update //
		if(_.isUndefined(this.model)){
			this.model = new app.Models.ClaimerType();
		}

		this.render();
	},



	/** Display the view
	*/
	render : function() {
		var self = this;


		// Retrieve the template // 
		$.get("templates/" + this.templateHTML + ".html", function(templateData){

			var template = _.template(templateData, {
				lang       : app.lang,
				claimerType: self.model
			});

			self.modal.html(template);

			self.modal.modal('show');
		});

		return this;
	},



	/** Delete the model pass in the view
	*/
	saveClaimerType: function(e){
		e.preventDefault();

		var self = this;

		// Set the button in loading State //
		$(this.el).find("button[type=submit]").button('loading');


		// Set the properties of the model //
		var params = {
			name       : this.$('#claimerTypeName').val(),
			code       : this.$('#claimerTypeCode').val()
		}

		this.model.save(params)
			.done(function(data) {
				self.modal.modal('hide');

				// Create mode //
				if(self.model.isNew()) {
					self.model.setId(data);
					console.log(data);
					self.model.fetch({silent: true, data : {fields : app.Collections.ClaimersTypes.prototype.fields} }).done(function(){
						app.views.claimersTypesListView.collection.add(self.model);
					})
				// Update mode //
				} else {
					self.model.fetch({ data : {fields : self.model.fields} });
				}
			})
			.fail(function (e) {
				app.Helpers.Main.printError(e);
			})
			.always(function () {
				$(self.el).find("button[type=submit]").button('reset');
			});
	},

});