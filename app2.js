var fs = require("fs"),
    crypto = require("crypto"),
    request = require("request"),
    Parser = require("feedparser"),
    Firebase = require("firebase");

var feeds = {};
var feedContent = {};

//var REFRESH_INTERVAL = 600000;
var REFRESH_INTERVAL = 60000;
var FBURL = "torid-fire-6233.firebaseio.com";
var SECRET = "V0Fw33XLTOaFWS9OEr8tv7srY9nEU0O9ZSwxpQjT";
var FEEDURL="http://blog.g0v.tw/posts.atom";
var ref = new Firebase(FBURL);

ref.auth(SECRET, function(err) {
  if (err) {
    console.error("Firebase authentication failed!", err);
  } else {
    console.log('Firebase login');
    setInterval(getFeedFromURL, REFRESH_INTERVAL);
  }
});

function getFeedFromURL() {
  console.log('Get feed from URL');
  //var statusURL = FBURL; 
  request(FEEDURL, function(err, resp, body) {
    if (!err && resp.statusCode == 200) {
      Parser.parseString(body, {addmeta: false}, function(err, meta, articles) {
        if (err) {
          console.log(err);
          return;
        }
        //console.log('articles',articles);
        for(var i=0; i<articles.length;i++){
           saveFeedArticle(articles[i]);
        }
      });
    } else {
      if (err) {
        console.log(err);
      } else {
        console.log(resp.statusCode);
      }
    }
  });
}

function saveFeedArticle(article){
    console.log('Save feed article');
    ref.child('articles').push(sanitizeObject(article));
}

function sanitizeObject(obj) {
  if (typeof obj != typeof {}) {
    return obj;
  }
  var newObj = {};
  var special = [".", "$", "/", "[", "]"];
  for (var key in obj) {
    var sum = -1;
    for (var i in special) {
      sum += (key.indexOf(special[i])) + 1;
    }
    if (sum < 0) {
      if (key == "date" || key == "pubdate" || key == "pubDate") {
        if (obj[key]) {
          newObj[key] = obj[key].toString();
        }
      } else if (key == "#") {
        newObj.value = sanitizeObject(obj[key]);
      } else if (key.indexOf("#") >= 0) {
        newObj["@" + key.replace("#", "")] = sanitizeObject(obj[key]);
      } else if (sanitizeObject(obj[key]) && key !== "") {
        newObj[key] = sanitizeObject(obj[key]);
      }
    }
  }
  return newObj;
}
