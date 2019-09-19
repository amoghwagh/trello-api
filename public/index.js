async function getBoardID(boardID, key, token) {
  try {
    const fetchCall = await fetch(
      `https://api.trello.com/1/boards/${boardID}?fields=name,url&key=${key}&token=${token}`
    );
    const jsonRetrieved = await fetchCall.json();
    return jsonRetrieved.id;
  } catch (err) {
    alert("Failed to retrieve board...");
  }
}

async function getListID(boardID, key, token) {
  try {
    const fetchCall = await fetch(
      `https://api.trello.com/1/boards/${boardID}/lists?cards=none&card_fields=all&filter=open&fields=all&key=${key}&token=${token}`
    );
    const jsonRetrieved = await fetchCall.json();
    return jsonRetrieved[0].id;
  } catch (err) {
    alert("Failed to retrieve List...");
  }
}

async function getCards(listID, key, token) {
  try {
    const fetchCall = await fetch(
      `https://api.trello.com/1/lists/${listID}/cards?key=${key}&token=${token}`
    );
    const jsonRetrieved = await fetchCall.json();
    return jsonRetrieved;
  } catch (err) {
    alert("Failed to retrieve cards...");
  }
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
  return itemsArray.map(item => {
    return {
      name: item.name,
      id: item.id,
      checklistId: item.idChecklist,
      state: item.state
    };
  });
}

async function getCheckItemNames(checklists, key, token) {
  try {
    const checkItemPromises = checklists.map(async checklist => {
      const fetchCall = await fetch(
        `https://api.trello.com/1/checklists/${checklist}?key=${key}&token=${token}`
      );
      const json = await fetchCall.json();
      return json.checkItems;
    });
    const checkItemData = await Promise.all(checkItemPromises);
    const checkItemNamesObj = await getCheckItems(checkItemData.flat());
    return checkItemNamesObj;
  } catch (err) {
    alert("Failed to retrieve check items");
    return err;
  }
}

function checkOrUncheckThroughApi(currentItem, cardsInfo, key, token) {
  const checklistData = currentItem.parents("li").data();

  if (checklistData.state === "incomplete") {
    currentItem.parents("li").data("state", "complete");
  } else {
    currentItem.parents("li").data("state", "incomplete");
  }

  cardsInfo.forEach(async eachCard => {
    if (eachCard.idChecklists.includes(checklistData.checklistId)) {
      try {
        await fetch(
          `https://api.trello.com/1/cards/${eachCard.id}/checkItem/${checklistData.id}?key=${key}&token=${token}&state=${checklistData.state}`,
          {
            method: "PUT"
          }
        );
      } catch (err) {
        alert("Failed to do the operation. Please check if you are online.");
        if (currentItem.is(":checked")) {
          currentItem.prop("checked", false);
        } else {
          currentItem.prop("checked", true);
        }
        return err;
      }
    }
  });
}

function addCheckboxListener(cardsInfo, key, token) {
  $('.collection input[type="checkbox"]').click(function() {
    try {
      checkOrUncheckThroughApi($(this), cardsInfo, key, token);
      $(this)
        .parents(".collection-item")
        .find(".item-name")
        .toggleClass("strike");
    } catch (err) {
      return err;
    }
  });
}

async function removeItemThroughApi(currentElement, key, token) {
  const checklistData = $(currentElement)
    .parents("li")
    .data();
  try {
    await fetch(
      `https://api.trello.com/1/checklists/${checklistData.checklistId}/checkItems/${checklistData.id}?key=${key}&token=${token}`,
      {
        method: "DELETE"
      }
    );
    $(currentElement)
      .parent()
      .remove();
  } catch (error) {
    alert("Failed to do the operation. Please check if you are online.");
    return error;
  }
}

function activateRemoveListener(key, token) {
  $(".collection .btn-floating").on("click", event => {
    removeItemThroughApi(event.currentTarget, key, token);
  });
}

function createCollectionItem(item) {
  let htmlString = `<li class="collection-item hoverable red accent-3"><p><label><input type="checkbox" class="filled-in checkbox-blue-grey"/><span>
  </span><div class="textarea-section inline" style="display:none" >
  <input type="materialize-textarea" class="item-name-textarea"/>
  </div><p class="item-name">${item.name}</p></label></p><a class="btn-floating btn-small waves-effect waves-light blue darken-4"><i class="material-icons">clear</i></a></li>`;

  let collectionItem = $.parseHTML(htmlString);

  $(".collection").append(collectionItem);

  if (item.state == "complete") {
    $(collectionItem)
      .find('input[type="checkbox"]')
      .prop("checked", true);
    $(collectionItem)
      .find(".item-name")
      .prop("checked", true)
      .toggleClass("strike");
  }

  $(collectionItem).data("id", item.id);
  $(collectionItem).data("checklist-id", item.checklistId);
  $(collectionItem).data("state", item.state);
}

async function createNewItemThroughApi(newItemObj, key, token) {
  try {
    const fetchCall = await fetch(
      `httpss://api.trello.com/1/checklists/${newItemObj.checklistId}/checkItems?name=${newItemObj.name}&pos=bottom&checked=false&key=${key}&token=${token}`,
      {
        method: "POST"
      }
    );
    const json = await fetchCall.json();
    const itemId = json.id;
    return itemId;
  } catch (err) {
    alert("Failed to do the operation. Please check if you are online.");
    const itemId = "Error";
    return itemId;
  }
}

async function createNewItem(card, newItem, key, token) {
  try {
    const newItemObj = {
      name: newItem,
      state: "incomplete",
      checklistId: "5d81d3e72855295cc63dc4e6"
    };
    const itemId = await createNewItemThroughApi(newItemObj, key, token);
    if (itemId !== "Error") {
      newItemObj.id = itemId;
      createCollectionItem(newItemObj);
      addCheckboxListener(card, key, token);
      activateRemoveListener(key, token);
      addTextboxListener(card, key, token);
    } else throw err;
  } catch (err) {
    return err;
  }
}

function addCheckItem(cards, key, token) {
  const inputField = $(".todo-card").find(".addCheckItem");
  let value = "";
  inputField.parents("form").submit(event => event.preventDefault());
  inputField.on("click", () => {
    inputField.val("");
  });
  inputField.focusout(() => {
    inputField.val("");
    inputField.siblings("label").removeClass("active");
  });
  inputField.on("keyup change", event => {
    if (event.which === 13) {
      value = inputField.val();
      if (value !== "") {
        createNewItem(cards, value, key, token);
        $(".collection").animate({ scrollTop: 9999 }, 1500);
        inputField.val("");
      }
    }
  });
}

function updateParaName(para, value) {
  $(para).text(value);
  $(para).css("display", "inline");
}

function updateNameThroughApi(value, para, cardsInfo, key, token) {
  const checklistId = $(para)
    .parents("li")
    .data("checklist-id");
  const checkItemId = $(para)
    .parents("li")
    .data("id");
  cardsInfo.forEach(eachCard => {
    if (eachCard.idChecklists.includes(checklistId)) {
      fetch(
        `https://api.trello.com/1/cards/${eachCard.id}/checkItem/${checkItemId}?key=${key}&token=${token}&name=${value}`,
        {
          method: "PUT"
        }
      ).catch(error => console.error("Error:", error));
    }
  });
}

function updateItemName(para, textInput, cards, key, token) {
  $(textInput).on("keyup change", event => {
    if (event.which === 13) {
      const value = textInput.val();
      if (value !== "") {
        updateParaName(para, value);
        updateNameThroughApi(value, para, cards, key, token);
        $(textInput)
          .parent()
          .css("display", "none");
      }
    }
  });
}

function addTextboxListener(cards, key, token) {
  $(".collection .item-name").on("click", event => {
    const textarea = $(event.currentTarget).siblings(".textarea-section");
    const textareaInput = $(textarea).children(".item-name-textarea");

    $(textarea).css("display", "inline");
    $(textarea)
      .children(".item-name-textarea")
      .attr("value", $(event.currentTarget).text());
    $(textarea)
      .children(".item-name-textarea")
      .focus();
    $(event.currentTarget).css("display", "none");
    updateItemName(event.currentTarget, textareaInput, cards, key, token);
    // When textbox Loses Focus
    $(textarea).focusout(() => {
      $(textarea).css("display", "none");
      $(event.currentTarget).css("display", "inline");
    });
  });
}

function createCheckListNames(list, card, key, token) {
  $(".checklist-collection .preloader-wrapper").remove();
  $(".checklist-collection").append('<ul class="collection hoverable"></ul>');
  list.forEach(item => {
    createCollectionItem(item);
  });
  addCheckboxListener(card, key, token);
  activateRemoveListener(key, token);
  addTextboxListener(card, key, token);
}

async function init() {
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
    addCheckItem(cards, key, token);
    createCheckListNames(checkItemNames, cards, key, token);
    addTextboxListener(cards, key, token);
  } catch (err) {
    alert(err);
  }
}

init();
