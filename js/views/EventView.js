openstm.Views.EventView = Backbone.View.extend({
	  
		el : '#myModal',

		templateHTML: 'task_duration',
		
        events : {
          "click .btn-primary" : "save"
        },

       
        initialize: function() {
            _.bindAll(this);           
        },
        render: function() {
        	$(this.el).modal();
        },        
        open: function() {
        	this.$('#total_hours').val(this.model.get('total_hours'));
            this.$('#remaining_hours').val(this.model.get('remaining_hours'));                        
        },        
        save: function() {
            //this.model.set({'total_hours': this.$('#total_hours').val(), 'remaining_hours': this.$('#remaining_hours').val()});
            
            data = {'total_hours': this.$('#total_hours').val(), 
                      'remaining_hours': this.$('#remaining_hours').val(),
                      'id': this.model.attributes.id
                      };

            if (this.model.isNew()) {
                this.collection.create(this.model, {success: this.close});
            } else {
                this.model.save(data,{success: this.close},false);
            }
            $("#myModal").modal('hide');
        },
        close: function() {
            this.el.dialog('close');
        },
        destroy: function() {
            this.model.destroy({success: this.close});
        }        
    });