//  __  __           _   __  __              _   
// |  \/  |         | | |  \/  |        /\  | |  
// | \  / | ___  ___| |_| \  / | ___   /  \ | |_ 
// | |\/| |/ _ \/ _ \ __| |\/| |/ _ \ / /\ \| __|
// | |  | |  __/  __/ |_| |  | |  __// ____ \ |_ 
// |_|  |_|\___|\___|\__|_|  |_|\___/_/    \_\__|

var homeNavigator = null;

(function($){
    
    'use strict';

    var modHome = {
    	navigator : null,
    	initNavigator : function(nav) {
            this.navigator = nav;
        },
        initTabbar: function() {
            this.initNavigator(homeNavigator);
        },
    	init : function() {
    	}
    };
    app.modules.register("HOME",modHome,app.tabs.HOME);

}(jQuery));