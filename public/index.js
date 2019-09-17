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
      return card.idChecklists[0];
    })
    .filter(ele => (ele !== undefined ? true : false));

  return checklistIdArray;
}

function getCheckItems(itemsArray) {
  return new Promise(resolve => {
    itemsArray = itemsArray.map(item => item.name);
    resolve(itemsArray);
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
    const checkItemNames = await getCheckItems(data.flat());
    return checkItemNames;
  });
}

function createCollectionItem(item) {
  $(".collection").append(
    `<li class="collection-item red accent-3"><p> <label class="centre"> <input type="checkbox" class="filled-in checkbox-blue-grey" /> <span>${item}</span></label></p><a class="btn-floating btn-small waves-effect waves-light blue darken-4"><i class="material-icons">clear</i></a></li>`
  );
}

function createCheckListNames(list) {
  list.forEach(item => createCollectionItem(item));
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
    createCheckListNames(checkItemNames);
  } catch (err) {
    console.log(err);
  }
}

getEverything();
