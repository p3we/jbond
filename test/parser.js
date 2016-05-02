QUnit.test('parser test for boolean', function(assert) {
    $('<span id="simple-test-01" data-rule="type:boolean">1</span>')
    .appendTo('#qunit-fixture');
    $('<span id="simple-test-02" data-rule="type:boolean">true</span>')
    .appendTo('#qunit-fixture');
    $('<span id="simple-test-03" data-rule="type:boolean">false</span>')
    .appendTo('#qunit-fixture');
    $('<input id="simple-test-04" data-rule="type:boolean" type="checkbox" checked>')
    .appendTo('#qunit-fixture');
    $('<span id="simple-test-05" data-rule="type:boolean;bind:attr=title" title="1"></span>')
    .appendTo('#qunit-fixture');

    var parser = new jbond.TreeParser();
    assert.equal(
        parser.traverse($('#simple-test-01')),
        true,
        'wrong boolean value'
    );
    assert.equal(
        parser.traverse($('#simple-test-02')),
        true,
        'wrong boolean value'
    );
    assert.equal(
        parser.traverse($('#simple-test-03')),
        false,
        'wrong boolean value'
    );
    assert.equal(
        parser.traverse($('#simple-test-04')),
        true,
        'wrong boolean value'
    );
    assert.equal(
        parser.traverse($('#simple-test-05')),
        true,
        'wrong boolean value'
    );
});

QUnit.test('parser test for number', function(assert) {
    $('<span id="simple-test-01" data-rule="type:number">1</span>')
    .appendTo('#qunit-fixture');
    $('<span id="simple-test-02" data-rule="type:number">3.14</span>')
    .appendTo('#qunit-fixture');
    $('<input id="simple-test-03" data-rule="type:number" type="text" value="13">')
    .appendTo('#qunit-fixture');
    $('<input id="simple-test-04" data-rule="type:number" type="number" value="11">')
    .appendTo('#qunit-fixture');
    $('<span id="simple-test-05" data-rule="type:number; bind:attr=title" title="9"></span>')
    .appendTo('#qunit-fixture');

    var parser = new jbond.TreeParser();
    assert.equal(
        parser.traverse($('#simple-test-01')),
        1,
        'wrong number value'
    );
    assert.equal(
        parser.traverse($('#simple-test-02')),
        3.14,
        'wrong number value'
    );
    assert.equal(
        parser.traverse($('#simple-test-03')),
        13,
        'wrong number value'
    );
    assert.equal(
        parser.traverse($('#simple-test-04')),
        11,
        'wrong number value'
    );
    assert.equal(
        parser.traverse($('#simple-test-05')),
        9,
        'wrong number value'
    );
});

QUnit.test('parser test for jsonschemar', function(assert) {
    $('<div id="tc01" data-rule="type:object;properties:name,tags">' +
      ' <ul data-rule="type:object;properties:name,surname">' +
      '  <li>Jan</li><li>Kowalski</li>' +
      ' </ul>' +
      ' <ul data-rule="type:array">' +
      '  <li data-rule="type:object; properties:id,names">' +
      '   <span></span>' +
      '   <select data-rule="type:array; bind:options" multiple></select>' +
      '  </li>' +
      ' </ul>' +
      ' </div>'
    ).appendTo('#qunit-fixture');

    var parser = new jbond.TreeParser();
    assert.deepEqual(
        parser.jsonschema($('#tc01')),
        {
            $bind: 'default',
            type:'object',
            properties: {
                name: {
                    $target: 0,
                    $bind: 'default',
                    type: 'object',
                    properties: {
                        name: {
                            $target: 0,
                            $bind: 'default',
                            type: 'string',
                        },
                        surname: {
                            $target: 1,
                            $bind: 'default',
                            type: 'string'
                        }
                    }
                },
                tags: {
                    $target: 1,
                    $bind: 'default',
                    type: 'array',
                    items: {
                        $bind: 'default',
                        type: 'object',
                        properties: {
                            id: {
                                $target: 0,
                                $bind: 'default',
                                type: 'string'
                            },
                            names: {
                                $target: 1,
                                $bind: 'options',
                                type: 'array',
                                items: {
                                    $bind: 'default',
                                    type: 'string'
                                }
                            }
                        }
                    }
                }
            }
        },
        'wrong number value'
    );
});

QUnit.test('parser test for array', function(assert) {
    $('<ul id="tc01" data-rule="type:array"><li data-rule="type:number"></li><li>3</li></ul>')
    .appendTo('#qunit-fixture');
    $('<ul id="tc02" data-rule="type:array">' +
      '<li data-rule="type:object; properties:id=number,label; bind:content"></li>' +
      '<li id="1">foo</li>' +
      '</ul>'
    ).appendTo('#qunit-fixture');
    $('<ul id="tc03" data-rule="type:array">' +
      '<li data-rule="type:object; properties:id=number,label"><p data-rule="type:string">a</p></li>' +
      '<li id="2"><p>item1</p></li>' +
      '<li id="4"><p>item2</p></li>' +
      '<li id="6"><p>item3</p></li>' +
      '</ul>'
    ).appendTo('#qunit-fixture');
    $('<ul id="tc04" data-rule="type:array">' +
      '<li><input data-rule type="date"></li>' +
      '<li><input data-rule type="date" value="2016-01-05"></li>' +
      '<li><input data-rule type="date" value="2016-03-05"></li>' +
      '<li><input data-rule type="date" value="2016-06-05"></li>' +
      '</ul>'
    ).appendTo('#qunit-fixture');

    var parser = new jbond.TreeParser();
    assert.deepEqual(
        parser.traverse($('#tc01')),
        [3],
        'wrong array value'
    );
    assert.deepEqual(
        parser.traverse($('#tc02')),
        [{id:1,label:'foo'}],
        'wrong array value'
    );
    assert.deepEqual(
        parser.traverse($('#tc03')),
        [
            {id:2,label:'item1'},
            {id:4,label:'item2'},
            {id:6,label:'item3'}
        ],
        'wrong array value'
    );
    assert.deepEqual(
        parser.traverse($('#tc04')),
        [
            '2016-01-05',
            '2016-03-05',
            '2016-06-05'
        ],
        'wrong array value'
    );
});

QUnit.test('parser test for object', function(assert) {
    $('<ul id="tc01" data-rule="type:object; properties:id,name">' +
      '<li>1</li><li>FooBar</li>' +
      '</ul>'
    ).appendTo('#qunit-fixture');
    $('<ul id="tc02" title="2" data-rule="type:object; properties:title=number,name; bind:content">' +
      '<li>Test</li>' +
      '</ul>'
    ).appendTo('#qunit-fixture');
    $('<form id="tc03" data-rule="type:object; properties:firstname,lastname">' +
      '<div class="form-group"><input data-rule value="Jan"></div>' +
      '<div class="form-group"><input data-rule value="Kowalski"></div>' +
      '</form>'
    ).appendTo('#qunit-fixture');
    $('<form id="tc04" data-rule="type:object; properties:id,isvalid">' +
      '<input data-rule="type: number" type="hidden" value="89">' +
      '<div><label>?</label><input data-rule="type:boolean" type="checkbox" checked></div>' +
      '</form>'
    ).appendTo('#qunit-fixture');

    var parser = new jbond.TreeParser();
    assert.deepEqual(
        parser.traverse($('#tc01')),
        {id: '1', name: 'FooBar'},
        'wrong object value'
    );
    assert.deepEqual(
        parser.traverse($('#tc02')),
        {title: 2, name: 'Test'},
        'wrong object value'
    );
    assert.deepEqual(
        parser.traverse($('#tc03')),
        {firstname: 'Jan', lastname: 'Kowalski'},
        'wrong object value'
    );
    assert.deepEqual(
        parser.traverse($('#tc04')),
        {id: 89, isvalid: true},
        'wrong object value'
    );
});


