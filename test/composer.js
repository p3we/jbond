QUnit.test('composer test for boolean', function(assert) {
    $('<span id="tc01" data-jbond="type:boolean"></span>').appendTo('#qunit-fixture');
    $('<span id="tc02" data-jbond="type:boolean;bind:attr=title"></span>').appendTo('#qunit-fixture');
    $('<input id="tc03" type="checkbox" data-jbond="type:boolean">').appendTo('#qunit-fixture');

    var composer = new jbond.TreeComposer();

    composer.traverse($('#tc01'), true);
    assert.equal($('#tc01').text(), 'true');

    composer.traverse($('#tc01'), false);
    assert.equal($('#tc01').text(), 'false');

    composer.traverse($('#tc02'), true);
    assert.equal($('#tc02').attr('title'), 'true');

    composer.traverse($('#tc02'), false);
    assert.equal($('#tc02').attr('title'), 'false');

    composer.traverse($('#tc03'), true);
    assert.equal($('#tc03').is(':checked'), true);
});

QUnit.test('composer test for number', function(assert) {
    $('<span id="tc01" data-jbond="type:number"></span>').appendTo('#qunit-fixture');
    $('<span id="tc02" data-jbond="type:number;bind:attr=title"></span>').appendTo('#qunit-fixture');
    $('<input id="tc03" type="number" data-jbond="type:number">').appendTo('#qunit-fixture');

    var composer = new jbond.TreeComposer();

    composer.traverse($('#tc01'), 56);
    assert.equal($('#tc01').text(), '56');

    composer.traverse($('#tc02'), 67);
    assert.equal($('#tc02').attr('title'), '67');

    composer.traverse($('#tc03'), 98);
    assert.equal($('#tc03').val(), 98);
});



QUnit.test('composer test for array', function(assert) {
    $('<ul id="tc01" data-jbond="type:array; bind:default">' +
      ' <li style="display:none" data-jbond="type:string"></li>' +
      '</ul>'
    ).appendTo('#qunit-fixture');
    $('<select id="tc02" multiple data-jbond="type:array; items:number; bind:options">' +
      ' <option value="12">12</option>' +
      ' <option value="22">22</option>' +
      ' <option value="32">32</option>' +
      '</select>'
    ).appendTo('#qunit-fixture');
    $('<fieldset id="tc03" data-jbond="type:array; bind:options">' +
      ' <label><input type="checkbox" value="13"> 13</label>' +
      ' <label><input type="checkbox" value="23"> 23</label>' +
      ' <label><input type="checkbox" value="33"> 33</label>' +
      '</fieldset>'
    ).appendTo('#qunit-fixture');

    var composer = new jbond.TreeComposer();

    composer.traverse($('#tc01'), [1,2,3,4,5]);
    assert.equal($('#tc01 li:not(:first-child)').length, 5);

    composer.traverse($('#tc02'), [22, 32]);
    assert.equal($('#tc02').val().length, 2);

    composer.traverse($('#tc03'), [13, 23]);
    assert.equal($('#tc02').val().length, 2);
});

QUnit.test('composer test for object', function(assert) {
    $('<ul id="tc01" data-jbond="type:object; properties: title,value">' +
      ' <li></li>' +
      ' <li></li>' +
      '</ul>'
    ).appendTo('#qunit-fixture');
    $('<span id="tc02" title="john" data-jbond="type:object; properties: title=string,value">' +
      ' <p></p>' +
      '</span>'
    ).appendTo('#qunit-fixture');
    $('<span id="tc03" title="john" data-jbond="type:object; properties: title=string,value; bind:content">' +
      '</span>'
    ).appendTo('#qunit-fixture');

    var composer = new jbond.TreeComposer();

    composer.traverse($('#tc01'), {title: 'john', value: '89'});
    assert.equal($('#tc01 li:nth(0)').text(), 'john');
    assert.equal($('#tc01 li:nth(1)').text(), '89');

    composer.traverse($('#tc02'), {title: 'john', value: '89'});
    assert.equal($('#tc02').attr('title'), 'john');
    assert.equal($('#tc02 :first-child').text(), '89');

    composer.traverse($('#tc03'), {title: 'john', value: '89'});
    assert.equal($('#tc03').attr('title'), 'john');
    assert.equal($('#tc03').text(), '89');
});

