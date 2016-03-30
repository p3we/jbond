QUnit.test('rule simple test', function(assert) {
    var rule = new jbond.RuleParser({validate: true});

    assert.ok(rule.parse('type: boolean') != null);
    assert.ok(rule.parse('type: boolean;') != null);
    assert.ok(rule.parse('type: boolean; bind: default') != null);
    assert.ok(rule.parse('type: object; properties:id,name  ;   bind: default,default ;') != null);
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
        rule.parse('type:object; properties:id'),
        {type: 'object', properties: ['id']},
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

QUnit.test('rule bind test', function(assert) {
    var rule = new jbond.RuleParser({validate: true});

    assert.propEqual(
        rule.parse('type:string; bind:default'),
        {type: 'string', bind: 'default'},
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
        {type: 'string', bind: 'attr=title'},
        'wrong bind method for provided rule'
    );
    assert.propEqual(
        rule.parse('type:array; bind:option'),
        {type: 'array', bind: 'option'},
        'wrong bind method for provided rule'
    );
    assert.propEqual(
        rule.parse('type:object; properties:id,name; bind:attr=title,default'),
        {type: 'object', properties:['id','name'], bind: ['attr=title','default']},
        'wrong bind method for provided rule'
    );
    assert.throws(
        function() {
            rule.parse('type:object; properties:id,label,name; bind:attr=title,default');
        },
        jbond.RuleError,
        'wrong number of bind methods for provided amount of properties'
    );
});


