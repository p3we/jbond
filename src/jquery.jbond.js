/**
 */
var jbond = (function($){
    /**
     * Exception throw by RuleParser on parse error
     */
    function RuleError() {
        var err = Error.apply(this, arguments);
        this.name = 'RuleError';
        this.message = err.message;
        this.stack = err.stack;
    };
    RuleError.prototype = Object.create(Error.prototype);
    RuleError.prototype.constructor = RuleError;

    /**
     * Parser of bond rule specification
     *
     * Examples:
     * type:null
     * type:boolean
     * type:number; bind:default|attr=<attr_name>
     * type:string; bind:default|attr=<attr_name>
     * type:array; bind:default|option
     * type:object; properties:id,name,tags; bind:default|attr=<attr1_name>,default,default
     */
    function RuleParser(options) {
        this.options = $.extend({
            validate: true
        }, options);
    }
    RuleParser.prototype = Object.create({
        parse : function(spec) {
            var self = this, parameters = spec.toLowerCase().split(';'), rule = {};
            $.each(parameters, function(i, item){
                if (item.length == 0) {
                    return;
                }
                var param = item.split(':');
                if (param.length != 2) {
                    throw new RuleError('wrong rule parameter format: ' + item);
                }
                var name = param[0].trim(), value = param[1].trim();
                switch(name) {
                    case 'type': rule.type = value; break;
                    case 'properties': rule.properties = self.parseProperties(value); break;
                    case 'bind': rule.bind = self.parseBind(value); break;
                    default: {
                        if (name.length) {
                            throw RuleError('unknown rule parameter: ' + name);
                        }
                        break;
                    }
                }
            });
            this.validate(rule);
            return rule;
        },

        parseBind: function(spec) {
            var self = this, parameters = spec.split(','), bindings = [];
            $.each(parameters, function(i, item){
                var param = item.trim();
                if (!param.length) {
                    return;
                }
                bindings.push(param);
            });
            if (!bindings.length) {
                throw new RuleError('bind list is empty');
            }
            else if (bindings.length==1) {
                return bindings[0];
            }
            else {
                return bindings;
            }
        },

        parseProperties: function(spec) {
            var self = this, parameters = spec.split(','), properties = [];
            $.each(parameters, function(i, item){
                var property = item.trim();
                if (property.length>0) {
                    properties.push(property);
                }
            });
            if (!properties.length) {
                throw new RuleError('properties list is empty');
            }
            return properties;
        },

        validate: function(rule) {
            if (!this.options.validate) {
                return;
            }
            if (!rule.type.match(/^(null|boolean|number|string|array|object)$/)) {
                throw new RuleError('unknow type: ' + rule.type);
            }
            if (rule.bind) {
                var re = /^(default|attr=[a-z]+[a-z0-9_]*|option)$/;
                $.each($.isArray(rule.bind) ? rule.bind : [rule.bind], function(i, bind) {
                    if (!bind.match(re)) {
                        throw new RuleError('wrong bind method ' + bind);
                    }
                });
            }
            if (rule.type == 'array' && rule.bind) {
                var re = /^(default|option)$/;
                if ($.isArray(rule.bind) || !rule.bind.match(re)) {
                    throw new RuleError('bind method not allowed');
                }
            }
            if (rule.type == 'object') {
                if (!rule.properties) {
                    throw new RuleError('missing parameter "properties" is required for type object');
                }
                else {
                    var re = /^[a-z][a-z0-9_\-]*$/;
                    $.each(rule.properties, function(i, property) {
                        if (!property.match(re)) {
                            throw new RuleError('wrong object property name: ' + property);
                        }
                    });
                }
                if ($.isArray(rule.bind) && (rule.properties.length != rule.bind.length)) {
                    throw new RuleError('wrong number of bind methods for provided amount of properties');
                }
            }
            else if ($.isArray(rule.bind)) {
                throw new RuleError('expected only one bind method');
            }
        }
    });
    RuleParser.prototype.constructor = RuleParser;

    return {
        "RuleError": RuleError,
        "RuleParser": RuleParser,
    };
})(jQuery);
