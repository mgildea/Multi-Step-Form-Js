(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD is used - Register as an anonymous module.
        define(['jquery', 'jquery-validation'], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'), require('jquery-validation'));
    } else {
        // Neither AMD nor CommonJS used. Use global variables.
        if (typeof jQuery === 'undefined') {
            throw 'multi-step-form-js requires jQuery to be loaded first';
        }
        if (typeof jQuery.validator === 'undefined') {
            throw 'multi-step-form-js requires requires jquery.validation.js to be loaded first';
        }
        factory(jQuery);
    }
}(function ($) {
    'use strict';

    const msfCssClasses = {
        header: "msf-header",
        step: "msf-step",
        stepComplete: "msf-step-complete",
        stepActive: "msf-step-active",
        content: "msf-content",
        view: "msf-view",
        navigation: "msf-navigation",
        navButton: "msf-nav-button"
    };

    const msfNavTypes = {
        back: "back",
        next: "next",
        submit: "submit"

    };

    const msfEventTypes = {
        viewChanged : "msf:viewChanged"
    };

    $.fn.multiStepForm = function (options) {
        var form = this;

        var defaults = {
            activeIndex: 0,
            validate: {},
            hideBackButton: false
        };

        var settings = $.extend({}, defaults, options);

        //find the msf-content object
        form.content = this.find("." + msfCssClasses.content).first();

        if (form.content.length === 0) {
            throw new Error('Multi-Step Form requires a child element of class \'' + msfCssClasses.content + '\'');
        }

        //find the msf-views within the content object
        form.views = $(this.content).find("." + msfCssClasses.view);

        if (form.views.length === 0) {
            throw new Error('Multi-Step Form\'s element of class \'' + msfCssClasses.content + '\' requires n elements of class \'' + msfCssClasses.view + '\'');
        }

        form.header = this.find("." + msfCssClasses.header).first();
        form.navigation = this.find("." + msfCssClasses.navigation).first();
        form.steps = [];

        form.getActiveView = function() {
            return form.views.filter(function () { return this.style && this.style.display !== '' && this.style.display !== 'none' });
        };

        form.setActiveView = function(index) {
            var view = form.getActiveView();
            var previousIndex = form.views.index(view);

            view = form.views.eq(index);
            view.show();
            view.find(':input').first().focus();

            //trigger the 'view has changed' event
            form.trigger(msfEventTypes.viewChanged, {
                currentIndex : index, 
                previousIndex : previousIndex,
                totalSteps : form.steps.length
            });    
        }

        form.init = function () {

            this.initHeader = function () {
                if (form.header.length === 0) {
                    form.header = $("<div/>", {
                        "class": msfCssClasses.header,
                        "display": "none"
                    });

                    $(form).prepend(form.header);
                }

                form.steps = $(form.header).find("." + msfCssClasses.step);

                this.initStep = function (index, view) {

                    if (form.steps.length < index + 1) {
                        $(form.header).append($("<div/>", {
                            "class": msfCssClasses.step,
                            "display": "none"
                        }));
                    }
                }

                $.each(form.views, this.initStep);

                form.steps = $(form.header).find("." + msfCssClasses.step);
            };


            this.initNavigation = function () {

                if (form.navigation.length === 0) {
                    form.navigation = $("<div/>", {
                        "class": msfCssClasses.navigation
                    });

                    $(form.content).after(form.navigation);
                }

                this.initNavButton = function (type) {
                    var element = this.navigation.find("button[data-type='" + type + "'], input[type='button']"), type;
                    if (element.length === 0) {
                        element = $("<button/>", {
                            "class": msfCssClasses.navButton,
                            "data-type": type,
                            "html": type
                        });
                        element.appendTo(form.navigation);
                    }

                    return element;
                };

                form.backNavButton = this.initNavButton(msfNavTypes.back);
                form.nextNavButton = this.initNavButton(msfNavTypes.next);
                form.submitNavButton = this.initNavButton(msfNavTypes.submit);
            };


            this.initHeader();
            this.initNavigation();

            this.views.each(function (index, element) {

                var view = element,
                    $view = $(element);

                $view.on('show', function (e) {
                    if (this !== e.target)
                        return;

                    //hide whichever view is currently showing
                    form.getActiveView().hide();
              
                    //choose which navigation buttons should be displayed based on index of view 
                    if (index > 0 && !settings.hideBackButton) {
                        form.backNavButton.show();
                    }

                    if (index == form.views.length - 1) {
                        form.nextNavButton.hide();
                        form.submitNavButton.show();
                    }
                    else {
                        form.submitNavButton.hide();
                        form.nextNavButton.show();

                        //if this is not the last view do not allow the enter key to submit the form as it is not completed yet
                        $(this).find(':input').keypress(function (e) {
                            if (e.which == 13) // Enter key = keycode 13
                            {
                                form.nextNavButton.click();
                                return false;
                            }
                        });
                    }

                    //determine if each step is completed or active based in index
                    $.each(form.steps, function (i, element) {
                        if (i < index) {
                            $(element).removeClass(msfCssClasses.stepActive);
                            $(element).addClass(msfCssClasses.stepComplete);
                        }

                        else if (i === index) {
                            $(element).removeClass(msfCssClasses.stepComplete);
                            $(element).addClass(msfCssClasses.stepActive);
                        }
                        else {
                            $(element).removeClass(msfCssClasses.stepComplete);
                            $(element).removeClass(msfCssClasses.stepActive);
                        }
                    });
                });

                $view.on('hide', function (e) {
                    if (this !== e.target)
                        return;

                    //hide all navigation buttons, display choices will be set on show event
                    form.backNavButton.hide();
                    form.nextNavButton.hide();
                    form.submitNavButton.hide();
                });
                      
                //initially hide each view
                $view.hide();
            });

            form.setActiveView(settings.activeIndex);
        };

        form.init();

        form.nextNavButton.click(function () {
            var view = form.getActiveView();

            //validate the input in the current view
            if (form.validate(settings.validate).subset(view)) {
                var i = form.views.index(view);

                form.setActiveView(i+1);
            }
        });

        form.backNavButton.click(function () {
            var view = form.getActiveView();
            var i = form.views.index(view);
            
            form.setActiveView(i-1);
        });

    };

    $.validator.prototype.subset = function (container) {
        var ok = true;
        var self = this;
        $(container).find(':input').each(function () {
            if (!self.element($(this))) ok = false;
        });
        return ok;
    };

    $.each(['show', 'hide'], function (i, ev) {
        var el = $.fn[ev];
        $.fn[ev] = function () {
            this.trigger(ev);
            return el.apply(this, arguments);
        };
    });
}));
