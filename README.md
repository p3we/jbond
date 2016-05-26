# jbond - easy two-way data binding (HTML&JSON)

This tiny library let's you make a simple bond between *HTML* and *JSON*. If you need to retrive data from HTML structore or update your HTML with provided data you probably find this library usefull.

The idea is simple, you extend your *HTML* markup with *data-jbond* attribute to make a hints for *JSON* representation of *HTML* content. With that, you will be able to easy retrive *JSON* from your document or update document with your *JSON* data. Just apply to your *HTML* some bond rules and forgot about templating and *HTML* parsing.

# Example

Let's assume we have following *HTML* structure, representing application user with some writable fields.

```html
<form id="#user-form" data-jbond="type:object; properties:username,roles,friends">
  <h3 data-jbond>p3we</h3>
  <div class="form-group">
    <label>Roles</label>
    <select data-jbond="type:array; items:string; bind:options" multiple>
      <option value="admin">Admin</option>
      <option value="moderator" selected>Moderator</option>
      <option value="users" selected>Users</option>
    </select>
  </div>
  <ul data-jbond="type:array;">
    <li data-jbond="type:object; properties:id=number,fullname,nick;bind:default" id>
      <span></span><em></em>
    </li>
    <li data-jbond id="13">
      <span>Joseph Smith</p><em>big joe</em>
    </li>
    <li data-jbond id="46">
      <span>Michael Angelo</span><em>mike</em>
    </li>
  </ul>
</form>
```

We can easly retrive user data from this document, with following jbond method call.

```javascript
var data = $('#user-form').jbond('parse');
console.log(data);
{
	"username": "p3we",
	"roles": [
		"moderator",
		"user"
	],
	"friends": [
		{
			"id": 13,
			"fullname": "Joseph Smith",
			"nick": "big joe"
		},
		{
			"id": 46,
			"fullname": "Michael Angelo",
			"nick": "mike"
		}
	]
}
```

Also there are two methods, to change document content based on provided JSON values.

```javascript
$('#user-form').jbond('compose', {username: "p3we", roles: [], friends: {}});
$('#user-form').jbond('patch', 'replace', '/roles', ['admin']);
$('#user-form').jbond('patch', 'add', '/friends', {id: '34', fullname: "Jan Nowak", nick: "janek"});
$('#user-form').jbond('patch', 'remove', '/friends/1');
```

# Quick review of available bond rules
| JSON type | bind type           | binding method |
| --------- | ------------------- | -------------- |
| null      | default             | ignore |
| boolean   | default             | expect value as text or input value |
|           | attr=*name*         | expect value as attribute |
| number    | default             | expect value as text or input value |
|           | attr=*name*         | expect value as attribute |
| string    | default             | expect value as text or input value |
|           | attr=*name*         | expect value as attribute |
| array     | default             | expect elemenets as children nodes |
|           | options             | expect elements as input value (option or checkbox fieldset) |
| object    | default             | expect properties as children nodes |
|           | content             | expect at least one property, last as content, rest as attribuutes |

