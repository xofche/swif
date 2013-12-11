define([
	'app',
	'appHelpers',

	'fullcalendar',
	'moment',

	'bookingModel',
	'bookingsCollection',

	'modalReservationDetailsView',
	'formBookingView'


], function(app, AppHelpers, fullcalendar, moment, BookingModel, BookingsCollection, ModalReservationDetailsView, FormBookingView){

	'use strict';

		
	
	/******************************************
	* Valid Request Modal View
	*/
	var CalendarPlanningView = Backbone.View.extend({
	
	
		templateHTML        : '<div id="calendarContainer"></div>',


	
		// The DOM events //
		events: {
			'click .fc-button-prev'      : 'goPrevDate',
			'click .fc-button-next'      : 'goNextDate',
			'click .fc-button-today'     : 'goTodayDate',
			'click .fc-button-agendaDay' : 'goDayFormat',
			'click .fc-button-agendaWeek': 'goWeekFormat',
			'click .fc-button-month'     : 'goMonthFormat'
		}, 
	
	
	
		/** View Initialization
		*/
		initialize: function (params) {
			var self = this;

			// Params //
			this.calendarView = params.calendarView;
			this.currentDate = params.date;

			this.render();
		},
	
	
	
		/** Display the view
		*/
		render : function() {
			var self = this;
	
	
			// Retrieve the template // 
			var template = _.template(this.templateHTML, {
				lang    : app.lang,
			});
	
			$(this.el).html(template);

			this.calendar = $('#calendarContainer');
			
			// Init the calendar //
			this.initCalendar();

			return this;
		},



		/** Init the calendar
		*/
		initCalendar: function(){
			var self = this;

			this.calendar.fullCalendar({
	    		
	    		/** Full calendar attributes **/
				date        :   this.currentDate.date(),
				month       :	this.currentDate.month(),
				year        :	this.currentDate.year(),
				defaultView   : this.calendarView,
				ignoreTimezone: false,
				height        : 735,
				header: {
					left  : 'agendaDay,agendaWeek,month',
					center: 'title',
					right : 'today,prev,next'
				},
				// time formats
				titleFormat: {
					month: 'MMMM yyyy',
					week : "'Semaine 'W' <small>du' d [MMM] [yyyy] {'au' d MMM yyyy}</small>",
					day  : 'dddd d MMM yyyy'
				},
				columnFormat: {
					month: 'ddd',
					week : 'ddd d/MM',
					day  : 'dd/MM/yyyy'
				},
				firstDay           : 1,
				axisFormat         : 'HH:mm',
				timeFormat         : 'H(:mm){ - H(:mm)}',
				allDayText         : _.capitalize(app.lang.daytime),
				slotMinutes        : 30,
				firstHour          : 8,
				defaultEventMinutes: 120,
				weekends           : true,
				selectable         : true,
				selectHelper       : true,
				
				weekNumbers        : true,
				weekNumberTitle    : 's',
				
				monthNames         : app.lang.monthNames,
				monthNamesShort    : app.lang.monthNamesShort,
				dayNames           : app.lang.dayNames,
				dayNamesShort      : app.lang.dayNamesShort,
				buttonText         : {
					today : _.capitalize(app.lang.today),
					month : _.capitalize(app.lang.month),
					week  : _.capitalize(app.lang.week),
					day   : _.capitalize(app.lang.day),
					prev  : '<i class="fa fa-chevron-left fa-fw"></i>',
					next  : '<i class="fa fa-chevron-right fa-fw"></i>',
				},


				/** Calculates events to display on calendar for officer (or team) on week selected
				*/
				events: function(start, end, callback) {

					// Get the selected resources //
					var selectedResources = _.union(app.views.sideBarPlanningSelectResourcesView.selectedPlaces, app.views.sideBarPlanningSelectResourcesView.selectedEquipments);

	    			if(!_.isEmpty(selectedResources)){

						self.fetchReservations(start, end, selectedResources)
						.done(function(){
								var events = self.collectionsToEvents(self.collection);
								callback(events);
						});
					}
				},


				/** EventRender
				*/ 
				eventRender: function(event, element){
					// Allow html tag in the reservation title //
					element.find('.fc-event-title').html(event.title);


					var dateFormat = 'DD/MM HH:mm'
					var content =  '<ul class="fa-ul">';
					content += '<li><i class="fa-li fa fa-clock-o"></i>'+moment(event.start).format(dateFormat)+' - '+moment(event.end).format(dateFormat)+'</li>';


					// Is Citizen //
					if(event.info.isCitizen == true){
						content += '<li><i class="fa-li fa fa-user"></i>'+app.lang.citizen+' : '+event.info.citizenName+'<li>';
					}
					else{
						content += '<li><i class="fa-li fa fa-user"></i>'+event.info.claimerContact+'<li>';	
					}

					content += '</ul>';

					// Note //
					if(!_.isUndefined(event.info.note)){
						content += '<p>'+event.info.note+'</p>';
					}

					// Popover //
					element.popover( {trigger: 'hover', placement: 'left', container: '#calendarManager', html: true, title: event.info.title, content: content} );
				},


				/** Open leave time modal (Absent task)
				*/
				select: function( startDate, endDate, allDay, jsEvent, view) {

					var booking = new BookingModel();
					booking.setStartDate(startDate);
					booking.setEndDate(endDate);


					console.log(booking);

					// Redirect to form //
					app.views.formBooking = new FormBookingView({
						model : booking
					});

					//app.views.formBooking.render();

				},
	

				/** Task is click on the calendar : display unplan task modal
	    	    */
	    	    eventClick: function(fcEvent, jsEvent, view) {

					app.views.ModalReservationDetailsView = new ModalReservationDetailsView({
						el      : '#modalReservationDetails',
						modelId : fcEvent.id
					});
	    		}
			});

		},




		/** Fetch the reservations
		*/
		fetchReservations: function(start, end, selectedResources){

			// Create the collection //
			if(_.isUndefined(this.collection)){ this.collection = new BookingsCollection();}


			// Create Fetch params //
			var fetchParams = {
				silent  : true,
				data : {
					fields : ['name', 'checkin', 'checkout', 'note', 'resource_ids', 'is_citizen', 'partner_id', 'people_name', 'recurrence_id']
				}
			};


			// Select the period of time //
			var domain = [
				{ 'field' : 'checkin', 'operator' : '>', 'value' : moment(start).format('YYYY-MM-DD HH:mm:ss') },
				{ 'field' : 'checkout', 'operator' : '<', 'value' : moment(end).format('YYYY-MM-DD HH:mm:ss')  },
				{ 'field' : 'reservation_line.reserve_product.id', 'operator' : 'in', 'value' : selectedResources},
				{ 'field' : 'state', 'operator' : 'in', 'value' : [BookingModel.status.confirm.key, BookingModel.status.done.key]}
			]

			fetchParams.data.filters    = app.objectifyFilters(domain);

			// Fetch the collections //
			return $.when(this.collection.fetch(fetchParams))
			.fail(function(e){
				console.log(e);
			});
		},



		/** fetchEvents
		*/
		fetchEvents: function(){
			this.calendar.fullCalendar('refetchEvents');	
		},


		
		/** Convert a collection to Array events for FullCalendar
		*/
		collectionsToEvents: function(collection){

			var events = [];

			_.each(collection.models, function(model, index){

				var resouceIds = model.getResourcesId();

				var resourcePlaces     = _.intersection(app.views.sideBarPlanningSelectResourcesView.selectedPlaces, resouceIds);
				var resourceEquipments = _.intersection(app.views.sideBarPlanningSelectResourcesView.selectedEquipments, resouceIds);


				// Set the color of the event with the color of the place resource //
				if(!_.isEmpty(resourcePlaces)){
					var resourceColorId = _.first(resourcePlaces);
					var color = app.views.sideBarPlanningSelectResourcesView.selectablePlaces.get(resourceColorId).getColor();
				}
				else{
					var resourceColorId = _.first(resourceEquipments);
					var color = app.views.sideBarPlanningSelectResourcesView.selectableEquipments.get(resourceColorId).getColor();
				}

				var rgb = AppHelpers.hexaToRgb(color.split('#')[1]);

				if( (((rgb[0]*299) + (rgb[0]*587) + (rgb[0]*114)) / 1000) < 125 ){
					var textColor = '#FFF';
				}
				else{
					var textColor = '#000';
				}


				// Recurrence //
				if(model.getRecurrence() != false){
					var recurrence = '<i class="fa fa-repeat fa-fw"></i>&nbsp;';
				}
				else{
					var recurrence = '';
				}


				// Get the equipments //
				if(!_.isEmpty(resourceEquipments)){
					
					var equipments = '&nbsp;'

					_.each(resourceEquipments, function(i){
						equipments += "<span class='badge'>"+app.views.sideBarPlanningSelectResourcesView.selectableEquipments.get(i).getName()+"</span>";
					})
				}
				else{
					var equipments = ''
				}

				var evt = {
					id       : model.getId(),
					title    : recurrence + model.getName() + equipments,
					start    : model.getStartDate(),
					end      : model.getEndDate(),
					color    : color,
					textColor: textColor,
					allDay   : false,
					className: 'resa-'+resourceColorId,
					info     : {
						title          : model.getName(),
						note           : model.getNote(),
						isCitizen      : model.fromCitizen(),
						citizenName    : model.getCitizenName(),
						claimerContact : model.getClaimer()
					}
				}

				events.push(evt);
			})

			return events;
		},



		urlBuilder: function(mode){

			var unite; var view;
			// Check the params //
			switch(this.calendarView){
				case 'agendaDay':
					unite = 'days';
					view = 'day';
				break;

				case 'agendaWeek':
					unite = 'weeks';
					view = 'week';
				break;

				case 'month':
					unite = 'months';
					view = 'month';
				break;
			}

			if(mode == 'add'){
				this.currentDate.add(unite, 1);
			}
			else if(mode == 'subtract'){
				this.currentDate.subtract(unite, 1);
			}
			else if(mode == 'today'){
				this.currentDate = moment();
			}

			var route = _.strLeft(app.routes.planningManager.url, '(');

			var params = view +'/'+ this.currentDate.format('DD') +'/'+ (this.currentDate).format('MM') +'/'+ this.currentDate.year();

			app.router.navigate(_.join('/', route, params), {trigger: false, replace: true});

		},



		/** Go to the previous Date
		*/		
		goPrevDate: function(e){
			this.urlBuilder('subtract');
		},

		/** Go to the next Date
		*/
		goNextDate: function(e){
			this.urlBuilder('add');
		},

		/** Go to the today's Date
		*/
		goTodayDate: function(e){
			this.urlBuilder('today');
		},

		/** Go to the Day Format
		*/
		goDayFormat: function(e){
			this.calendarView = 'agendaDay';
			this.urlBuilder();
		},

		/** Go to the Week Format
		*/
		goWeekFormat: function(e){
			this.calendarView = 'agendaWeek';
			this.urlBuilder();
		},

		/** Go to the Month Format
		*/
		goMonthFormat: function(e){
			this.calendarView = 'month';
			this.urlBuilder();
		}


	});

return CalendarPlanningView;

})