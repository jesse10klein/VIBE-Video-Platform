console.log("messages.js");


window.onresize = resizeContent;
window.onload = resizeContent; 

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function resizeContent() {
  //Get video and change dimensions
  const content = document.getElementById("content");

  const sidebar_width = 270;

   const width = window.innerWidth - sidebar_width;
   content.style.width = width + "px";
};

function formatMessageHTML(messageText, sentByUser) {

  let HTML = "";
  if (sentByUser) {
    HTML = `
      <div class="convoMessage">
        <p class="sentByUser"> ${messageText} </p>
      </div>
    
    `;
  } else {
    HTML = `
    <div class="convoMessage">
      <p class="sentByOther"> ${messageText.message} </p>
      <p class="messageID"> ${messageText.id} </p>
    </div>
  
    `;
  }
  return HTML;

}

function sendMessage() {

  const form = $("#message-form");
  const message =  $('#message').val();

  const url = window.location.pathname + "/add-message";
  const data = {message};

  //We need to send back the created message because it needs to be added to the
    //top of the sidebar

  $.ajax({
      url, type: "POST", data,
      success: function(response) {
        const message = response.messageSent;
      
        sent = getCookie("username") == message.sender;
        message.sentByUser = getCookie("username") == message.sender;
        message.toUser = sent ? message.recipient : message.sender;
        message.imageURL = $("#userInfo img").attr("src");

        updateSidebarMessageUtility(message, "opened");

        //Add to conversation
        const node = $($.parseHTML(formatMessageHTML(message.message, true)));
        (node).insertAfter(form);
        //Empty comment box
        $('#message').val("");
      }
  })
}

function formatSidebarMessage(message, type) {
  let HTML = `
    <a class="message" href="/messages/${message.toUser}"> 
      <div class="flexDiv ${type}">
        <img class="pp" src="${message.imageURL}"> </img>
        <div class="messageInfo">
          <h1>${message.toUser}</h1>
          <h3>${message.message}</h3>`
          if (message.sentByUser) {
            HTML += `<p> Sent Just now </p>`
          } else {
            HTML += `<p> Recieved Just now </p>`
          }
        HTML += `</div>
      </div>
    </a>
  `;
  console.log(HTML);
  return HTML;
}

function pollForMessages() {
  console.log("Polling for new messages");

  //Get ID of last recieved message
  const messagesRecieved = $(".convoMessage .sentByOther");
  let lastRecievedID = null;
  if (messagesRecieved.length == 0) {
    lastRecievedID = -1;
  } else {
    lastRecievedID = $(messagesRecieved[0]).next().text();
  }

  const data = {lastRecievedID};
  const url = window.location.pathname + "/poll-for-messages"

  $.ajax({
    url, type: "POST", data,
    success: function(response) {
      console.log(response);
      updateMessages(response);
      setTimeout(pollForMessages, 1000);
    }
  });
}

function updateMessages(response) {
  const { newMessages } = response;

  if (newMessages.length > 0) {
    const newMessage = newMessages[0];
    sent = getCookie("username") == newMessage.sender;
    newMessage.sentByUser = getCookie("username") == newMessage.sender;
    newMessage.toUser = sent ? newMessage.recipient : newMessage.sender;
    newMessage.imageURL = $("#userInfo img").attr("src");

    updateSidebarMessageUtility(newMessage, "opened");
  }

  let HTMLString = "";
  for (let i = 0; i < newMessages.length; i++) {
    HTMLString += formatMessageHTML(newMessages[i], false);
  }
  const form = $("#message-form")
  const node = $($.parseHTML(HTMLString));
  (node).insertAfter(form);
}

function updateSidebarMessageUtility(message, option) {
  console.log("Updating sidebar");

  //Loop through messages and find same sendUser
  const sidebarMessages = document.querySelectorAll("#messages .message");
  for (let i = 0; i < sidebarMessages.length; i++) {
    const name = $(sidebarMessages[i]).find(".messageInfo h1").text();
    if (name == message.toUser) {
      $(sidebarMessages[i]).remove();
    }
  }

  const sidebarNode = $($.parseHTML(formatSidebarMessage(message, option)));
  $("#messages").prepend(sidebarNode);
}

function pollAllMessages() {
  console.log("Polling all messages");
  //Don't need any data, just refreshing messages every 20 seconds
  const data = {};
  const url = window.location.pathname + "/poll-for-all-messages"

  $.ajax({
    url, type: "POST", data,
    success: function(response) {
      console.log(response);

      const { messages } = response;
      for (let i = 0; i < messages.length; i++) {
        sent = getCookie("username") == messages[i].sender;
        messages[i].sentByUser = getCookie("username") == messages[i].sender;
        messages[i].toUser = sent ? messages[i].recipient : messages[i].sender;
        messages[i].imageURL = `/images/user-thumbs/${messages[i].imageURL}`;

        updateSidebarMessageUtility(messages[i], "unopened");
      }

      setTimeout(pollAllMessages, 10000);
    }
  });
}


//Don't poll for specific messages if we're on the home page
if (window.location.pathname != "/messages/home") {
  pollForMessages();
}
pollAllMessages();

$("#search-users").on('keyup', function () {

  const searchTerm = $("#search-term").val();
  const data = { searchTerm }
  const url = window.location.pathname + "/process-autocomplete";

  if (searchTerm.length < 4) {
    updateAutoComplete({matches: []})
    console.log("Search isn't specific enough");
    return;
  } 

  $.ajax({
    url, type: "POST", data,
    success: function(response) {
      updateAutoComplete(response);
    }
  })


});

function formatAutocompleteTag(tag) {
  const HTML = `
    <a class="autocomplete-tag" href="/messages/${tag.username}">
      <img src="/images/user-thumbs/${tag.imageURL}"> </img>
      <p> ${tag.username} </p>
    </a>
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

  setTimeout(function () {
    const dd = $("#search-dropdown");
    dd.css("display", "none");
  }, 10000);



}