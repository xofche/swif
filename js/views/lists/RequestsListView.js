/******************************************
* Requests List View
*/
app.Views.RequestsListView = app.Views.GenericListView.extend({

	templateHTML : 'requestsList',



	// The DOM events //
	events: function(){
		return _.defaults({
			'click #filterStateRequestList li a' 	: 'setFilterState',
			'click #badgeActions[data-filter!=""]'  : 'badgeFilter',
			'click a.createRequest'		            : 'modalCreateRequest'
		}, 
			app.Views.GenericListView.prototype.events
		);
	},



	/** View Initialization
	*/
	initialize: function () {
		var self = this;

		this.initCollection().done(function(){
			// Unbind & bind the collection //
			self.collection.off();
			self.listenTo(self.collection, 'add', self.add);
			
			app.router.render(self);
		});
	},
	


	/** When the model ara created //
	*/
	add: function(model){
		var itemRequestView = new app.Views.ItemRequestView({ model: model });
		$('#rows-items').prepend(itemRequestView.render().el);
		app.Helpers.Main.highlight($(itemRequestView.el))

		app.notify('', 'success', app.lang.infoMessages.information, model.getName()+' : '+app.lang.infoMessages.requestCreateOk);
		this.partialRender();
	},



	/** Display the view
	*/
	render: function () {
		var self = this;

		// Change the page title //
		app.router.setPageTitle(app.lang.viewsTitles.requestsList);

		// Change the active menu item //
		app.views.headerView.selectMenuItem(app.router.mainMenus.manageInterventions);


		// Retrieve the template //
		$.get("templates/" + this.templateHTML + ".html", function(templateData){

			var template = _.template(templateData, {
				lang             : app.lang,
				nbRequests       : self.collection.cpt,
				nbRequestsToDeal : self.collection.specialCpt,
				requestsState    : app.Models.Request.status,
			});

			$(self.el).html(template);

			// Call the render Generic View //
			app.Views.GenericListView.prototype.render(self.options);


			// Create item request view //
			_.each(self.collection.models, function(request, i){
				var itemRequestView = new app.Views.ItemRequestView({model: request});
				$('#rows-items').append(itemRequestView.render().el);
			});


			// Pagination view //
			app.views.paginationView = new app.Views.PaginationView({ 
				page       : self.options.page.page,
				collection : self.collection
			})

			
			// Render Filter Link on the Table //
			if(!_.isUndefined(self.options.filter)){

				$('#filterStateRequest').removeClass('filter-disabled');
				$('#filterStateRequestList li.delete-filter').removeClass('disabled');

				$('a.filter-button').addClass('text-'+app.Models.Request.status[self.options.filter.value].color);
			}
			else{
				$('#filterStateRequest').addClass('filter-disabled');
				$('#filterStateRequestList li.delete-filter').addClass('disabled');
			}

		});

		$(this.el).hide().fadeIn();

		return this;
	},



	/** Partial Render of the view
	*/
	partialRender: function() {
		var self = this;

		app.views.paginationView.render();

		this.collection.specialCount().done(function(){
			$('#badgeActions').html(self.collection.specialCpt);
			$('#bagdeCpt').html(self.collection.cpt);
		});
	},



	/** Filter Requests on the State
	*/
	setFilterState: function(e){
		e.preventDefault();

		if($(e.target).is('i')){
			var filterValue = _($(e.target).parent().attr('href')).strRightBack('#');
		}else{
			var filterValue = _($(e.target).attr('href')).strRightBack('#');
		}

		// Set the filter value in the options of the view //
		if(filterValue != 'delete-filter'){
			this.options.filter = { by: 'state', value: filterValue};
			delete this.options.page;
		}
		else{
			delete this.options.filter;
		}
		
		app.router.navigate(this.urlBuilder(), {trigger: true, replace: true});
	},



	/** Filter Requests on the State of the Badge
	*/
	badgeFilter: function(e){

		var filterValue = $(e.target).data('filter');

		// Set the filter value in the options of the view //
		if(filterValue != ''){
			this.options.filter = { by: 'state', value: filterValue};
			delete this.options.search;
			delete this.options.page;
		}

		app.router.navigate(this.urlBuilder(), {trigger: true, replace: true});
	},




	/** Modal form to create a new Request
	*/
	modalCreateRequest: function(e){
		e.preventDefault();

		console.log('Affichage de la modal ');

		app.views.modalRequestView = new app.Views.ModalRequestView({
			el : '#modalSaveRequest'
		});
	},



	initCollection: function(){
		var self = this;

		// Check if the collections is instantiate //
		if(_.isUndefined(this.collection)){ this.collection = new app.Collections.Requests(); }


		// Check the parameters //

		if(_.isUndefined(this.options.sort)){
			this.options.sort = this.collection.default_sort;
		}
		else{
			this.options.sort = app.Helpers.Main.calculPageSort(this.options.sort);	
		}

		this.options.page = app.Helpers.Main.calculPageOffset(this.options.page);

		if(!_.isUndefined(this.options.filter)){
			this.options.filter = app.Helpers.Main.calculPageFilter(this.options.filter);
		}

			
		// Create Fetch params //
		var fetchParams = {
			silent     : true,
			data       : {
				limit  : app.config.itemsPerPage,
				offset : this.options.page.offset,
				sort   : this.options.sort.by+' '+this.options.sort.order
			}
		};

		var globalSearch = {};
		if(!_.isUndefined(this.options.search)){
			globalSearch.search = this.options.search;
		}
		if(!_.isUndefined(this.options.filter)){
			globalSearch.filter = this.options.filter;
		}

		if(!_.isEmpty(globalSearch)){
			fetchParams.data.filters = app.Helpers.Main.calculSearch(globalSearch, app.Models.Request.prototype.searchable_fields);
		}


		// Fetch the collections //
		return $.when(this.collection.fetch(fetchParams))
		.fail(function(e){
			console.log(e);
		});

	}

});