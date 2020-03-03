//CREATE NEW USER BASED ON SIGN UP DATA
router.post('/process-signup', asyncHandler(async (req, res) => {
    user = await UserInfo.create({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
        
    })
    res.send("USER CREATED");
}));

//CHECK IF LOGIN MATCHES USER
router.post('/login-check', asyncHandler(async (req, res) => {

    if (req.cookies.username) {
      console.log("Already signed in");
      res.redirect("/");
    }
  
    const user = await UserInfo.findAll({ 
      where: {
      username: req.body.username,
      password: req.body.password
          }
    });
  
    //Check if user is in the system
    const match = user[0];
    try {
      const username = match.toJSON().username
      res.cookie("username", username);
      res.redirect("/");
    } catch(error) {
      res.send("Incorrect username or password");
    }
  
  }));

//Sorting comments under video
//CHECK IF LOGIN MATCHES USER
router.get('/video/:id', asyncHandler(async (req, res) => {

    const video = await Videos.findByPk(req.params.id);
    
    const comments = await Comments.findAll({ 
        order: [["createdAt", "DESC"]],
        where: { videoID = req.params.id }
    });

    res.render("video", {video, comments});
    
  
  }));
