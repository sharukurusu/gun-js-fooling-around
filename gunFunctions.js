// const createANode = function(name) {
//     console.log(name)
//     gun.get(`${name}`).put({name: name})

// }

// const relateNodes = function(nodeA, relationSoul, nodeB) {
//     let nodeA = gun.get(nodeA)
//     let nodeB = gun.get(nodeB)

//     nodeA.get(relationSoul).put(nodeB)
//     nodeB.get(relationSoul).put(nodeA)
// }

// const getSoulName = function(gunNode) {

// }

// Ways nodes can interact/be manipulated:

// create nodes

// find nodes by soul

// create a relationship node, then connect two other nodes to interact

// find nodes in relationship to other nodes

// proposed node structure:
// {_: {#: soul}
// content: {title: title, text: text}
// type: 'info' || 'relationship'
// creator: {user: userSoul}
// relationships: set
// }

const gun = Gun('http://127.0.0.1:8765/gun')
var ideaSet = gun.get('root node').get('ideaSet')
var focused = gun.get('focused')

function testId (element) {
    console.log(element)
}

function clickTitle (element) {
    element = $(element)
    if (!element.find('input').get(0)) {
      element.html('<input value="' + element.html() + '" onkeyup="keypressTitle(this)">')
    }
  }

  function keypressTitle (element) {
    if (event.keyCode === 13) {
      ideaSet.get($(element).parent().parent().attr('id')).put({title: $(element).val()})
    }
  }

  function clickCheck (element) {
    ideaSet.get($(element).parent().attr('id')).put({done: $(element).prop('checked')})
  }

  function clickDelete (element) {
    ideaSet.get($(element).parent().attr('id')).put(null)
  }
  function clickFocus (element) {
      var parentId = $(element).parent().attr('id')
      if (parentId.startsWith("REL-")) {
        var ideaToFocus = ideaSet.get(parentId.slice(4))
      } else {
        var ideaToFocus = ideaSet.get(parentId)
      }

    focused.get('focused').put(ideaToFocus)
    focused.once(v => console.log(v))
    console.log('fired clickFocus')
  }
  function createRelationship() {
    event.preventDefault()
    let relationShipTitle = $("#relationShipTitle").val()
    let soulOfNodeToRelateTo = $("#soulOfNodeToRelateTo").val()

    console.log($("#relationShipTitle").val())
    console.log($("#soulOfNodeToRelateTo").val())

    focused.get('focused').once( function(currentIdeaData) {
        console.log(currentIdeaData)
        let ideaSoul = currentIdeaData["_"]["#"]
        gun.get(ideaSoul).get('relationshipSet').set({title: relationShipTitle, relatedNodeSoul: soulOfNodeToRelateTo})

        gun.get(soulOfNodeToRelateTo).get('relationshipSet').set({title: relationShipTitle, relatedNodeSoul: ideaSoul})
    })
    

    $("#relationShipTitle").val('')
    $("#soulOfNodeToRelateTo").val('')
  }
  function jqueryEmpty() {
    console.log('fired jqueryEmpty()')
    $("#relationshipSetList").empty()
  }
$( document ).ready(function() {
    console.log( "ready!" );
    
    $('#newIdeaForm').on('submit', function (event) {
        event.preventDefault()
        console.log('adding new Idea')
        var ideaToAdd = $('#ideaToAdd')
        ideaSet.set({title: ideaToAdd.val()})
        ideaToAdd.val('')
    })


    focused.get('focused').on( function(node, id) {
        console.log("focused changed/was updated",node)

        $("#focused").text(node.title)
        $("#focused").append(`<br>Define New Relationship:<br>
        <form>
        <input id="relationShipTitle" placeholder="Relationship Title">
        <input id="soulOfNodeToRelateTo" placeholder="Soul Of Node To Relate To">
        <button onclick="createRelationship()">Create</button>
        </form>
        Relation List:
        <ul id="relationshipSetList"></ul>
        `)
    })
    focused.get('focused').get('relationshipSet').on(() => jqueryEmpty())
    focused.get('focused').get('relationshipSet').map().on(function(relationData){
        console.log("relationData",relationData)

        var listItem = `<li id="REL-${relationData.relatedNodeSoul}"><span>${relationData.title}</span></li>`

        $("#relationshipSetList").append(listItem)
        gun.get(relationData.relatedNodeSoul).once(function(relatedNodeData){
            $(`#REL-${relationData.relatedNodeSoul}`)
            .append(
                `${relatedNodeData.title}<button onclick="clickFocus(this)">Focus</button>`)
        })

    })

    ideaSet.map().on(function (idea, id) {
        var li = $('#' + id)
        if (!li.get(0)) {
            li = $('<li>').attr('id', id).appendTo('#ideaSetList')
        }
        if (idea) {
            var html = 
            `<input type="checkbox" onclick="clickCheck(this)"${(idea.done ? 'checked' : '')}>
            <span onclick="clickTitle(this)">${idea.title}</span>${id}
            <img onclick="clickDelete(this)" src="https://cdnjs.cloudflare.com/ajax/libs/foundicons/3.0.0/svgs/fi-x.svg"/>
            <button onclick="clickFocus(this)">Focus</button>
            ${idea.related ? idea.related : ''}`
            li.html(html)
        } else {
            li.remove()
        }
    })


     
});

