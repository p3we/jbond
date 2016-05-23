QUnit.test('test jsonschema', function(assert) {
    $('<div id="tc01" data-jbond="type:object;properties:name,tags">' +
      ' <ul data-jbond="type:object;properties:name,surname">' +
      '  <li>Jan</li><li>Kowalski</li>' +
      ' </ul>' +
      ' <ul data-jbond="type:array">' +
      '  <li data-jbond="type:object; properties:id,names">' +
      '   <span></span>' +
      '   <select data-jbond="type:array; bind:options" multiple></select>' +
      '  </li>' +
      ' </ul>' +
      '</div>'
    ).appendTo('#qunit-fixture');
    $('<ul id="tc02" data-jbond="type:array">' +
      '  <li data-jbond="type:object;properties:id=number,value;bind:content" style="display:none">' +
      '  </li>' +
      '  <li data-jbond id="5">cola</li>' +
      '  <li data-jbond id="6">pepsi</li>' +
      '</ul>'
    ).appendTo('#qunit-fixture');

    var rtree = new jbond.RuleTree();

    assert.deepEqual(
        rtree.jsonschema($('#tc01')),
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
        'wrong json schema'
    );

    assert.deepEqual(
        rtree.jsonschema($('#tc02')),
        {
            'type': 'array',
            '$bind': 'default',
            'items': {
                'type': 'object',
                '$bind': 'content',
                'properties': {
                    'id': {
                        'type': 'number',
                    },
                    'value': {
                        'type': 'string',
                        '$target': 0
                    }
                }
            }
        },
        'wrong JSON schema'
    );
});

QUnit.test('test resolve', function(assert) {
    $('<div id="tc01" data-jbond="type:object;properties:people,perms">' +
      ' <ul data-jbond>' +
      '  <li data-jbond="type:object;properties:id=string,first,last">'+
      '    <span></span><span></span>'+
      '  </li>' +
      '  <li data-jbond id="56">'+
      '    <span>Jan</span><span>Kowalski</span>'+
      '  </li>' +
      '  <li data-jbond id="57">'+
      '    <span>Piotr</span><span>Nowak</span>'+
      '  </li>' +
      ' </ul>' +
      ' <ul data-jbond="type:object;properties:read,write,execute">' +
      '  <li data-jbond="type:boolean">true</li>' +
      '  <li data-jbond="type:boolean">false</li>' +
      '  <li data-jbond="type:boolean">false</li>' +
      ' </ul>' +
      '</div>'
    ).appendTo('#qunit-fixture');
    $('<table><tbody id="tc02" data-jbond>' +
      ' <tr data-jbond="type:object;properties:exists,name,type,perms">' +
      '  <td><input data-jbond="type:boolean" type="checkbox"></td>' +
      '  <td><span data-jbond="type:object;properties:filename;bind:content"></span></td>' +
      '  <td><fieldset data-bind="type:array">' +
      '   <label><input type="checkbox" value="pdf checked">pdf</label>' +
      '   <label><input type="checkbox" value="txt">txt</label>' +
      '   <label><input type="checkbox" value="doc">doc</label>' +
      '  </fieldset></td>' +
      '  <td><select data-jbond="type:array;bind:options" multiselect>' +
      '   <option value="read" selected>Read</option>' +
      '   <option value="write" selected>Write</option>' +
      '   <option value="execute">Execute</option>' +
      '  </select></td>' +
      ' </tr>' +
      ' <tr data-jbond>' +
      '  <td><input data-jbond checked></td>' +
      '  <td><span data-jbond>example.pdf</span></td>' +
      '  <td><fieldset data-bind>' +
      '   <label><input type="checkbox" value="pdf" checked>pdf</label>' +
      '   <label><input type="checkbox" value="txt">txt</label>' +
      '   <label><input type="checkbox" value="doc">doc</label>' +
      '  </fieldset></td>' +
      '  <td><select data-jbond multiselect>' +
      '   <option value="read" selected>Read</option>' +
      '   <option value="write" selected>Write</option>' +
      '   <option value="execute">Execute</option>' +
      '  </select></td>' +
      ' </tr>' +
      '</tbody></table>'
    ).appendTo('#qunit-fixture');

    var rtree = new jbond.RuleTree();

    assert.ok(rtree.resolve($('#tc01'), '/'));
    assert.ok(rtree.resolve($('#tc01'), '/people'));
    assert.ok(rtree.resolve($('#tc01'), '/people/0/id'));
    assert.ok(rtree.resolve($('#tc01'), '/people/0/first'));
    assert.ok(rtree.resolve($('#tc01'), '/people/0/last'));
    assert.ok(rtree.resolve($('#tc01'), '/people/1/id'));
    assert.ok(rtree.resolve($('#tc01'), '/people/1/first'));
    assert.ok(rtree.resolve($('#tc01'), '/people/1/last'));
    assert.ok(rtree.resolve($('#tc01'), '/perms'));
    assert.ok(rtree.resolve($('#tc01'), '/perms/read'));
    assert.ok(rtree.resolve($('#tc01'), '/perms/write'));
    assert.ok(rtree.resolve($('#tc01'), '/perms/execute'));
    assert.notOk(rtree.resolve($('#tc01'), '/people/2'));
    assert.notOk(rtree.resolve($('#tc01'), '/people/2/first'));
    assert.notOk(rtree.resolve($('#tc01'), '/perm'));
    assert.notOk(rtree.resolve($('#tc01'), '/unknown'));
    assert.notOk(rtree.resolve($('#tc01'), '/unknown/'));
    assert.notOk(rtree.resolve($('#tc01'), ''));

    assert.ok(rtree.resolve($('#tc02'), '/'));
    assert.ok(rtree.resolve($('#tc02'), '/0/exists'));
    assert.ok(rtree.resolve($('#tc02'), '/0/name'));
    assert.ok(rtree.resolve($('#tc02'), '/0/name/filename'));
    assert.ok(rtree.resolve($('#tc02'), '/0/type'));
    assert.ok(rtree.resolve($('#tc02'), '/0/perms'));
    assert.notOk(rtree.resolve($('#tc02'), '/0/perms/0'));
    assert.notOk(rtree.resolve($('#tc02'), '/1'));
    assert.notOk(rtree.resolve($('#tc02'), '/1/perms'));
    assert.notOk(rtree.resolve($('#tc02'), '/1/perms/'));
});

