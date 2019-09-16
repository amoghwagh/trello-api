function getBoardID(boardID, key, token) {
  return new Promise((resolve, reject) => {
    fetch(
      `https://api.trello.com/1/boards/${boardID}?fields=name,url&key=${key}&token=${token}`
    )
      .then(function(response) {
        return response.json();
      })
      .then(function(myJson) {
        resolve(myJson["id"]);
      })
      .catch(err => reject(err));
  });
}

function getListID(boardID, key, token) {
  return new Promise((resolve, reject) => {
    fetch(
      `https://api.trello.com/1/boards/${boardID}/lists?cards=none&card_fields=all&filter=open&fields=all&key=${key}&token=${token}`
    )
      .then(function(response) {
        return response.json();
      })
      .then(function(myJson) {
        resolve(myJson[0]["id"]);
      })
      .catch(err => reject(err));
  });
}

function getCards(listID, key, token) {
  return new Promise((resolve, reject) => {
    fetch(
      `https://api.trello.com/1/lists/${listID}/cards?key=${key}&token=${token}`
    )
      .then(function(response) {
        return response.json();
      })
      .then(function(myJson) {
        console.log(myJson);
      })
      .catch(err => reject(err));
  });
}

async function getBoards() {
  const key = "4a0d830d67c1acd2c6e927bc368469e9";
  const token =
    "d8295327e9764268b9e8fbb0ffe5b41518a24923f873c859ef2fa0756ebe2935";
  const EightCharBoardID = "fIIRzxc4";
  try {
    const boardID = await getBoardID(EightCharBoardID, key, token);
    const listID = await getListID(boardID, key, token);
    const cards = await getCards(listID, key, token);
    console.log(cards);
  } catch (err) {
    console.log(err);
  }
}

getBoards();
