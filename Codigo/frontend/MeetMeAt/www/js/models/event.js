//  __  __           _   __  __              _   
// |  \/  |         | | |  \/  |        /\  | |  
// | \  / | ___  ___| |_| \  / | ___   /  \ | |_ 
// | |\/| |/ _ \/ _ \ __| |\/| |/ _ \ / /\ \| __|
// | |  | |  __/  __/ |_| |  | |  __// ____ \ |_ 
// |_|  |_|\___|\___|\__|_|  |_|\___/_/    \_\__|

(function($){
    
    'use strict';

    var modEvent = {
        table : 'events',
        S : {
            eventTemplate : "#event-template",
            eventListTemplate : "#events-list-template"
        },
        model : {
            _events : []
        },
        getCacheEventObjByID : function(id) {
            var events = this.model._events;
            var eventObj = null;
            for (var i=0; i < events.length; i++) {
                var event = events[i];
                if ( event.id == id ) {
                    eventObj = event;
                    break;
                }
            }
            return eventObj;
        },
        getMyEvents : function() {
            var self = this;
            this.model._events = [];
            var promise = $.Deferred();
            app.api.table(this.table,{
                cacheRow: function(rowData) {
                    // transform field-value to object
                    var row = {};
                    rowData.map(function(v){
                        row[v.field] = v.value;
                    });
                    self.model._events.push(row);
                }
            }).then(function(){
                promise.resolve(self.model._events);
            },function(error){
                promise.reject(error);
            });
            return promise;
        },
        renderEvent : function(selContainer,eventDATA) {
            var container = $(selContainer),
                source = $(this.S.eventTemplate).html();

            var template = Handlebars.compile(source);
            var html = template(eventDATA);

            // inject html
            if ( container[0] instanceof HTMLElement ) {
                container.html(html);
                ons.compile(container[0]);
            }
        },
        renderEventsList : function(selContainer,eventsDATA,viewEventCallback) {
            var container = $(selContainer),
                source = $(this.S.eventListTemplate).html();

            var template = Handlebars.compile(source);
            var html = template(eventsDATA);

            if ( container[0] instanceof HTMLElement ) {
                container.html(html);
                ons.compile(container[0]);
                
                // bind view event
                container.find('.event-list-item').on('click',function(e){
                    e.preventDefault();
                    viewEventCallback.call(this);
                });
            }
        },
    	init : function() {
    	}
    };
    app.models.register("EVENT",modEvent);

}(jQuery));