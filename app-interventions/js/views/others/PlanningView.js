define([
	'app',
	'appHelpers',

	'interventionsCollection',
	'tasksCollection',
	
	'interventionModel',

	'calendarView',
	'planningInterListView'

], function(app, AppHelpers, InterventionsCollection, TasksCollection, InterventionModel, CalendarView, PlanningInterListView ){

	'use strict';

	/******************************************
	* Planning View
	*/
	var planningView = Backbone.View.extend({
	
	
		el : '#rowContainer',
	
		templateHTML: 'others/planning',
	
		filters: 'interventionsListFilter',
	
		
		
		selectedInter : '',
		selectedTask  : '',
	
		sstoragePlanningSelected: 'selectedPlanning',
		
		// The DOM events //
		events: {		
	
		},
	
	
	
		/** View Initialization
		*/
		initialize : function(params) {
			var self = this;
	
			this.options = params;
	
			//By default display open intervention (intervention to schedule)
			this.options.filter = 'state-open';
			
		    this.initCollections().done(function(){	    	
		    	app.router.render(self);		
		    });
		},
	
	
	
		/** Display the view
		*/
		render : function() {
			var self = this;
	
	
			// Change the page title //
			app.router.setPageTitle(app.lang.viewsTitles.planning);
	
	
			// Retrieve the Login template // 
			$.get(app.moduleUrl+"/templates/" + this.templateHTML + ".html", function(templateData){
	
	
				// Change the page title //
				app.router.setPageTitle(app.lang.viewsTitles.planning);
	
				
				var options = self.options
				self.collections.officers = app.models.user.getOfficers();
				self.collections.teams = app.models.user.getTeams();
				options.collections = self.collections;
	
				// Set variables template //
				var template = _.template(templateData, {
					lang: app.lang,			
				});
	
				$(self.el).html(template);
				//calendar panel
				$('#calendar').append( new CalendarView(self.options).render().el );	
				//interventions left panel			
				app.views.planningInterListView = new PlanningInterListView(self.options)
	
	
			});
			$(this.el).hide().fadeIn('slow');
			return this;
		},
	
	
	
		/** Partial Render of the view
		*/
		partialRender: function () {
			var self = this;
			this.initCollections().done(function(){
				app.views.planningInterListView.render();
			});
		},
	
		/**
		 * Init intervention and task collections
		 */
		initCollections: function(){
			var self = this;
			
			// Check if the collections is instantiate //
			if(_.isUndefined(this.collections)){this.collections = {}}
			if(_.isUndefined(this.collections.interventions)){this.collections.interventions = new InterventionsCollection();}
			if(_.isUndefined(this.collections.tasks)){ this.collections.tasks = new TasksCollection(); }
	
	
			// Check the parameters //
			if(_.isUndefined(this.options.sort)){
				this.options.sort = this.collections.interventions.default_sort;
			}
			else{
				this.options.sort = AppHelpers.calculPageSort(this.options.sort);	
			}
			this.options.page = AppHelpers.calculPageOffset(this.options.page);
	
			if(!_.isUndefined(this.options.filter)){
				this.options.filter = AppHelpers.calculPageFilter(this.options.filter);
			}
	
			// Create Fetch params //
			this.fetchParams = {
				silent : true,
				data   : {
					limit  : app.config.itemsPerPage,
					offset : this.options.page.offset,
					sort   : this.options.sort.by+' '+this.options.sort.order
				}
			};
	
			var globalSearch = {};
			if(!_.isUndefined(this.options.search)){
				globalSearch.search = this.options.search;
			}
			if( !_.isUndefined(this.options.filter) ){
				globalSearch.filter = this.options.filter;
			}
	
			if(!_.isEmpty(globalSearch)){
				this.fetchParams.data.filters = AppHelpers.calculSearch(globalSearch, InterventionModel.prototype.searchable_fields);
			}
			
			return this.fetchCollections();
		
		},
	
	
	
		/**
		* Fetch collections
		*/
		fetchCollections : function(){
			var self = this;
			//Fetch officers, teams, and interventions collections
			return $.when(
				app.models.user.queryManagableOfficers(), 
				app.models.user.queryManagableTeams(),
				this.collections.interventions.fetch(this.fetchParams)
			)
			.fail(function(e){
				console.error(e);
			})
		}
	
	});
	
			
	return planningView;

});