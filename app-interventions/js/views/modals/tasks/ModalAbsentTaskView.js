define([
	'app',
	'appHelpers',

	'genericModalView',
	'advancedSelectBoxView',

	'absentTypesCollection',	
	
	'taskModel',


], function(app, AppHelpers, GenericModalView, AdvancedSelectBoxView, AbsentTypesCollection, TaskModel){


	'use strict';
		
	
	
	/******************************************
	* Absent Type Modal View
	*/
	var modalAbsentTaskView = GenericModalView.extend({
	
	
		templateHTML : '/templates/modals/tasks/modalAbsentTask.html',
	
	
	
		// The DOM events //
		events: function(){
			return _.defaults({
				'click #btnAddAbsentTask'     : 'saveAbsentTask'
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
					lang      : app.lang,
				});
	
				self.modal.html(template);	
				self.modal.modal('show');
		        
				var startDate = self.options.startDate;
				var endDate = self.options.endDate;
				
				var mStartDate = moment( startDate );
				var mEndDate = moment( endDate );
				
	        	$('.timepicker-default').timepicker({ showMeridian: false, disableFocus: true, showInputs: false, modalBackdrop: false});
	        	$('.datepicker').datepicker({ format: 'dd/mm/yyyy', weekStart: 1, autoclose: true, language: 'fr'});
	
	        	// Display only categories in dropdown belongs to intervention //
				self.advancedSelectBoxAbsentTypesView = new AdvancedSelectBoxView({el: $("#absentType"), collection: AbsentTypesCollection.prototype}); 
				self.advancedSelectBoxAbsentTypesView.render();
	
	        	$("#startDate").val( moment( startDate ).format('L') );
	        	$("#endDate").val( moment( endDate ).format('L') );
	        	if( self.options.allDay ) {
	        		var tempStartDate = moment( mStartDate );
	        		tempStartDate.add('hours', (app.config.endWorkTime - app.config.startWorkTime))
		    		$("#startHour").timepicker( 'setTime', tempStartDate.format('LT') );
	        		var tempEndDate = moment( mEndDate );
	        		tempEndDate.add('hours',app.config.endWorkTime)
		    		$("#endHour").timepicker('setTime', tempEndDate.format('LT') );
	        	}
	        	else {
		    		$("#startHour").timepicker( 'setTime', mStartDate.format('LT') );
		    		$("#endHour").timepicker('setTime', mEndDate.format('LT') );
	        	}
	        	
	        	// Set Modal informations 
	        	var icon = self.options.teamMode?'users':'user' 
	        	$('#infoModalAbsentTask p').html("<i class='fa fa-" + icon +"'></i> " + self.model.name );
	    		$('#infoModalAbsentTask small').html("Du " + mStartDate.format('LLL') + " au " + mEndDate.format('LLL') );
	
				
			});
	
			return this;
		},
	
	
	
		/** Delete the model pass in the view
		*/
		saveAbsentTask: function(e){
			e.preventDefault();
			var self = this;
			
			// Set the button in loading State //
			$(e.target).button('loading');
			
			var mNewDateStart =  new moment( $("#startDate").val(),"DD-MM-YYYY")
									.add('hours',$("#startHour").val().split(":")[0] )
									.add('minutes',$("#startHour").val().split(":")[1] );
			var mNewDateEnd =  new moment( $("#endDate").val(),"DD-MM-YYYY")
									.add('hours',$("#endHour").val().split(":")[0] )
									.add('minutes',$("#endHour").val().split(":")[1] );
			var planned_hours = mNewDateEnd.diff(mNewDateStart, 'hours', true);
			
			params = {
				name: self.advancedSelectBoxAbsentTypesView.getSelectedText(),
			    absent_type_id: self.advancedSelectBoxAbsentTypesView.getSelectedItem(),
			    state: 'absent',
			    date_start: mNewDateStart.toDate(),
			    date_end: mNewDateEnd.toDate(),
			    planned_hours: planned_hours,
			    effective_hours: planned_hours,
			    hours: planned_hours,
			    remaining_hours: 0,
			    team_id: self.options.teamMode?self.model.id:0,
			    user_id: !self.options.teamMode?self.model.id:0,
			};
			
			this.model = new TaskModel();
	
			this.model.save(params, {patch: false, silent: true})
				.done(function(data) {				
					self.model.fetch({ data : {fields : self.model.fields} })
						.done(function(data) {
							self.modal.modal('hide');				
							self.options.collection.add(self.model);
						})
						.always(function () {
							// Reset the button state //
							$(e.target).button('reset');
						});
				})
				.fail(function (e) {
					console.log(e);
				})
	
		},
	
	});
	
		
	return modalAbsentTaskView;

});