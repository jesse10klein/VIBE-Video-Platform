console.log("universal.js")

pollForUpdates();

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

//Polls for updates to the notification and message read numbers
function pollForUpdates() {

  console.log("Polling for updates");

  //Make sure user is logged way
  if (getCookie("username") == "") {
    return;
  }

  //Don't need any data..
  const data = {};
  const url = "/users/update-notifications"
 
  $.ajax({
    url, type: "POST", data,
    success: function(response) {

      const { unreadMessages, unreadNotifications } = response;

      $("#messageNumber").text(unreadMessages);
      if (unreadMessages > 0) {
        $("#messageNumber").css("display", "block");
      } else {
        $("#messageNumber").css("display", "none");
      }

      $("#notificationNumber").text(unreadNotifications);
      if (unreadNotifications > 0) {
        $("#notificationNumber").css("display", "block");
      } else {
        $("#notificationNumber").css("display", "none");
      }

      setTimeout(pollForUpdates, 2000);
    }
  });
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
  if (response.length == 0) {
    $("#notificationContainer").append(`
      <div class="notification">
        <p>No notifications for you yet</p>
      </div>
    `);
  }
  $("#notificationContainer").css("display", "flex");
  $("#notificationContainer").css("flex-direction", "column");
}

function formatNotificationHTML(notification) {

  //SKELETON
  HTML = `
    <div class="notification">
      <a class="${notification.notificationType} `
      if (!notification.read) {
        HTML += `unopened`;
      }
      HTML += `" href="/users/notifications/${notification.id}"> 
        <img class="notpp" src="/images/user-thumbs/${notification.imageURL}"> </img>
      <p>`;
      if (notification.notificationType == "Subscribe") {
        HTML += `${notification.user} has subscribed to you</p>`;
      } else if (notification.notificationType == "Reply") {
        HTML += `${notification.user} Has replied to your comment on ${notification.uploader}'s video</p>
        <video class="notification-video" src="/videos/${notification.videoURL}#t=2" muted></video>`;
      } else if (notification.notificationType == "Comment") {
        HTML += `${notification.user} Has commented on your video: ${notification.videoTitle}</p>
        <video class="notification-video" src="/videos/${notification.videoURL}#t=2" muted></video>`;
      } else { //Someone has uploaded a new video
        HTML += `${notification.user} Has uploaded a new video: ${notification.videoTitle}</p>
        <video class="notification-video" src="/videos/${notification.videoURL}#t=2" muted></video><`;
      }
      
    HTML += `  
      </a>
    </div>  
  `;
  return HTML;
}