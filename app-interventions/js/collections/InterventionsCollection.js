/*!
 * SWIF-OpenSTC
 * Copyright 2013-2014 Siclic <contact@siclic.fr>
 * Licensed under AGPL-3.0 (https://www.gnu.org/licenses/agpl.txt)
 */

define([
	'app',

	'genericCollection',
	'interventionModel'

], function(app, GenericCollection, InterventionModel){

	'use strict';

	/******************************************
	* Interventions Collection
	*/
	var InterventionsCollection = GenericCollection.extend({

		model  : InterventionModel,

		url    : '/api/openstc/interventions',

		fields : ['id', 'name', 'description', 'tasks', 'state', 'service_id', 'site1', 'site_details', 'date_deadline', 'planned_hours', 'effective_hours', 'total_hours', 'tooltip', 'progress_rate', 'overPourcent', 'actions','create_uid', 'create_date', 'ask_id', 'equipment_id', 'has_equipment', 'todo_tasks', 'contract_id', 'cost', 'hr_cost', 'equipment_cost', 'consumable_cost'],

		advanced_searchable_fields: [
			{ key: 'site1',         label: app.lang.place },
			{ key: 'equipment_id',  label: app.lang.equipment },
			{ key: 'service_id',    label: app.lang.service },
			{ key: 'state',         label: app.lang.status },
			{ key: 'cost',          label: app.lang.cost },
			{ key: 'create_date',   label: app.lang.createDate },
			{ key: 'date_deadline', label: app.lang.date_deadline }
		],

		specialCpt: 0,
		specialCpt2: 0,


		/** Collection Initialization
		*/
		initialize: function () {
		},


		/** Retrieve the number of Pending Intervention
		*/
		specialCount: function(){
			var self = this;

			var domain = [ { field : 'state', operator : 'in', value : [InterventionModel.status.pending.key] } ];

			return $.ajax({
				url      : this.url,
				method   : 'HEAD',
				dataType : 'text',
				data     : {filters: app.objectifyFilters(domain)},
				success  : function(data,status,request){
					var contentRange = request.getResponseHeader('Content-Range');
					self.specialCpt = contentRange.match(/\d+$/);
				}
			});
		},



		/** Retrieve the number of Planned Intervention
		*/
		specialCount2: function(){
			var self = this;

			var domain = [ { field : 'state', operator : 'in', value : [InterventionModel.status.scheduled.key] } ];

			return $.ajax({
				url      : this.url,
				method   : 'HEAD',
				dataType : 'text',
				data     : {filters: app.objectifyFilters(domain)},
				success  : function(data,status,request){
					var contentRange = request.getResponseHeader('Content-Range');
					self.specialCpt2 = contentRange.match(/\d+$/);
				}
			});
		},




		/** Collection Sync
		*/
		sync: function(method, model, options){

			options.data.fields = this.fields;

			return $.when(this.count(options), this.specialCount(), this.specialCount2(), Backbone.sync.call(this,method,this,options));
		}

	});

	return InterventionsCollection;

});