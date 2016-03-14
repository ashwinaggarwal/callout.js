(function (root, factory) {
  if (typeof exports === 'object') {
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else {
    factory(root);
  }
} (this, function (exports) {

    function Callout(options) {
        this._initialize(options);
    }

    Callout.prototype = {

        start : function() {
            this._fireEvent('beforestart');
            this._introJs.start();
            this._render();
        },

        exit : function() {
            this._introJs.exit();
            this._exit();
        },

        step : function(stepNo) {
            if( stepNo ) this._startFromStepNumber(stepNo);
            else return this._introJs._currentStep;
        },

        _initialize : function(options) {

            this._options = $.extend(options,{
                isSubMenuEvent : false,
                exitDueToGoToMenu : false,
                showBullets : options.showBullets || false,
                tooltipClass : 'callout',
                tooltipPosition : options.tooltipPosition || 'bottom',
                showStepNumbers : options.showStepNumbers || false,
                scrollToElement : options.scrollToElement || false,
                events : options.events || {},
                nextLabel: options.nextLabel || 'Got it',
                doneLabel: options.doneLabel || 'Done'
            });

            this._introJs = introJs();
            this._setOptions(this._options);
            this._bind();
        },

        _render : function() {
            this._renderSubMenu();
        },

        _bind : function(){
            this._introJs.onchange(this._prepareView.bind(this));
            this._introJs.onafterchange(this._onRender.bind(this));
            this._introJs.onexit(this._exit.bind(this));
            this._introJs.oncomplete(this._complete.bind(this));
        },

        _fireEvent : function(event) {
            try {
                this._options.events[event].call(this, event);
            } catch (e) {
                console.warn(event + ' handler is undefined');
            }
        },

        _startFromStepNumber : function(stepNo) {
            if(stepNo === 0){
                this._options.isSubMenuEvent = true;
                this._introJs.start();
            } else {
                this._introJs.goToStep(stepNo).start();
            }
            this._renderSubMenu();
        },

        _setOptions : function(options,value) {
            if(options && typeof options == "object")
                this._introJs.setOptions(options);
            else if(typeof options == "string" && value != undefined)
                this._introJs.setOption(options,value);
        },

        _onRender : function(targetElement) {
            var self = this._introJs,
                instance = this;

            this._options.exitDueToGoToMenu = false;
            instance._hideSubMenu();
            $('.callout .introjs-button').each(function(i,btn){
                var $btn = $(btn);
                if($btn.hasClass('introjs-disabled')) $btn.hide();

                if(self._introItems && self._currentStep!==0){
                    if($btn.hasClass('introjs-skipbutton')) $btn.html('').addClass('callout-icon-cross');
                }

            });

            var $skipBtn = $('.introjs-skipbutton'),
                $nextBtn = $('.introjs-nextbutton'),
                $currentStepBtn = $('.callout .introjs-current-step .introjs-button').remove();

            $currentStepBtn = $('<div class="introjs-current-step">'+
                                        '<u>'+
                                            '<a class="introjs-button" step="'+ self._currentStep +'">'+ 
                                                parseInt(self._currentStep+1) +' of '+ parseInt(self._introItems.length) +
                                                '<i class="callout-icon-arrow-down"></i>'+
                                            '</a>'+
                                        '</u>'+
                                    '</div>');

            $('.callout .introjs-tooltipbuttons').after($currentStepBtn);

            $currentStepBtn.on('click', '.introjs-button',function(e){
                e.stopPropagation();
                e.preventDefault();
                instance._toggleGoToStepMenu();
            });

            if(self._introItems && self._introItems.length == self._currentStep+1 ){
                $skipBtn.removeClass('callout-icon-cross');
                $skipBtn.html(this._options.doneLabel).addClass('last');
                $currentStepBtn.show();
            } else{
                $skipBtn.removeClass('last');
                $skipBtn.html('').addClass('callout-icon-cross');
                $currentStepBtn.show();
                $nextBtn.css({display:'block'}).text(this._options.nextLabel);
            }

            $('.callout').off('mousedown click mouseup').on('mousedown click mouseup',function(e){
                e.stopPropagation();
                e.preventDefault();
            });

            this._fireEvent('onafterchange');

        },

        _renderSubMenu : function() {

            var $container = $('.introjs-tooltipReferenceLayer .introjs-tooltip');
            $container.find('.introjs-gotoStep').remove();
            var $subMenu = $('<div class="introjs-gotoStep hide">'+
                                '<div class="introjs-goto-step-container">'+
                                    '<table class="table"><thead></thead><tbody></tbody></table>'+
                                '</div>'+
                            '</div>');


            this._introJs._introItems.forEach(function(item,index){
                if(!item.introShort) throw "introShort should be defined";
                $subMenu.find('tbody').append(''+
                    '<tr index='+ index +'>'+
                            '<td>'+ this._padZero(parseInt(index+1))+'</td>' +
                            '<td>'+item.introShort+'</td>'+
                    '</tr>');

            }.bind(this));


            $container.append($subMenu);

            $subMenu.css({
                top : $('.introjs-tooltip.callout').outerHeight() + 2,
                right : $('.introjs-tooltip.callout').css('right')
            });

            $subMenu.off('click').on('click', 'tr', function(e){
                e.stopPropagation();
                e.preventDefault();
                this._goToStepMenu.call(this,parseInt($(e.target).parents('tr').attr('index')));
            }.bind(this));

            this._$subMenu = $subMenu;
        },

        _hideSubMenu : function() {
            this._$subMenu && this._$subMenu.addClass('hide');
        },

        _toggleGoToStepMenu : function() {
            this._$subMenu.toggleClass('hide');
            this._$subMenu.css({
                top : $('.introjs-tooltip.callout').outerHeight() + 2,
                right : $('.introjs-tooltip.callout').css('right')
            });
            this._$subMenu.find('tr').removeClass('active').eq(this._introJs._currentStep).addClass('active');
        },

        _complete : function() {
            this._fireEvent('complete');
        },

        _goToStepMenu : function(currentStep) {
            this._options.exitDueToGoToMenu = true;
            this._introJs.exit();
            this._startFromStepNumber(currentStep);
        },

        _prepareView : function() {
            var intro = this._introJs;
            try {
                intro._introItems[intro._currentStep].prepareView(intro._introItems[intro._currentStep],intro._direction);
            } catch (e) {
                console.warn('prepare view is undefined for ' + intro._currentStep);
            }
        },

        _exit : function() {
            if(this._options.exitDueToGoToMenu){
                this._options.exitDueToGoToMenu = false;
                return;
            }
            this._fireEvent('exit');
        },

        _padZero : function(num) {
            return num < 10 ? '0' + num : num;
        }

    };

    var callout = function(options){
        return new Callout(options);
    };

    exports.callout = callout;
    return callout;

}));