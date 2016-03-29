QUnit.test('parser test', function(assert) {
    var rule = new jbond.RuleParser({validate: true});

    assert.ok(rule.parse('type: boolean') != null);
    assert.ok(rule.parse('type: boolean;') != null);
    assert.ok(rule.parse('type: boolean; bind: default') != null);
    assert.ok(rule.parse('type: object; properties:id,name  ;   bind: default,default ;') != null);
    assert.throws(function(){ rule.parse('type: boolean; foobar;'); }, jbond.RuleError);
    assert.throws(function(){ rule.parse('type: boolean; ;'); }, jbond.RuleError);
});

QUnit.test('type test', function(assert) {
    var rule = new jbond.RuleParser({validate: true});

    assert.propEqual(
        rule.parse('type:null'),
        {type: 'null'},
        'Wrong type for provider rule'
    );
    assert.propEqual(
        rule.parse('type:boolean'),
        {type: 'boolean'},
        'Wrong type for provider rule'
    );
    assert.propEqual(
        rule.parse('type:number'),
        {type: 'number'},
        'Wrong type for provider rule'
    );
    assert.propEqual(
        rule.parse('type:string'),
        {type: 'string'},
        'Wrong type for provider rule'
    );
    assert.propEqual(
        rule.parse('type:array'),
        {type: 'array'},
        'Wrong type for provider rule'
    );
    assert.propEqual(
        rule.parse('type:object; properties:id'),
        {type: 'object', properties: ['id']},
        'Wrong type for provider rule'
    );
    assert.throws(
        function(){ rule.parse('type:unknowntype'); },
        jbond.RuleError,
        'Rule allows only null,boolean,number,string,array and object as type'
    );
    assert.throws(
        function(){ rule.parse('type:object'); },
        jbond.RuleError,
        'Rule definition for object type should include properties list'
    );
});

QUnit.test('bind test', function(assert) {
    var rule = new jbond.RuleParser({validate: true});

    assert.propEqual(
        rule.parse('type:string; bind:default'),
        {type: 'string', bind: 'default'},
        'Wrong bind method for provided rule'
    );
    assert.throws(
        function() {
            rule.parse('type:string; bind: force_error');
        },
        jbond.RuleError,
        'Wrong bind method provided'
    );
    assert.propEqual(
        rule.parse('type:string; bind:attr=title'),
        {type: 'string', bind: 'attr=title'},
        'Wrong bind method for provided rule'
    );
    assert.propEqual(
        rule.parse('type:array; bind:option'),
        {type: 'array', bind: 'option'},
        'Wrong bind method for provided rule'
    );
    assert.propEqual(
        rule.parse('type:object; properties:id,name; bind:attr=title,default'),
        {type: 'object', properties:['id','name'], bind: ['attr=title','default']},
        'Wrong bind method for provided rule'
    );
    assert.throws(
        function() {
            rule.parse('type:object; properties:id,label,name; bind:attr=title,default');
        },
        jbond.RuleError,
        'Wrong number of bind methods for provided amount of properties'
    );
});


