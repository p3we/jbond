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
        'wrong json schema'
    );
});


