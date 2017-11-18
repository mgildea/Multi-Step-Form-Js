(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD is used - Register as an anonymous module.
        define(['jquery', 'jquery-validation'], factory);
    }
    else if (typeof exports === 'object') {
        factory(require('jquery'), require('jquery-validation'));
    }
    else {
        // Neither AMD nor CommonJS used. Use global variables.
        if (typeof jQuery === 'undefined') {
            throw 'multi-step-form-js requires jQuery to be loaded first';
        }
        if (typeof jQuery.validator === 'undefined') {
            throw 'multi-step-form-js requires requires jquery.validation.js to be loaded first';
        }
        factory(jQuery);
    }
}(function($) {
    'use strict';

    const msfCssClasses = {
        header: "msf-header",
        step: "msf-step",
        statuses: {
            stepComplete: "msf-step-complete",
            stepIncomplete: "msf-step-incomplete",
            stepActive: "msf-step-active"
        },
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

    const msfJqueryData = {
        validated: "msf-validated",
        visited: "msf-visited"
    };

    const msfEventTypes = {
        viewChanged: "msf:viewChanged"
    };

    $.fn.multiStepForm = function(options) {
        var form = this;

        var defaults = {
            activeIndex: 0,
            validate: {},
            hideBackButton: false,
            allowUnvalidatedStep: false,
            allowClickNavigation: false
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
        //form.completedSteps = 0;

        form.getActiveView = function() {
            return form.views.filter(function() {
                return this.style && this.style.display !== '' && this.style.display !== 'none'
            });
        };

        form.setActiveView = function(index) {
            var previousView = form.getActiveView()[0];
            var previousIndex = form.views.index(previousView);

            $(previousView).hide();
            //if(previousView)
            //    previousView.hide();

            var view = form.views.eq(index);
            view.show();
            view.find(':input').first().focus();

            var completedSteps = 0;
            $.each(form.views, function(index, view) {
                if ($.data(view, msfJqueryData.validated)) {
                    completedSteps++;
                }
            });

            //trigger the 'view has changed' event
            form.trigger(msfEventTypes.viewChanged, {
                currentIndex: index,
                previousIndex: previousIndex,
                totalSteps: form.steps.length,
                completedSteps: completedSteps
            });
        }

        form.setStatusCssClass = function(step, cssClass) {
            $(step).removeClass(msfCssClasses.statuses.stepComplete);
            $(step).removeClass(msfCssClasses.statuses.stepIncomplete);

            $(step).addClass(cssClass);
        }

        form.tryNavigateToView = function(currentIndex, targetIndex) {
            if (targetIndex <= currentIndex) {

                form.validateView(form.views[currentIndex]);

                if(!settings.hideBackButton)
                    form.setActiveView(targetIndex);
                return;
            }

            if (!form.validateViews(currentIndex, targetIndex - currentIndex, function(i) {
                    if (!settings.allowUnvalidatedStep) {
                        form.setActiveView(i);
                        return false;
                    }

                    return true;
                })) {
                if (!settings.allowUnvalidatedStep) {
                    return;
                }
            }
            form.setActiveView(targetIndex);
        }

        form.init = function() {

            this.initHeader = function() {
                if (form.header.length === 0) {
                    form.header = $("<div/>", {
                        "class": msfCssClasses.header,
                        "display": "none"
                    });

                    $(form).prepend(form.header);
                }

                form.steps = $(form.header).find("." + msfCssClasses.step);

                this.initStep = function(index, view) {

                    //append steps to header if they do not exist
                    if (form.steps.length < index + 1) {
                        $(form.header).append($("<div/>", {
                            "class": msfCssClasses.step,
                            "display": "none"
                        }));
                    }

                    if (settings.allowClickNavigation) {
                        //bind the click event to the header step
                        $(form.steps[index]).click(function(e) {
                            var view = form.getActiveView()[0];
                            var currentIndex = form.views.index(view);
                            var targetIndex = form.steps.index($(e.target).closest("." + msfCssClasses.step)[0]);

                            form.tryNavigateToView(currentIndex, targetIndex);
                        });
                    }
                }

                $.each(form.views, this.initStep);

                form.steps = $(form.header).find("." + msfCssClasses.step);
            };


            this.initNavigation = function() {

                if (form.navigation.length === 0) {
                    form.navigation = $("<div/>", {
                        "class": msfCssClasses.navigation
                    });

                    $(form.content).after(form.navigation);
                }

                this.initNavButton = function(type) {
                    var element = this.navigation.find("button[data-type='" + type + "'], input[type='button']"),
                        type;
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

            this.views.each(function(index, view) {

                $.data(view, msfJqueryData.validated, false);
                $.data(view, msfJqueryData.visited, false);

                //if this is not the last view do not allow the enter key to submit the form as it is not completed yet                  
                if (index !== form.views.length - 1) {
                    $(view).find(':input').not('textarea').keypress(function(e) {
                        if (e.which === 13) // Enter key = keycode 13
                        {
                            form.nextNavButton.click();
                            return false;
                        }
                    });
                }

                $(view).on('show', function(e) {
                    if (this !== e.target)
                        return;

                    var view = e.target;
                    $.data(view, msfJqueryData.visited, true);

                    var index = form.views.index(view);
                    var step = form.steps[index];

                    $(step).addClass(msfCssClasses.statuses.stepActive);
                    //form.setStatusCssClass(step, msfCssClasses.statuses.stepActive);

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
                    }
                });

                $(view).on('hide', function(e) {
                    if (this !== e.target)
                        return;

                    var index = form.views.index(e.target);
                    var step = form.steps[index];

                    $(step).removeClass(msfCssClasses.statuses.stepActive);

                    if ($.data(e.target, msfJqueryData.validated) && $.data(e.target, msfJqueryData.visited)) {
                        form.setStatusCssClass(step, msfCssClasses.statuses.stepComplete);
                    }
                    else if ($.data(e.target, msfJqueryData.visited)) {
                        form.setStatusCssClass(step, msfCssClasses.statuses.stepIncomplete);
                    }
                    else {
                        form.setStatusCssClass(step, "");
                    }

                    //hide all navigation buttons, display choices will be set on show event
                    form.backNavButton.hide();
                    form.nextNavButton.hide();
                    form.submitNavButton.hide();
                });

                //initially hide each view
                $(view).hide();
            });


            if (settings.activeIndex > 0) {
                $(form).ready(function() {
                    form.tryNavigateToView(0, settings.activeIndex);
                });
            }
            else {
                form.setActiveView(0);
            }

        };

        form.validateView = function(view) {
            var index = form.views.index(view);

            if (form.validate().subset(view)) {
                $.data(view, msfJqueryData.validated, true);
                form.setStatusCssClass(form.steps[index], msfCssClasses.statuses.stepComplete);
                return true;
            }
            else {
                $.data(view, msfJqueryData.validated, false);
                form.setStatusCssClass(form.steps[index], msfCssClasses.statuses.stepIncomplete);
                return false;
            }
        };

        form.validateViews = function(currentIndex, length, invalid) {
            currentIndex = typeof currentIndex === 'undefined' ? 0 : currentIndex;
            length = typeof length === 'undefined' ? form.views.length : length;


            var validationIgnore = ""; // Saving the existing validator ignore settings to reset them after validating multi-step form
            var isValid = true;

            //remember original validation setings for ignores
            if ($(form).data("validator")) {
                var formValidatorSettings = $(form).data("validator").settings;
                validationIgnore = formValidatorSettings.ignore;

                var currentValidationIgnoreSettingsArray = validationIgnore.split(",");
                if (currentValidationIgnoreSettingsArray.length >= 1) {
                    // Remove the ":hidden" selector from validator ignore settings as we want our hidden fieldsets/steps to be validated before final submit
                    var hiddenIndex = $.inArray(":hidden", currentValidationIgnoreSettingsArray);
                    currentValidationIgnoreSettingsArray.splice(hiddenIndex, 1);
                    $(form).data("validator").settings.ignore = currentValidationIgnoreSettingsArray.toString();
                }
            }

            for (var i = currentIndex; i < currentIndex + length; i++) {
                if (!form.validateView(form.views[i])) {
                    isValid = false;

                    if (!invalid(i)) {
                        break;
                    }
                }
            }

            if ($(form).data("validator")) {
                $(form).data("validator").settings.ignore = validationIgnore;
            }

            return isValid;
        }

        form.init();

        form.nextNavButton.click(function() {
            var view = form.getActiveView()[0];
            var index = form.views.index(view);

            if (form.validateView(view)) {
                form.setActiveView(index + 1);
            }
            else if (settings.allowUnvalidatedStep) {
                form.setActiveView(index + 1);
            }
        });

        form.backNavButton.click(function() {
            var view = form.getActiveView()[0];
            var index = form.views.index(view);

            form.validateView(view);

            form.setActiveView(index - 1);
        });

        form.submit(function(e) {
            var validationIgnore = "";

            form.validateViews(0, form.views.length, function() {
                e.preventDefault();
                return true;
            });
        });
        return form;
    };

    $.validator.prototype.subset = function(container) {
        var ok = true;
        var self = this;
        $(container).find(':input').each(function() {
            if (!self.element($(this))) ok = false;
        });
        return ok;
    };

    $.each(['show', 'hide'], function(i, ev) {
        var el = $.fn[ev];
        $.fn[ev] = function() {
            this.trigger(ev);
            return el.apply(this, arguments);
        };
    });
}));
