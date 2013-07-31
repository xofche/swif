/******************************************
* Planning View
*/
app.Views.PlanningView = Backbone.View.extend({


	el : '#rowContainer',

	templateHTML: 'planning',

	filters: 'interventionsListFilter',

	
	
	selectedInter : '',
	selectedTask : '',

	sstoragePlanningSelected: 'selectedPlanning',
	
	// The DOM events //
	events: {

		'click #listAgents li a, #listTeams li a' :          'selectPlanning',
	},


	/** View Initialization
	*/
	initialize : function() {
	},


	/** Display the view
	*/
	render : function() {
		var self = this;
		

		// Retrieve the Login template // 
		$.get("templates/" + this.templateHTML + ".html", function(templateData){


			// Change the page title //
			app.router.setPageTitle(app.lang.viewsTitles.planning);
			// Change the Grid Mode of the view //
			app.views.headerView.switchGridMode('fluid');
			
			// Set variables template //
			var template = _.template(templateData, {
				lang: app.lang,
				officers: app.models.user.getOfficers(),
				teams: app.models.user.getTeams(),				
			});

			$(self.el).html(template);

			// If a plannig was Selected //
			if(sessionStorage.getItem(self.sstoragePlanningSelected) != null){
				
				// Get the planning ID //
				var id = sessionStorage.getItem(self.sstoragePlanningSelected);

				// Simule a click to the link //
				$('#'+id).click();

				// Check if a Team was selected to select the Team Tab //
				if(_.str.include(id, 'Team')){
					$('#allTabs a[data-target="#tab-teams"]').tab('show');
				}

				// Navigate to the link //
				window.location.href = $('#'+id).attr('href');
			}else{
				self.currentObject = app.models.user.getOfficers()[0];
				$('#pOfficer_'+self.currentObject.id).click();
				window.location.href = $('#pOfficer_'+self.currentObject.id).attr('href');
			}


			// Display filter on the table //
			if(sessionStorage.getItem(self.filters) != null){
				$('a.filter-button').removeClass('filter-disabled').addClass('filter-active');
				$('li.delete-filter').removeClass('disabled');
				if(sessionStorage.getItem(self.filters) != 'notFilter'){
					$('a.filter-button').addClass('text-'+app.Models.Intervention.status[sessionStorage.getItem(self.filters)].color);
				}
			}
			else{
				$('a.filter-button').removeClass('filter-active ^text').addClass('filter-disabled');
				$('li.delete-filter').addClass('disabled');
			}
			
			//Initialize inter panel view
			app.views.planningInterPanelView = new app.Views.PlanningInterPanelView().render()
				
			app.loader('hide');
		});
	   
		return this;
	},

	/** Select the planning to display
	*/
	selectPlanning: function(e){
		
		var link = $(e.target);

		// Save the selected planning in the Session storage //

		var linkId = link.attr('id')
		sessionStorage.setItem(this.sstoragePlanningSelected, linkId);
		
		//Calculates calendar selected (team or officer)
		teamMode = _.str.include( _(linkId).strLeft('_').toLowerCase(),"officer" )?false:true;	
		calendarId = _(_(linkId).strRight('_')).toNumber();		

		$('#listAgents li.active, #listTeams li.active').removeClass('active');
		link.parent('li').addClass('active');
		
		//Initialize calendar view
		app.views.eventsListView = new app.Views.EventsListView({
			planning : this,
			el: $("#calendar"), 
			calendarId : calendarId,
			teamMode : teamMode,
		})
	},

	/** Partial Render of the view
		*/
	partialRender: function (type) {
		app.views.planningInterPanelView.render();
	},

});

