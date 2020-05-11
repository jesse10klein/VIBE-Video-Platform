
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
    imageURL: 'spaceyjane.jpg',
    bannerURL: 'spaceyjane.jpg',
    subscriberCount: "0"
  },
  {
    id: '2',
    username: 'Clairo',
    password: 'clairo',
    email: 'clairo@gmail.com',
    imageURL: 'clairo.jpg',
    bannerURL: 'clairo.jpg',
    subscriberCount: "0"
  },
  {
    id: '3',
    username: 'Catfish and the Bottlemen',
    password: 'catfish',
    email: 'catfish@gmail.com',
    imageURL: 'catfish.jpg',
    bannerURL: 'catfish.png',
    subscriberCount: "0"
  }, 
  {
    id: '4',
    username: 'Middle Kids',
    password: 'middlekids',
    email: 'middlekids@gmail.com',
    imageURL: 'middlekids.jpg',
    bannerURL: 'middlekids.jpg',
    subscriberCount: "0"
  },
  {
    id: '5',
    username: 'Two Door Cinema Club',
    password: 'twodoor',
    email: 'twodoor@gmail.com',
    imageURL: 'twodoor.jpg',
    bannerURL: 'twodoor.png',
    subscriberCount: "0"
  },
  {
    id: '6',
    username: 'Mura Masa',
    password: 'muramasa',
    email: 'muramasa@gmail.com',
    imageURL: 'muramasa.jpg',
    bannerURL: 'muramasa.jpg',
    subscriberCount: "0"
  },
  {
    id: '7',
    username: 'San Cisco',
    password: 'sancisco',
    email: 'sancisco@gmail.com',
    imageURL: 'sancisco.jpg',
    bannerURL: 'sancisco.jpg',
    subscriberCount: "0"
  },
  {
    id: '8',
    username: 'Stella Donnelly',
    password: 'stella',
    email: 'stella@gmail.com',
    imageURL: 'stella.jpg',
    bannerURL: 'stella.jpg',
    subscriberCount: "0"
  },
  {
    id: '9',
    username: 'CrashingSwine05',
    password: 'yeetyeet',
    email: 'jesse@gmail.com',
    imageURL: 'default.png',
    bannerURL: 'default.jpg',
    subscriberCount: "0"
  },
  {
    id: '10',
    username: 'Jesse Ultra Chad',
    password: 'yeetyeet',
    email: 'jesse1@gmail.com',
    imageURL: 'default.png',
    bannerURL: 'default.jpg',
    subscriberCount: "0"
  },
  {
    id: '11',
    username: 'Roy Beta Simp (and proud)',
    password: 'yeetyeet',
    email: 'jesse2@gmail.com',
    imageURL: 'default.png',
    bannerURL: 'default.jpg',
    subscriberCount: "0"
  },
  {
    id: '12',
    username: 'HWhipped Willie',
    password: 'yeetyeet',
    email: 'jesse3@gmail.com',
    imageURL: 'default.png',
    bannerURL: 'default.jpg',
    subscriberCount: "0"
  },
  {
    id: '13',
    username: 'Channel Tres',
    password: 'channeltres',
    email: 'channel@gmail.com',
    imageURL: 'channel.jpg',
    bannerURL: 'channel.png',
    subscriberCount: "0"
  },
  {
    id: '14',
    username: 'Joji',
    password: 'joji',
    email: 'joji@gmail.com',
    imageURL: 'joji.jpg',
    bannerURL: 'joji.jpg',
    subscriberCount: "0"
  },
  {
    id: '15',
    username: 'Oliver Tree',
    password: 'olivertree',
    email: 'oliver@gmail.com',
    imageURL: 'oliver.jpg',
    bannerURL: 'oliver.jpg',
    subscriberCount: "0"
  },
  {
    id: '16',
    username: 'Rex Orange County',
    password: 'rexorange',
    email: 'rexorange@gmail.com',
    imageURL: 'rex.jpg',
    bannerURL: 'rex.jpg',
    subscriberCount: "0"
  },
  {
    id: '17',
    username: 'Rum Jungle',
    password: 'rumjungle',
    email: 'rumjungle@gmail.com',
    imageURL: 'rumjungle.jpg',
    bannerURL: 'rumjungle.jpg',
    subscriberCount: "0"
  },
  {
    id: '18',
    username: 'Tame Impala',
    password: 'tameimpala',
    email: 'tameimpala@gmail.com',
    imageURL: 'tame.jpg',
    bannerURL: 'tame.jpg',
    subscriberCount: "0"
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
    tags: "video`live`laneway`music`indie`australian`spacey jane",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '2',
    uploader: 'Spacey Jane',
    title: 'Good Grief - Live at Laneway Festival',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'goodgrief.mp4',
    tags: "video`live`laneway`music`indie`australian`spacey jane",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '3',
    uploader: 'Spacey Jane',
    title: 'Head Cold - Spacey Jane',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'headcold.mp4',
    tags: "video`music`indie`spacey jane`australian",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '5',
    uploader: 'Stella Donnelly',
    title: 'Seasons Greetings Live',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'seasonsgreetings.mp4',
    tags: "video`live`music`indie`stella donnelly`australian",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '6',
    uploader: 'Catfish and the Bottlemen',
    title: '7 - Live from Manchester Arena',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Catfish and the Bottlemen - 7 (Live From Manchester Arena)_s1n5R-FmHYw_240p.mp4',
    tags: "video`music`live`manchester`arena`english`catfish and the bottlemen",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '7',
    uploader: 'Catfish and the Bottlemen',
    title: 'Pacifier - Live from Manchester Arena',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Catfish and the Bottlemen - Pacifier (Live From Manchester Arena)_EAO3OjF7eW8_240p.mp4',
    tags: "video`music`live`manchester`arena`english`catfish and the bottlemen",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '8',
    uploader: 'Clairo',
    title: '4ever - Clairo',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Clairo - 4EVER_tlGUom_AV4o_240p.mp4',
    tags: "video`music`clairo",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '9',
    uploader: 'Clairo',
    title: 'Drown - Clairo x Cuco',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - CUCO x CLAIRO - DROWN (Official Audio)__1VyGyWpQpU_360p.mp4',
    tags: "video`music`clairo",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '10',
    uploader: 'Catfish and the Bottlemen',
    title: 'Encore - Catfish and the Bottlemen',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Encore_ZV_5mWg_RhI_360p.mp4',
    tags: "video`music`encore`catfish and the bottlemen",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '11',
    uploader: 'Middle Kids',
    title: 'Edge of Town - Middle Kids',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Middle Kids -  Edge of Town_cFWqLLaMOFs_360p.mp4',
    tags: "`video`music`indie`middle kids`",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '12',
    uploader: 'Mura Masa',
    title: 'Deal Wiv It - Mura Masa',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Mura Masa - Deal Wiv It with slowthai (Official Video)_F0uvt97Xn20_360p.mp4',
    tags: "video`music`english`mura masa",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '13',
    uploader: 'San Cisco',
    title: 'Awkward - San Cisco',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - San Cisco - Awkward_ukNOaKeUEQY_360p.mp4',
    tags: "video`music`indie`australian`san cisco",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '14',
    uploader: 'San Cisco',
    title: 'Skin - San Cisco',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: "y2mate.com - San Cisco 'Skin' (Official Music Video)_FHwFEE8od7M_360p.mp4",
    tags: "video`music`indie`australian`san cisco",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '15',
    uploader: 'Two Door Cinema Club',
    title: 'Undercover Martyn - TDCC',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - TWO DOOR CINEMA CLUB _ UNDERCOVER MARTYN_LLK4oaXUuLg_360p.mp4',
    tags: "video`music`english`two door cinema club",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '16',
    uploader: 'Two Door Cinema Club',
    title: 'What You Know - Live',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Two Door Cinema Club- What You Know (Live) Reading Festival 2011_nIL36WfxVx0_240p.mp4',
    tags: "video`music`english`two door cinema club",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '17',
    uploader: 'Channel Tres',
    title: 'Controller',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Channel Tres - Controller_EtNIMvyEIQA_360p.mp4',
    tags: "video`music`american`channel tres",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '18',
    uploader: 'Channel Tres',
    title: 'Topdown',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Channel Tres - Topdown (Official Video)_8pReEUxHxJM_240p.mp4',
    tags: "video`music`american`channel tres",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '19',
    uploader: 'Joji',
    title: 'Gimme Love',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Joji - Gimme Love (Official Video)_jPan651rVMs_240p.mp4',
    tags: "video`music`american`joji",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '20',
    uploader: 'Joji',
    title: 'Run',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Joji - Run (Official Video)_K09_5IsgGe8_240p.mp4',
    tags: "video`music`american`joji",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '21',
    uploader: 'Joji',
    title: 'Sanctuary',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Joji - Sanctuary (Official Video)_YWN81V7ojOE_240p.mp4',
    tags: "video`music`american`joji",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '22',
    uploader: 'Oliver Tree',
    title: 'Let Me Down',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Oliver Tree - Let Me Down [Official Music Video]_FxG-7AsbjeI_240p.mp4',
    tags: "video`music`american`oliver tree",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '23',
    uploader: 'Oliver Tree',
    title: 'Miracle Man',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Oliver Tree - Miracle Man [Official Music Video]_EBLF26-Irdc_240p.mp4',
    tags: "video`music`american`oliver tree",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '24',
    uploader: 'Rex Orange County',
    title: 'Loving is Easy',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Rex Orange County - Loving is Easy (feat. Benny Sings) [Official Video]_39IU7ADaXmQ_240p.mp4',
    tags: "video`music`english`rex orange county",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '25',
    uploader: 'Rex Orange County',
    title: 'Sunflower',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Rex Orange County - Sunflower_Z9e7K6Hx_rY_240p.mp4',
    tags: "video`music`english`rex orange county",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '26',
    uploader: 'Rum Jungle',
    title: 'Keep',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Rum Jungle - Keep_XGyJEPU5Rmw_240p.mp4',
    tags: "video`music`australia`rum jungle",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '27',
    uploader: 'Tame Impala',
    title: 'It Might be Time',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Tame Impala - It Might Be Time (Official Audio)_4hZ_wTx_kWg_240p.mp4',
    tags: "video`music`australian`tame impala",
    views: "0",
    upvotes: "0",
    downvotes: "0"
  },
  {
    id: '28',
    uploader: 'Tame Impala',
    title: 'Lost in Yesterday',
    description: `What is Lorem Ipsum?
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy`,
    videoURL: 'y2mate.com - Tame Impala - Lost in Yesterday (Official Video)_utCjuKDXQsE_240p.mp4',
    tags: "video`music`australian`tame impala",
    views: "0",
    upvotes: "0",
    downvotes: "0"
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
  }, 
  {
    id: "10",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }, 
  {
    id: "11",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }, 
  {
    id: "12",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }, 
  {
    id: "13",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }, 
  {
    id: "14",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }, 
  {
    id: "15",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }, 
  {
    id: "16",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }, 
  {
    id: "17",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }, 
  {
    id: "18",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }, 
  {
    id: "19",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }, 
  {
    id: "20",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }, 
  {
    id: "21",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }, 
  {
    id: "22",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }, 
  {
    id: "23",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }, 
  {
    id: "24",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }, 
  {
    id: "25",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }, 
  {
    id: "26",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }, 
  {
    id: "27",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }, 
  {
    id: "28",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }, 
  {
    id: "29",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }, 
  {
    id: "30",
    user: "Jesse Ultra Chad",
    videoID: "2",
    comment: "Tell me something I don't know you two!!!",
    replyID: "-1"
  }
]

function sleep(ms) {
  //return new Promise((resolve) => {
    //setTimeout(resolve, ms);
  //});
}   

async function fillDB() {

  for (user of users) {
    await sleep(1000);
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const use = await UserInfo.create({
      id: user.id,
      username: user.username,
      password: hashedPassword,
      email: user.email,
      imageURL: user.imageURL,
      bannerURL: user.bannerURL,
      subscriberCount: user.subscriberCount
    });
  }

  for (video of videos) {
    await sleep(1000);
    const use = await Video.create({
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
    await sleep(1000);
    const use = await Comments.create({
      id: comment.id,
      replyID: comment.replyID,
      comment: comment.comment,
      user: comment.user,
      videoID: comment.videoID
    });
  }
  console.log("DONE");

}

//Try to sync database
async function setUp() {
    try {
        await db.sequelize.sync({force: false});
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
const messageRoutes = require(path.join(__dirname, 'routes/messages'));
app.use('/messages', messageRoutes);

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
  } else {
    if (!req.cookies.username) {
      res.cookie("username", req.session.username);
    }
  }
  next();
});


app.get('/', async (req, res) => {
  if (!req.session.username) {
    req.session.username = "Spacey Jane";
    res.cookie("username", "Spacey Jane");
    req.session.save();
  }
  res.redirect('video');
});

app.get('*', (req, res) => {
  res.render("404", {message: "You have requested an invalid route"});
});

const port = 8081; //Has to be this for nginx

app.set('trust proxy', 'loopback');

app.listen(port);
console.log( `Web server listening on port ${port}`);
