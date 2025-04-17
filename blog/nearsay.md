
# nearsay - mishaps and terrible design decisions 

As basically my first full stack project*, I made lots of mistakes. I've recorded many of my misadventures here.

<sub>* my hardly functional music player <a href="https://github.com/troylu8/moonlight">moonlight</a> doesn't count</sub>

## someone else already solved that problem, and way better than you can

When I first started thinking about how to query for all the posts visible within the user's rectangular screen, I had the idea of splitting the region into tiles to make the search quicker. 

This led to writing [nearby-points](https://www.npmjs.com/package/nearby-points), an npm package that I *thought* would be a great solution.

![a naive solution](./img/positionaldb-blocks.png)

Then I discovered [quadtrees](https://en.wikipedia.org/wiki/Quadtree), and realized that my idea sucked. 

Still, I would need to store coordinate points persistently on disk but still be able to query them somewhat quickly. 

Luckily, I found MongoDB's [geospatial queries](https://www.mongodb.com/docs/manual/geospatial-queries/) before attempting to serialize quadtrees myself...


I discovered these geospatial querying solutions embarassingly late, which required a lot of rewriting of features that had to do with geolocation, like placing a note and sending a chat message. 


How did I implement things like:
> "a note was just placed at (x,y) so tell all clients whose phone screens can see the point (x,y) that there's a new note there" 

before I discovered these geospatial tools?

It was a complicated and probably quite inefficient method of putting clients inside **socket.io rooms** based on the geographic bounds of their view, then broadcasting events to certain rooms that overlapped with the coordinate point where the event happened.


In the end, I've learned my lesson. Never again will I attempt to do anything before doing research on the tools available to me.

## premature optimization. i fell for it.

This optimization idea was amazingly tempting. I had no performance problems thus far, but...

Users who query for data within a certain geographic rectangle are likely to query for data in adjacent rectangles soon after (as they pan around the map, zoom in/out).

Why not cache data points that lie just outside this rectangle somewhere after receiving the first request, in anticipation for the subsequent request on an adjacent rectangle?

The (perceived) need for a cache for my database was born, and I became another victim to **Redis** and their favorite buzzwords like "fast", "scalable", "in-memory cache", and "fast".
 
One week later, there was no perceivable difference in geoquery time, and it now took 50x longer to add a new post to the database.
<sub>this decreased to ~2-3x after I discovered Redis's pipelining feature, but that will never make up for the time I've lost... </sub>


## the troubles of caching geospatial points that can cluster 

Removing a point from a cluster is hard. 


## latitude is NOT x

The convention of writing latitude before longitude [(it's even ISO standard)](https://en.wikipedia.org/wiki/ISO_6709) 
despite latitude being the "y" axis admittedly caused me many bugs before I finally learned my lesson.

> [!note] latitude is like a ladder
> This phrase used to remember latitude/longitude messed me up so much.
> 
> > "**la**titude lines run across the globe like the rungs of a **la**dder" 
> 
> The rungs of a ladder go side to side, so I kept thinking that latitude itself meant "horizontal"...

