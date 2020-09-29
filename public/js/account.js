


function goBack() {
  window.location.pathname = '/account';
}

async function processAccountDelete() {

  let data = {};

  url = window.location.pathname;

  $.ajax({
     url, type: "POST", data,
     success: function(response) {

      console.log("Account deleted successfully");

     }
  })
  window.location.pathname = '/';
}