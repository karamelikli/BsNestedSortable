
# Bootstrap Nested Sortable Tree

  

A drag and drop sort able list library.

![bootstrap Nested Sortable 1](https://user-images.githubusercontent.com/6809318/196047512-07439a48-c4c1-4806-a111-67def7e92d65.png)

  

### Motivation

There are some projects about sortable divs, and one of them is [treeSortable](https://github.com/ahamed/treeSortable) project. But I need so many requisites like using Bootstrap and serialization. The utilized data should be reorganized; therefore, auto-leveling existing data were need. This library has sound new features which simplify its usage by developers or new starters.

## Installation
Download `BsNestedSortable.css` and `BsNestedSortable.min.js` files from this project and use them on your server. Use the following tags in **head** part of html.






```html
<head><meta  charset="UTF-8"><meta  name="viewport"  contents="width=device-width, initial-scale=1.0">
    <title>bootstrap Nested Sortable</title>
    <link  href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/css/bootstrap.min.css"  rel="stylesheet" integrity="sha384-iYQeCzEYFbKjA/T2uDLTpkwGzCiq6soy8tYaI1GyVh/UjpbCx/TYkiZhlZB6+fzT"  crossorigin="anonymous">
    <script  src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-u1OknCvxWvY5kfmNBILK2hRnQC3Pr17a+RTT6rIHI7NnikvbZlHgTPOOmMi466C8"
    crossorigin="anonymous"></script>
    <link  rel="stylesheet"  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.min.css" integrity="sha512-q3eWabyZPc1XTCmF+8/LuE1ozpg5xxn7iO89yfSOd5/oKvyqLngoNGsx8jq92Y8eXJ/IRxQbEC+FGSYxtk2oiw==" crossorigin="anonymous"  referrerpolicy="no-referrer"  />
    <script  src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
    <script  src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <link  href="./css/BsNestedSortable.css"  rel="stylesheet"  />
    <script  src="./js/BsNestedSortable.js"></script>
    </head>
```
    
In the body section following tags can be included:

 ```html
 <div  class="container">
	<div  class="row">
	   <ul  id="tree"></ul>
	</div>
</div>
```
  

You can change the id and other parts of the code as your need. The following codes should be included in the body section too.

```html
<script>
const data = [
    {
    id: 1,
    parent_id: 0,
    title: 'Branch 1',
    description: '<p>Test Desc.</p>',
    },
    {
    id: 2,
    parent_id: 1,
    title: 'Branch 2',
    img: 'images/profile.jpg'
    },
       ];
 $(document).ready(function () {        
 $("#tree").BsNestedSortable();
 });
</script>
```

If you have yourself, data name, and keys, it can be done by changing the last code:

```javascript
const myData = [ { myid: 1, myparent_id: 0, mytitle: 'Branch 1', mydesc: 'desc.', myimage:'a.jpg'  },]
$("#tree").BsNestedSortable(
{
 data: myData,
  options: {
   dataKeys: {
       id: 'myid',
       parent: 'myparent_id',
       title: 'mytitle',
       description: 'mydesc',
       image: 'myimage'
     },
   }
}
);
```
Using your modals is available too. In this case, it can be defined in options as:

```javascript
 $("#tree").BsNestedSortable(
 {
  options: {
   modal: {
   id: "#myModal",
   ModalDelete: "#myModalDelete",
   name: "#CatName",
   description: "#CatDescId",
   image: "#image"
   }
 }
 );
```
# Serialization
The most important about sorting branches are using the results. Therefore this project aims to obtain complete output after each action. **serializeOption** can be used for this proposal. There are four different methods to get the results: 

 1. **JSON** , retruns the serialized values as json format. 
 2. **alert** , alert the serialized values.
 3. **console** , write the output in console to check them.
 4. **asVar** , returns the results as variable. 

By using **JSON**, the results can be called in the page as value (of form' input) or html and text.  The equivalency of these options in Jquery are as .html() , .val() and .text() .

The output of serialized values can be obtained as following formats simultaneously. 

 - **catObj**: Returns all branches data as array. `[{"id":0,"parent_id":"","level":0,"title":"Root","parents":[],"children":[],"img":"","description":""},`
 - **parentArr**: Returns parents array `{"1":["0"],"2":["1"],"3":["1"],"4":["3"]}`
 - **childrenArr**:  Returns children array for each branch `{"0":["1"],"1":["3","2"],"2":["6"],}`
 - **Hierarchy**: Returns expanded hierarchical array containing all children data `{"id":0,"parents":[],"level":0,"children":[{"id":"1","parents":[0],"level":"1","description":`
 - **minHierarchy**:  Return minimized hierarchical array included just id and children. `{"id":0,"children":[{"id":"1","children":[{"id":"3","children":[{"id":"4","children":[{"id":"5"}]},`
 - **allParentsArr**: Returns all of parents of branches. `{"1":[0],"2":[0,"1"],"3":[0,"1"],"4":[0,"3","1"],`
 - **allChildrenArr**: Returns all of children of the branches. `{"0":["3","4","5","9","10","7","6","1","2","8"],"1":["2","8"],"3":["4","5","9","10","7"],"`

The following command can perform this serialization. 

```javascript     
  $("#tree").BsNestedSortable(  
  {
  serializeOption: {
	method: "JSON", // JSON alert console asVar
	call: "val", // html val text jquery .html() ,.val() or .text()
	outPuts: {
		catObj: "#catObj", // the places which will have all categories
		parentArr: "#parentArr", // parents array
		childrenArr: "#childrenArr", // children array
		Hierarchy: "#hierarchy", // expanded hierarchical array
		minHierarchy: "#minHierarchy", // minimized hierarchical array
		allParentsArr: "#allParentsArr", // all of parents
		allChildrenArr: "#allChildrenArr"  // all of children
			}
	}
}
```

 ## Events
The most critical issue for developers is saving the serialized results. In this regard **eventsOptions** may be useful for developers. *onComplete* ,   *onDelete* ,   *onEdit* and  *onAdd* are envisaged for this propose. All of the mentioned functions make an object as follows:

*{"deleted":[],"added":[],"modified":[{...}],"theLastSerializ":[{...}],}*

**EventsOptions** can modify user-defined functions. An example of a delete event is as follows:

```javascript 
$("#tree").BsNestedSortable(    
  {
   eventsOptions: {
     onComplete: function (_, newSer) { console.log("Completed"); console.log(JSON.stringify(newSer)); },
     onDelete: async function (_, newSer) {
       await $("#proceeding-modal").modal({backdrop: 'static',keyboard: false,}).modal("show");
        ajaxRequest({
          url: "proceeding.php",
          type: "POST",
          data: {
            deletedArray: newSer.deleted
          }
       }, function (data) {
           const returnVals = JSON.parse(data);
           console.log(returnVals.message);
           $("#proceeding-modal").modal("hide");
           initialSerilized = newSer.theLastSerializ;
       },
           function (error, exception) {
               $('#proceeding-modal').on('shown.bs.modal', function (e) {
                   $("#proceeding-modal").modal("hide");
               });
               $("#proceeding-modal").modal("hide");
           }
       )
     },
     onEdit: function (_, newSer) { console.log("Edited"); console.log(newSer); },
     onAdd: function (_, newSer) { console.log("Added"); console.log(newSer); },
    }
 }
```
 

 
## Options


| Option | Default | Description |
|--------| --------| ------------|
| treeSortable | #tree | The tree root ID selector. If you change the root selector then you have to update the CSS as per requirements.|
| branchSelector | .tree-branch | The tree branch class selector. This need to be applied at the `li` element of the tree.|
|branchPathSelector| .branch-path | The left side path indication element's class selector. |
|dragHandlerSelector| .branch-drag-handler| The drag element. This element is responsible for enabling the dragging features of the branch.|
|placeholderName| sortable-placeholder | The placeholder name. This is for jquery-ui sortable. Note that there is no dot(.) or hash(#). See the jquery-ui sortable library.|
|childrenBusSelector| .children-bus| The children bus selector. This element is responsible for carrying the children on sorting a parent element.|
|collapseChildren|.collapseChildren|Collapse children class
|levelPrefix| branch-level| This prefix is added to the `li` element and create a level class. For example, for the level 1 branch the class would be `.branch-level-1`|
|insertNewButton|`<button type="button" class="btn btn-primary btn-lg btn-block w-100">Insert New Branch</button>`|The button when the data is empty.
|imagesUrlPrefix||Url of the images directory (http://localhost/images/)
|icons| `{tag: "i",remove: '<i class="far fa-trash-alt"></i>',edit: '<i class="far fa-edit"></i>',add: '<i class="far fa-plus-square"></i>', Class: 'fas',expand: 'fa-plus',collapse: 'fa-minus',}`| Fontawsome was used for icons. Don't forget to change header part of HTML when it is modified.
|maxLevel| 10 | The maximum level the tree could go. For example, if you set the `maxLevel` to `2` then the branch could have maximum `.branch-level-2`.|
|depth| 30 | The Depth of a child branch. If you change the depth then you have to update the CSS of the `.branch-level-X` classes. See the `treeSortable.css` for more references.|
|rootID|0|The root ID. This is crucial for reordering the data. Both string and numeric values are compatible.|
|dataAttributes|{id: 'id',parent: 'parent',title: 'title',}|Attibutes in the produced tags.  *data-title* etc|
|dataKeys|{id:'id',parent:'parent_id', title:'title', description:'description',image:'img'}|Change these values based on your row data structure|
|eventsOptions| { <br />&nbsp;&nbsp;onComplete: function () { }, <br />&nbsp;&nbsp;onDelete: function () { }, <br />&nbsp;&nbsp;onEdit: function () { }, <br /> &nbsp;&nbsp;onAdd: function () { }, <br />&nbsp;&nbsp;excludedObjElms: [],<br />} |Events' functions.|
|serializeOption|    {<br />&nbsp;&nbsp;serializeON: false,<br />&nbsp;&nbsp;method: "JSON",<br />&nbsp;&nbsp;call: "html",<br />&nbsp;&nbsp;outPuts: {<br />&nbsp;&nbsp;&nbsp;&nbsp;catObj: "#catObj", <br />&nbsp;&nbsp;&nbsp;&nbsp;parentArr: "#parentArr", <br />&nbsp;&nbsp;&nbsp;&nbsp;childrenArr: "#childrenArr",<br />&nbsp;&nbsp;&nbsp;&nbsp; Hierarchy: "#hierarchy", <br />&nbsp;&nbsp;&nbsp;&nbsp;minHierarchy: "#minHierarchy", <br />&nbsp;&nbsp;&nbsp;&nbsp;           allParentsArr: "#allParentsArr",<br />&nbsp;&nbsp;&nbsp;&nbsp;        allChildrenArr: "#allChildrenArr"  <br />&nbsp;&nbsp;}<br />&nbsp;&nbsp;}| - method optons are JSON,alert,console,asVar<br /> - call optons are :    html,val,text<br /> -outPuts options are as follow <br /> - - catObj, the places which will have all categories<br /> - - parentArr ,  parents array<br /> - - childrenArr,    children array<br /> - - Hierarchy, expanded hierarchical array <br /> - -minHierarchy,  minimized hierarchical array <br /> - - allParentsArr,   All of parents<br /> - - allChildrenArr,  all of children |



