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


