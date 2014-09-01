//  __  __           _   __  __              _   
// |  \/  |         | | |  \/  |        /\  | |  
// | \  / | ___  ___| |_| \  / | ___   /  \ | |_ 
// | |\/| |/ _ \/ _ \ __| |\/| |/ _ \ / /\ \| __|
// | |  | |  __/  __/ |_| |  | |  __// ____ \ |_ 
// |_|  |_|\___|\___|\__|_|  |_|\___/_/    \_\__|

var eventsNavigator = null;

(function($){
    
    'use strict';

    var modEvents = {
    	navigator : null,
        S : {
            myEventsList : "#my-events-list"
        },
        model : {
            eventModel : null,
        },
        viewEvent : function(id) {
            var eventObj = this.model.eventModel.getCacheEventObjByID(id);
            app.modules.get("MODAL").start('Loading Event');
            app.modules.get("EVENTVIEW").setEventByObj(eventObj);
            this.navigator.pushPage("event-view.html");
        },
        render : function() {
            var self = this;
            self.model.eventModel.getMyEvents().then(function(events){
                self.model.eventModel.renderEventsList(self.S.myEventsList,events,function(){
                    self.viewEvent($(this).attr('data-id'));
                });
            },function(error){
                console.log(error);
            });
        },
    	initNavigator : function(nav) {
            this.navigator = nav;

            // events binding
            this.navigator.on('postpush', function(event) {
                app.modules.get("MODAL").hide();
                app.modules.get("EVENTVIEW").render();
            });
        },
        initTabbar : function() {
            this.initNavigator(eventsNavigator);
            this.render();
        },
    	init : function() {
            this.model.eventModel = app.models.get('EVENT');
    	}
    };
    app.modules.register("EVENTS",modEvents,app.tabs.EVENTS);

}(jQuery));