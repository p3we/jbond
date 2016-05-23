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
    $('<fieldset id="tc04" data-jbond="type:string; bind:options">' +
      ' <label><input name="tc04" type="radio" value="10"></label>' +
      ' <label><input name="tc04" type="radio" value="20"></label>' +
      ' <label><input name="tc04" type="radio" value="30" checked></label>' +
      '</fieldset>'
    ).appendTo('#qunit-fixture');

    var composer = new jbond.TreeComposer();

    composer.traverse($('#tc01'), 56);
    assert.equal($('#tc01').text(), '56');

    composer.traverse($('#tc02'), 67);
    assert.equal($('#tc02').attr('title'), '67');

    composer.traverse($('#tc03'), 98);
    assert.equal($('#tc03').val(), 98);

    composer.traverse($('#tc04'), 20);
    assert.equal($('#tc04 :checked').val(), 20);
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

QUnit.test('composer test for patch replace method', function(assert) {
    $('<ul id="tc01" data-jbond="type:object; properties: title,value">' +
      ' <li data-jbond="type:string">amount</li>' +
      ' <li data-jbond="type:number">45</li>' +
      '</ul>'
    ).appendTo('#qunit-fixture');
    $('<ul id="tc02">' +
      ' <li style="display:none"></li>' +
      ' <li>john</li>' +
      ' <li>david</li>' +
      ' <li>adam</li>' +
      '</ul>'
    ).appendTo('#qunit-fixture');
    $('<select id="tc03" multiple data-jbond="type:array; items:number; bind:options">' +
      ' <option value="10" selected>10</li>' +
      ' <option value="20" selected>20</li>' +
      ' <option value="30">30</li>' +
      ' <option value="40" selected>40</li>' +
      '</select>'
    ).appendTo('#qunit-fixture');
    $('<ul id="tc04" data-jbond="type:array;">' +
      ' <li style="display:none" data-jbond="type:object;properties:id,label"><span></span><em></em></li>' +
      ' <li data-jbond><span>19</span><em>kowalski</em></li>' +
      ' <li data-jbond><span>21</span><em>polak</em></li>' +
      ' <li data-jbond><span>37</span><em>smith</em></li>' +
      '</ul>'
    ).appendTo('#qunit-fixture');
    $('<table><tbody id="tc05">' +
      ' <tr style="display:none" data-jbond="type:object;properties:name,tags">' +
      '   <td></td>' +
      '   <td><ul data-jbond="type:array">' +
      '     <li style="display:none"><a data-jbond="type:object;properties:href=string,label"><em></em></a></li>' +
      '   </ul></td>' +
      ' </tr>' +
      ' <tr data-jbond>' +
      '   <td>article1</td>' +
      '   <td><ul data-jbond>' +
      '     <li style="display:none"><a data-jbond></a></li>' +
      '     <li><a data-jbond href="#tag1"><em>tag1</em></a></li>' +
      '     <li><a data-jbond href="#tag2"><em>tag2</em></a></li>' +
      '   </ul></td>' +
      ' </tr>' +
      '</tbody></table>'
    ).appendTo('#qunit-fixture');

    var composer = new jbond.TreeComposer();

    assert.ok(composer.patch($('#tc01'), 'replace', '/value', 76));
    assert.equal($('#tc01 li:nth(1)').text(), '76');

    assert.ok(composer.patch($('#tc02'), 'replace', '/1', 'artur'));
    assert.equal($('#tc02 li:nth(1)').text(), 'john');
    assert.equal($('#tc02 li:nth(2)').text(), 'artur');
    assert.equal($('#tc02 li:nth(3)').text(), 'adam');

    assert.ok(composer.patch($('#tc03'), 'replace', '/', [20, 40]));
    assert.deepEqual($('#tc03').val(), ['20', '40']);

    assert.ok(composer.patch($('#tc04'), 'replace', '/1/label', 'taylor'));
    assert.equal($('#tc04 li:nth(2) span').text(), '21');
    assert.equal($('#tc04 li:nth(2) em').text(), 'taylor');

    assert.ok(composer.patch($('#tc04'), 'replace', '/2/id', '13'));
    assert.equal($('#tc04 li:nth(3) span').text(), '13');
    assert.equal($('#tc04 li:nth(3) em').text(), 'smith');

    assert.ok(composer.patch($('#tc05'), 'replace', '/0/tags/0', {href: '#super', label: 'super'}));
    assert.equal($('#tc05 tr:nth(1) td:nth(1) li:nth(1) a').attr('href'), '#super');
    assert.equal($('#tc05 tr:nth(1) td:nth(1) li:nth(1) a em').text(), 'super');

    assert.ok(composer.patch($('#tc05'), 'replace', '/0/tags/1/label', 'news'));
    assert.equal($('#tc05 tr:nth(1) td:nth(1) li:nth(2) a em').text(), 'news');
});

QUnit.test('composer test for patch add and remove methods', function(assert) {
    $('<div id="tc01" data-jbond="type:object; properties:name,friends">' +
      ' <div>John Carter</div>' +
      ' <ul>' +
      '  <li style="display:none"></li>' +
      '  <li>friend1</li>' +
      '  <li>friend2</li>' +
      '  <li>friend3</li>' +
      '  <li>friend4</li>' +
      ' </ul>' +
      '</div>'
    ).appendTo('#qunit-fixture');

    var composer = new jbond.TreeComposer();

    assert.equal($('#tc01 ul > li:not(:first-child)').length, 4);

    assert.ok(composer.patch($('#tc01'), 'add', '/friends', 'friend5'));
    assert.equal($('#tc01 ul > li:not(:first-child)').length, 5);
    assert.equal($('#tc01 ul > li:nth(5)').text(), 'friend5');

    assert.ok(composer.patch($('#tc01'), 'add', '/friends/1', 'stranger'));
    assert.equal($('#tc01 ul > li:not(:first-child)').length, 6);
    assert.equal($('#tc01 ul > li:nth(2)').text(), 'stranger');

    assert.ok(composer.patch($('#tc01'), 'remove', '/friends/1', 'stranger'));
    assert.equal($('#tc01 ul > li:not(:first-child)').length, 5);
    assert.equal($('#tc01 ul > li:nth(2)').text(), 'friend2');
});

