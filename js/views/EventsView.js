app.Views.EventsView = Backbone.View.extend({
	
//		events: {
//		    "submit form": "save"
//		},
	
	
        initialize: function(planning,collection,officer_id){
			this.planning = planning;
			this.el = $('div#officer_'+officer_id);
			this.collection = collection;
			this.officer_id = officer_id;
            _.bindAll(this); 

            this.collection.bind('reset', this.addAll);
            this.collection.bind('add', this.addOne);
            this.collection.bind('change', this.change);            
            this.collection.bind('destroy', this.destroy);
            
            this.eventView = new app.Views.EventView();            
        },

        
        render: function() {	
        	this.initEvents();
        	this.initCalendar();       
        },
        
		save: function(params) {
			model = new app.Models.Task();
			model.save(params,			
				{
				    success: function (data) {
				        console.log(data);
				        if(data.error){
				    		app.notify('', 'error', app.lang.errorMessages.unablePerformAction, app.lang.errorMessages.sufficientRights);
				        }
				        else{
				            console.log('Success SAVE REQUEST');
				        }
				    },
				    error: function () {
						console.log('ERROR - Unable to save the Request - RequestDetailsView.js');
				    },           
			},false);
		},
		
        addAll: function() {
            this.el.fullCalendar('addEventSource', this.collection.toJSON());
        },
        addOne: function(event) {
            this.el.fullCalendar('renderEvent', event.toJSON());
        },        
        select: function(startDate, endDate) {
            this.eventView.collection = this.collection;
            this.eventView.model = new Event({start: startDate, end: endDate});
            this.eventView.render();            
        },
        eventClick: function(fcEvent, jsEvent, view) {
        	var self = this;
            this.eventView.model = this.collection.get(fcEvent.id);
            this.eventView.render($(jsEvent.currentTarget))
        },
        change: function(event) {
            // Look up the underlying event in the calendar and update its details from the model
            var fcEvent = this.el.fullCalendar('clientEvents', event.get('id'))[0];
            fcEvent.planned_hours = event.get('planned_hours');
            fcEvent.remaining_hours = event.get('remaining_hours');
            //this.el.fullCalendar('updateEvent', fcEvent);           
        },
        eventDropOrResize: function(fcEvent) {
            // Lookup the model that has the ID of the event and update its attributes
            this.collection.get(fcEvent.id).save({start: fcEvent.start, end: fcEvent.end});            
        },        
                
        initEvents: function() {
        	this.events = [];
        	var self = this;
        	
        	_.each(this.collection.toJSON(), function (task, i){
        		var event = { id: task.id, 
        		              title: task.name, 
        		              start: task.date_start, 
        		              end: task.date_end, 
        		              planned_hours: task.planned_hours,
        		              total_hours: task.total_hours,
        		              remaning_hours: task.remaining_hours,
        		              allDay:false
        		             };
        		self.events.push(event);
        	});
        },
        
        initCalendar: function() {
        	var self = this;
        	this.calendar = self.el.fullCalendar({
				events: self.events,
				
				defaultView: self.planning.calendarView,
				aspectRatio: 1.30,
				header: {
				    left: 'infosUser',
				    center: 'title',
				    right: 'today,prev,next'
				},
				titleFormat:{
				    //week: "d { [ MMM] '-' d} MMM yyyy",
				    week: "'Semaine ' W '<small class=hidden-phone> du' d { [ MMM] 'au' d} MMM yyyy '</small>'",
				},
				allDayText: 'Journée entière',
				axisFormat: 'H:mm',
				timeFormat: 'H:mm',
				slotMinutes: 120,
				firstHour: 8,
				minTime: 8,
				maxTime: 18,
				defaultEventMinutes: 120,
				dragOpacity: 0.5,
				weekends: true,
				editable: true,
				droppable: true,
				disableResizing: true,				
                selectable: true,
                selectHelper: true,
                editable: true,
                ignoreTimezone: false,                
                select: this.select,
                dragRevertDuration:0,
                eventClick: this.eventClick,
//                eventColor: {
//					backgroundColor: 'black',
//					borderColor: 'yellow',
//				},
//                eventDrop: this.eventDropOrResize,        
//                eventResize: this.eventDropOrResize,
				
				//eventColor: '#378006',
				
//				viewDisplay: function() {
//					// qTip call
//					$('.fc-event', this).qtip();
//				},
				
				eventRender: function(event, element) {
					console.debug(element);		
//					element.qtip({ content: event.description,
//								   position: {
//										corner:{target: 'topRight',tooltip: 'bottomLeft'}
//											},	
//								   show: 'mouseover',
//								   hide: 'mouseout',
//						});
				},


				drop: function( date, allDay) { // this function is called when something is dropped
				
				    // retrieve the dropped element's stored Event Object
				    var originalEventObject = $(this).data('eventObject');
				
				    // we need to copy it, so that multiple events don't have a reference to the same object
				    var copiedEventObject = $.extend({}, originalEventObject);
				
				    // assign it the date that was reported
				    copiedEventObject.start = date;
				    copiedEventObject.allDay = allDay;
				
				    // render the event on the calendar
				    // the last `true` argument determines if the event "sticks" (http://arshaw.com/fullcalendar/docs/event_rendering/renderEvent/)
				    $(self.el).fullCalendar('renderEvent', copiedEventObject, true);
				    //$(self.el).append('<button type="button" class="close" data-dismiss="close">X</button>');
				    params = { 
				               id: copiedEventObject.id,
				    		   date_end: date,
				               date_start: date,
				               planned_hours: copiedEventObject.planned_hours,
				               user_id: self.officer_id
				    };
				    self.save(params);
				
				    $.pnotify({
				        title: 'Tâche attribuée',
				        text: 'La tâche a correctement été attribué à l\'agent.'
					    });
				
				
				    $(this).remove();     
				},
				
				
				eventDragStop: function(event, jsEvent, ui, view) {
				    //if (self.isElemOverDiv($(this), $('div.accordion-group'))) {
					app.loader('display');
					
				    params = { 
				       id: event.id,
				       user_id: null
				    };
				    model = app.collections.tasks.get(event.id)
					model.save(params);	
				    	
				    self.planning.render();	
				    $(self.el).fullCalendar('removeEvents', event.id);
				    app.loader('hide');
				    //}
				}

			});
    	}
    });
