QUnit.test('parser test for boolean', function(assert) {
    $('<span id="simple-test-01" data-rule="type:boolean">1</span>')
    .appendTo('#qunit-fixture');
    $('<span id="simple-test-02" data-rule="type:boolean">true</span>')
    .appendTo('#qunit-fixture');
    $('<span id="simple-test-03" data-rule="type:boolean">false</span>')
    .appendTo('#qunit-fixture');
    $('<input id="simple-test-04" data-rule="type:boolean" type="checkbox" checked>')
    .appendTo('#qunit-fixture');
    $('<span id="simple-test-05" data-rule="type:boolean;bind:attr=title" title></span>')
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

