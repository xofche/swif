/*!
 * SWIF-OpenSTC
 * Copyright 2013-2014 Siclic <contact@siclic.fr>
 * Licensed under AGPL-3.0 (https://www.gnu.org/licenses/agpl.txt)
 */

define(['app', 'appHelpers', 'claimerTypeModel', 'claimersTypesCollection', 'genericModalView'],
	function (app, AppHelpers, ClaimerTypeModel, ClaimersTypesCollection, GenericModalView) {

	'use strict';


	return GenericModalView.extend({

		templateHTML: 'templates/modals/modalClaimerType.html',


		// The DOM events //
		events      : function () {
			return _.defaults({
					'submit #formSaveClaimerType': 'saveClaimerType'
				},
				GenericModalView.prototype.events
			);
		},



		/** View Initialization
		*/
		initialize: function (params) {
			this.options = params;

			this.modal = $(this.el);

			// Check if it's a create or an update //
			if (_.isUndefined(this.model)) {
				this.model = new ClaimerTypeModel();
			}

			this.render();
		},



		/** Display the view
		*/
		render: function () {
			var self = this;

			// Retrieve the template //
			$.get(this.templateHTML, function (templateData) {

				var template = _.template(templateData, {
					lang       : app.lang,
					claimerType: self.model
				});

				self.modal.html(template);
				
				$('.make-switch').bootstrapSwitch();

				self.modal.modal('show');
			});

			return this;
		},

		/** Delete the model pass in the view
		 */
		saveClaimerType: function (e) {
			e.preventDefault();

			var self = this;

			// Set the button in loading State //
			$(this.el).find('button[type=submit]').button('loading');

			// Set the properties of the model //
			var params = {
				name: this.$('#claimerTypeName').val(),
				code: this.$('#claimerTypeCode').val().toUpperCase(),
				sending_mail: $('#switchSendingMail').bootstrapSwitch('state'),
			};

			this.model.save(params)
				.done(function (data) {
					self.modal.modal('hide');

					// Create mode //
					if (self.model.isNew()) {
						self.model.setId(data);

						self.model.fetch({silent: true, data: {fields: ClaimersTypesCollection.prototype.fields} }).done(function () {
							app.views.claimersTypesListView.collection.add(self.model);
						});
						// Update mode //
					} else {
						self.model.fetch({ data: {fields: self.model.fields} });
					}
				})
				.fail(function (e) {
					AppHelpers.printError(e);
				})
				.always(function () {
					$(self.el).find('button[type=submit]').button('reset');
				});
		},

	});
});