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

    "use strict";

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

    }

    $.fn.multiStepForm = function (options) {
        var form = this;

        var defaults = {
            activeIndex: 0,
            validate: {}
        };

        var settings = $.extend({}, defaults, options);

        form.content = this.find("." + msfCssClasses.content).first();

        if (form.content.length === 0) {
            throw new Error('Multi-Step Form requires a child element of class \'' + msfCssClasses.content + '\'');
        }

        form.views = $(this.content).find("." + msfCssClasses.view);

        if (form.views.length === 0) {
            throw new Error('Multi-Step Form\'s element of class \'' + msfCssClasses.content + '\' requires n elements of class \'' + msfCssClasses.view + '\'');
        }

        form.header = this.find("." + msfCssClasses.header).first();
        form.steps = [];

        form.navigation = this.find("." + msfCssClasses.navigation).first();

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

                view.init = function () {
                    if (index === settings.activeIndex) {
                        $view.show();
                    }
                };


                $view.on('show', function (e) {
                    if (this !== e.target)
                        return;

                    if (index > 0) {
                        form.backNavButton.show();
                    }

                    if (index == form.views.length - 1) {
                        form.nextNavButton.hide();
                        form.submitNavButton.show();
                    }
                    else {
                        form.submitNavButton.hide();
                        form.nextNavButton.show();

                        $(this).find(':input').keypress(function (e) {
                            if (e.which == 13) // Enter key = keycode 13
                            {
                                form.nextNavButton.click();
                                return false;
                            }
                        });
                    }


                    $.each(form.steps, function (i, element) {
                        if (i < index) {
                            $(element).removeClass(msfCssClasses.stepActive);
                            $(element).addClass(msfCssClasses.stepComplete);
                        }

                        else if (i === index) {
                            $(element).removeClass(msfCssClasses.stepComplete);
                            $(element).addClass(msfCssClasses.stepActive);
                            var currentProgress = Math.round((i / form.steps.length)*100);
                            $(document).trigger('msf:updateProgress', [currentProgress]);    // Trigger an event to notify the progress has changed
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

                    form.backNavButton.hide();
                    form.nextNavButton.hide();
                    form.submitNavButton.hide();
                });

                view.init();
            });

        };

        form.init();

        form.nextNavButton.click(function () {
            //get the view that is currently being displayed
            var view = form.views.filter(function () { return this.style && this.style.display !== '' && this.style.display !== 'none' });

            if (form.validate(settings.validate).subset(view)) {
                var i = form.views.index(view);
                view.hide();
                form.views.eq(i + 1).show();
                form.views.eq(i + 1).find(':input').first().focus();
            }
        });

        form.backNavButton.click(function () {
            //get the view that is currently being displayed
            var view = form.views.filter(function () { return this.style && this.style.display !== '' && this.style.display !== 'none' });

            var i = form.views.index(view);
            view.hide();

            form.views.eq(i - 1).show();
            form.views.eq(i - 1).find(':input').first().focus();
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
