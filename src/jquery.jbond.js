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
     * Exception throw by jbond on schema error
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
    RuleParser.prototype.constructor = RuleParser;
    /**
     * Parse data binding rule
     */
    RuleParser.prototype.parse = function(spec) {
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
    }
    /**
     * Parse properties parameter, finds attribute type or target child
     */
    RuleParser.prototype.parseProperties = function(spec) {
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
    }
    /**
     * Make validation of provided biniding rule
     */
    RuleParser.prototype.validate = function(rule) {
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
                throw new RuleError('"properties" are required for type object');
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

    /**
     * JBond functionality common for parser and composer
     */
    function RuleTree(options) {
        this.options = $.extend({
            namespace: 'rule',
            RuleParser: RuleParser,
        }, options);
    }
    RuleTree.prototype.constructor = RuleTree;
    /**
     * Parse bind attribute on provided element and return schema
     */
    RuleTree.prototype.rule = function($el) {
        var schema = {type: 'string', $bind: 'default'}
        if ($el.length != 1) {
            throw new SchemaError('Unable to create schema for provided element');
        }
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
    /**
     * Find closest element with bind attribute
     */
    RuleTree.prototype.find = function($el) {
        var $child = $el.find('[data-$ns]'.replace('$ns', this.options.namespace)).first();
        if ($el.data(this.options.namespace) || $child.length == 0) {
            return $el;
        }
        else {
            return $child;
        }
    }
    /**
     * Return extended JSON Schema for provided HTML subtree
     */
    RuleTree.prototype.jsonschema = function($el) {
        var schema = this.rule($el);
        if (schema.type == 'array') {
            if (schema.$bind == 'options') {
                schema.items = $.extend({$bind: 'default', type: 'string'}, schema.items);
            }
            else {
                schema.items = this.jsonschema(this.find($el.children().first()));
            }
        }
        else if (schema.type == 'object') {
            var $children = $el.children();
            for (var name in schema.properties) {
                var property = schema.properties[name];
                if ('$target' in property && schema.$bind == 'default') {
                    schema.properties[name] = $.extend(
                        property,
                        this.jsonschema(this.find($children.eq(property.$target)))
                    );
                }
                else {
                    schema.properties[name] = $.extend({type: 'string'}, property);
                }
            }
        }
        return schema;
    }

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
    TreeParser.prototype = Object.create(RuleTree.prototype);
    TreeParser.prototype.constructor = TreeParser;
    /**
     * Handle null type
     */
    TreeParser.prototype.visitNull = function($el, schema) {
        return null;
    }
    /**
     * Handle boolean type
     */
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
    /**
     * Handle number type
     */
    TreeParser.prototype.visitNumber = function($el, schema) {
        return parseFloat($.trim(this.visitString($el, schema)));
    }
    /**
     * Handle string type
     */
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
     * Handle array type.
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
            // determine schema from first element if not available
            if (!('items' in schema)) {
                var $tpl = this.find($el.children(':first-child'));
                schema = $.extend(schema, {items: this.jsonschema($tpl)});
            }
            var result = [];
            $el.children(':not(:first-child)').each((function(i, item){
                result.push(this.visit(this.find($(item)), schema.items));
            }).bind(this));
            return result;
        }
    }
    /**
     * Handle object type.
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
                    var $child = this.find($children.eq(property.$target));
                    if ('$bind' in property) {
                        result[name] = this.visit($child, property);
                    }
                    else {
                        result[name] = this.traverse($child);
                    }
                }
            }
            else {
                result[name] = this.visit($el, property);
            }
        }
        return result;
    }
    /**
     * Visit DOM node, dispatch to proper handing method
     */
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
    /**
     * Find schema and visit DOM node
     */
    TreeParser.prototype.traverse = function($el) {
        return this.visit($el, this.rule($el));
    }

    function TreeComposer(options) {
        this.options = $.extend({
            namespace: 'rule'
        }, options);
    }

    return {
        "RuleError": RuleError,
        "SchemaError": SchemaError,
        "RuleParser": RuleParser,
        "TreeParser": TreeParser,
    };
})(jQuery);
