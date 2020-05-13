



//User if in a watch-party and this is the poll notifications function
router.post('/:id/poll-for-updates', tools.asyncHandler(async (req, res) => {

  //Get the last notification id from the user
  const { lastNotificationID } = req.body;

  const { username } = req.session;
  if (username == null) {
    res.redirect("/users/login");
    return;
  }

  const party = await WatchParty.findOne({where: {id: req.params.id}});
  if (party == null) {
    res.redirect("404", {message: "The watch party you are trying to view has ended"});
    return;
  }

  const partyNotifications = await PartyNotifications.findAll({
    where: {partyID: party.id}, 
    order: [["createdAt", "DESC"]],
  });

  //Get all new notifications
  for (let i = 0; i < partyNotifications.length; i++) {
    if (partyNotifications[i].id == lastNotificationID) {
      partyNotifications = partyNotifications.slice(i + 1);
      break;
    }
  }

  res.send(partyNotifications);

  
}));

//Client side

function pollForPartyUpdates() {

  const url = window.location.pathname + "/poll-for-updates";
  const data = { lastNotificationID: $("#notifications .notification").last().find(".id").val() };

  $.ajax({
    url, type: "POST", data, dataType: 'json',
    success: function(response) {
      console.log(response);
      for (let i = 0; i < response.length; i++) {
        const notification = response[i];
        if (notification.type == "left" || notification.type == "joined") {
          handleUserConnections(notification);
        } else if (notification.type == "play" || notification.type == "pause" || notification.type == "skip") {
          handleAdminActions(notification);
        }
      }
    }
  })
}

//WHEN A USER HAS JOINED OR LEFT
function handleUserConnections(notification) {

  const HTML = `
    <div class="partyNotification"
      <img src="/images/user-thumbs/${notification.imageURL}">
      <p class="partyUsername"> ${notification.user} </p>
      <p class="partyTime"> ${notification.formattedTimeSince} </p>
    </div>
  `
  console.log(HTML);

}

//WHEN THE ADMIN PLAYS/PAUSES ETC
function handleAdminActions(notification) {
  const video = document.getElementById("partyVideo");
  if (notification.type == "pause") video.pause();
  if (notification.type == "play") video.play();

  if (notification.type == "skip") {
    vid.play();
    vid.pause();
    vid.currentTime = notification.time;
    vid.play();
  }
}

//Get the notification in a form that can be parsed on the client side
async function formatNotification(notification) {
  const user = await UserInfo.findOne({where: {username: notification.user}});
  const notif = {
    id: notification.id,
    partyID: notification.partyID,
    user: notification.user,
    type: notification.type,
    formattedTimeSince: tools.formatTimeSince(notification.createdAt),
    imageURL: user.imageURL
  }
  return notif;
}




