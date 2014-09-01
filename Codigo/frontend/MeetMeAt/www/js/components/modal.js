//  __  __           _   __  __              _   
// |  \/  |         | | |  \/  |        /\  | |  
// | \  / | ___  ___| |_| \  / | ___   /  \ | |_ 
// | |\/| |/ _ \/ _ \ __| |\/| |/ _ \ / /\ \| __|
// | |  | |  __/  __/ |_| |  | |  __// ____ \ |_ 
// |_|  |_|\___|\___|\__|_|  |_|\___/_/    \_\__|

(function($){
    
    'use strict';

    /**
     * @component MODAL
     */
    var onsModal = {
        modal : null,
        S : {
            label : '#modal-label',
            icon : '#modal-icon'
        },
        model : {
            label : '',
            icon : '',
            timeout : 2000
        },
        show : function() {
            this.modal.show();
        },
        hide : function(label) {
            this.updateLabel('Done!');
            this.modal.hide();
        },
        updateLabel : function(text) {
            this.model.label = text;
            $(this.S.label).text(this.model.label);
        },
        updateIcon : function(icon) {
            this.model.icon = icon;
            var container = $(this.S.icon);
            var parent = container.parent();
            container.remove();
            if ( icon != '' ) {
                container = $('<ons-icon id="modal-icon" spin="false" icon="' + this.model.icon + '"></ons-icon>');
                parent.prepend(container);
                if ( parent[0] instanceof HTMLElement ) {
                    ons.compile(parent[0]);
                }
            }
        },
        hideTimeout : function(callback) {
            var self = this;
            setTimeout(function(){
                self.hide();
                callback && callback.call();
            },this.model.timeout);
        },
        prepareModal : function(text,icon) {
            this.updateLabel(text);
            if (icon) {
                this.updateIcon(icon)
            } else {
                this.updateIcon('');
            }
        },
        start : function(text,icon) {
            if (!icon) icon = "ion-looping";
            this.prepareModal(text,icon);
            this.show();
        },
        update : function(text) {
            this.updateLabel(text);
        },
        end : function(text,callback,icon) {
            if (!icon) icon = "ion-looping";
            this.prepareModal(text,icon);
            this.hideTimeout(callback);
        },
        notify : function(text,icon) {
            var self = this;
            if (!icon) icon = "ion-sad";
            this.prepareModal(text,icon);
            this.show();
            this.hideTimeout();
        },
        init : function() {
             // modal is a var reference
            this.modal = modal;
        }
    }
    app.modules.register("MODAL",onsModal);

}(jQuery));