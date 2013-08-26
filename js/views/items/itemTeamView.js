/******************************************
* Row Team View
*/
app.Views.ItemTeamView = Backbone.View.extend({

	tagName      : 'tr',

	className    : function(){

		if(this.model.getId() == app.views.teamsListView.options.id) {
			return 'info bolder row-item selectable';
		}
		else{
			return 'row-item selectable';
		}

	},

	templateHTML : 'items/itemTeam',


	// The DOM events //
	events: {
		'click'                    : 'selectTeam',
		'click a.modalDeleteTeam'  : 'modalDeleteTeam',
		'click a.modalUpdateTeam'  : 'modalUpdateTeam'
	},



	/** View Initialization
	*/
	initialize : function() {
		this.model.off();

		// When the model are updated //
		this.listenTo(this.model, 'change', this.change);

		// When the model are destroy //
		this.listenTo(this.model,'destroy', this.destroy);
	},



	/** When the model is updated //
	*/
	change: function(e){

		this.render();
		this.highlight();
		app.notify('', 'success', app.lang.infoMessages.information, this.model.getName()+' : '+app.lang.infoMessages.teamUpdateOk);

		app.views.teamsListView.displayTeamMembersAndServices(this.model);
		this.setSelected();
	},



	/** When the model is destroy //
	*/
	destroy: function(e){
		var self = this;

		this.highlight().done(function(){
			self.remove();
			app.views.teamsListView.partialRender();
		});

		app.notify('', 'success', app.lang.infoMessages.information, e.getName()+' : '+app.lang.infoMessages.teamDeleteOk);
		
		
		if(!_.isUndefined(app.views.teamMembersAndServices)){
			if(_.isEqual(this.model, app.views.teamMembersAndServices.model)){
				app.views.teamMembersAndServices.hide();
			}
		}
		delete app.views.teamsListView.options.id;
		app.router.navigate(app.views.teamsListView.urlBuilder(), {trigger: false, replace: false});
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

			// Set the Tooltip //
			$('*[data-toggle="tooltip"]').tooltip();
		});

		return this;
	},



	/** Display Modal form to add/sav a new place
	*/
	modalUpdateTeam: function(e){  
		e.preventDefault(); e.stopPropagation();

		app.views.modalTeamView = new app.Views.ModalTeamView({
			el      : '#modalSaveTeam',
			model   : this.model,
		});
	},



	/** Modal to remove a place
	*/
	modalDeleteTeam: function(e){
		e.preventDefault(); e.stopPropagation();

		app.views.modalDeleteView = new app.Views.ModalDeleteView({
			el           : '#modalDeleteTeam',
			model        : this.model,
			modalTitle   : app.lang.viewsTitles.deleteTeam,
			modalConfirm : app.lang.warningMessages.confirmDeleteTeam
		});
	},



	/** Select a team
	*/
	selectTeam: function(e){
		e.preventDefault();

		// Set the new route //
		app.views.teamsListView.options.id = this.model.getId();
		app.router.navigate(app.views.teamsListView.urlBuilder(), {trigger: false, replace: false});

		this.setSelected();

		app.views.teamsListView.displayTeamMembersAndServices(this.model);
	},



	/** Highlight the row item
	*/
	highlight: function(){
		var self = this;

		$(this.el).addClass('highlight');

		var deferred = $.Deferred();

		// Once the CSS3 animation are end the class are removed //
		$(this.el).one('webkitAnimationEnd oanimationend msAnimationEnd animationend',   
			function(e) {
			$(self.el).removeClass('highlight');
			deferred.resolve();
		});

		return deferred;
	},


	/** Set the row as selected
	*/
	setSelected: function(){
		$('tr.row-item.info').removeClass('info bolder');
		$(this.el).addClass('info bolder');
	}


});