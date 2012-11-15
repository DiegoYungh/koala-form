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
            validation: [],
            submitHandler: 'input[type=submit]',
            debug: false
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;
        this.$el = $(this.element)
        this.options = $.extend( {}, defaults, options) ;
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    // Console.log linked to debug...
    Plugin.prototype.log = function(message){
        if(this.options.debug){
            console.log(message);}
    };

    // Validation methods
    Plugin.prototype.validate_rule = function(rule, field){

        var field,
            inputData = field.val(),
            valid = true;

        for(var ruleName in rule){
            var method = 'rule_' + ruleName;
            //TODO: should I prepare the input value here before the methods or inside them ? ... idk yet
            if(Plugin.prototype[method]){
                valid &= this[method](inputData, rule[ruleName]);}}

        // finally
        return valid;
    };
    Plugin.prototype.validate_rules = function(ruleList){
        /*lists*/
        var failedRules = []; //TODO: redundant? I could just mark the isValid property of a rule... what is better?
        var valid = true;
        /**/
        for(var index in ruleList){
            /*Necessary declarations?*/
            //I think there should be a better way to treat the jquery field element...
            // maybe create a fieldList on the Plugin ? this.fields[rule.field]
            // I think anything is better than this.$el.find... optimizations please...
            var rule = ruleList[index];
            var field = this.$el.find(rule.fieldSelector);
            // TODO: how about some kind of flag, to see if the field has changed, this way not redundantly revalidating it
            var valid = this.validate_rule(rule, field);
            /*Execute validation and callbacks to change fields...*/
            //TODO: any better way to call these field modifiers ?
            if(!valid){
                failedRules.push(rule);
                this.field_fail(field, rule.message);}
            else if(valid){
                this.field_pass(field);}}
        /*finally...*/
        return failedRules;
    };
    //TODO: field_fail/pass/success could accept callbacks so developers may create functions and pass instead of developing here...
    Plugin.prototype.field_fail = function(field, message){
        //There is another way... wrapping all three elements inside a div.error just choose a way...
        //TODO: verify if the field was wrong and continue wrong ? this way shouldn't need to process it again
        //add classes...
        field.prev().addClass('error');
        field.addClass('error');
        if(field.next()[0].tagName != 'SMALL')
            field.after('<small class="error">' + message + '</small>');
    };
    Plugin.prototype.field_pass = function(field){
        //remove classes
        field.prev().removeClass('error');
        field.removeClass('error');
        //remove the small comment...
        if(field.next()[0].tagName == 'SMALL')
            field.next().remove();
    };

    // Rules methods
    Plugin.prototype.rule_required = function(value){
        this.log("Executing required method with value " + value);
        //TODO: complete the verification of null/undefined/zero-length and any kind of empty check
        return value.length > 0;
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

    // Default validaton callbacks
    Plugin.prototype.onSuccess = function(){
        this.log('On success triggered!');
        this.element.submit(); //normally we should submit the form :)
    };
    Plugin.prototype.onFail = function(failedInputs){
        /*If something went wrong we receive a list of failed inputs with both our input and the rule object associated */
        for(var key in failedInputs){
            var rule = failedInputs[key];
            var input = this.$el.find(rule.field);
        }
     };

    // Default Validation Triggers
    // TODO: add/remove triggers on-the-fly ?
    // If then I should add 2 methods, registerTrigger and remove/unregister it, this way you can change your
    // validation mode on-the-fly...
    Plugin.prototype.trigger_submit = function(self){
        // Submit handler...
        this.$el.on('submit', function(e){
            // prevent the submit or link...
            e.preventDefault();
            // list of fields that failed on the rules
            var failedList = self.validate_rules(self.options.validation);
            // route you to the correct function... or callback?
            if(failedList.length > 0){
                self.onFail(failedList);}
            else{
                self.onSuccess();}
        });
    };
    Plugin.prototype.trigger_focus = function(self){
        // On loose focus handler
        this.$el.find('input').on('blur', function(e){
            var input = $(this);
            var inputName = input.attr('name');
            var rules = $.grep(self.options.validation, function(item){
                return item.fieldName == inputName;
            });
            // if we found something...
            if(rules.length > 0){
                self.validate_rules(rules);}
        });
    };
    Plugin.prototype.trigger_live = function(self) {
        // Keypress trigger or live trigger
        this.$el.find('input').on('keyup', function (e) {
            var input = $(this);
            var inputName = input.attr('name');
            var rules = $.grep(self.options.validation, function (item) {
                return item.fieldName == inputName;
            });
            // if we found something...
            if (rules.length > 0) {
                self.validate_rules(rules);
            }
        });
    };

    // Start
    Plugin.prototype.init = function () {
        //Don't loose self consciousness
        var self = this;

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
