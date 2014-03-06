Feed the Fire
=============
Feed the Fire is a combination of web frontend and a backend process to
synchronize RSS or Atom feeds with [Firebase](https://www.firebase.com/).

Feeds are fetched every 10 minutes and updated if neccessary. Changes in the
feed's content will show up through the usual Firebase events like
`child_added`. For example, to fetch the latest XKCD comics:

```js
var ref = new Firebase("https://feeds.firebaseio.com/xkcd");
ref.child("meta").once("value", function(snapshot) {
  $("#e-title").html(snapshot.val().description);
});
ref.child("articles").on("child_added", function(snapshot) {
  var article = snapshot.val();
  var link = $("<a>", {"href": article.link, "target": "_blank"});
  $("#e-list").append($("<li>").append(link.html(article.title)));
});
```

Deploying
---------
To deploy your own instance of FeedTheFire, you'll first need to sign up
and create a [Firebase](https://www.firebase.com/). You can then run the node
script `app.js`, on a server. Following are instructions for deploying to
[Heroku](), though you may use any service that lets you run node scripts.

0. You may want to set the security rules for the Firebase to read/write: false.
You'll be providing the secret key to the Firebase to the node script to
override these default security settings.

1. Enable Persona authentication for the Firebase via the 'Simple Login' panel.
More instructions [are available here](https://www.firebase.com/docs/security/simple-login-persona.html).

2. Check out the master branch of FeedTheFire repository:
```bash
git clone https://github.com/firebase/feedthefire
cd feedthefire
git checkout master
```

3. Create a Heroku app (you must have the toolbelt installed):
```bash
heroku create
```

4. Set up the `FBURL` and `SECRET` environment variables. These should point
to your Firebase and its secret key respectively:
```bash
heroku config:set FBURL='https://<my-firebase>.firebaseio.com/' SECRET='my-secret-key'
```

5. Deploy the code. A `Profile` is already included for your convenience:
```bash
git push heroku master
```

Architecture
------------
The project is split into two components:

* The frontend is contained in its entirety in [index.html](https://github.com/firebase/feedthefire/blob/gh-pages/index.html).
This code is responsible for accepting an RSS/Atom URL, a Firebase URL and optionally,
a secret from the user and storing it in a Firebase dedicated to this application.

* The backend, [app.js](https://github.com/firebase/feedthefire/blob/gh-pages/app.js), is a
node process responsible for listening to changes to user data, fetching feeds every
10 minutes, writing the feeds to the appropriate Firebases, and updating the
status of each feed.

The backend writes the content of the feed under two top-level keys, `articles`
and `meta`. The `meta` object contains information about the feed, such as
its description, title and published date. The `articles` object contains
the individual feed items, ordered by date. The prirority for each of these
articles is set to the timestamp at which the article was published, so all
the `child_added` callbacks will be invoked in order.

License
-------
[MIT](http://firebase.mit-license.org).
