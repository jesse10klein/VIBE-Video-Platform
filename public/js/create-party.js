


window.onload = function() {
  window.addEventListener("beforeunload", function (e) {

      var confirmationMessage = 'It looks like you have been editing something. '
                              + 'If you leave before saving, your changes will be lost.';

      (e || window.event).returnValue = confirmationMessage;
      return confirmationMessage;
  });
};

function chooseAnotherVideo() {
  const userList = [];
  const users = $("#users .partyUser p");
  if (users.length > 0) {
    users.each(function( index ) {
      if (index == 0) {
        userList.push(getCookie("username"));
        return;
      }
      userList.push($(this).text());
    });
  }
  userList.shift();

  const queryString = userList.join('`');
  window.location.pathname = `/watch-party/select-video/${queryString}`;
}

function startWatchParty() {

  const userList = [];
  const users = $("#users .partyUser p");
  if (users.length > 0) {
    users.each(function( index ) {
      if (index == 0) {
        userList.push(getCookie("username"));
        return;
      }
      userList.push($(this).text());
    });
  }
  const userString = userList.join("`");

  const url = "/watch-party/create-session";
  data = { userString };

  //Send post request to create the session in the database
  //On success, redirect to the created watchparty session
  ///watch-party/session/:id

  $.ajax({
    url, type: "POST", data,
    success: function(response) {
      console.log(response);
    }
  })
}

$("#search-users").on('keyup', function () {

  console.log("Here");

  const searchTerm = $("#search-term").val();
  const url = "/messages/home/process-autocomplete";

  if (searchTerm.length < 4) {
    updateAutoComplete({matches: []})
    console.log("Search isn't specific enough");
    return;
  } 

  //Get list of users already added so we don't add dups
  const userList = [];
  const users = $("#users .partyUser p");
  if (users.length > 0) {
    users.each(function( index ) {
      if (index == 0) {
        userList.push(getCookie("username"));
        return;
      }
      userList.push($(this).text());
    });
  }

  if (userList.length == 5) {
    console.log("Max 10 people per watch party");
    return;
  }

  const data = { searchTerm, filled: userList };

  $.ajax({
    url, type: "POST", data,
    success: function(response) {
      updateAutoComplete(response);
    }
  })
});

function resizeContent() {
  //Get video and change dimensions
  const content = document.getElementById("content");
  console.log(content);

  const sidebar_width = 320;
  
  const width = window.innerWidth - sidebar_width;
  content.style.width = width + "px";

};

function addUser(elem) {
  console.log("Attempting to add user");
  const HTML = `<div class="partyUser"> ${$(elem).html()} </div>`
  $("#users").append(HTML);
  const dd = $("#search-dropdown");
  dd.css("display", "none");
  $("#search-term").val("");
}

function formatAutocompleteTag(tag) {
  const HTML = `
    <button class="autocomplete-tag" onclick=addUser(this)>
      <img src="/images/user-thumbs/${tag.imageURL}"> </img>
      <p>${tag.username}</p>
    </button>
  `
  return HTML;
}
  
function updateAutoComplete(response) {
  
  const { matches } = response;
  const dropdown = $("#search-dropdown");
  dropdown.empty();
  
  let HTMLString = "";
  for (let i = 0; i < matches.length; i++) {
      HTMLString += formatAutocompleteTag(matches[i]);
  }
  
  dropdown.append(HTMLString);
  dropdown.css("display", "flex");
  dropdown.css("flex-direction", "column");
  
}