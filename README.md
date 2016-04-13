# jbond

This tiny library let's you bind data to *HTML* structure, so you can easy retrive *JSON* from your document, or update document with *JSON*. Just apply to your *HTML* some bond rules and forgot about templating and *HTML* parsing.

# Spec
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
|           | option@type         | expect elements as input value (option or checkbox fieldset) |
| object    | default             | expect properties as children nodes |
|           | option@type=*name*  | expect two properties, first as *name* attribute second as text node |
|           | attr@type=*name*    | expect n-th property as attributes |

# Example

```html
<form data-rule="type:object; properties:name,roles,friends">
  <h3 data-rule="type:string; bind:default">p3we</h3>
  <div class="form-group">
    <label>Roles</label>
    <select data-rule="type:array; bind:option" multiple>
      <option value="admin">Admin</option>
      <option value="users">Users</option>
    </select>
  </div>
  <ul data-rule="type:array; bind:default">
    <li hidden data-rule="type:object; properties:name,nick; bind:attr=title,default">
      <p data-rule="type:string"></p>
    </li>
    <li title="Peter">
      <p>pit</p>
    </li>
    <li title="Michael">
      <p>mike</p>
    </li>
  </ul>
</form>
<div class="widget">
  <select data-rule="type:array; bind:default">
    <option disabled hidden data-rule="type:object; properties:id,name; bind:option@number=value"></option>
    <option value="admin">Admin</option>
    <option value="users">Users</option>
  </select>
</div>
```
