const NUM_CATEGORIES = 6;
const NUM_CLUES_PER_CAT = 5;

let categories = [];

async function getCategoryIds() {
  let response = await axios.get('https://jservice.io/api/categories', {params: {count: 100}});
  let categoryIds = response.data.map(category => category.id);
  return _.sampleSize(categoryIds, NUM_CATEGORIES);
}

async function getCategory(catId) {
  let response = await axios.get(`https://jservice.io/api/category?id=${catId}`);
  let category = response.data;
  let allClues = category.clues;
  let clues = _.sampleSize(allClues, NUM_CLUES_PER_CAT);
  return { title: category.title, clues: clues.map(clue => ({question: clue.question, answer: clue.answer, showing: null})) };
}

async function fillTable() {
  $("#jeopardy thead").empty();
  let $tr = $("<tr>");
  for (let category of categories) {
    $tr.append($("<th>").text(category.title));
  }
  $("#jeopardy thead").append($tr);

  $("#jeopardy tbody").empty();
  for (let clueIndex = 0; clueIndex < NUM_CLUES_PER_CAT; clueIndex++) {
    let $tr = $("<tr>");
    for (let catIndex = 0; catIndex < NUM_CATEGORIES; catIndex++) {
      $tr.append($("<td>").attr("id", `${catIndex}-${clueIndex}`).text("?"));
    }
    $("#jeopardy tbody").append($tr);
  }
}

function handleClick(evt) {
  let id = evt.target.id;
  let [catId, clueId] = id.split("-");
  let clue = categories[catId].clues[clueId];

  let msg;

  if (!clue.showing) {
    msg = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    msg = clue.answer;
    clue.showing = "answer";
  } else {
    return;
  }

  $(`#${catId}-${clueId}`).html(msg);
}

function showLoadingView() {
  $("#load").show();
  $("#start").hide();
}

function hideLoadingView() {
  $("#load").hide();
  $("#start").show();
}

async function setupAndStart() {
  showLoadingView();
  let categoryIds = await getCategoryIds();

  categories = [];

  for (let catId of categoryIds) {
    categories.push(await getCategory(catId));
  }

  fillTable();
  hideLoadingView();
}

$(async function() {
  $("#start").on("click", setupAndStart);
  $("#jeopardy").on("click", "td", handleClick);
});


