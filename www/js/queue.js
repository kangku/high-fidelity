/*jshint forin:false, plusplus:false, sub:true */
'use strict';

define(function(require) {
    // If the download queue already exists, just return it!
    if (window._downloadQueue) {
        return window._downloadQueue;
    }

    // The app-wide download queue, used to make sure we don't download more
    // than a few files at once and that items are downloaded in order. Really
    // simple and hacky interface for now, but this could be expanded into
    // something pretty usable.
    //
    // Any item added to the queue must have a _download() method the queue
    // will call once a download slot is available. It will then assign a
    // `true` value to that item in the queue, signifying it's an active
    // download.
    //
    // TODO: Support for broken downloads, storing the queue in storage so
    // it's crash-resistant, and pause/resume of downloads (this one might be
    // hard?).
    function DownloadQueue() {
        var queue = [];

        function next() {
            if (queue.length) {
                queue.forEach(function(download, i) {
                    // TODO: Remove reliance on podcasts-specific global and
                    // allow passing in/setting of max download count.
                    if (numberOfActiveDownloads() < window.GLOBALS.MAX_DOWNLOADS && download[1] !== true) {
                        download[1]._download();
                        queue[i][1] = true;
                    }
                });
            }
        }

        function numberOfActiveDownloads() {
            var active = 0;

            // TOOD: My brain is being weird but feels like there's a more
            // elegant way to do this.
            queue.forEach(function(download) {
                if (download[1] === true) {
                    active++;
                }
            });

            return active;
        }

        this.add = function(id, object) {
            queue.push([id, object ? object : true]);
            next();
        }

        this.done = function(id) {
            var index = null;

            // TODO: Again, there's gotta be a sexier way to do this.
            queue.forEach(function(download, i) {
                if (index !== null) {
                    return;
                }

                if (download[1] === true) {
                    index = i;
                }
            });
            queue.splice(index, 1);
            next();
        }

        return this;
    }
    window._downloadQueue = new DownloadQueue();

    return window._downloadQueue;
});
