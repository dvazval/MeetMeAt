//  __  __           _   __  __              _   
// |  \/  |         | | |  \/  |        /\  | |  
// | \  / | ___  ___| |_| \  / | ___   /  \ | |_ 
// | |\/| |/ _ \/ _ \ __| |\/| |/ _ \ / /\ \| __|
// | |  | |  __/  __/ |_| |  | |  __// ____ \ |_ 
// |_|  |_|\___|\___|\__|_|  |_|\___/_/    \_\__|

(function($){
    
    'use strict';

    var modEventView = {
    	S : {
    		container : "#event-view"
    	},
    	model : {
    		id : null,
    		event: null
    	},
    	setEventByObj : function(eventObj) {
    		this.model.event = eventObj;
    		this.model.id = eventObj.id;
    	},
    	render : function() {
    		app.models.get("EVENT").renderEvent(this.S.container,this.model.event);
    	},
    	reset : function() {
    		this.model.id = null;
    		this.model.event = null;
    	},
    	initTabbar : function() {
        },
    	init : function() {
    		this.reset();
    	}
    };
    app.modules.register("EVENTVIEW",modEventView);

}(jQuery));