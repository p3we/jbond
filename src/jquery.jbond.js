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
     * type:boolean; bind:[default|attr=<attr_name>]
     * type:number; bind:[default|attr=<attr_name>]
     * type:string; bind:[default|attr=<attr_name>]
     * type:array; bind:[default|options]; (?items:<type>)
     * type:object; properties:id(?=<type>),name,tags; bind:[default|content]
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
                    case 'items': rule.items = {'type': value}; break;
                    case 'properties': rule.properties = self.parseProperties(value); break;
                    case 'bind': rule['$bind'] = value; break;
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

        parseProperties: function(spec) {
            var self = this, parameters = spec.split(','), index = 0, properties = {};
            $.each(parameters, function(i, item){
                var property = item.trim();
                if (property.length>0) {
                    var prop_params = property.split('=');
                    var prop_name = prop_params[0].trim();
                    if (prop_params.length>1) {
                        properties[prop_name] = {
                            'type': prop_params[1].trim(),
                            '$bind': 'attr='+prop_name
                        };
                    }
                    else {
                        properties[prop_name] = {'$target': index};
                        index = index + 1;
                    }
                }
            });
            return properties;
        },

        validate: function(rule) {
            if (!this.options.validate) {
                return;
            }

            var type_re = /^(null|boolean|number|string|array|object)$/;
            if (!rule.type.match(type_re)) {
                throw new RuleError('unknow type: ' + rule.type);
            }
            if ('$bind' in rule) {
                if (!rule.$bind.match(/^(default|attr=[a-z]+[a-z0-9_]*|options|content)$/)) {
                    throw new RuleError('wrong bind method ' + rule.$bind);
                }
            }
            if (rule.type == 'array') {
                if ('$bind' in rule && !rule.$bind.match(/^(default|options)$/)) {
                    throw new RuleError('bind method not allowed');
                }
            }
            if (rule.type == 'array' && rule.items) {
                if (!rule.items.type || !rule.items.type.match(type_re)) {
                    throw new RuleError('wrong items type: ' + rule.items.type);
                }
            }
            if (rule.type == 'object') {
                if (!rule.properties) {
                    throw new RuleError('missing parameter "properties" is required for type object');
                }
                else {
                    for (var name in rule.properties) {
                        if (!name.match(/^[a-z][a-z0-9_\-]*$/)) {
                            throw new RuleError('wrong object property name: ' + name);
                        }
                        if (rule.properties[name]) {
                            var property = rule.properties[name];
                            if (property.type && !property.type.match(type_re)) {
                                throw new RuleError('wrong property type: ' + property.type);
                            }
                        }
                    }
                }
                if ('$bind' in rule && !rule.$bind.match(/^(default|content)$/)) {
                    throw new RuleError('bind method not allowed');
                }
            }
        }
    });
    RuleParser.prototype.constructor = RuleParser;

    /**
     * Exception throw by jbon on schema error
     */
    function SchemaError() {
        var err = Error.apply(this, arguments);
        this.name = 'SchemaError';
        this.message = err.message;
        this.stack = err.stack;
    };
    SchemaError.prototype = Object.create(Error.prototype);
    SchemaError.prototype.constructor = SchemaError;

    /**
     * Parse DOM tree to create JSON data
     */
    function TreeParser(options) {
        this.options = $.extend({
            namespace: 'rule',
            RuleParser: RuleParser,
        }, options);
        this.ruleParser = new this.options.RuleParser({validate:false});
    }
    TreeParser.prototype.constructor = TreeParser

    TreeParser.prototype.rule = function($el) {
        var schema = {type: 'string', $bind: 'default'}
        if ($el.is('[type=number]')) {
            schema.type = 'number';
        }
        if ($el.is('table,tbody,ul,ol')) {
            schema.type = 'array';
        }

        var raw = $el.data(this.options.namespace);
        if (raw) {
            return $.extend({$bind: 'default'}, this.ruleParser.parse(raw));
        }
        return schema;
    }

    TreeParser.prototype.visitNull = function($el, schema) {
        return null;
    }

    TreeParser.prototype.visitBoolean = function($el, schema) {
        if (schema.$bind.match(/^attr=.*/)) {
            return $el.is('[attr]'.replace('attr', schema.$bind.substr(5)))
        }
        else {
            if ($el.is('input[type=checkbox]')) {
                return $el.is(':checked');
            }
            var val = $.trim(this.visitString($el, schema));
            return (val == 'true' || val == 't' || 0 < parseInt(val));
        }
    }

    TreeParser.prototype.visitNumber = function($el, schema) {
        return parseFloat($.trim(this.visitString($el, schema)));
    }

    TreeParser.prototype.visitString = function($el, schema) {
        if (schema.$bind.match(/^attr=.*/)) {
            return $.trim($el.attr(schema.$bind.substr(5)))
        }
        else {
            if ($el.is('select:has(option),fieldset:has(input[type=radio])')) {
                return $el.children(':checked').val();
            }
            if ($el.is('input,textarea')) {
                return $el.val();
            }
            return $.trim($el.text());
        }
    }

    /**
     * Parse array based on schema. If schema is unavailable, traverse DOM.
     */
    TreeParser.prototype.visitArray = function($el, schema) {
        if (schema.$bind == 'options') {
            var schema = $.extend({items: {type: 'string'}}, schema);
            if ($el.is('select[multiple]')) {
                var result = [];
                $.each($el.val(), function(i, value){
                    switch(schema.type) {
                        case 'number': result.push(parseFloat(value)); break;
                        case 'string': result.push(value); break;
                        default: throw SchemaError('invariant violation');
                    }
                });
                return result;
            }
            throw SchemaError('invariant violation');
        }
        else {
            if($el.children().length < 1) {
                throw SchemaError('Array has to have at least one children');
            }
            if (!('items' in schema)) {
                var $tpl = $el.children(':first-child');
                schema = $.extend(schema, {items: this.jsonschema($tpl)});
            }
            var result = [];
            $el.children(':not(:first-child)').each((function(i, item){
                result.push(this.visit($(item), schema.items));
            }).bind(this));
            return result;
        }
    }

    /**
     * Parse object based on schema. If schema is unavailable, traverse DOM.
     */
    TreeParser.prototype.visitObject = function($el, schema) {
        var result = {}, $children = $el.children();
        for (var name in schema.properties) {
            var property = schema.properties[name];
            if ('$target' in property) {
                if (schema.$bind == 'content') {
                    if (property.$target != 0) {
                        throw Error('unbound property: ' + name);
                    }
                    result[name] = $el.text();
                }
                else {
                    if ('$bind' in property) {
                        result[name] = this.visit($children.eq(property.$target), property);
                    }
                    else {
                        result[name] = this.traverse($children.eq(property.$target));
                    }
                }
            }
            else {
                result[name] = this.visit($el, property);
            }
        }
        return result;
    }

    TreeParser.prototype.visit = function($el, schema) {
        var result = null;
        switch (schema.type) {
        case 'null': result = this.visitNull($el, schema); break;
        case 'boolean': result = this.visitBoolean($el, schema); break;
        case 'number': result = this.visitNumber($el, schema); break;
        case 'string': result = this.visitString($el, schema); break;
        case 'array': result = this.visitArray($el, schema); break;
        case 'object': result = this.visitObject($el, schema); break;
        default: throw Error('invariant violation'); break;
        }
        return result;
    }

    TreeParser.prototype.traverse = function($el) {
        return this.visit($el, this.rule($el));
    }

    TreeParser.prototype.jsonschema = function($el) {
        var schema = this.rule($el);

        if (schema.type == 'array' && schema.$bind == 'default') {
            schema.items = this.jsonschema($el.children().first());
        }

        if (schema.type == 'object') {
            var $children = $el.children();
            for (var name in schema.properties) {
                var property = schema.properties[name];
                if ('$target' in property && schema.$bind == 'default') {
                    schema.properties[name] = $.extend(
                        property,
                        this.jsonschema($children.eq(property.$target))
                    );
                }
                else {
                    schema.properties[name] = $.extend({type: 'string'}, property);
                }
            }
        }

        return schema;
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
