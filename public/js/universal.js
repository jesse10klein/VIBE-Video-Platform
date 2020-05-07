console.log("universal.js")

/*
    This file is to be run in the background of all routes!
    Contains polling functions to fetch notifications and new messages
*/

function formatNumber(number) {
  if (number < 1000) {
    return number;
  } else if (number < 1000000) {
    return Math.floor(number / 1000) + "K";
  } else {
    return Math.floor(number / 1000000) + "M";
  }
}

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


function pollForNotifications() {
  console.log("Need to implement notification polling");
}

function pollForMessages() {
  console.log("Need to implement message polling");
}

function fetchNotifications() {

  //If box is open, close it
  if ($("#notificationContainer").get(0).style.display == "flex") {
    $("#notificationContainer").css("display", "none");
    return;
  }

  $("#notificationContainer").empty();

  if (getCookie("username") == "") {
    window.location.href = "/users/login";
  }

  //Don't need any data..
  const data = {};
  const url = "/users/fetch-notifications"

  $.ajax({
    url, type: "POST", data,
    success: function(response) {
      console.log(response);
      displayNotifications(response);
    }
  });
}

function displayNotifications(response) {
  for (let i = 0; i < response.length; i++) {
    const notification = response[i];
    $("#notificationContainer").append(formatNotificationHTML(notification));
  }
  $("#notificationContainer").css("display", "flex");
  $("#notificationContainer").css("flex-direction", "column");
}

function formatNotificationHTML(notification) {

  //SKELETON
  HTML = `
    <div class="notification">
      <a href="/users/${notification.user}"> 
        <img class="notpp" src="/images/user-thumbs/${notification.imageURL}"> </img>
      </a>
      <h1>`;
      if (notification.notificationType == "Subscribe") {
        HTML += `${notification.user} Has subscribed to you</h1>`;
      } else if (notification.notificationType == "Reply") {
        HTML += `${notification.user} Has replied to your comment</h1>`;
      } else if (notification.notificationType == "Comment") {
        HTML += `${notification.user} Has commented on your video: ${notification.videoTitle}</h1>
        <a href="/video/${notification.contentID}">
        <video class="notification-video" src="/videos/${notification.videoURL}#t=2" muted></video></a>`;
      } else { //Someone has uploaded a new video
        HTML += `${notification.user} Has uploaded a new video: ${notification.videoTitle}</h1>
        <a href="/video/${notification.contentID}">
        <video class="notification-video" src="/videos/${notification.videoURL}#t=2" muted></video></a>`;
      }
      
    HTML += `  
    </div>  
  `;
  return HTML;
}