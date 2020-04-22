
const path = require('path')

const db = require(path.join(__dirname, 'db'));
const {UserInfo} = db.models;
const {Video} = db.models;
const {Comments} = db.models;
const {Subscriptions} = db.models;
const {Bookmarks} = db.models;
const {videoVotes} = db.models;
const {commentVotes} = db.models;


//Need to use bcrypt
const bcrypt = require('bcrypt');


//USERS
const users = [
  {
    id: '1',
    username: 'Spacey Jane',
    password: 'spaceyjane',
    email: 'spaceyjane@gmail.com',
    imageURL: 'SpaceyJane-By-CharlieHardy-3970-1.jpg',
    subscriberCount: "696969"
  },
  {
    id: '2',
    username: 'Clairo',
    password: 'clairo',
    email: 'clairo@gmail.com',
    imageURL: 'merlin_138539625_2983f99c-a11b-4cf5-a47e-09b35992e12d-articleLarge.jpg',
    subscriberCount: "696969"
  },
  {
    id: '3',
    username: 'Catfish and the Bottlemen',
    password: 'catfish',
    email: 'catfish@gmail.com',
    imageURL: 'MV5BNTZjMzY2YmEtMzQ1OC00Yjg0LThkNDgtNDdmNWJjMjcwZmUxXkEyXkFqcGdeQXVyNTI5NjIyMw@@._V1_.jpg',
    subscriberCount: "696969"
  }, 
  {
    id: '4',
    username: 'Middle Kids',
    password: 'middlekids',
    email: 'middlekids@gmail.com',
    imageURL: 'middle-kids-sign-with-mushroom-music-publishing.jpg',
    subscriberCount: "696969"
  },
  {
    id: '5',
    username: 'Two Door Cinema Club',
    password: 'twodoor',
    email: 'twodoor@gmail.com',
    imageURL: '2_door_cinema_club_118.jpg',
    subscriberCount: "696969"
  },
  {
    id: '6',
    username: 'Mura Masa',
    password: 'muramasa',
    email: 'muramasa@gmail.com',
    imageURL: '220px-Mura_Masa_album.jpg',
    subscriberCount: "696969"
  },
  {
    id: '7',
    username: 'San Cisco',
    password: 'sancisco',
    email: 'sancisco@gmail.com',
    imageURL: 'dca7be54c8b05b97bb64fd771eee5977.jfif',
    subscriberCount: "696969"
  },
  {
    id: '8',
    username: 'Stella Donnelly',
    password: 'stella',
    email: 'stella@gmail.com',
    imageURL: 'Stella_Donnelly_2__Chris_Almeida_1290_855.jpg',
    subscriberCount: "696969"
  },
  {
    id: '9',
    username: 'CrashingSwine05',
    password: 'yeetyeet',
    email: 'jesse@gmail.com',
    imageURL: '2.png',
    subscriberCount: "696969"
  },
  {
    id: '10',
    username: 'Jesse Ultra Chad',
    password: 'yeetyeet',
    email: 'jesse1@gmail.com',
    imageURL: '71224105_685382588635802_3829665034665984000_n.jpg',
    subscriberCount: "696969"
  },
  {
    id: '11',
    username: 'Roy Beta Simp (and proud)',
    password: 'yeetyeet',
    email: 'jesse2@gmail.com',
    imageURL: '67440715_570898303314451_1700881631323095040_n.jpg',
    subscriberCount: "696969"
  },
  {
    id: '12',
    username: 'HWhipped Willie',
    password: 'yeetyeet',
    email: 'jesse3@gmail.com',
    imageURL: '82946664_487130125540844_4583167018970120192_n.jpg',
    subscriberCount: "696969"
  }
]

const videos = [
  {
    id: '1',
    uploader: 'Spacey Jane',
    title: 'Good For You - Live at Laneway Festival',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'goodforyou.mp4',
    tags: "NOTHING",
    views: "7526",
    upvotes: "45693",
    downvotes: "462"
  },
  {
    id: '2',
    uploader: 'Spacey Jane',
    title: 'Good Grief - Live at Laneway Festival',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'goodgrief.mp4',
    tags: "NOTHING",
    views: "11645",
    upvotes: "45693",
    downvotes: "462"
  },
  {
    id: '3',
    uploader: 'Spacey Jane',
    title: 'Head Cold - Spacey Jane',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'headcold.mp4',
    tags: "NOTHING",
    views: "506",
    upvotes: "45693",
    downvotes: "462"
  },
  {
    id: '4',
    uploader: 'CrashingSwine05',
    title: 'Rocket League Clip',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'Rocket League 2019.08.05 - 19.08.23.02.DVR.mp4',
    tags: "NOTHING",
    views: "37",
    upvotes: "45693",
    downvotes: "462"
  },
  {
    id: '5',
    uploader: 'Stella Donnelly',
    title: 'Seasons Greetings Live',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'seasonsgreetings.mp4',
    tags: "NOTHING",
    views: "971",
    upvotes: "45693",
    downvotes: "462"
  },
  {
    id: '6',
    uploader: 'Catfish and the Bottlemen',
    title: '7 - Live from Manchester Arena',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Catfish and the Bottlemen - 7 (Live From Manchester Arena)_s1n5R-FmHYw_240p.mp4',
    tags: "NOTHING",
    views: "572681",
    upvotes: "45693",
    downvotes: "462"
  },
  {
    id: '7',
    uploader: 'Catfish and the Bottlemen',
    title: 'Pacifier - Live from Manchester Arena',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Catfish and the Bottlemen - Pacifier (Live From Manchester Arena)_EAO3OjF7eW8_240p.mp4',
    tags: "NOTHING",
    views: "157953",
    upvotes: "45693",
    downvotes: "462"
  },
  {
    id: '8',
    uploader: 'Clairo',
    title: '4ever - Clairo',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Clairo - 4EVER_tlGUom_AV4o_240p.mp4',
    tags: "NOTHING",
    views: "2458605",
    upvotes: "45693",
    downvotes: "462"
  },
  {
    id: '9',
    uploader: 'Clairo',
    title: 'Drown - Clairo x Cuco',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - CUCO x CLAIRO - DROWN (Official Audio)__1VyGyWpQpU_360p.mp4',
    tags: "NOTHING",
    views: "468245",
    upvotes: "45693",
    downvotes: "462"
  },
  {
    id: '10',
    uploader: 'Catfish and the Bottlemen',
    title: 'Encore - Catfish and the Bottlemen',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Encore_ZV_5mWg_RhI_360p.mp4',
    tags: "NOTHING",
    views: "8052458",
    upvotes: "45693",
    downvotes: "462"
  },
  {
    id: '11',
    uploader: 'Middle Kids',
    title: 'Edge of Town - Middle Kids',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Middle Kids -  Edge of Town_cFWqLLaMOFs_360p.mp4',
    tags: "NOTHING",
    views: "57682",
    upvotes: "45693",
    downvotes: "462"
  },
  {
    id: '12',
    uploader: 'Mura Masa',
    title: 'Deal Wiv It - Mura Masa',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Mura Masa - Deal Wiv It with slowthai (Official Video)_F0uvt97Xn20_360p.mp4',
    tags: "NOTHING",
    views: "13572953",
    upvotes: "45693",
    downvotes: "462"
  },
  {
    id: '13',
    uploader: 'San Cisco',
    title: 'Awkward - San Cisco',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - San Cisco - Awkward_ukNOaKeUEQY_360p.mp4',
    tags: "NOTHING",
    views: "15762",
    upvotes: "45693",
    downvotes: "462"
  },
  {
    id: '14',
    uploader: 'San Cisco',
    title: 'Skin - San Cisco',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: "y2mate.com - San Cisco 'Skin' (Official Music Video)_FHwFEE8od7M_360p.mp4",
    tags: "NOTHING",
    views: "65785",
    upvotes: "45693",
    downvotes: "462"
  },
  {
    id: '15',
    uploader: 'Two Door Cinema Club',
    title: 'Undercover Martyn - TDCC',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - TWO DOOR CINEMA CLUB _ UNDERCOVER MARTYN_LLK4oaXUuLg_360p.mp4',
    tags: "NOTHING",
    views: "23759862",
    upvotes: "45693",
    downvotes: "462"
  },
  {
    id: '16',
    uploader: 'Two Door Cinema Club',
    title: 'What You Know - Live',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Two Door Cinema Club- What You Know (Live) Reading Festival 2011_nIL36WfxVx0_240p.mp4',
    tags: "NOTHING",
    views: "12578953",
    upvotes: "45693",
    downvotes: "462"
  }
]

const comments = [
  {
    id: "1",
    user: "Spacey Jane",
    videoID: "1",
    comment: "Nice vid",
    replyID: "-1"
  }, 
  {
    id: "2",
    user: "Middle Kids",
    videoID: "1",
    comment: "Ok boomer",
    replyID: "1"
  }, 
  {
    id: "3",
    user: "Stella Donnelly",
    videoID: "1",
    comment: "Yeah good one mate",
    replyID: "1"
  }, 
  {
    id: "4",
    user: "Spacey Jane",
    videoID: "1",
    comment: "Stop trolling me!",
    replyID: "-1"
  }, 
  {
    id: "5",
    user: "Two Door Cinema Club",
    videoID: "1",
    comment: "ok",
    replyID: "4"
  }, 
  {
    id: "6",
    user: "Catfish and the Bottlemen",
    videoID: "1",
    comment: "bruh moment #2",
    replyID: "4"
  }, 
  {
    id: "7",
    user: "Roy Beta Simp (and proud)",
    videoID: "12",
    comment: "I am big simp!",
    replyID: "-1"
  }, 
  {
    id: "8",
    user: "HWhipped Willie",
    videoID: "12",
    comment: "I am very whipped haha!",
    replyID: "7"
  }, 
  {
    id: "9",
    user: "Jesse Ultra Chad",
    videoID: "12",
    comment: "Tell me something I don't know you two!!!",
    replyID: "7"
  }
]

async function fillDB() {

  for (user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const use = await UserInfo.create({
      id: user.id,
      username: user.username,
      password: hashedPassword,
      email: user.email,
      imageURL: user.imageURL,
      subscriberCount: user.subscriberCount
    });
    //console.log(use);
  }

  for (video of videos) {
    await Video.create({
      id: video.id,
      uploader: video.uploader,
      title: video.title,
      description: video.description,
      videoURL: video.videoURL,
      tags: video.tags,
      viewCount: video.views,
      upvotes: video.upvotes,
      downvotes: video.downvotes
    });
  }

  //Create comment for testing
  for (comment of comments) {
    await Comments.create({
      id: comment.id,
      replyID: comment.replyID,
      comment: comment.comment,
      user: comment.user,
      videoID: comment.videoID
    });
  }

}

//Try to sync database
async function setUp() {
    try {
        await db.sequelize.sync({force: true});
        //await fillDB();
    } catch (error) {
      console.log(error);
        console.log("Database unable to be synced");
    }
};
setUp();


const express = require("express");
const pug = require("pug");
const app = express();
var bodyParser = require('body-parser');

const expressSession = require("express-session");

const sessionName = 'sid';
app.use(expressSession({
  name: sessionName,
  cookie: {
    maxAge: (1000 * 60 * 60),
    sameSite: true,
    secure: false
  },
  secret: 'isthisthingon?', 
  saveUninitialized: true, 
  resave: false
}));

//Get Routes
const userRoutes = require(path.join(__dirname, 'routes/users'));
app.use('/users', userRoutes);
const videoRoutes = require(path.join(__dirname, 'routes/video'));
app.use('/video', videoRoutes);
const accountRoutes = require(path.join(__dirname, 'routes/account'));
app.use('/account', accountRoutes);
const uploadRoutes = require(path.join(__dirname, 'routes/upload'));
app.use('/upload', uploadRoutes);
const searchRoutes = require(path.join(__dirname, 'routes/search'));
app.use('/search', searchRoutes);

//Set view engine and tell express where to look for views
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());


app.use((req, res, next) => {
  if (!req.session.username) {
    if (req.cookies.username) {
      res.clearCookie("username");
      console.log("Login cookie cleared");
    }  
  }
  next();
});


app.get('/', (req, res) => {
  if (!req.session.username) {
    //req.session.username = "Spacey Jane";
    //res.cookie("username", "Spacey Jane");
    //req.session.save();
  }
  res.redirect('video');
});

app.get('*', (req, res) => {
  res.render("404", {message: "You have requested an invalid route"});
});

app.listen(3000);
console.log("Web server listening on port 3000");
