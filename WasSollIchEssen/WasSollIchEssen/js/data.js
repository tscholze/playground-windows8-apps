(function () {
    "use strict";

    // Set up array variables
    var dataPromises = [];
    var locations;

    // Create a data binding for our ListView
    var dishPosts = new WinJS.Binding.List();

    // Process the blog feeds
    function getFeeds() {
        // Create an object for each feed in the blogs array
        // Get the content for each feed in the blogs array
        // Return when all asynchronous operations are complete
        // Create an object for each feed in the blogs array
        locations = [
                {
                    key: "thisWeekM",
                    url: 'http://www.hs-augsburg.de/~scholze/sonstiges/demo-data.xml',
                    name: 'Mensa M',
                    owner: 'Studentenwerk Augsburg',
                    advice: 'Mensakarte: akzeptiert',
                    image: '../images/Mensa_M.png',
                    acquireSyndication: acquireSyndication, dataPromise: null
                },
               {
                   key: "thisWeekH",
                   url: 'http://www.hs-augsburg.de/~scholze/sonstiges/demo-data.xml',
                   name: 'Mensa H',
                   owner: 'Studentenwerk Augsburg',
                   advice: 'Mensakarte: akzeptiert',
                   image: '../images/Mensa_H.png',
                   acquireSyndication: acquireSyndication, dataPromise: null
               },
               {
                   key: "thisWeekUni",
                   url: 'http://www.hs-augsburg.de/~scholze/sonstiges/demo-data.xml',
                   name: 'Mensa Universitaet',
                   owner: 'Studentenwerk Augsburg',
                   advice: 'Mensakarte: akzeptiert',
                   image: '../images/Mensa_Uni.png',
                   acquireSyndication: acquireSyndication, dataPromise: null
               }
        ];

        // Get the content for each feed in the blogs array
        locations.forEach(function (feed) {
            feed.dataPromise = feed.acquireSyndication(feed.url);
            dataPromises.push(feed.dataPromise);
        });

        // Return when all asynchronous operations are complete
        return WinJS.Promise.join(dataPromises).then(function () {
            return locations;
        });
    }

    function acquireSyndication(url) {
        // Call xhr for the URL to get results asynchronously
        return WinJS.xhr({ url: url });

    }

    function getDishPosts() {
        // Walk the results to retrieve the blog posts
        getFeeds().then(function () {
            // Process each blog
            locations.forEach(function (feed) {
                feed.dataPromise.then(function (articlesResponse) {
                    var articleSyndication = articlesResponse.responseXML;
                    // Get the blog posts
                    getItemsFromXml(articleSyndication, dishPosts, feed);
                });
            });
        });
        return dishPosts;
    }

    function getItemsFromXml(articleSyndication, dishPosts, feed) {
        // Get the info for each blog post
        var days = articleSyndication.querySelectorAll("menu");
        console.log('Laenge: ' + days.length);

        for (var dayIndex = 0; dayIndex < days.length; dayIndex++) {
            var day = days[dayIndex];
            var date = day.querySelector("date").textContent;
            var dateData = date.split('.');
            var dateDay = dateData[0] + '.';

            var dishes = day.querySelectorAll("meal");
            // Process each blog post
            for (var postIndex = 0; postIndex < dishes.length; postIndex++) {
                var dish = dishes[postIndex];

                // Hole Namen.
                var name = dish.querySelector("name").textContent;

                // Hole Preis fuer Studenten.
                var priceStudent = dish.querySelector("prices > student").textContent;

                // Hole Preis fuer Angestellte und Andere.
                var priceOthers = dish.querySelector("prices > normal").textContent;

                // Hole alle Zusatzstoffe
                var additives = dish.querySelectorAll("additive");

                // Leerer String fuer Zusaetze, oder Specials wie 'Aus Bio Anbau'.
                var special = ""

                // Pruefen ob Zusaetze vorhanden sind, wenn nicht - schreibe Platzhalter.
                if (additives.length < 2) {
                    special = "Keine kennzeichnungspflichtigen Stoffe.";
                } else {
                    // Wenn Zusatze vorhanden sind, schreibe diese in ein String Array.
                    for (var i = 0; i < additives.length; i++) {
                        special += toStaticHTML(additives[i].textContent);
                        // Wenn es nicht der letzte Eintrag ist, schreibe ein ','.
                        if (i != additives.length - 1) {
                            special += ", ";
                        }
                    }
                }


                // Baue Preisstring zum leichteren anzeigen.
                var priceString = priceStudent + "€ / " + priceOthers + "€";

                // Process the content so it displays nicely
                var staticContent = assembleContent(name, date, special, priceStudent, priceOthers);

                // Store the post info we care about in the array
                dishPosts.push({
                    group: feed,
                    key: feed.title,
                    name: name,
                    date: date,
                    dateDay: dateDay,
                    price: priceString,
                    special: special,
                    content: staticContent,
                });
            }
        }
    }

    // Baut einen lesbaren String aus den gegebenen Informationen
    function assembleContent(name, date, special, priceStudent, priceOthers) {
        // Contentstring..
        var content = "";
        content += "<h3>Datum</h3>" + date;
        content += "<h3>Hinweis</h3>Dieses Gericht ist / enthaelt: " + special;
        content += "<h3>Preis</h3><li>Studenten: " + priceStudent + "&euro;</li><li>Sonstige: " + priceOthers + "&euro;</li>";
        content += "<h3>Meinungen</h3> Lecker! [TBD] <br><br>";
        content += "<h3>Teilen</h3> [Twitter], [Facebook] {TBD}";

        // Hilft gegen html-Entities.
        content = toStaticHTML(content);

        return content;
    }

    // Get a reference for an item, using the group key and item title as a
    // unique reference to the item that can be easily serialized.
    function getItemReference(item) {
        return [item.group.key, item.title];
    }

    function resolveGroupReference(key) {
        for (var i = 0; i < groupedItems.groups.length; i++) {
            if (groupedItems.groups.getAt(i).key === key) {
                return groupedItems.groups.getAt(i);
            }
        }
    }

    function resolveItemReference(reference) {
        for (var i = 0; i < groupedItems.length; i++) {
            var item = groupedItems.getAt(i);
            if (item.group.key === reference[0] && item.title === reference[1]) {
                return item;
            }
        }
    }

    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(group) {
        return list.createFiltered(function (item) { return item.group.key === group.key; });
    }

    var list = getDishPosts();

    var groupedItems = list.createGrouped(
        function groupKeySelector(item) { return item.group.key; },
        function groupDataSelector(item) { return item.group; }
    );


    WinJS.Namespace.define("Data", {
        items: groupedItems,
        groups: groupedItems.groups,
        getItemsFromGroup: getItemsFromGroup,
        getItemReference: getItemReference,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference
    });
})();
