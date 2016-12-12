# Multi-Step-Form-Js
Multi Step Form with jQuery validation

## Download

You can install `multi-step-form-js` through `npm`.

```
npm install multi-step-form-js
```


The multi-step-form-js package requires:<br>
    1. an *msf-content* element with 1 to N *msf-view* elements<br>
and uses optional:<br>
    1. an *msf-header* element with N required *msf-step* elements<br>
    2. an *msf-navigation* element with *msf-nav-button* buttons; if buttons are not defined they will be generated <br>


Example Html element with multi-step-from (msf) classes.  

```html
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
</div>
```

Example JavaScript multi-step-form initialization

```javascript
 $(".msf:first").multiStepForm();
```


## Release History
* 0.0.1 Initial Release
