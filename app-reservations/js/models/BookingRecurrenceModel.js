define([
	'app',
	'genericModel',
	'bookingModel',
	'bookingsCollection',
	
	'moment',
	'moment-timezone',
	'moment-timezone-data'

], function(app, GenericModel, BookingModel, BookingsCollection, moment){

	'use strict';


	/******************************************
	* Booking Model
	*/
	var bookingRecurrence = GenericModel.extend({
		
		urlRoot: "/api/openresa/booking_recurrences",
		
		fields : ['id', 'name' , 'recur_periodicity', 'recur_week_monday', 'recur_week_tuesday', 'recur_week_wednesday', 'recur_week_thursday',
		         'recur_week_friday', 'recur_week_saturday', 'recur_week_sunday', 'recur_month_type', 'recur_month_absolute',
				 'recur_month_relative_weight', 'recur_month_relative_day', 'recur_type', 'date_start', 'recur_length_type', 
				 'date_end', 'recur_occurrence_nb', 'date_confirm', 'recurrence_state', 'actions'
				],
				
		weekdays_vals : ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'],
	
		searchable_fields: [
			{
				key  : 'id',
				type : 'numeric'
			},
			{
				key  : 'name', 
				type : 'text'
			}
		],
	
		getId: function(){
			return this.get('id');
		},
		
		getName: function(){
			return this.get('name');
		},
		
		getStartDate: function(type){
			var date = this.getTemplate().getStartDate();
			if(date != false){
				switch(type){
					case 'human':	
						return moment.utc(date).local().format('LLL');
					break;
					default:
						return date;
					break;
				}
			}
			else{
				return '';
			}
		},
		
		setStartDate: function(val){
			if(val != ''){
				this.set({'date_start':val});
			}
			else{
				this.set({'date_start':false});
			}
		},
		
		getCount: function(){
			return this.get('recur_occurrence_nb');
		},
		
		setCount: function(val){
			this.set({recur_occurrence_nb:val});
		},
		
		getUntil: function(type){
			if(this.get('date_end') != false){
				switch(type){
					case 'human':	
						return moment(this.get('date_end')).format('LL');
					break;
					default:
						return this.get('date_end');
					break;
				}
			}
			else{
				return '';
			}
		},
		
		setUntil: function(val){
			if(val != ''){
				//complete date_end with time of date_start
				var date_start = moment.utc(this.getStartDate());
				var date_end = moment.utc(val,'DD-MM-YYYY').
				add('hours',date_start.hours()).
				add('minutes', date_start.minutes());
				this.set({date_end:date_end.format('YYYY-MM-DD HH:mm:ss')});
			}
			else{
				this.set({date_end:false});
			}
		},
		
		getWeight: function(e){
			return this.get('recur_periodicity');
		},
		
		setDailyWeight: function(val){
			if(this.get('recur_type') == 'daily'){
				this.set({recur_periodicity:val});
			}
		},
		
		setWeeklyWeight: function(val){
			if(this.get('recur_type') == 'weekly'){
				this.set({recur_periodicity:val});

			}
		},
		
		setMonthlyWeight: function(val){
			if(this.get('recur_type') == 'monthly'){
				this.set({recur_periodicity:val});

			}
		},
		
		getMonthday: function(){
			return this.get('recur_month_absolute');
		},
		
		setMonthday: function(val){
			this.set({recur_month_absolute:val});
		},
		
		getMonthRelativePosition: function(){
			return this.get('recur_month_relative_weight');
		},
		
		setMonthRelativePosition: function(val){
			this.set({recur_month_absolute:val});
		},
		
		getMonthWeekday: function(){
			return this.get('recur_month_relative_day');
		},
		
		setMonthWeekday: function(val){
			this.set({recur_month_relative_day:val});
		},
		
		getWeekdays: function(){
			var self = this;
			var ret = [];
			var prefix = 'recur_week_'
			_.each(this.weekdays_vals, function(weekday,i){
				var key = prefix + weekday;
				if(self.get(key)){
					ret.push(weekday);
				}
			});
			return ret;
		},
		
		//update all 7 fields for weekly setting, with true or false value according to cases
		setWeekdays: function(vals){
			var self = this;
			//prefix for backend field
			var prefix = 'recur_week_';
			var values = {};
			//for each weekday in vals, set corresponding field as true, for other weekdays, set fields as false
			_.each(this.weekdays_vals, function(weekday,i){
				var key = prefix + weekday;
				if(vals.indexOf(weekday) > -1){
					values[key] = true;
				}
				else{
					values[key] = false;
				}
			});
			this.set(values);
		},
		
		fetchDatesDaily: function(){
			return $.ajax({
				url: '/api/openresa/recurrence',
				type: 'GET',
				data: {
					date_start: this.getStartDate(),
					weight: this.getWeight(),
					date_end: this.get('recur_length_type') == 'until' ?  this.getUntil():'',
					count: this.get('recur_length_type') == 'count' ? this.getCount():0,
					type: 'daily'
				},
				error: function(e){
					console.log(e);
				}
			});
		},
		
		fetchDatesWeekly: function(){
			return $.ajax({
				url: '/api/openresa/recurrence',
				type: 'GET',
				data: {
					date_start: this.getStartDate(),
					weight: this.getWeight(),
					date_end: this.get('recur_length_type') == 'until' ?  this.getUntil():'',
					count: this.get('recur_length_type') == 'count' ? this.getCount():0,
					weekdays: this.getWeekdays(),
					type: 'weekly'
				},
				error: function(e){
					console.log(e);
				}
			});
		},
		
		fetchDatesDayMonthly: function(){
			return $.ajax({
				url: '/api/openresa/recurrence',
				type: 'GET',
				data: {
					date_start: this.getStartDate(),
					weight: this.getWeight(),
					date_end: this.get('recur_length_type') == 'until' ?  this.getUntil():'',
					count: this.get('recur_length_type') == 'count' ? this.getCount():0,
					monthday: this.getMonthday(),
					type: 'daymonthly'
				},
				error: function(e){
					console.log(e);
				}
			});
		},
		
		fetchDatesWeekdayMonthly: function(){
			return $.ajax({
				url: '/api/openresa/recurrence',
				type: 'GET',
				data: {
					date_start: this.getStartDate(),
					weight: this.getWeight(),
					date_end: this.get('recur_length_type') == 'until' ?  this.getUntil():'',
					count: this.get('recur_length_type') == 'count' ? this.getCount():0,
					relative_position: this.getMonthRelativePosition(),
					weekday: this.getMonthWeekday(),
					type: 'weekdaymonthly'
				},
				error: function(e){
					console.log(e);
				}
			});
		},
		
		fetchDates: function(){
			var self = this;
			var fnct = null;
			switch(this.get('recur_type')){
			case 'daily':
				fnct = this.fetchDatesDaily;
			break;
			case 'weekly':
				fnct = this.fetchDatesWeekly;
			break;
			case 'monthly':
				if(this.get('recur_month_type') == 'monthday'){
					fnct = this.fetchDatesDayMonthly;
				}
				else{
					fnct = this.fetchDatesWeekdayMonthly;
				}
			break;
			}
			//compute recurrence by calling corresponding method on 'fnct' variable
			return fnct.call(this).done(function(data){
				//for each date, i create a BookingModel based on this.template
				if(data.length > 0){
					//do not create first date if refers to the template dates
					//TOREMOVE or TOCHECK, do nothing for now (data[0] is an object, startDate is a string)
					if(data[0] == self.template.getStartDate()){
						data.splice(0,1);
					}
					//get length of resa (date_end - date_start)
					var date_start = moment.utc(self.getTemplate().getStartDate()).local();
					var date_end = moment.utc(self.getTemplate().getEndDate()).local();
					var length_resa = moment.duration({milliseconds:date_end - date_start});
					var collectionLine = self.template.lines;
					_.each(data, function(date,i){
						//fix to map date returned by JSON and date expected by moment
						date.month -= 1;
						date.minute = date.min;
						var resa_date_start = moment(date);
						var resa_date_end = moment(resa_date_start).add(length_resa);
						//create new occurrence based on template
						var resaModel = new BookingModel(self.template.getCloneVals());
						//add lines based on template_lines
						_.each(collectionLine.models,function(line,i){
							var newLine = line.clone().off();
							newLine.set({id:null},{silent:true});
							resaModel.addLine(newLine);
						});
						//and set changed data for this occurrence
						resaModel.set({
							id: null,
							checkin: moment.utc(resa_date_start).format('YYYY-MM-DD HH:mm:ss'),
							checkout: moment.utc(resa_date_end).format('YYYY-MM-DD HH:mm:ss'),
							is_template:false
						},{silent:true});
						//manually perform update of lines data
						resaModel.updateLinesData().done(function(){
							self.addOccurrence(resaModel);
						});
					});
					//DEBUG
					console.log(self);
				}
			});
		},
		
		setTemplate: function(model){
			this.template = model;
			model.recurrence = this;
			this.template.set({is_template:true},{silent:true});
		},
		
		getTemplate: function(){
			return this.template;
		},
		
		addOccurrence: function(model){
			model.recurrence = this;
			this.occurrences.add(model);
		},
		
		fetchOccurrences: function(){
			var self = this;
			var deferred = $.Deferred();
			this.occurrences.fetch({data:{filters:{0:{field:'recurrence_id.id',operator:'=',value:this.getId()}}}}).done(function(){
				self.occurrences.each(function(occurrence,i){
					occurrence.recurrence = self;
					occurrence.fetchLines();
				});
				deferred.resolve();
			});
			return deferred;
		},
		
		getSaveVals: function(){
			return {
				recur_length_type: this.get('recur_length_type'),
				recur_month_absolute: this.getMonthday(),
				recur_month_relative_day: this.getMonthRelativePosition(),
				recur_month_relative_weight: this.getMonthWeekday(),
				recur_month_type: this.get('recur_month_type'),
				recur_occurrence_nb: this.getCount(),
				recur_periodicity: this.getWeight(),
				recur_type: this.get('recur_type'),
				recur_week_friday: this.get('recur_week_friday'),
				recur_week_monday: this.get('recur_week_monday'),
				recur_week_saturday: this.get('recur_week_saturday'),
				recur_week_sunday: this.get('recur_week_sunday'),
				recur_week_thursday: this.get('recur_week_thursday'),
				recur_week_tuesday: this.get('recur_week_tuesday'),
				recur_week_wednesday: this.get('recur_week_wednesday'),
				template_id: this.getTemplate().getId()}
		},
		
		//save template to backend, then save the recurrence, and finally, save its occurrences
		//if some occurrences are planned to be removed, destroy corresponding models too
		saveToBackend: function(){
			var self = this;
			var vals = this.getSaveVals();
			
			this.save(vals,{wait:true,silent:true,patch:!this.isNew()}).done(function(data){
				if(self.isNew()){
					self.set({id:data});
				}
				self.fetch({silent:true}).done(function(){
					self.occurrences.each(function(occurrence){
						occurrence.setRecurrenceId(data);
						occurrence.saveToBackend();
					});
					self.occurrencesToRemove.each(function(occurrenceToRemove){
						occurrenceToRemove.destroy();
					});
				});
			});
			
		},
		
		/** Model Initialization
		*/
		initialize: function(){
			this.template = null;
			this.occurrences = new BookingsCollection();
			this.occurrencesToRemove = new BookingsCollection();
			if(!this.isNew()){
				var default_values = {
					date_end:false,
					recur_occurrence_nb:1,
					recur_type:'daily',
					recur_periodicity: 1,
					recur_month_absolute: 1,
					recur_month_relative_day: 'monday',
					recur_month_relative_weight: 'first',
					recur_month_type: 'monthday',
					recur_length_type: 'count'
				}
				this.set(default_values);
				//use setter to set 7 weekdays to false
				this.setWeekdays([]);
			}			
		},
	
	
	}, {
		// Request State Initialization //
		status : {
	
		}
	
	});	

	return bookingRecurrence;

});