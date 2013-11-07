/******************************************
 * Service Details View
 */
app.Views.ServiceView = Backbone.View.extend({

		el : '#rowContainer',
		
		templateHTML: 'serviceDetails',

		
		// The DOM events //
		events: {
			'submit #formService'		: 'saveService',
		},



		/** View Initialization
		 */
		initialize: function (model, create) {
			this.model = model;
			this.create = create;
	    },



	    /** Display the view
	     */
	    render: function () {
			
		console.log(this.model);
			// Change the page title depending on the create value //
			if(this.create){
				app.router.setPageTitle(app.lang.viewsTitles.newService);
			}
			else{
				app.router.setPageTitle(app.lang.viewsTitles.serviceDetail + 'n° ' + this.model.id);
			}

			// Change the active menu item //
			app.views.headerView.selectMenuItem(app.router.mainMenus.configuration);
			
			

			var self = this;
			// Retrieve the template // 
			$.get("templates/" + this.templateHTML + ".html", function(templateData){

				var template = _.template(templateData, {lang: app.lang, service: self.model.toJSON()});
				$(self.el).html(template);  
				

					app.views.selectListServicesView = new app.Views.DropdownSelectListView({el: $("#serviceParentService"), collection: app.collections.claimersServices})
					app.views.selectListServicesView.clearAll();
					app.views.selectListServicesView.addEmptyFirst();
					app.views.selectListServicesView.addAll();
					
					this.selectedServiceJson = self.model.toJSON();
					if( this.selectedServiceJson ) {
						$('#serviceName').val(this.selectedServiceJson.name);
						$('#serviceCode').val(this.selectedServiceJson.code);

						if( this.selectedServiceJson.service_id )
							app.views.selectListServicesView.setSelectedItem( this.selectedServiceJson.service_id[0] );	
						if( this.selectedServiceJson.technical )
							$('#serviceIsTechnical').prop('checked', true);
					}
					else {
						$('#serviceName; #serviceCode').val('');
						$('#serviceIsTechnical').prop('checked', false);	
					}
		
			});
	
			$(this.el).hide().fadeIn('slow'); 
			return this;
	    },
	    


		getIdInDopDown: function(view) {
			if ( view && view.getSelected() )
				return view.getSelected().toJSON().id;
			else 
				return 0
		},



		/** Save the service
		*/
	    saveService: function (e) {
			e.preventDefault();

			var input_service_id = this.getIdInDopDown(app.views.selectListServicesView);

			var params = {	
				name       : this.$('#serviceName').val(),
				code       : this.$('#serviceCode').val(),
				service_id : input_service_id,
				technical  : this.$('#serviceIsTechnical').is(':checked'),
		     };		     
		   
		    this.model.save(params,{
				success: function(data){
					console.log(data);
					if(data.error){
						app.notify('', 'error', app.lang.errorMessages.unablePerformAction, app.lang.errorMessages.sufficientRights);
					}
					else{
						app.router.navigate(app.routes.services.baseUrl, true);
						console.log('Success SAVE SERVICE');
					}
				},
				error: function () {
					console.error('ERROR - Unable to save the Service');
				},
			});
	    },
});

