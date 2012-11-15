/*
 *  Project: Koala's Hut
 *  Description: Yet another jquery form validator
 *  Author: Diego Yungh
 *  License: MIT - http://www.opensource.org/licenses/mit-license.php
 *  Using: Jquery Plugin Boilerplate
 */

;(function ( $, window, undefined ) {

    // Defaults
    var pluginName = 'Manage',
        document = window.document,
        defaults = {
            triggers: ['live', 'submit'],
            rules: [],
            submitHandler: 'input[type=submit]',
            debug: false
        },
        fieldDefaults = {
            required: true,
            type: 'input',
            message: 'Error!'
        }

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;
        this.$el = $(this.element)
        this.options = $.extend( {}, defaults, options) ;
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    // Custom id generation, thanks internet
    function getID()
    {
        var S4 = function (){
            return Math.floor(
                Math.random() * 0x10000 /* 65536 */
            ).toString(16);};

        return (
            S4() + S4() + "-" +
                S4() + "-" +
                S4() + "-" +
                S4() + "-" +
                S4() + S4() + S4());
    }

    // Console.log linked to debug...
    Plugin.prototype.log = function(message){
        if(this.options.debug){
            console.log(message);}
    };

    // Get a field by the ID
    Plugin.prototype.getField = function(uid){
        var self = this;
        var field = null;
        $.each(this.options.rules, function(index, rule){
            if(rule.field.form_id == uid)
                field = rule.field;
        });
        return field;
    };

    // Get the value we want to validate by field type
    Plugin.prototype.get_input = function(field){
        // Logic to get data from input fields
        return field.val();
    };
    Plugin.prototype.get_options = function(field){
        // Logic to get data from radio groups
        var fields = [];
        // Map all fields to {checekd: bool, value: value}
        $.each(field, function(index, val){
            var val = $(val);
            fields.push({
                checked: val.is(':checked'),
                value: val.val()
            });
        });
        return fields;
    };
    Plugin.prototype.get_checklist = function(field){
        // Logic to get data from checklists
        var fields = [];
        // Map all fields to {checekd: bool, value: value}
        $.each(field, function(index, val){
            fields.push({
                checked: val.is(':checked'),
                value: val.val()
            });
        });
        return fields;
    };
    Plugin.prototype.get_checkbox = function(field){
        // Logic to get data from a single checkbox
        return {checked: field.is(':checked'), value: field.val()};
    };
    Plugin.prototype.get_select = function(field){
        // Logic to get data from select/combos
        return field.val();
    };

    // Validation methods
    Plugin.prototype.validate_rule = function(field){
        // Vars
        var rule = field.rule,
            valid = true;
        // Input value
        var methodName = 'get_' + rule.type,
            inputValue = this[methodName](field);
        // Apply rule
        for(var ruleName in rule){
            var method = 'rule_' + ruleName;
            if(Plugin.prototype[method] && rule.required){
                valid &= this[method](inputValue, rule[ruleName], field);}}
        // Finally
        return valid;
    };
    Plugin.prototype.validate_rules = function(ruleList){
        /*lists*/
        var failedRules = []; //TODO: redundant? I could just mark the isValid property of a rule... what is better?
        var valid = true;
        // Iterate over rules
        for(var index in ruleList){
            // Vars
            var rule = ruleList[index];
            var field = rule.field;
            // TODO: how about some kind of flag, to see if the field has changed, this way not redundantly revalidating it
            // Validate...
            var valid = this.validate_rule(field);
            //TODO: any better way to call these field modifiers ? maibe as callbacks
            if(!valid){
                failedRules.push(rule);
                this.field_fail(field);}
            else if(valid){
                this.field_pass(field);}}
        /*finally...*/
        return failedRules;
    };

    // Rules methods
    Plugin.prototype.rule_empty = function(value, empty){
        this.log("Executing empty method with value " + value);
        //TODO: complete the verification of null/undefined/zero-length and any kind of empty check
        if(!empty)
            return (value.length > 0);
        else if(empty)
            return true;
    };
    Plugin.prototype.rule_minLength = function(value, min){
        this.log("Executing minLength method with value " + value + " and reference of " + min);
        return value.length >= min;
    };
    Plugin.prototype.rule_maxLength = function(value, max){
        this.log("Executing maxLength method with value " + value + " and reference of " + max);
        return value.length <= max;
    };
    Plugin.prototype.rule_pattern = function(value, pattern){
        this.log("Executing pattern method with value " + value + " and reference of " + pattern);
        var matches = value.match(pattern);
        this.log(matches);
        return matches? (matches.length > 0): false;
    };

    // Trigger methods
    // TODO: add/remove triggers on-the-fly ?
    // If then I should add 2 methods, registerTrigger and remove/unregister it, this way you can change your
    // validation mode on-the-fly...
    function validateHandler($this, self){
        // Validate
        var ID = $this.data('form_id'),
            field = self.getField(ID),
            valid = self.validate_rule(field);
        // Apply on fields
        if(!valid){
            self.field_fail(field);}
        else if(valid){
            self.field_pass(field);}
    }
    Plugin.prototype.trigger_submit = function(self){
        // Submit handler...
        this.$el.on('submit', function(e){
            // prevent the submit or link...
            e.preventDefault();
            // list of fields that failed on the rules
            var failedList = self.validate_rules(self.options.rules);
            // route you to the correct function... or callback?
            if(failedList.length > 0){
                self.onFail(failedList);}
            else{
                self.onSuccess();}
        });
    };
    Plugin.prototype.trigger_focus = function(self){
        // On loose focus handler
        for(var key in self.options.rules){
            // Vars
            var rule = self.options.rules[key];
            var field = rule.field;
            //
            field.on('blur', function(e){validateHandler($(this), self);});
        }
    };
    Plugin.prototype.trigger_live = function(self) {
        // Keypress trigger or live trigger
        for(var key in self.options.rules){
            // Vars
            var rule = self.options.rules[key];
            var field = rule.field;
            //
            field.on('keyup', function(e){validateHandler($(this), self);});
        }
    };

    // Start
    Plugin.prototype.init = function () {
        //Don't loose self consciousness
        var self = this;

        // Populate Fields
        for(var key in this.options.rules){
            // Apply defaults for field...
            this.options.rules[key] = $.extend({}, fieldDefaults, this.options.rules[key]);
            //
            var rule = this.options.rules[key];
            // Preload the JQuery object of the field
            this.options.rules[key]['field'] = $(rule.fieldSelector);
            // Test recursive reference
            var ID = getID();
            this.options.rules[key]['field'].data('form_id', ID);
            this.options.rules[key]['field'].form_id = ID;
            this.options.rules[key]['field'].rule = rule;
        }

        // Prepare triggers
        for(var key in this.options.triggers){
            var triggerName = this.options.triggers[key];
            var method = 'trigger_' + triggerName;
            // Call it if exists
            if(Plugin.prototype[method]){
                this[method](this);}
        }

        // Prepare something else...

    };

    // Future Callbacks
    //TODO: field_fail/pass/success could accept callbacks so developers may create functions and pass instead of developing here...
    Plugin.prototype.field_fail = function(field){
        // There is another way... wrapping all three elements inside a div.error just choose a way...
        // TODO: verify if the field was wrong and continue wrong ? this way shouldn't need to process it again
        // add classes...
        field.prev().addClass('error');
        field.addClass('error');
        var nextElement = field.next()[0];
        if(nextElement && nextElement.tagName != 'SMALL'){
            var message = field.rule.message;
            field.after('<small class="error">' + message + '</small>');}
    };
    Plugin.prototype.field_pass = function(field){
        //remove classes
        field.prev().removeClass('error');
        field.removeClass('error');
        //remove the small comment...
        var nextElement = field.next()[0];
        if(nextElement && nextElement.tagName == 'SMALL')
            field.next().remove();
    };
    // Default validation callbacks
    Plugin.prototype.onSuccess = function(){
        this.log('On success triggered!');
        this.element.submit(); //normally we should submit the form :)
    };
    Plugin.prototype.onFail = function(failedInputs){
        /*If something went wrong we receive a list of failed inputs with both our input and the rule object associated */
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
            }
        });
    };

}(jQuery, window));
