/******************************************
* Teams List View
*/
app.Views.TeamsView = Backbone.View.extend({

	el : '#rowContainer',

	templateHTML: 'teams',

	numberListByPage: 25,

	selectedTeam : '',


	// The DOM events //
	events: {
		'click li.active'				: 'preventDefault',
		'click li.disabled'				: 'preventDefault',
		'click ul.sortable li'			: 'preventDefault',

		'click a.modalDeleteTeam'  		: 'modalDeleteTeam',
		'click a.modalSaveTeam'  		: 'modalSaveTeam',

		'submit #formSaveTeam' 			: 'saveTeam',
		'click button.btnDeleteTeam'	: 'deleteTeam',

		'click a.teamName' 				: 'displayTeamInfos'
	},



	/** View Initialization
	*/
	initialize: function () {

	},


	selectTeam: function(){
		alert('ok');

	},


	/** Display the view
	*/
	render: function () {
		var self = this;

		// Change the page title //
		app.router.setPageTitle(app.lang.viewsTitles.teamsList);

		// Change the active menu item //
		app.views.headerView.selectMenuItem(app.router.mainMenus.configuration);

		// Change the Grid Mode of the view //
		app.views.headerView.switchGridMode('fluid');

		var teams = app.collections.teams.models;
		var nbTeams = _.size(teams);

		console.debug(app.collections.officers);

		var officersWithoutTeam = _.filter(app.collections.officers.models, function(item){
			return item.attributes.belongsToTeam == null; 
		});


		var len = teams.length;
		var startPos = (this.options.page - 1) * this.numberListByPage;
		var endPos = Math.min(startPos + this.numberListByPage, len);
		var pageCount = Math.ceil(len / this.numberListByPage);


		// Retrieve the template // 
		$.get("templates/" + this.templateHTML + ".html", function(templateData){
			var template = _.template(templateData, {
				teams: app.collections.teams.toJSON(),
				nbTeams: nbTeams,
				officersWithoutTeam: officersWithoutTeam,
				lang: app.lang,
				startPos: startPos, endPos: endPos,
				page: self.options.page, 
				pageCount: pageCount
			});

			$(self.el).html(template);


			$('#teamMembers, #officersList').sortable({
				connectWith: 'ul.sortableOfficersList',
				dropOnEmpty: true,
				forcePlaceholderSize: false,
				forceHelperSize: true,
				placeholder: 'sortablePlaceHold',
				containment: '.officersDroppableArea',
				cursor: 'move',
				opacity: '.8',
				revert: 300,
				receive: function(event, ui){
					self.saveServicesOfficersTeam();
				}
			});


			$('#teamServices, #servicesList').sortable({
				connectWith: 'ul.sortableServicesList',
				dropOnEmpty: true,
				forcePlaceholderSize: true,
				forceHelperSize: true,
				placeholder: 'sortablePlaceHold',
				containment: '.servicesDroppableArea',
				cursor: 'move',
				opacity: '.8',
				revert: 300,
				receive: function(event, ui){
					self.saveServicesOfficersTeam();
				}
			});


			// Fill select Foreman  //
			app.views.selectListOfficersView = new app.Views.DropdownSelectListView({el: $("#teamForeman"), collection: app.collections.officers})
			app.views.selectListOfficersView.clearAll();
			app.views.selectListOfficersView.addEmptyFirst();
			app.views.selectListOfficersView.addAll();

		});

		$(this.el).hide().fadeIn('slow');

		return this;
	},



	getIdInDropDown: function(view) {
    	if ( view && view.getSelected() )
    		var item = view.getSelected().toJSON();
    		if( item )
    			return [ item.id, item.name ];
    	else 
    		return 0
    },



	setModel: function(e) {
		e.preventDefault();
		var link = $(e.target);
		
		var id =  _(link.parents('tr').attr('id')).strRightBack('_');
		this.selectedTeam = _.filter(app.collections.teams.models, function(item){ return item.attributes.id == id });

        if( this.selectedTeam.length > 0 ) {
		
			$('table.teamsTable tr.info').removeClass('info');
			link.parents('tr').addClass('info').children('i');

			$('#teamServicesMembers').removeClass('hide');

			this.model = this.selectedTeam[0];
			this.selectedTeamJson = this.model.toJSON();

        }
        else {
			this.selectedTeamJson = null;
        }

		console.debug(this.model);
	},



    /** Modal create/update team
    */
    modalSaveTeam: function(e){
		this.setModel(e);

		$('#teamName').val('');
		app.views.selectListOfficersView.setSelectedItem(0);

		if( this.selectedTeamJson ) {
			$('#teamName').val(this.selectedTeamJson.name);
			app.views.selectListOfficersView.setSelectedItem( this.selectedTeamJson.manager_id[0] );
		}

	},



	/** Display information in the Modal view delete team
	*/
	modalDeleteTeam: function(e){
        
        // Retrieve the ID of the team //
    	this.setModel(e);

        $('#infoModalDeleteTeam p').html(this.selectedTeamJson.name);
        $('#infoModalDeleteTeam small').html(_.capitalize(app.lang.foreman) +": "+ this.selectedTeamJson.manager_id[1]);
    },



	/** Save Team
	*/
	saveTeam: function(e) {
    	e.preventDefault();

		var manager_id = this.getIdInDropDown(app.views.selectListOfficersView);
	     
		this.params = {
			name: this.$('#teamName').val(),
			manager_id: manager_id
		};
	     
	    this.params.manager_id =  manager_id[0];
	    this.modelId = this.selectedTeamJson==null?0: this.selectedTeamJson.id;

		var self = this;

	    app.Models.Team.prototype.save(
	    	this.params,
	    	this.modelId, {
			success: function(data){
				console.log(data);
				if(data.error){
					app.notify('', 'error', app.lang.errorMessages.unablePerformAction, app.lang.errorMessages.sufficientRights);
				}
				else{
					if( self.modelId==0 ){
						self.model = new app.Models.Team({id: data.result.result});
					}

					self.params.manager_id = self.getIdInDropDown(app.views.selectListOfficersView);
					
					if(self.selectedTeamJson != null){
						self.params.service_ids = self.selectedTeamJson.service_ids;
						self.params.user_ids = self.selectedTeamJson.user_ids;
					}

					self.model.update(self.params);

					app.collections.teams.add(self.model);

					$('#modalSaveTeam').modal('hide');
					app.notify('', 'info', app.lang.infoMessages.information, app.lang.infoMessages.teamSaveOk);
					self.render();
				}				
			},
			error: function(e){
				alert('Impossible de créer ou mettre à jour l\'équipe');
			}
		});
	},



	/** Save Officer and Services Team
	*/
	saveServicesOfficersTeam: function() {

		this.services = _.map($("#teamServices").sortable('toArray'), function(service){ return _(_(service).strRightBack('_')).toNumber(); });
		this.members = _.map($("#teamMembers").sortable('toArray'), function(member){ return _(_(member).strRightBack('_')).toNumber(); });
     

		this.params = {
			name: this.selectedTeamJson.name,
			manager_id: this.selectedTeamJson.manager_id[0],
			service_ids: [[6, 0, this.services]],
			user_ids: [[6, 0, this.members]]
		};

		this.modelId = this.selectedTeamJson==null?0: this.selectedTeamJson.id;

		var self = this;

		app.Models.Team.prototype.save(
			this.params,
			this.modelId, {
			success: function(data){
				console.log(data);
				if(data.error){
					app.notify('', 'error', app.lang.errorMessages.unablePerformAction, app.lang.errorMessages.sufficientRights);
				}
				else{
					if( self.modelId==0 ){
						self.model = new app.Models.Team({id: data.result.result});
					}

					self.params.service_ids = self.services;
					self.params.user_ids = self.members;
					self.params.manager_id = [self.selectedTeamJson.manager_id[0], self.selectedTeamJson.manager_id[1]];

					self.model.update(self.params);

					app.collections.teams.add(self.model);

					app.notify('', 'info', app.lang.infoMessages.information, app.lang.infoMessages.teamSaveOk);
					self.render();
				}				
			},
			error: function(e){
				alert("Impossible de créer ou mettre à jour l'équipe");
			}
		});
	},
	     


	/** Delete the selected team
	*/
	deleteTeam: function(e){
		e.preventDefault();
    	
		var self = this;
		this.model.delete({
			success: function(data){
				console.log(data);
				if(data.error){
					app.notify('', 'error', app.lang.errorMessages.unablePerformAction, app.lang.errorMessages.sufficientRights);
				}
				else{
					app.collections.teams.remove(self.model);

					$('#modalDeleteTeam').modal('hide');
					app.notify('', 'info', app.lang.infoMessages.information, app.lang.infoMessages.teamDeleteOk);
					self.render();
				}
			},
			error: function(e){
				alert("Impossible de supprimer l'équipe");
			}

		});
	},



	/** Display team members
	*/
	displayTeamInfos: function(e){
		e.preventDefault();

		this.setModel(e);

		// Retrieve the ID of the intervention //
		var link = $(e.target);
		var id = _(link.parents('tr').attr('id')).strRightBack('_');

		this.selectedTeam = _.filter(app.collections.teams.models, function(item){ return item.attributes.id == id });
		var selectedTeamJson = this.selectedTeam[0].toJSON();

		// Clear the list of the user //
		$('#teamMembers li, #teamServices li, #servicesList li').remove();

		
		// Display the members of the team //
		_.each(selectedTeamJson.user_ids, function (member, i){
			$('#teamMembers').append('<li id="officer_'+member.id+'"><a href="#"><i class="icon-user"></i> '+ member.firstname +' '+ member.name +'</a></li>');
		});


		var teamServices = new Array();
		// Display the services of the team //
		_.each(selectedTeamJson.service_ids, function (service, i){
			$('#teamServices').append('<li id="service_'+service.id+'"><a href="#"><i class="icon-sitemap"></i> '+ service.name +' </a></li>');
			teamServices[i] = service.id;
		});



		// Display the remain services //
		_.filter(app.collections.claimersServices.toJSON(), function (service, i){ 
			if(!_.contains(teamServices, service.id)){
				$('#servicesList').append('<li id="service_'+service.id+'"><a href="#"><i class="icon-sitemap"></i> '+ service.name +' </a></li>');
			}
		});

		var nbRemainServices = $('#servicesList li').length;
		$('#badgeNbServices').html(nbRemainServices);
		
	},


	preventDefault: function(event){
		event.preventDefault();
	},

});