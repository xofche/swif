
define(['app', 
        'appHelpers', 
        
        'bookingRecurrenceModel',
        
        'itemFormBookingOccurrenceView',
        
        'moment',
        'moment-timezone',
        'moment-timezone-data',
        'bsTimepicker',
        'bsDatepicker'

], function (app, AppHelpers, BookingRecurrenceModel, ItemFormBookingOccurrenceView, moment) {

    'use strict';
	/******************************************
	* Requests Details View
	*/
	var FormRecurrenceView = Backbone.View.extend({
	
	
		templateHTML : 'forms/form_recurrence',
		tagName: 'div',
		className: 'recurrence-item',
	
	
		// The DOM events //
		events: {
		
			//Recurrence setting events
			'change input[name="periodicity"]'	: 'changePeriodicity',
			'change #recur_length_count'		: 'changeCount',
			'change #recur_length_until'		: 'changeUntil',
			'change input[name="recur_type_length"]': 'changeLengthType',			
			
			'change input[name="weekdays"]'		: 'changeWeekdays',
			'change #recur_daily_weight'		: 'changeDailyWeight',
			'change #recur_weekly_weight'		: 'changeWeeklyWeight',
			'change #recur_monthly_weight'		: 'changeMonthlyWeight',
			
			'change input[name="type_monthly"]'	: 'changeTypeMonthly',
			'change #recur_monthly_monthday'	: 'changeMonthday',
			'change #recur_monthly_relative_position': 'changeRelativePosition',
			'change #recur_monthly_weekday'		: 'changeMonthWeekday',
			
			//Form Buttons
			'click #getRecurrenceDates'			: 'getRecurrenceDates'
		},
	
		/** View Initialization
		*/
		initialize : function() {
			var self = this;
			this.deferredOccurrences = $.Deferred();
			this.listenTo(this.model.occurrences, 'add', this.addOccurrence);
			if(!this.model.isNew()){
				self.deferredOccurrences = this.model.fetchOccurrences();
			}
			else{
				self.deferredOccurrences.resolve();
			}
		},
		
		addOccurrence: function(model){
			var itemView = new ItemFormBookingOccurrenceView({model:model});
			$(this.el).find('#bookingOccurrences').append(itemView.render().el);
		},
		
		/** Display the view
		*/
		render: function(loader) {
	
			var self = this;
			// Retrieve the template //
			$.get(app.moduleUrl + "/templates/" + self.templateHTML + ".html", function(templateData){			
				
				var date_end = self.model.getUntil();
				if(date_end != ''){
					date_end = moment.utc(date_end).local().format('DD/MM/YYYY');
				}
				var template = _.template(templateData, {
					lang   		: app.lang,
					recurrence  : self.model,
					weekdays	: self.model.getWeekdays(),
					date_end	: date_end
				});
	
				$(self.el).html(template);
	
				$('.timepicker-default').timepicker({ showMeridian: false, disableFocus: true, showInputs: false, modalBackdrop: false});
				$(".datepicker").datepicker({ format: 'dd/mm/yyyy',	weekStart: 1, autoclose: true, language: 'fr' });

				$(this.el).hide().fadeIn('slow');
			});
			return this;
	    },
	    
	    //update type of recurrence (daily, weekly, ...) and map correct value of 'weight'
	    changePeriodicity: function(e){
	    	var type = $('input[name="periodicity"]:checked').val();
	    	this.model.set({recur_type:type});
	    	switch(type){
	    	case 'daily':
	    		this.model.setDailyWeight($('#recur_daily_weight').val());
	    	break;
	    	case 'weekly':
	    		this.model.setWeeklyWeight($('#recur_weekly_weight').val());
	    	break;
	    	case 'monthly':
	    		this.model.setMonthlyWeight($('#recur_monthly_weight').val());
	    	break;
	    	}
	    },
	    
	    changeLengthType: function(e){
	    	var val = $('input[name="recur_type_length"]:checked').val();
	    	if(val != ''){
	    		this.model.set({recur_length_type:val});
	    	}
	    },
	    
	    changeCount: function(e){
	    	var val = $('#recur_length_count').val();
	    	val = val != '' ? parseInt(val) : 0;
	    	this.model.setCount(val);
	    },
	    
	    changeUntil: function(e){
	    	this.model.setUntil($('#recur_length_until').val());
	    },
	    
	    changeDailyWeight: function(e){
	    	var val = $('#recur_daily_weight').val();
	    	val = val != '' ? parseInt(val) : 0;
	    	this.model.setDailyWeight(val);
	    },
	    
	    changeWeeklyWeight: function(e){
	    	var val = $('#recur_weekly_weight').val();
	    	val = val != '' ? parseInt(val) : 0;
	    	this.model.setWeeklyWeight(val);
	    },
	    
	    changeMonthlyWeight: function(e){
	    	var val = $('#recur_monthly_weight').val();
	    	val = val != '' ? parseInt(val) : 0;
	    	this.model.setMonthlyWeight(val);
	    },
	    
	    changeMonthday : function(e){
	    	var val = $('#recur_monthly_monthday').val();
	    	val = val != '' ? parseInt(val) : 0;
	    	this.model.setMonthday(val);
	    },
	    
	    changeRelativePosition: function(e){
	    	var val = $('#recur_monthly_relative_position').val();
	    	val = val != '' ? parseInt(val) : false;
	    	this.model.setMonthRelativePosition(val);
	    },
	    
	    changeMonthWeekday: function(e){
	    	var val = $('#recur_monthly_weekday').val();
	    	val = val != '' ? parseInt(val) : false;
	    	this.model.setMonthWeekday(val);	
	    },
	    
	    changeWeekdays: function(e){
	    	var weekdays = [];
	    	$('input[name="weekdays"]:checked').each(function(){
	    		weekdays.push($(this).val());
	    	});
	    	this.model.setWeekdays(weekdays);
	    },
	    
	    changeTypeMonthly: function(e){
	    	var val = $('input[name="type_monthly"]:checked').val();
	    	this.model.set({recur_month_type:val});
	    },
	    
	    getRecurrenceDates: function(e){
			e.preventDefault();
			this.model.fetchDates();
		}
 
	});	
	return FormRecurrenceView;
})