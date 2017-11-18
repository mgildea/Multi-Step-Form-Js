# Multi-Step-Form-Js
**Multi Step Form with jQuery validation**

* utilizes jquery validation (with or without jquery unobtrusive validation) to validate the form at each step.
* contains customizable header step classes to distinguish between active, complete, and incomplete steps.
* triggers custom change events with relevant step data for custom processing (e.g. updating progress bars)
* provides configuration for navigating steps by clicking headers
* provides configuration for allowing navigating through steps with unvalidated form elements

## Download

You can install `multi-step-form-js` through `npm`.

```
npm install multi-step-form-js
```

## Demo

The following demo contains examples for listening to the 'msf:viewChanged' event to update a progress bar as well as defined header step classes to distinguish the current and completed steps and click navigation.<br><br>
View a [jsfiddle here](https://jsfiddle.net/mgildea/xmnftakx/)



## Setup

The multi-step-form-js package requires:<br>
    1. use of [jQuery](https://jquery.com/) and [jQuery Validation](https://jqueryvalidation.org/)<br>
    2. an *.msf-content* html element with 1 to N *.msf-view* html elements<br><br>
and uses optional:<br>
    1. [jQuery Unobtrusive Validation](https://github.com/aspnet/jquery-validation-unobtrusive)<br>
    2. an *.msf-header* element with N required *.msf-step* elements<br>
    3. an *.msf-navigation* element with *.msf-nav-button* buttons; if buttons are not defined they will be generated <br>



Example Html element with multi-step-form (msf) classes.  <br>
As progress is made through each step the 'msf-step-active' and 'msf-step-complete' classes will be added to the element of 'msf-step' class adn the 'msf:viewChanged' event is triggered.

```html
<head>
     <link rel="stylesheet" href="/node_modules/multi-step-form-js/css/multi-step-form.css" type="text/css">
</head>

...

<form class="msf">
    <div class="msf-header">
        <div class="row text-center">
            <div class="msf-step col-md-4"><i class="fa fa-clipboard"></i> <span>Step 1</span></div>
            <div class="msf-step col-md-4"><i class="fa fa-credit-card"></i><span>Step 2</span></div>
            <div class="msf-step col-md-4"><i class="fa fa-check"></i> <span>Step 3</span></div>
        </div>
    </div>

    <div class="msf-content">
        <div class="msf-view">
            ...
        </div>
        <div class="msf-view">
            ...
        </div>
        <div class="msf-view">
            ...
        </div>
    </div>

    <div class="msf-navigation">
        <div class="row">
            <div class="col-md-3">
                <button type="button" data-type="back" class="btn btn-outline-dark msf-nav-button"><i class="fa fa-chevron-left"></i> Back </button>
            </div>
            <div class="col-md-3 col-md-offset-6">
                <button type="button" data-type="next" class="btn  btn-outline-dark msf-nav-button">Next <i class="fa fa-chevron-right"></i></button>
                <button type="submit" data-type="submit" class="btn btn-outline-dark msf-nav-button">Submit</button>
            </div>
        </div>
    </div>
</form>
```

## Initialize

Requires jQuery and jQuery Validation

```html
<script src=".../path/to/jquery/jquery.min.js"></script>
<script src=".../path/to/jquery/validation/jquery.validate.min.js"></script>
```
can optionally use jQuery Unobtrusive Validation

```html
<script src=".../path/to/jquery/unobtrusive/validation/jquery.validate.unobtrusive.min.js"></script>
```

include mulit-step-form.js

```html
<script src="../path/to/multi-step-form-js/multi-step-form.js"></script>
```

Example Multi-Step-Form-Js initialization with options<br>
*activeIndex* - index of step to initially display, default : 0<br>
*allowClickNavigation* - allows ability to click steps in header to advance form, default : false<br>
*allowUnvalidatedStep* - allows ability to advance in form without passing validation, default : false<br>
*hideBackButton* - boolean value indicating if back button should be visible after the first step, default : false<br>
*validate* - [jQuery Validation options object](https://jqueryvalidation.org/validate/), default :  {}<br>


```html

<script type="text/javascript">
    $(".msf:first").multiStepForm({
        activeIndex : 0,
        allowClickNavigation : true,    
        allowUnvalidatedStep : false,    
        hideBackButton : false,
        validate: {
            rules : {
                name : "required",
                email : {
                    required : true,
                    email : true
                    }
                }
            }
        });
</script>
```



Example Multi-Step-Form-Js initialization using unobtrusive validation

```html
<script type="text/javascript">
    $(".msf:first").multiStepForm();
</script>
```



Example jquery event listener to update some progress bar with object parameter containing properties: 'currentIndex', 'previousIndex', and 'totalSteps' 


```html
<script type="text/javascript">
    $(document).on("msf:viewChanged", function(event, data){
        var progress = Math.round((data.currentIndex / data.totalSteps)*100);
        $(".progress-bar").css("width", progress + "%").attr('aria-valuenow', progress);
    });

</script>
```


## Release History
* 0.1.0 return form object, fix bugs in hidden view validation
* 0.0.13 remove default parameter values in js functions
* 0.0.12 configs to allow for advancing views without completed validations, click navigation in header, fixed ability to initialize start index
* 0.0.11 hide all views upon initialization before showing first view
* 0.0.10 provide option to not display back button in subsequent steps
* 0.0.9 trigger 'msf:viewChanged' event when displaying a new view
* 0.0.8 block form submit on enter if nonfinal view
* 0.0.6 documentation updates
* 0.0.4 allow parameters for non unobtrusive validation
* 0.0.1 Initial Release
