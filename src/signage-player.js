class SignagePlayer {
    constructor(element, settings) {
        this.root = element;
        this.imageElement = document.getElementById("image-container");
        this.videoElement = document.getElementById("video-container");
        this.media = [];
        this.supported_mimes = [];
        this.index = 0;
        this.initialize(settings);
        this.registerEventHandlers();
        this.syncMedia();
        if (this.settings.static_playlist === false) {
            this.mediaUpdateTimer = setInterval(() => {
                this.getMediaUpdates();
            }, this.settings.media_update_interval);
        }
    }
    initialize(settings) {
        this.settings = $.extend(
            {
                image_width: "100%",
                image_height: "auto",
                video_width: "1080px",
                video_height: "1920px",
                static_playlist: false,
                media_url:
                    "http://localhost/projects/laravel-signagedost/public/signage-player/1",
                method: "POST",
                media_update_interval: 5000,
                reverse: false,
            },
            settings
        );
    }
    registerEventHandlers() {
        this.root.addEventListener(
            "last-media",
            this.lastMediaHandler.bind(this)
        );
        this.root.addEventListener(
            "first-media",
            this.firstMediaHandler.bind(this)
        );
        this.root.addEventListener(
            "next-media",
            this.nextMediaHandler.bind(this)
        );
        this.root.addEventListener(
            "prev-media",
            this.prevMediaHandler.bind(this)
        );
        this.videoElement.addEventListener(
            "ended",
            this.videoEndedHander.bind(this)
        );
        this.videoElement.addEventListener(
            "loadeddata",
            this.videoLoadeddataHandler.bind(this)
        );
        this.videoElement.addEventListener(
            "loadedcontent",
            this.videoLoadedcontentHandler.bind(this)
        );
    }

    videoEndedHander(event) {
        event.target.style.display = "none";
        if (this.settings.reverse == true) this.prev();
        else this.next();
    }
    videoLoadeddataHandler() {
        //Future
    }
    videoLoadedcontentHandler() {
        //Future
    }
    lastMediaHandler() {
        console.log("Last media Encountered");
        if (this.nextQueue.length == 0) {
            console.log("No Further Media to Play");
        } else this.setMedia(this.nextQueue);
    }
    firstMediaHandler() {
        console.log("First Media Encountered");
        if (this.nextQueue.length == 0) {
            console.log("No Further Media to Play");
        } else this.setMedia(this.nextQueue);
    }
    nextMediaHandler() {
        this.next();
        console.log("Playing Next");
    }
    prevMediaHandler() {
        this.prev();
        console.log("Playing Prev");
    }
    getMedia() {
        return this.media;
    }
    getRoot() {
        return this.root;
    }
    setMedia(media) {
        if (media instanceof Array && media.length != 0) {
            this.media = media;
            this.index = 0;
            console.log("Media Queue Updated");
        } else {
            this.media = [];
            throw Error("No Media Exception");
        }
    }
    getMediaUpdates() {
        this.syncMedia("new");
    }
    syncMedia(mode = "initial") {
        this.nextQueue = [];
        $.ajax({
            url: this.settings.media_url,
            method: this.settings.method,
            async: false,
            data: this.settings.queryParams,
            success: (res) => {
                if (mode == "initial") {
                    this.setMedia(res);
                    this.playMedia();
                } else {
                    this.nextQueue = res;
                }
            },
            error: () => {},
        });
    }
    playMedia() {
        if (this.settings.reverse == true) {
            this.index = this.media.length - 1;
        }
        this.handleMedia();
    }
    next() {
        if (this.media.length - 1 == this.index) {
            this.root.dispatchEvent(new Event("last-media"));
            this.index = 0;
        } else {
            this.index = this.index + 1;
        }
        this.handleMedia();
    }
    prev() {
        if (0 == this.index) {
            this.root.dispatchEvent(new Event("first-media"));
            this.index = this.media.length - 1;
        } else {
            this.index = this.index - 1;
        }
        this.handleMedia();
    }
    handleMedia() {
        console.log(`Playing ${this.index + 1}/${this.media.length}`);
        switch (this.media[this.index].type) {
            case "image":
                this.playImage(
                    this.media[this.index].url,
                    this.media[this.index].duration
                );
                break;
            case "video":
                this.playVideo(this.media[this.index].url);
                break;
            //Future
            default:
                console.log(
                    "Unhandled Media Type",
                    this.media[this.index].type
                );
        }
    }
    playVideo(url) {
        this.videoElement.src = url;
        this.videoElement.load();
        this.videoElement.style.display = "block";
        this.imageElement.style.display = "none";
        this.videoElement.play();
    }
    playImage(url, duration = 5000) {
        this.videoElement.style.display = "none";
        this.imageElement.setAttribute("width", this.settings.image_width);
        this.imageElement.setAttribute("height", this.settings.image_height);
        this.imageElement.setAttribute("src", url);
        this.imageElement.style.margin = "auto";
        this.imageElement.style.display = "block";

        if (this.index % 2 == 0) {
            this.imageElement.className = "slide-right";
        } else {
            this.imageElement.className = "slide-left";
        }
        this.imageTimer = setTimeout(() => {
            if (this.settings.reverse == true) this.prev();
            else this.next();
        }, duration);
    }
    restart() {
        //Future
    }
    stop() {
        clearInterval(this.mediaUpdateTimer);
    }
}
$.extend({
    signagePlayer: (element, settings) => {
        if (!this.instance) {
            this.instance = new SignagePlayer(element, settings);
        }
        return this.instance;
    },
});
