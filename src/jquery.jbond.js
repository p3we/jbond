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
                        throw new RuleError('unknown rule parameter: ' + name);
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
            namespace: 'jbond',
            RuleParser: RuleParser,
        }, options);
        this.ruleParser = new this.options.RuleParser({validate:false});
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
        if ($el.data(this.options.namespace)!=null || $child.length == 0) {
            return $el;
        }
        else {
            return $child;
        }
    }
    /**
     * Visit DOM node, dispatch to proper handing method
     */
    RuleTree.prototype.visit = function($el, schema) {
        var result = null;
        switch (schema.type) {
        case 'null': result = this.visitNull.apply(this, arguments); break;
        case 'boolean': result = this.visitBoolean.apply(this, arguments); break;
        case 'number': result = this.visitNumber.apply(this, arguments); break;
        case 'string': result = this.visitString.apply(this, arguments); break;
        case 'array': result = this.visitArray.apply(this, arguments); break;
        case 'object': result = this.visitObject.apply(this, arguments); break;
        default: throw new SchemaError('invariant violation'); break;
        }
        return result;
    }
    /**
     * Find schema and visit DOM node
     */
    RuleTree.prototype.traverse = function($el) {
        var args = Array.prototype.slice.call(arguments);
        args.splice(1, 0, this.rule($el));
        return this.visit.apply(this, args);
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
        RuleTree.call(this, options);
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
                return $el.find(':checked').val();
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
            if ($el.is('select[multiple],fieldset:has(input[type=checkbox])')) {
                return $el.find('option:selected,input:checked').map(function(i, item) {
                    var $item = $(item);
                    switch(schema.items.type) {
                    case 'boolean': return $item.val().toLowerCase() == 'true';
                    case 'number': return parseFloat($item.val());
                    case 'string': return $item.val();
                    default: throw new SchemaError('invariant violation');
                    }
                }).get();
            }
            throw new SchemaError('invariant violation');
        }
        else {
            if($el.children().length < 1) {
                throw new SchemaError('Array has to have at least one children');
            }
            // determine schema from first element if not available
            if (!('items' in schema)) {
                var $tpl = this.find($el.children(':first-child'));
                schema = $.extend(schema, {items: this.jsonschema($tpl)});
            }
            return $el.children(':not(:first-child)').map((function(i, item){
                return this.visit(this.find($(item)), schema.items);
            }).bind(this)).get();
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
                        throw new SchemaError('unbound property: ' + name);
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

    function TreeComposer(options) {
        RuleTree.call(this, options);
    }
    TreeComposer.prototype = Object.create(RuleTree.prototype);
    TreeComposer.prototype.constructor = TreeComposer;

    TreeComposer.prototype.visitNull = function($el, schema, value) {
        return;
    }
    TreeComposer.prototype.visitBoolean = function($el, schema, value) {
        this.visitString($el, schema, value);
    }
    TreeComposer.prototype.visitNumber = function($el, schema, value) {
        this.visitString($el, schema, value);
    }
    TreeComposer.prototype.visitString = function($el, schema, value) {
        if (schema.$bind.match(/^attr=.*/)) {
            $el.attr(schema.$bind.substr(5), value);
        }
        else {
            if ($el.is('select:has(option)')) {
                $el.children('option').each(function(i, item){
                    var $item = $(item);
                    $item.prop('selected', $item.val() == value)
                });
            }
            else if ($el.is('fieldset:has(input[type=radio])')) {
                $el.children('input[type=radio]').each(function(i, item){
                    var $item = $(item);
                    $item.prop('checked', $item.val() == value)
                });
            }
            else if ($el.is('input,textarea')) {
                $el.val(value);
            }
            else {
                $el.text(value);
            }
        }
    }
    TreeComposer.prototype.visitArray = function($el, schema, value) {
        if (schema.$bind == 'options') {
            var schema = $.extend({items: {type: 'string'}}, schema);
            if ($el.is('select[multiple]')) {
                $el.val($.isArray(value) ? value : []);
            }
            else if ($el.is('fieldset:has(input[type=checkbox])')) {
                $el.find('input').val($.isArray(value) ? value : []);
            }
            else {
                throw new SchemaError('invariant violation');
            }
        }
        else {
            if($el.children().length < 1) {
                throw new SchemaError('Array has to have at least one children');
            }
            // determine schema from first element if not available
            var $tpl = this.find($el.children(':first-child'));
            if (!('items' in schema)) {
                schema = $.extend(schema, {items: this.jsonschema($tpl)});
            }

            var $children = $el.children(':not(:first-child)');
            if ($.isArray(value)) {
                // alter DOM to match number of array elements
                if ($children.length > value.length) {
                    $children.slice(value.length).remove();
                }
                else if ($children.length < value.length) {
                    var $item = $tpl.clone(), ns = 'data-$ns'.replace('$ns', this.options.namespace);
                    // make data-* an empty attibute to sign only where bond have place
                    $item.removeAttr('disabled').removeAttr('hidden').show();
                    $item.add('['+ns+']', $item).attr(ns, '');
                    for (var i = $children.length; i < value.length; i++) {
                        $el.append($item.clone());
                    }
                }

                $el.children(':not(:first-child)').each((function(i, item){
                    this.visit(this.find($(item)), schema.items, (i in value ) ? value[i] : null);
                }).bind(this));
            }
            else {
                $children.remove();
            }
        }
    }
    TreeComposer.prototype.visitObject = function($el, schema, value) {
        var $children = $el.children();
        for (var name in schema.properties) {
            var property = schema.properties[name];
            var property_value = (value && name in value) ? value[name] : null;
            if ('$target' in property) {
                if (schema.$bind == 'content') {
                    if (property.$target != 0) {
                        throw new SchemaError('unbound property: ' + name);
                    }
                    $el.text(property_value);
                }
                else {
                    var $child = this.find($children.eq(property.$target));
                    if ('$bind' in property) {
                        this.visit($child, property, property_value);
                    }
                    else {
                        this.traverse($child, property_value);
                    }
                }
            }
            else {
                this.visit($el, property, property_value);
            }
        }
    }

    var plugin = {
        tree: new RuleTree(),
        parser: new TreeParser(),
        composer: new TreeComposer()
    }

    $.fn.jbond = function(method, arg) {
        switch(method) {
            case 'jsonschema': return plugin.tree.jsonschema(this);
            case 'parse': return plugin.parser.traverse(this);
            case 'compose': return plugin.composer.traverse(this, arg);
            default: throw new Error('invalid method');
        }
    }

    return {
        "RuleError": RuleError,
        "SchemaError": SchemaError,
        "RuleParser": RuleParser,
        "TreeParser": TreeParser,
        "TreeComposer": TreeComposer,
    };
})(jQuery);
