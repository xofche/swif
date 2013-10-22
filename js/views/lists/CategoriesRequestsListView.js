/******************************************
* Categories Requests List View
*/
app.Views.CategoriesRequestsListView = app.Views.GenericListView.extend({
	
	templateHTML: 'categoriesRequestsList',
	

	// The DOM events //
	events: function(){
		return _.defaults({
			'click a.modalCreateCat' : 'modalCreateCat',
		}, 
			app.Views.GenericListView.prototype.events
		);
	},

	

	/** View Initialization
	*/
	initialize: function (params) {
		this.options = params;

		var self = this;

		this.initCollection().done(function(){

			// Unbind & bind the collection //
			self.collection.off();
			self.listenTo(self.collection, 'add', self.add);

			app.router.render(self);
		})
	},



    /** When the model ara created //
	*/
	add: function(model){

		var itemCategoryRequestView  = new app.Views.ItemCategoryRequestView({ model: model });
		$('#rows-items').prepend(itemCategoryRequestView.render().el);
		app.Helpers.Main.highlight($(itemCategoryRequestView.el));

		app.notify('', 'success', app.lang.infoMessages.information, model.getName()+' : '+app.lang.infoMessages.catCreateOk);
		this.partialRender();
	},



	/** Display the view
	*/
    render: function () {
		var self = this;

		// Change the page title //
		app.router.setPageTitle(app.lang.viewsTitles.categoriesIntersList);

		// Change the active menu item //
		app.views.headerView.selectMenuItem(app.router.mainMenus.configuration);


		
		// Retrieve the template // 
		$.get("templates/" + this.templateHTML + ".html", function(templateData){
			var template = _.template(templateData, {
				lang   : app.lang,
				nbCats : self.collection.cpt
			});

			$(self.el).html(template);

			// Call the render Generic View //
			app.Views.GenericListView.prototype.render(self.options);


			// Create item category request view //
			_.each(self.collection.models, function(catRequest, i){
				var itemCategoryRequestView  = new app.Views.ItemCategoryRequestView({model: catRequest});
				$('#rows-items').append(itemCategoryRequestView.render().el);
			});


			// Pagination view //
			app.views.paginationView = new app.Views.PaginationView({ 
				page       : self.options.page.page,
				collection : self.collection
			})
			app.views.paginationView.render();
			
		});

		$(this.el).hide().fadeIn('slow');
		
        return this;
    },



    /** Partial Render of the view
	*/
	partialRender: function (type) {
		var self = this; 

		this.collection.count(this.fetchParams).done(function(){
			$('#bagdeNbCats').html(self.collection.cpt);
			app.views.paginationView.render();
		});
	},



	/** Modal form to create a new Cat
	*/
	modalCreateCat: function(e){
		e.preventDefault();
		
		app.views.modalCategoryRequestView = new app.Views.ModalCategoryRequestView({
			el  : '#modalSaveCat'
		});
	},



	/** Collection Initialisation
	*/
    initCollection: function(){
		var self = this;

		// Check if the collections is instantiate //
		if(_.isUndefined(this.collection)){ this.collection = new app.Collections.CategoriesRequests(); }


		// Check the parameters //
		if(_.isUndefined(this.options.sort)){
			this.options.sort = this.collection.default_sort;
		}
		else{
			this.options.sort = app.Helpers.Main.calculPageSort(this.options.sort);	
		}
		this.options.page = app.Helpers.Main.calculPageOffset(this.options.page);


		// Create Fetch params //
		this.fetchParams = {
			silent : true,
			data   : {
				limit  : app.config.itemsPerPage,
				offset : this.options.page.offset,
				sort   : this.options.sort.by+' '+this.options.sort.order
			}
		};
		if(!_.isUndefined(this.options.search)){
			this.fetchParams.data.filters = app.Helpers.Main.calculSearch({search: this.options.search }, app.Models.CategoryRequest.prototype.searchable_fields);
		}


		return $.when(self.collection.fetch(this.fetchParams))
			.fail(function(e){
				console.log(e);
			})

	}

});