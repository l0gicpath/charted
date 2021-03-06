var Charted = {
  URL: "/charted/",
  send: function(path, queryString) {
    var url = this.URL + path;
    if (this.cookie("chartedignore")) { return; }
    if (typeof jQuery === 'undefined') {
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = url + "?" + queryString;
      document.getElementsByTagName("head")[0].appendChild(script);
    } else if (this.external()) {
      jQuery.getScript(url + "?" + queryString);
    } else {
      jQuery.get(url, queryString);
    }
  },
  external: function() {
    return !!this.URL.match(/^https?:\/\//);
  },
  cookie: function(name) {
    var obj = {};
    var val = document.cookie.match(new RegExp("(?:^|;) *"+name+"=([^;]*)"));
    if (val) {
      val = this.decode(val[1]).split("&");
      return val[0];
    }
    return null;
  },
  ignore: function() {
    var date = new Date();
    date.setTime(date.getTime()+(2*365*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
    document.cookie = "chartedignore=1"+expires+"; path=/";
  },
  clear: function() {
    document.cookie = 'charted=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  },
  strip: function(str) {
    return String(str).replace(/^\s+|\s+$/g, '');
  },
  decode: function(encoded) {
    return decodeURIComponent(encoded.replace("+", "%20"));
  },
  normalize: function(str) {
    return str.toLowerCase().replace(' ', '-').replace(/\W/g, '');
  },
  events: function() {
    var str = [];
    for (var i = 0; i < arguments.length; i++) {
      str.push(arguments[i]);
    }
    this.send("record", "events=" + encodeURIComponent(str.join(";")));
  },
  goals: function() {
    var str = [];
    for (var i = 0; i < arguments.length; i++) {
      str.push(arguments[i]);
    }
    this.send("record", "goals=" + encodeURIComponent(str.join(";")));
  },
  init: function() {
    var cookie = this.cookie("charted");
    var bucketNum = cookie ?
      parseInt(cookie.split("-")[1]) :
      Math.floor(Math.random() * 10);
    var domainQuery = "";
    if (this.external()) {
      domainQuery = "&domain=" + encodeURIComponent(window.location.hostname);
    }
    var convQuery = "";
    var conversions = document.body.getAttribute("data-conversions");
    if (conversions) {
      convQuery = "&conversions=" + encodeURIComponent(conversions);
    }
    var expQuery = "";
    var experiments = document.body.getAttribute("data-experiments");
    if (experiments) {
      expQuery = "&experiments=";
      experiments = experiments.split(";");
      for (var i = 0; i < experiments.length; i++) {
        var experiment = experiments[i].split(":");
        var label = this.strip(experiment[0]);
        var buckets = experiment[1].split(",");
        var bucket = buckets[bucketNum % buckets.length];
        bucket = this.strip(bucket);

        document.body.className +=
          (this.normalize(label) + "-" + this.normalize(bucket) + " ");
        expQuery += encodeURIComponent(label + ":" + bucket + ";");
      }
    }
    Charted.send(
      "",
      "path=" + encodeURIComponent(window.location.pathname) +
      "&title=" + encodeURIComponent(document.title) +
      "&referrer=" + encodeURIComponent(document.referrer) +
      "&resolution=" + encodeURIComponent(screen.width+"x"+screen.height) +
      "&bucket=" + bucketNum +
      domainQuery + convQuery + expQuery);
  }
};
Charted.init();
