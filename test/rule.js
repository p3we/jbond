QUnit.test('rule simple test', function(assert) {
    var rule = new jbond.RuleParser({validate: true});

    assert.ok(rule.parse('type: boolean') != null);
    assert.ok(rule.parse('type: boolean;') != null);
    assert.ok(rule.parse('type: boolean; bind: default') != null);
    assert.ok(rule.parse('type: object; properties:id,name  ;   bind: default ;') != null);
    assert.throws(function(){ rule.parse('type: boolean; foobar;'); }, jbond.RuleError);
    assert.throws(function(){ rule.parse('type: boolean; ;'); }, jbond.RuleError);
});

QUnit.test('rule type test', function(assert) {
    var rule = new jbond.RuleParser({validate: true});

    assert.propEqual(
        rule.parse('type:null'),
        {type: 'null'},
        'wrong type for provider rule'
    );
    assert.propEqual(
        rule.parse('type:boolean'),
        {type: 'boolean'},
        'wrong type for provider rule'
    );
    assert.propEqual(
        rule.parse('type:number'),
        {type: 'number'},
        'wrong type for provider rule'
    );
    assert.propEqual(
        rule.parse('type:string'),
        {type: 'string'},
        'wrong type for provider rule'
    );
    assert.propEqual(
        rule.parse('type:array'),
        {type: 'array'},
        'wrong type for provider rule'
    );
    assert.propEqual(
        rule.parse('type:array; items:number'),
        {type: 'array', items: {type: 'number'}},
        'wrong type for provider rule'
    );
    assert.propEqual(
        rule.parse('type:object; properties:id'),
        {type: 'object', properties: {id: {$target: 0}}},
        'wrong type for provider rule'
    );
    assert.throws(
        function(){ rule.parse('type:unknowntype'); },
        jbond.RuleError,
        'rule allows only null,boolean,number,string,array and object as type'
    );
    assert.throws(
        function(){ rule.parse('type:object'); },
        jbond.RuleError,
        'rule definition for object type should include properties list'
    );
});

QUnit.test('rule items and properties test', function(assert) {
    var rule = new jbond.RuleParser({validate: true});

    assert.propEqual(
        rule.parse('type:array; items:number; bind:options'),
        {type: 'array', items: {type: 'number'}, $bind: 'options'},
        'wrong items type for provided rule'
    );
    assert.propEqual(
        rule.parse('type:array; bind:options'),
        {type: 'array', $bind: 'options'},
        'wrong items type for provided rule'
    );
    assert.throws(
        function() {
            rule.parse('type:array; items:wrongtype; bind:options');
        },
        jbond.RuleError,
        'wrong items type for provided bind method'
    );
    assert.propEqual(
        rule.parse('type:object; properties:id,value; bind:default'),
        {
            type: 'object',
            properties: {id: {$target: 0}, value: {$target: 1}},
            $bind: 'default'
        },
        'wrong propetries for provided rule'
    );
    assert.propEqual(
        rule.parse('type:object; properties:value=number,label; bind:content'),
        {
            type: 'object',
            properties: {value: {type: 'number'}, label: {$target: 0}},
            $bind: 'content'
        },
        'wrong propetries for provided rule'
    );
    assert.throws(
        function() {
            rule.parse('type:object; properties:id=unknowntype,label; bind:content');
        },
        jbond.RuleError,
        'wrong property type provided rule'
    );
});

QUnit.test('rule bind test', function(assert) {
    var rule = new jbond.RuleParser({validate: true});

    assert.propEqual(
        rule.parse('type:string; bind:default'),
        {type: 'string', $bind: 'default'},
        'wrong bind method for provided rule'
    );
    assert.throws(
        function() {
            rule.parse('type:string; bind: force_error');
        },
        jbond.RuleError,
        'wrong bind method provided'
    );
    assert.propEqual(
        rule.parse('type:string; bind:attr=title'),
        {type: 'string', $bind: 'attr=title'},
        'wrong bind method for provided rule'
    );
    assert.propEqual(
        rule.parse('type:array; bind:options'),
        {type: 'array', $bind: 'options'},
        'wrong bind method for provided rule'
    );
    assert.propEqual(
        rule.parse('type:object; properties:id=number,name; bind:default'),
        {
            type: 'object',
            properties: {id: {type: 'number'}, name: {$target: 0}},
            $bind: 'default'
        },
        'wrong bind method for provided rule'
    );
    assert.propEqual(
        rule.parse('type:object; properties:id,name; bind:content'),
        {
            type: 'object',
            properties: {id: {$target: 0}, name: {$target: 1}},
            $bind: 'content'
        },
        'wrong bind method for provided rule'
    );
    assert.throws(
        function() {
            rule.parse('type:object; properties:id,label,name; bind:attr');
        },
        jbond.RuleError,
        'wrong bind method'
    );
});


