/*!
 * SWIF-OpenSTC
 * Copyright 2013-2014 Siclic <contact@siclic.fr>
 * Licensed under AGPL-3.0 (https://www.gnu.org/licenses/agpl.txt)
 */

define([
	'app',
	'requestModel',

	'categoriesTasksCollection',
	'categoriesRequestsCollection',
	'claimersServicesCollection',

	'genericModalView',
	'advancedSelectBoxView',
	'bsDatepicker-lang',
	'bsTimepicker',
	'moment'

], function(app, RequestModel, CategoriesTasksCollection, CategoriesRequestsCollection, ClaimersServicesCollection, GenericModalView, AdvancedSelectBoxView, datepicker, timepicker, moment){

	'use strict';



	/******************************************
	* Valid Request Modal View
	*/
	var ModalValidRequestView = GenericModalView.extend({


		templateHTML : '/templates/modals/modalValidRequest.html',


		// The DOM events //
		events: function(){
			return _.defaults({
				'submit #formValidRequest'    : 'validRequest',
				'change #createAssociatedTask': 'accordionAssociatedTask',

				'change #requestService'      : 'filterTaskCategories'
			},
				GenericModalView.prototype.events
			);
		},



		/** View Initialization
		*/
		initialize : function(params) {
			this.options = params;

			this.modal = $(this.el);

			this.render();
		},



		/** Display the view
		*/
		render : function() {
			var self = this;


			// Retrieve the template //
			$.get(app.menus.openstc+this.templateHTML, function(templateData){

				var template = _.template(templateData, {
					lang    : app.lang,
					request : self.model,
					moment  : moment
				});

				self.modal.html(template);

				// Advance Select List View //
				app.views.advancedSelectBoxCategoryRequestView = new AdvancedSelectBoxView({el: $('#requestCategory'), url: CategoriesRequestsCollection.prototype.url });
				app.views.advancedSelectBoxCategoryRequestView.render();

				app.views.advancedSelectBoxRequestServiceView = new AdvancedSelectBoxView({el: $('#requestService'), url: ClaimersServicesCollection.prototype.url });
				app.views.advancedSelectBoxRequestServiceView.render();

				app.views.advancedSelectBoxTaskcategoryView = new AdvancedSelectBoxView({el: $('#taskCategory'), url: CategoriesTasksCollection.prototype.url });
				app.views.advancedSelectBoxTaskcategoryView.render();

				// Enable the datePicker //
				$('input.datepicker').datepicker({ format: 'dd/mm/yyyy', weekStart: 1, autoclose: true, language: 'fr'});
				$('input.timepicker').timepicker({ showMeridian: false, disableFocus: true, showInputs: false, modalBackdrop: false});


				self.modal.modal('show');
			});

			return this;
		},



		/** Delete the model pass in the view
		*/
		validRequest: function(e){
			e.preventDefault();

			var self = this;

			// Set the button in loading State //
			$(this.el).find('button[type=submit]').button('loading');


			var params = {
				state   : RequestModel.status.valid.key,
				intervention_assignement_id : app.views.advancedSelectBoxCategoryRequestView.getSelectedItem(),
				service_id : app.views.advancedSelectBoxRequestServiceView.getSelectedItem(),
				date_deadline : moment($('#requestDateDeadline').val(), 'DD/MM/YYYY').format('YYYY-MM-DD'),
				description: $('#requestDescription').val(),

				create_task: $('#createAssociatedTask').is(':checked'),
				planned_hours: moment.duration({ hours: _($('#taskHour').val()).strLeft(':'), minutes: _($('#taskHour').val()).strRight(':') }).asHours(),
				category_id : app.views.advancedSelectBoxTaskcategoryView.getSelectedItem()
			};


			this.model.save(params, {patch: true, silent: true})
				.done(function() {
					self.modal.modal('hide');
					self.model.fetch({ data : {fields : self.model.fields} });
				})
				.fail(function (e) {
					console.log(e);
				})
				.always(function () {
					$(self.el).find('button[type=submit]').button('reset');
				});
		},



		/** Display or Hide Create associated Task Section
		*/
		accordionAssociatedTask: function(e){
			e.preventDefault();

			// Toggle Slide Create associated task section //
			$('fieldset.associated-task').stop().slideToggle('fast');

			// Set the search params for the Task Category //
			if(app.views.advancedSelectBoxRequestServiceView.getSelectedItem() !== ''){
				app.views.advancedSelectBoxTaskcategoryView.setSearchParam({ field : 'service_ids.id', operator : '=', value : app.views.advancedSelectBoxRequestServiceView.getSelectedItem()}, true);
			}

			// Set field as required //
			if($('#createAssociatedTask').is(':checked')){
				$('#taskHour, #taskCategory').prop('required', true);
			}
			else{
				$('#taskHour, #taskCategory').prop('required', false);
			}
		},



		/** When Request Service change, the Task categories are updated
		*/
		filterTaskCategories: function(){

			if(app.views.advancedSelectBoxRequestServiceView.getSelectedItem() !== ''){
				app.views.advancedSelectBoxTaskcategoryView.setSearchParam({ field : 'service_ids.id', operator : '=', value : app.views.advancedSelectBoxRequestServiceView.getSelectedItem()}, true);
			}
		}

	});

	return ModalValidRequestView;
});