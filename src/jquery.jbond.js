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

    /**
     * Parse DOM tree to create JSON data
     */
    function TreeParser(options) {
        this.options = $.extend({
            namespace: 'rule',
            RuleParser: RuleParser,
        }, options);
        this.guide = new this.options.RuleParser({validate:false});
    }
    TreeParser.prototype.constructor = TreeParser

    TreeParser.prototype.guess = function($el) {
        if ($el.is('[type=number]')) {
            return 'number';
        }
        if ($el.is('table,tbody,ul')) {
            return 'array';
        }
        return 'string';
    }

    TreeParser.prototype.visitNull = function($el, bind) {
        return null;
    }

    TreeParser.prototype.visitBoolean = function($el, bind) {
        if (bind=='default') {
            if ($el.is('input[type=checkbox]')) {
                return $el.is(':checked');
            }
            var val = $.trim($el.text()).toLowerCase();
            return (val == 'true' || val == 't' || 0 < parseInt(val));
        }
        if (bind.match(/^attr=.*/)) {
            return $el.is('[attr]'.replace('attr', bind.substr(5)))
        }
        return null;
    }

    TreeParser.prototype.visitNumber = function($el, bind) {
        if ($el.is('input,select,textarea')) {
            return parseFloat($el.val());
        }
        return parseFloat($el.text());
    }

    TreeParser.prototype.visitString = function($el, bind) {
        if ($el.is('select:has(option),fieldset:has(input[type=radio])')) {
            return $el.children(':checked').val();
        }
        if ($el.is('input,textarea')) {
            return $el.val();
        }
        return $.trim($el.text());
    }

    TreeParser.prototype.visitArray = function($el, bind) {
        if (bind != 'option') {
            throw Error('invariant violation');
        }
        return $el.val();
    }

    TreeParser.prototype.visitObject = function($el, bind) {
        return null;
    }

    TreeParser.prototype.traverse = function($el) {
        var result = null;
        var raw = $el.data(this.options.namespace);
        if (!raw) {
            throw new Error('dom element has to specify data-* attribute');
        }

        var rule = $.extend({type:this.guess($el), bind:'default'}, this.guide.parse(raw));

        switch (rule.type) {
        case 'null': result = this.visitNull($el, rule.bind);  break;
        case 'boolean': result = this.visitBoolean($el, rule.bind);  break;
        case 'number': result = this.visitNumber($el, rule.bind); break;
        case 'string': result = this.visitString($el, rule.bind); break;
        case 'array': {
            if (rule.bind == 'option') {
                result = this.visitArray($el, rule.bind);
            }
            else {
                result = []
                $el.children(':not(:first-child)').each((function(i, item){
                    var $item = $(item);
                    if (!$item.is(':has(*)') || $item.data(this.options.namespace)) {
                        result.push(this.traverse($item));
                    }
                    else {
                        var $el = $item.find('[data-ns]'.replace('ns', this.options.namespace));
                        if ($el.length == 0) {
                            throw Error('invariant violation');
                        }
                        result.push(this.traverse($el.first()));
                    }
                }).bind(this));
            }
            break;
        }
        case 'object': {
            break;
        }
        default: throw Error('invariant violation'); break;
        }

        return result;
    }

    function TreeComposer(options) {
        this.options = $.extend({
            namespace: 'rule'
        }, options);
    }

    return {
        "RuleError": RuleError,
        "RuleParser": RuleParser,
        "TreeParser": TreeParser,
    };
})(jQuery);
