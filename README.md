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
|           | options             | expect elements as input value (option or checkbox fieldset) |
| object    | default             | expect properties as children nodes |
|           | content             | expect at least one property, last as content, rest as attribuutes |

# Example

```html
<form data-jbond="type:object; properties:name,roles,friends">
  <h3 data-jbond="type:string; bind:default">p3we</h3>
  <div class="form-group">
    <label>Roles</label>
    <select data-jbond="type:array; items:string; bind:options" multiple>
      <option value="admin">Admin</option>
      <option value="users">Users</option>
    </select>
  </div>
  <ul data-jbond="type:array; bind:default">
    <li hidden data-jbond="type:object; properties:title=string,nick; bind:default">
      <p data-jbond="type:string"></p>
    </li>
    <li title="Peter" data-jbond>
      <p data-jbond>pit</p>
    </li>
    <li title="Michael" data-jbond>
      <p data-jbond>mike</p>
    </li>
  </ul>
</form>
<div class="widget">
  <select data-jbond="type:array; bind:default">
    <option disabled hidden data-jbond="type:object; properties:value=number,name; bind:content"></option>
    <option value="admin">Admin</option>
    <option value="users">Users</option>
  </select>
</div>
```
