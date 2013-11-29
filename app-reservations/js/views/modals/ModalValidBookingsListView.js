define([
	'app',
	
	'bookingModel',
	
	'genericModalView'

], function(app, BookingModel, GenericModalView){

	'use strict';


	/******************************************
	* Refuse Request Modal View
	*/
	var modalValidBookingsListView = GenericModalView.extend({
	
	
		templateHTML : 'modals/modalValidBookingsList',
	
	
		// The DOM events //
		events: function(){
			return _.defaults({
				'submit #formValidBooking'   : 'validBooking'
			}, 
				GenericModalView.prototype.events
			);
		},
	
	
	
		/** View Initialization
		*/
		initialize : function() {
			var self = this;
	
			this.modal = $(this.el);
	
			this.render();
		},
	
	
	
		/** Display the view
		*/
		render : function() {
			var self = this;
	
	
			// Retrieve the template // 
			$.get(app.moduleUrl + "/templates/" + this.templateHTML + ".html", function(templateData){
	
				var template = _.template(templateData, {
					lang    : app.lang,
					bookings : self.collection
				});
	
				self.modal.html(template);
	
				self.modal.modal('show');
			});
	
			return this;
		},
	
	
	
		/** Delete the model pass in the view
		*/
		validBooking: function(e){
			e.preventDefault();
	
			var self = this;
	
			// Set the button in loading State //
			$(this.el).find("button[type=submit]").button('loading');
	
			var params = {
				state   : BookingModel.status.done.key,			 
				note 	: $('#note').val()
			}
	
	
			// Save Only the params //
			this.model.save(params, {patch: false, silent: true})
				.done(function(data) {
					self.modal.modal('hide');
					//self.model.fetch({ data : {fields : self.model.fields} });
				})
				.fail(function (e) {
					console.log(e);
				})
				.always(function () {
					$(self.el).find("button[type=submit]").button('reset');
				});
			
		}
	
	});
	
	return modalValidBookingsListView;
})