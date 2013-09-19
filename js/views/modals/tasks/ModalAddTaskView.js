/******************************************
 * Intervention Details View
 */
app.Views.ModalAddTaskView = app.Views.GenericModalView.extend({

	//el : '#rowContainer',
	
	templateHTML: 'modals/tasks/modalAddTask',

	
	// The DOM events //
	events: function() {
		return _.defaults({
		'submit #formAddTask'          : 'saveTask',
		'click .linkRefueling'			: 'accordionRefuelingInputs',
		'change #taskSelectUsersTeams'	: 'fillOfficerTeam',
		'click a.linkSelectUsersTeams'	: 'changeSelectListUsersTeams',
		},
		app.Views.GenericModalView.prototype.events);
		
	},



	/** View Initialization
	 */
	initialize: function () {
	    console.log("Daily Add Task view intialization");
	    this.create = false;
	    this.modal = $(this.el);
	    if(_.isUndefined(this.model)){
			this.model = new app.Models.Task();
			this.create = true;
	    }
	    
    	this.render();    
    },


    /** Display the view
     */
    render: function () {
		
		// Change the page title depending on the create value //
		app.router.setPageTitle(app.lang.viewsTitles.newTask);

		// Change the active menu item //
		app.views.headerView.selectMenuItem(app.router.mainMenus.manageInterventions);
		
		var self = this;
		// Retrieve the template // 
		$.get("templates/" + this.templateHTML + ".html", function(templateData){
			
			var template = _.template(templateData, {lang: app.lang});
			var modelJSON = self.model.toJSON();
			
			self.modal.html(template);
			self.modal.modal('show');
			if(self.create){
				$(self.modal).find('input').prop('readonly',false);
				$(self.modal).find('button').prop('disabled',false);
			}
			else{
				$(self.modal).find('input').prop('readonly',true);
				$(self.modal).find('button').prop('disabled',true);
			}
			
			$(".datepicker").datepicker({ format: 'dd/mm/yyyy',	weekStart: 1, autoclose: true, language: 'fr' });

			$('.timepicker-default').timepicker({ showMeridian: false, disableFocus: true, showInputs: false, modalBackdrop: false});
			
			// Display only categories in dropdown belongs to intervention //
			self.advancedSelectBoxCategoriesInterventionAddTaskView = new app.Views.AdvancedSelectBoxView({el: $("#taskCategory"), collection: app.Collections.CategoriesTasks.prototype}); 

			self.advancedSelectBoxCategoriesInterventionAddTaskView.render();
			//Initialize Vehicle select2 box
			self.selectListVehicleView = new app.Views.AdvancedSelectBoxView({el:'#taskEquipmentAdd', collection:app.Collections.Equipments.prototype});
			self.selectListVehicleView.render();
		
			self.taskEquipmentAddList = new app.Views.AdvancedSelectBoxView({el:'#taskEquipmentAddList', collection:app.Collections.Equipments.prototype});
			self.taskEquipmentAddList.render();
			
			self.selectListOfficersTeamsView = new app.Views.AdvancedSelectBoxView({el:'#taskSelectUsersTeams', collection: app.Collections.Officers.prototype});
			self.selectListOfficersTeamsView.render();
			
			self.initSearchParams();
			
			var mStartDate = moment();
			var mEndDate = moment();
			if(self.create){
				//init datetimes values with user timezone
				$("#startDate").val( mStartDate.format('L') );
		    	$("#endDate").val( mEndDate.format('L') );
				var tempStartDate = moment( mStartDate );
				tempStartDate.hours(8);
				tempStartDate.minutes(0);
				$("#startHour").timepicker( 'setTime', tempStartDate.format('LT') );
				var tempEndDate = moment( mEndDate );
				tempEndDate.hours(18);
				tempEndDate.minutes(0);
				$("#endHour").timepicker('setTime', tempEndDate.format('LT') );
			}
			else{

				
				$('#taskName').val(modelJSON.name);
				//init datetimes values with user timezone
				var mStartDate = moment.utc(modelJSON.date_start).tz(app.models.user.getContext().tz);
				var mEndDate = moment.utc(modelJSON.date_end).tz(app.models.user.getContext().tz);
			
				$("#startDate").val( mStartDate.format('L') );
		    	$("#endDate").val( mEndDate.format('L') );
		    	$("#startHour").timepicker( 'setTime', mStartDate.format('LT') );
		    	$("#endHour").timepicker('setTime', mEndDate.format('LT') );

		    	//init AdvancedSelectBox values
		    	self.advancedSelectBoxCategoriesInterventionAddTaskView.setSelectedItem(modelJSON.category_id);
		    	//equipments and vehicle values need to be retrieved separately
		    	if(modelJSON.equipment_ids.length>0){
			    	var vehicle = new app.Collections.Equipments();
			    	var filter_ids = {field:'id', operator:'in', value:modelJSON.equipment_ids};
			    	var filter_type = {field:'categ_id.is_vehicle', operator:'=', value:'True'};
					var equipment_names = modelJSON.equipment_names.slice();

					//get vehicle, if present, in equipment_ids (first equipment described as vehicle)
					vehicle.fetch({data:{filters:{0:filter_ids,1:filter_type}}}).done(function(){
						if(vehicle.models.length>0){
							var vehicle_id = vehicle.models[0].get('id');
							var vehicle_names = null;
							_.each(equipment_names, function(item,i){
								if(item[0] == vehicle_id){
									//DEBUG
									if(vehicle_names != null){
										console.log('Error: There is more than one vehicle linked to the task');
									}
									vehicle_names = equipment_names.splice(i,1)[0];
								}
							});
				    		self.selectListVehicleView.setSelectedItem(vehicle_names);
						}
						_.each(equipment_names, function(item,i){
							equipment_names[i] = {id:item[0],name: item[1]};
						});
			    		self.taskEquipmentAddList.setSelectedItems(equipment_names);
			    	})
			    	.fail(function(e){
			    		console.log(e);
			    	});
		    	}
				var itemToLoad = modelJSON.team_id != false ? 'teams' : 'officers';
				self.updateSelectListUsersTeams(itemToLoad);
				if(modelJSON.team_id != false){
			    	self.selectListOfficersTeamsView.setSelectedItem(modelJSON.team_id);
			    	self.changeOfficerTeam(modelJSON.team_id[0]);
		    	}
		    	else{
		    		self.selectListOfficersTeamsView.setSelectedItem(modelJSON.user_id);
		    		self.changeOfficerTeam(modelJSON.user_id[0]);
		    	}
		    	
			}
		});
 
		return this;
    },

	/** Save the Task
	*/
	saveTask: function(e){

		var self = this;

		e.preventDefault();
		
		var mNewDateStart =  new moment( $("#startDate").val(),"DD-MM-YYYY")
								.add('hours',$("#startHour").val().split(":")[0] )
								.add('minutes',$("#startHour").val().split(":")[1] );
		var mNewDateEnd =  new moment( $("#endDate").val(),"DD-MM-YYYY")
								.add('hours',$("#endHour").val().split(":")[0] )
								.add('minutes',$("#endHour").val().split(":")[1] );
		var planned_hours = mNewDateEnd.diff(mNewDateStart, 'hours', true);
	
	    var vehicle =  self.selectListVehicleView.getSelectedItem();
		var equipments = self.taskEquipmentAddList.getSelectedItems(); 
	    
	    if(vehicle && vehicle >0 ){
	    	equipments.push( vehicle );
	    }
	    equipments = [[6,0,equipments]];
	    
		var params = {
			date_start: mNewDateStart.toDate(),
			date_end: mNewDateEnd.toDate(),
			state: app.Models.Task.status.done.key,
			vehicule: vehicle,
			equipment_ids: equipments,
			name: this.$('#taskName').val(),
			km: this.$('#equipmentKmAdd').val(),
			oil_qtity: this.$('#equipmentOilQtityAdd').val().replace(',', '.'),
			oil_price: this.$('#equipmentOilPriceAdd').val().replace(',', '.'),
			category_id: self.advancedSelectBoxCategoriesInterventionAddTaskView.getSelectedItem(),	         
			planned_hours: planned_hours,
			remaining_hours: 0,
		    report_hours: planned_hours,
		};

	    if($('#taskSelectUsersTeams').data('item') == 'teams'){
	    	params.user_id = false;
	    	params.team_id = this.selectListOfficersTeamsView.getSelectedItem();
	    }
	    else{
	    	params.user_id = this.selectListOfficersTeamsView.getSelectedItem();
	    	params.team_id = false;
	    }
		
		var task_model = new app.Models.Task(params);
	
		task_model.save().done(function(data) {
			// add task to collection
			task_model.setId(data);
			task_model.fetch({silent : true}).done(function() {
				self.options.tasks.add(task_model);
				self.modal.modal('hide');
			}).fail(function(e) {
				console.log(e)
			})
		}).fail(function(e) {
			console.log(e)
		})
	},
	
	initSearchParams: function(){
		this.selectListVehicleView.setSearchParam({field:'categ_id.is_vehicle',operator:'=',value:'True'},true);
		this.selectListVehicleView.setSearchParam({field:'internal_use',operator:'=',value:'True'});
		
		this.taskEquipmentAddList.setSearchParam({field:'categ_id.is_equipment', operator:'=', value:'True'}, true);
		this.taskEquipmentAddList.setSearchParam({field:'internal_use',operator:'=',value:'True'});
	},
	
	/**
	 * Update filters on equipments and taskCategories according to officer / team selected
	 */
	changeOfficerTeam: function(value){
		var self = this;
		this.initSearchParams();
		if(value){
			var item = $('#taskSelectUsersTeams').data('item');
			var model = null;
			if(item == 'teams'){
				model = new app.Models.Team();
			}
			else{
				model = new app.Models.Officer();
			}
			model.set('id',value);
			model.fetch().done(function(){
				//base filter for equipments
				var filterEquipment = {field: 'service_ids', operator:'=?', value:'False'};
				if(model.get('service_ids').length>0){
					var filter = {field: 'service_ids.id', operator:'in', value:model.get('service_ids')};
					self.selectListVehicleView.setSearchParam('|');
					self.selectListVehicleView.setSearchParam(filter);

					self.taskEquipmentAddList.setSearchParam('|');
					self.taskEquipmentAddList.setSearchParam(filter);

					self.advancedSelectBoxCategoriesInterventionAddTaskView.setSearchParam(filter,true);
				}
				self.selectListVehicleView.setSearchParam(filterEquipment);
				self.taskEquipmentAddList.setSearchParam(filterEquipment);

			});
		}
	},
	
	fillOfficerTeam: function(e){
		this.changeOfficerTeam(this.selectListOfficersTeamsView.getSelectedItem());
	},
	
	updateSelectListUsersTeams: function(itemToLoad){
		if(itemToLoad == 'officers'){
			$('#btnSelectUsersTeams > i.iconItem.icon-group').addClass('icon-user').removeClass('icon-group');
			$('#taskSelectUsersTeams').data('item', 'officers');
			$('#taskSelectUsersTeams').attr('data-placeholder', app.lang.actions.selectAAgentShort);
			
			this.selectListOfficersTeamsView.collection = app.Collections.Officers.prototype;
			this.selectListOfficersTeamsView.reset();
			this.selectListOfficersTeamsView.render();
		}
		else if(itemToLoad == 'teams'){
			$('#btnSelectUsersTeams > i.iconItem.icon-user').addClass('icon-group').removeClass('icon-user');
			$('#taskSelectUsersTeams').data('item', 'teams');
			$('#taskSelectUsersTeams').attr('data-placeholder', app.lang.actions.selectATeamShort);

			this.selectListOfficersTeamsView.collection = app.Collections.Teams.prototype;
			this.selectListOfficersTeamsView.reset();
			this.selectListOfficersTeamsView.render();
		}
	},
	
	/** Update the <select> list of Users or Teams in the Modal Task Done
	*/
	changeSelectListUsersTeams: function(e){
		e.preventDefault();
		var link = $(e.target);

		// Retrieve the item to refresh - Users or Teams //
		if(link.is('a')){ var itemToLoad = link.data('item'); }
		else{ var itemToLoad = link.parent('a').data('item'); }
		
		this.updateSelectListUsersTeams(itemToLoad);
	},
	
	
	/** Display or Hide Refueling Section (Inputs Km, Oil, Oil prize)
	*/
	accordionRefuelingInputs: function(e){
		e.preventDefault();

		// Toggle Slide Refueling section //
		$('.refueling-vehicle').stop().slideToggle();
	},
});