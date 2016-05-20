QUnit.test('parser test for boolean', function(assert) {
    $('<span id="tc01" data-jbond="type:boolean">true</span>')
    .appendTo('#qunit-fixture');
    $('<span id="tc02" data-jbond="type:boolean">false</span>')
    .appendTo('#qunit-fixture');
    $('<input id="tc03" data-jbond="type:boolean" type="checkbox" checked>')
    .appendTo('#qunit-fixture');
    $('<span id="tc04" data-jbond="type:boolean;bind:attr=title" title="true"></span>')
    .appendTo('#qunit-fixture');

    var parser = new jbond.TreeParser();
    assert.equal(
        parser.traverse($('#tc01')),
        true,
        'wrong boolean value'
    );
    assert.equal(
        parser.traverse($('#tc02')),
        false,
        'wrong boolean value'
    );
    assert.equal(
        parser.traverse($('#tc03')),
        true,
        'wrong boolean value'
    );
    assert.equal(
        parser.traverse($('#tc04')),
        true,
        'wrong boolean value'
    );
});

QUnit.test('parser test for number', function(assert) {
    $('<span id="tc01" data-jbond="type:number">1</span>')
    .appendTo('#qunit-fixture');
    $('<span id="tc02" data-jbond="type:number">3.14</span>')
    .appendTo('#qunit-fixture');
    $('<input id="tc03" data-jbond="type:number" type="text" value="13">')
    .appendTo('#qunit-fixture');
    $('<input id="tc04" data-jbond="type:number" type="number" value="11">')
    .appendTo('#qunit-fixture');
    $('<span id="tc05" data-jbond="type:number; bind:attr=title" title="9"></span>')
    .appendTo('#qunit-fixture');
    $('<select id="tc06" data-jbond="type:number; bind:options">' +
      '<option value="10"></option><option value="20" selected></option>' +
      '</select>'
    ).appendTo('#qunit-fixture');
    $('<fieldset id="tc07" data-jbond="type:number; bind:options">' +
      '<label><input type="radio" value="17"></label>' +
      '<label><input type="radio" value="27" checked></label>' +
      '<label><input type="radio" value="37"></label>' +
      '</fieldset>'
    ).appendTo('#qunit-fixture');

    var parser = new jbond.TreeParser();
    assert.equal(
        parser.traverse($('#tc01')),
        1,
        'wrong number value'
    );
    assert.equal(
        parser.traverse($('#tc02')),
        3.14,
        'wrong number value'
    );
    assert.equal(
        parser.traverse($('#tc03')),
        13,
        'wrong number value'
    );
    assert.equal(
        parser.traverse($('#tc04')),
        11,
        'wrong number value'
    );
    assert.equal(
        parser.traverse($('#tc05')),
        9,
        'wrong number value'
    );
    assert.equal(
        parser.traverse($('#tc06')),
        20,
        'wrong number value'
    );
    assert.equal(
        parser.traverse($('#tc07')),
        27,
        'wrong number value'
    );
});

QUnit.test('parser test for array', function(assert) {
    $('<ul id="tc01" data-jbond="type:array"><li data-jbond="type:number"></li><li>3</li></ul>')
    .appendTo('#qunit-fixture');
    $('<ul id="tc02" data-jbond="type:array">' +
      '<li data-jbond="type:object; properties:id=number,label; bind:content"></li>' +
      '<li id="1">foo</li>' +
      '</ul>'
    ).appendTo('#qunit-fixture');
    $('<ul id="tc03" data-jbond="type:array">' +
      '<li data-jbond="type:object; properties:id=number,label"><p data-jbond="type:string">a</p></li>' +
      '<li data-jbond id="2"><p data-jbond>item1</p></li>' +
      '<li data-jbond id="4"><p data-jbond>item2</p></li>' +
      '<li data-jbond id="6"><p data-jbond>item3</p></li>' +
      '</ul>'
    ).appendTo('#qunit-fixture');
    $('<ul id="tc04" data-jbond="type:array">' +
      '<li><input data-jbond type="date"></li>' +
      '<li><input data-jbond type="date" value="2016-01-05"></li>' +
      '<li><input data-jbond type="date" value="2016-03-05"></li>' +
      '<li><input data-jbond type="date" value="2016-06-05"></li>' +
      '</ul>'
    ).appendTo('#qunit-fixture');
    $('<select id="tc05" data-jbond="type:array; items:number; bind:options" multiple>' +
      '<option value="15" selected></option><option value="25" selected></option>' +
      '</select>'
    ).appendTo('#qunit-fixture');
    $('<fieldset id="tc06" data-jbond="type:array; items:number; bind:options">' +
      '<label><input type="checkbox" value="16"></label>' +
      '<label><input type="checkbox" value="26" checked></label>' +
      '<label><input type="checkbox" value="36" checked></label>' +
      '</fieldset>'
    ).appendTo('#qunit-fixture');
    $('<table><tbody id="tc07">' +
      '<tr data-jbond="type:object;properties:action,task">' +
      '<td data-jbond="type:number"></td><td data-jbond="type:string"></td>' +
      '</tr>' +
      '<tr data-jbond>' +
      '<td data-jbond>12</td><td data-jbond>running</td>' +
      '</tr>' +
      '</tbody></table>'
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
    assert.deepEqual(
        parser.traverse($('#tc05')),
        [15, 25],
        'wrong array value'
    );
    assert.deepEqual(
        parser.traverse($('#tc06')),
        [26, 36],
        'wrong array value'
    );
    assert.deepEqual(
        parser.traverse($('#tc07')),
        [{action: 12, task: 'running'}],
        'wrong array value'
    );
});

QUnit.test('parser test for object', function(assert) {
    $('<ul id="tc01" data-jbond="type:object; properties:id,name">' +
      ' <li>1</li><li>FooBar</li>' +
      '</ul>'
    ).appendTo('#qunit-fixture');
    $('<span id="tc02" title="2" data-jbond="type:object; properties:title=number,name; bind:content">' +
      'Test' +
      '</span>'
    ).appendTo('#qunit-fixture');
    $('<form id="tc03" data-jbond="type:object; properties:firstname,lastname">' +
      ' <div class="form-group"><input data-jbond value="Jan"></div>' +
      ' <div class="form-group"><input data-jbond value="Kowalski"></div>' +
      '</form>'
    ).appendTo('#qunit-fixture');
    $('<form id="tc04" data-jbond="type:object; properties:id,isvalid">' +
      ' <input data-jbond="type: number" type="hidden" value="89">' +
      ' <div><label>?</label><input data-jbond="type:boolean" type="checkbox" checked></div>' +
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


