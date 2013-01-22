/******************************************
* Interventions View
*/
app.Views.InterventionsView = Backbone.View.extend({

    el : '#rowContainer',

    templateHTML: 'interventions',
    
    
    selectedInter : '',
    selectedTask : '',

    
    // The DOM events //
    events: {
        'click .btn.addTask'                : 'setInfoModal',
        'click button.saveTask'             : 'saveTask',
        
        'click a.modalDeleteTask'   		: 'setInfoModal',
        'click button.btnDeleteTask'   		: 'deleteTask',
        
        'click a.buttonCancelInter'			: 'setInfoModal',
        'submit #formCancelInter' 			: 'cancelInter',
        'click a.accordion-intervention'    : 'tableAccordion'
        	
    },



    /** View Initialization
    */
    initialize : function() {
        console.log('Interventions view Initialize');
        
        
    },



    /** Display the view
    */
    render : function() {
        var self = this;

        // Change the page title //
        app.router.setPageTitle(app.lang.viewsTitles.interventions);

        // Change the active menu item //
        app.views.headerView.selectMenuItem(app.router.mainMenus.manageInterventions);

        // Change the Grid Mode of the view //
        app.views.headerView.switchGridMode('fluid');


        var interventions = app.collections.interventions.models;

        // Retrieve the number of validated Interventions //
        var interventionsValidated = _.filter(interventions, function(item){ 
        	return true //(item.attributes.progress_rate <= 99) 
        			/*&&
        			item.attributes.state != app.Models.Intervention.state[0].value &&
        			item.attributes.state != app.Models.Intervention.state[1].value); */
        });
        var nbInterventions = _.size(interventionsValidated);
        
        interventionsValidated = _.sortBy(interventionsValidated, function(item){ 
        	 return item.attributes.date_start; 
        });


        // Check the number of planned interventions //
        var interventionsPlanned = _.filter(interventions, function(item){ 
            return (item.attributes.state == app.Models.Intervention.state[1].value);
        });
        var nbInterventionsPlanned = _.size(interventionsPlanned);


        // Check the number of pending interventions //
        var interventionsPending = _.filter(interventions, function(item){ 
            return (item.attributes.state == app.Models.Intervention.state[2].value);
        });
        var nbInterventionsPending = _.size(interventionsPending);


        // Retrieve the HTML template // 
        $.get("templates/" + this.templateHTML + ".html", function(templateData){
                var template = _.template(templateData, {
                    lang: app.lang,
                    nbInterventions: nbInterventions,
                    nbInterventionsPending: nbInterventionsPending,
                    nbInterventionsPlanned: nbInterventionsPlanned,
                    interventionsState: app.Models.Intervention.state,
                    interventions: (new app.Collections.Interventions(interventionsValidated)).toJSON(),
                });

            console.debug(interventionsValidated);

            $(self.el).html(template);

			app.views.selectListAssignementsView = new app.Views.DropdownSelectListView({el: $("#taskCategory"), collection: app.collections.categories})
			app.views.selectListAssignementsView.clearAll();
			app.views.selectListAssignementsView.addEmptyFirst();
			app.views.selectListAssignementsView.addAll();

            $('*[rel="tooltip"]').tooltip({placement: "right"});
        });

        $(this.el).hide().fadeIn('slow');
        return this;
    },
    




    /** Fonction collapse table row
    */
    tableAccordion: function(e){

        e.preventDefault();
        
        // Retrieve the intervention ID //
        var id = _($(e.target).attr('href')).strRightBack('_');


        var isExpend = $('#collapse_'+id).hasClass('expend');

        // Reset the default visibility //
        $('tr.expend').css({ display: 'none' }).removeClass('expend');
        $('tr.row-intervention').css({ opacity: '0.5'});
        $('tr.row-intervention > td').css({ backgroundColor: '#FFF'});
        
        // If the table row isn't already expend //       
        if(!isExpend){
            // Set the new visibility to the selected intervention //
            $('#collapse_'+id).css({ display: 'table-row' }).addClass('expend');
            $(e.target).parents('tr.row-intervention').css({ opacity: '1'});
            $(e.target).parents('tr.row-intervention').children('td').css({ backgroundColor: '#F5F5F5'});
        }
        else{
            $('tr.row-intervention').css({ opacity: '1'});
            $('tr.row-intervention > td').css({ backgroundColor: '#FFF'});
            $('tr.row-intervention:nth-child(4n+1) > td').css({ backgroundColor: '#F9F9F9'});
        }
           
    },
    
    /** Display information in the Modal view
    	    */
    setInfoModal: function(e){
        
        // Retrieve the ID of the intervention //
        var link = $(e.target);
        var id = _(link.parents('tr').attr('id')).strRightBack('_');
  
        if(link.parent('a').attr('href') == "#modalCancelInter"){           
            
            //var inter = _.filter(app.collections.interventions.models, function(item){ return item.attributes.id == id });
			this.inter = app.collections.interventions.get(this.pos);
			this.interJSON = this.inter.toJSON()
            
            if( inter ) {
            	this.selectedInter = inter[0]
	            this.selectedInterJSON = this.selectedInter.toJSON();
	
	            $('#infoModalCancelInter p').html(this.selectedInterJSON.name);
	            $('#infoModalCancelInter small').html(this.selectedInterJSON.description);
            }
            else{
            	app.notify('', 'error', app.lang.errorMessages.unablePerformAction, "Annulation Intervention : non trouvée dans la liste");
            }
        }
        else if(link.parent('a').attr('href') == "#modalAddTask"){        
        	this.inter = app.collections.interventions.get(this.pos);
        	this.interJSON = this.inter.toJSON()
        	$('#modalAddTask').modal();
        }
        else if(link.parent('a').attr('href') == "#modalDeleteTask"){        
        	
            var task = _.filter(app.collections.tasks.models, function(item){ return item.attributes.id == id });
            if( task ) {
            	this.selectedTask = task[0]
	            this.selectedTaskJSON = this.selectedTask.toJSON();
	
	            $('#infoModalDeleteTask p').html(this.selectedTaskJSON.name);
	            $('#infoModalDeleteTask small').html(this.selectedTaskJSON.description);
            }
            else{
            	app.notify('', 'error', app.lang.errorMessages.unablePerformAction, "Suppression Tâche : non trouvée dans la liste");
            }
        }

    },

//    getTarget:function(e) {    	
//    	e.preventDefault();
//	    // Retrieve the ID of the intervention //
//		var link = $(e.target);
//		this.pos =  _(link.parents('tr').attr('id')).strRightBack('_');
//		this.inter = app.collections.interventions.get(this.pos);
//		this.interJSON = this.inter.toJSON();
//    },

//    /** Display the form to add a new Task
//    */
//   displayModalAddTask: function(e){
//        this.getTarget(e);
//        $('#modalAddTask').modal();
//   },
//   
//	displayModalDeleteTask: function(e){
//	    this.getTarget(e);
//	    $('#modalDeleteTask').modal();
//	},
//
//   displayModalCancelInter: function(e) {
//	   this.getTarget(e);
//	   $('#infoModalCancelInter').children('p').html(this.interJSON.name);
//	   $('#infoModalCancelInter').children('small').html(this.interJSON.description);
//   },

    /** Save the Task
    */
    saveTask: function(e){
    	 var self = this;

		e.preventDefault();
		
		 
		 input_category_id = null;
	     if( app.views.selectListAssignementsView != null )
	    	 input_category_id = app.views.selectListAssignementsView.getSelected().toJSON().id;

	     var params = {
	         project_id: this.pos,
	         name: this.$('#taskName').val(),
	         category_id: input_category_id,	         
		     planned_hours: this.$('#taskHour').val(),
	     };
	     //TODO : test
	     app.models.task.save(0,params,$('#modalAddTask'), null, "interventions");
   },
   
    /** Delete task
    	    */
    deleteTask: function(e){
		var self = this;
		this.selectedTask.destroy({
			success: function(data){
				if(data.error){
					app.notify('', 'error', app.lang.errorMessages.unablePerformAction, app.lang.errorMessages.sufficientRights);
				}
				else{
					app.collections.tasks.remove(self.selectedTask);
					var inter = app.collections.interventions.get(self.selectedTaskJSON.intervention.id);					
					inter.attributes.tasks.remove(self.selectedTaskJSON.id);
					app.collections.interventions.add(inter);
					$('#modalDeleteTask').modal('hide');
					app.notify('', 'info', app.lang.infoMessages.information, app.lang.infoMessages.serviceDeleteOk);
					self.render();
				}
			},
			error: function(e){
				alert("Impossible de supprimer la tâche");
			}

		});

    },
   
	cancelInter: function(e){
		e.preventDefault();
	
		params = {
		        state: app.Models.Intervention.state[4].value,
		        cancel_reason: $('#motifCancel').val(),		
		};		
		this.saveNewState( params,$('#modalCancelInter') );
	},
	
		
	saveNewState: function(params, element) {
		var self = this;
		self.element = element;
		self.params = params
		this.inter.save(params, {
				    success: function (data) {
					        console.log(data);
					        if(data.error){
					    		app.notify('', 'error', app.lang.errorMessages.unablePerformAction, app.lang.errorMessages.sufficientRights);
					        }
					        else{					        	
					            console.log('NEW STATE INTER SAVED');
					            if( self.element!= null )
					            	self.element.modal('hide');
					            self.inter.update(self.params);
					            app.collections.interventions.add(self.inter);
					            self.render();
					        }
					    },
					    error: function () {
							console.log('ERROR - Unable to valid the Inter - InterventionView.js');
					    },           
					},false);
	},
  
});




