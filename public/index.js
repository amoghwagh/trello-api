function getBoardID(boardID, key, token) {
  return fetch(
    `https://api.trello.com/1/boards/${boardID}?fields=name,url&key=${key}&token=${token}`
  )
    .then(response => {
      return response.json();
    })
    .then(myJson => {
      return myJson.id;
    })
    .catch(err => err);
}

function getListID(boardID, key, token) {
  return fetch(
    `https://api.trello.com/1/boards/${boardID}/lists?cards=none&card_fields=all&filter=open&fields=all&key=${key}&token=${token}`
  )
    .then(response => {
      return response.json();
    })
    .then(myJson => {
      return myJson[0].id;
    })
    .catch(err => err);
}

function getCards(listID, key, token) {
  return fetch(
    `https://api.trello.com/1/lists/${listID}/cards?key=${key}&token=${token}`
  )
    .then(response => {
      return response.json();
    })
    .then(myJson => {
      return myJson;
    })
    .catch(err => err);
}

function getChecklistIDs(cards) {
  const checklistIdArray = cards
    .map(card => {
      return card.idChecklists;
    })
    .flat()
    .filter(ele => (ele !== undefined ? true : false));

  return checklistIdArray;
}

function getCheckItems(itemsArray) {
  return new Promise(resolve => {
    itemsObj = itemsArray.map(item => {
      return {
        name: item.name,
        id: item.id,
        checklistId: item.idChecklist,
        state: item.state
      };
    });
    resolve(itemsObj);
  });
}

async function getCheckItemNames(checklists, key, token) {
  const checkItemPromises = checklists.map(checklist => {
    return fetch(
      `https://api.trello.com/1/checklists/${checklist}?key=${key}&token=${token}`
    )
      .then(response => {
        return response.json();
      })
      .then(myJson => {
        return myJson.checkItems;
      })
      .catch(err => err);
  });
  const checkItems = new Array();
  return Promise.all(checkItemPromises).then(async data => {
    const checkItemNamesObj = await getCheckItems(data.flat());
    return checkItemNamesObj;
  });
}

function checkThroughApi(currentItem, cardsInfo, key, token) {
  const checklistId = currentItem.parents("li").data("checklist-id");
  const checkItemId = currentItem.parents("li").data("id");
  cardsInfo.forEach(eachCard => {
    if (eachCard.idChecklists.includes(checklistId)) {
      fetch(
        `https://api.trello.com/1/cards/${eachCard.id}/checkItem/${checkItemId}?key=${key}&token=${token}&state=complete`,
        {
          method: "PUT"
        }
      ).catch(error => console.error("Error:", error));
    }
  });
}

function uncheckThroughApi(currentItem, cardsInfo, key, token) {
  const checklistId = currentItem.parents("li").data("checklist-id");
  const checkItemId = currentItem.parents("li").data("id");
  cardsInfo.forEach(eachCard => {
    if (eachCard.idChecklists.includes(checklistId)) {
      fetch(
        `https://api.trello.com/1/cards/${eachCard.id}/checkItem/${checkItemId}?key=${key}&token=${token}&state=incomplete`,
        {
          method: "PUT"
        }
      ).catch(error => console.error("Error:", error));
    }
  });
}

function addCheckboxListener(cardsInfo, key, token) {
  $('.collection input[type="checkbox"]').click(function() {
    if ($(this).is(":checked")) {
      $(this)
        .parents(".collection-item")
        .find(".item-name")
        .css("text-decoration", "line-through");
      checkThroughApi($(this), cardsInfo, key, token);
    } else if ($(this).is(":not(:checked)")) {
      $(this)
        .parents(".collection-item")
        .find(".item-name")
        .css("text-decoration", "none");
      uncheckThroughApi($(this), cardsInfo, key, token);
    }
  });
}

function addRemoveListener(key, token) {
  $(".collection .btn-floating").on("click", event => {
    const checklistId = $(event.currentTarget)
      .parents("li")
      .data("checklist-id");
    const checkItemId = $(event.currentTarget)
      .parents("li")
      .data("id");
    $(event.currentTarget)
      .parent()
      .remove();
    fetch(
      `https://api.trello.com/1/checklists/${checklistId}/checkItems/${checkItemId}?key=${key}&token=${token}`,
      {
        method: "DELETE"
      }
    ).catch(error => console.error("Error:", error));
  });
}

function createCollectionItem(items) {
  $(".collection").append(
    `<li class="collection-item red accent-3"><p><label><input type="checkbox" class="filled-in checkbox-blue-grey"/><span>
    </span><p class="item-name"> ${items.name}</p></label></p><a class="btn-floating btn-small waves-effect waves-light blue darken-4"><i class="material-icons">clear</i></a></li>`
  );
  if (items.state == "complete") {
    $('.collection input[type="checkbox"]')
      .last()
      .prop("checked", true);
    $(".collection .item-name")
      .last()
      .css("text-decoration", "line-through");
  }
  $(".collection li")
    .last()
    .data("id", items.id);
  $(".collection li")
    .last()
    .data("checklist-id", items.checklistId);
}

function createCheckListNames(list, card, key, token) {
  $(".checklist-collection").append('<ul class="collection"></ul>');
  list.forEach(item => {
    createCollectionItem(item);
  });
  addCheckboxListener(card, key, token);
  addRemoveListener(key, token);
}

async function getEverything() {
  const key = "4a0d830d67c1acd2c6e927bc368469e9";
  const token =
    "d8295327e9764268b9e8fbb0ffe5b41518a24923f873c859ef2fa0756ebe2935";
  const EightCharBoardID = "fIIRzxc4";
  try {
    const boardID = await getBoardID(EightCharBoardID, key, token);
    const listID = await getListID(boardID, key, token);
    const cards = await getCards(listID, key, token);
    const checklistIds = await getChecklistIDs(cards);
    const checkItemNames = await getCheckItemNames(checklistIds, key, token);

    createCheckListNames(checkItemNames, cards, key, token);
  } catch (err) {
    console.log(err);
  }
}

getEverything();
