/*!
 * SWIF-OpenSTC
 * Copyright 2013-2014 Siclic <contact@siclic.fr>
 * Licensed under AGPL-3.0 (https://www.gnu.org/licenses/agpl.txt)
 */

define([
	'app',
	'appHelpers',
	'claimersServicesCollection',
	'claimerServiceModel',
	'officersCollection',

	'genericModalView',
	'advancedSelectBoxView',
	'bsSwitch'

], function(app, AppHelpers, ClaimersServicesCollection, ClaimerServiceModel, OfficersCollection, GenericModalView, AdvancedSelectBoxView){

	'use strict';



	/******************************************
	* Service Modal View
	*/
	var ModalServiceView = GenericModalView.extend({


		templateHTML : 'templates/modals/modalService.html',



		// The DOM events //
		events: function(){
			return _.defaults({
				'submit #formSaveService'     : 'saveService'
			},
				GenericModalView.prototype.events
			);
		},



		/** View Initialization
		*/
		initialize : function(params) {
			this.options = params;

			var self = this;

			this.modal = $(this.el);


			// Check if it's a create or an update //
			if(_.isUndefined(this.model)){

				this.model = new ClaimerServiceModel();
				this.render();
			}
			else{
				// Render with loader //
				this.render(true);
				this.model.fetch({silent: true, data : {fields : this.model.fields}}).done(function(){
					self.render();
				});
			}

		},



		/** Display the view
		*/
		render : function(loader) {
			var self = this;


			// Retrieve the template //
			$.get(this.templateHTML, function(templateData){

				var template = _.template(templateData, {
					lang   : app.lang,
					service: self.model,
					loader : loader
				});


				self.modal.html(template);

				if(!loader){
					// Advance Select List View //
					app.views.advancedSelectBoxManagerView = new AdvancedSelectBoxView({el: $('#serviceManager'), url: OfficersCollection.prototype.url });
					app.views.advancedSelectBoxManagerView.render();

					app.views.advancedSelectBoxServiceParentView = new AdvancedSelectBoxView({el: $('#serviceParentService'), url: ClaimersServicesCollection.prototype.url });
					app.views.advancedSelectBoxServiceParentView.render();

					$('.make-switch').bootstrapSwitch();
				}

				self.modal.modal('show');
			});

			return this;
		},



		/** Save the model pass in the view
		*/
		saveService: function(e){
			e.preventDefault();

			var self = this;

			// Set the button in loading State //
			$(this.el).find('button[type=submit]').button('loading');


			// Set the properties of the model //
			var params = {
				name     : $('#serviceName').val(),
				code     : $('#serviceCode').val().toUpperCase(),
				technical: $('#switchTechnicalService').bootstrapSwitch('state'),
				manager_id : app.views.advancedSelectBoxManagerView.getSelectedItem(),
				service_id : app.views.advancedSelectBoxServiceParentView.getSelectedItem()
			};

			this.model.unset('user_ids', { silent: true });

			this.model.save(params, {silent: true})
				.done(function(data) {
					self.modal.modal('hide');

					// Create mode //
					if(self.model.isNew()) {
						self.model.setId(data);
						self.model.fetch({silent: true, data : {fields : ClaimersServicesCollection.prototype.fields} }).done(function(){
							app.views.servicesListView.collection.add(self.model);
						});
					// Update mode //
					} else {
						self.model.fetch({ data : {fields : self.model.fields} });
					}
				})
				.fail(function (e) {
					AppHelpers.printError(e);
				})
				.always(function () {
					$(self.el).find('button[type=submit]').button('reset');
				});
		}

	});

	return ModalServiceView;
});