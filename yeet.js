

function verifyEmail() {

    const { username } = req.session;

    if (username == null) {
        res.send("You must login before you can verify your email");
        return;
    }

    //Update email registered in db
}