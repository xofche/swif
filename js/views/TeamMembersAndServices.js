/******************************************
* Place Modal View
*/
app.Views.TeamMembersAndServices = Backbone.View.extend({


	templateHTML : 'teamMembersAndServices',



	// The DOM events //
	events: function(){
		return _.defaults({
			'change #placeWidth, #placeLenght' : 'calculPlaceArea',
		}, 
			app.Views.GenericModalView.prototype.events
		);
	},



	/** View Initialization
	*/
	initialize : function() {
		var self = this;

		self.render();
	},



	/** Display the view
	*/
	render : function() {
		var self = this;


		// Retrieve the template // 
		$.get("templates/" + this.templateHTML + ".html", function(templateData){

			var template = _.template(templateData, {
				lang  : app.lang,
				team : self.model
			});

			$(self.el).html(template);


			// Advance Select List View //
			app.views.advancedSelectBoxTeamMembersView = new app.Views.AdvancedSelectBoxView({el: $("#searchMembers"), collection_url: app.Collections.Officers.prototype.url })
			app.views.advancedSelectBoxTeamMembersView.render();

			app.views.advancedSelectBoxPlaceParentView = new app.Views.AdvancedSelectBoxView({el: $("#searchServices"), collection_url: app.Collections.ClaimersServices.prototype.url })
			app.views.advancedSelectBoxPlaceParentView.render();
		});

		return this;
	},


});