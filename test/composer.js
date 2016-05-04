QUnit.test('composer test for array', function(assert) {
    $('<ul id="tc01" data-rule="type:array; bind:default">' +
      ' <li style="display:none" data-rule="type:string"></li>' +
      '</ul>'
    ).appendTo('#qunit-fixture');

    var composer = new jbond.TreeComposer();
    composer.traverse($('#tc01'), [1,2,3,4,5]);
    assert.equal($('#tc01 li:not(:first-child)').length, 5);
});
