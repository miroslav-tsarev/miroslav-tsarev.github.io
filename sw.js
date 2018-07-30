'use strict';

importScripts('sw-toolbox.js');

toolbox.precache(["index.html","assets/style/styles.min.css","assets/lib/bootstrap-4.1.1/css/bootstrap-grid.min.css"]);

toolbox.router.get('assets/img/*', toolbox.cacheFirst);

toolbox.router.get('/*', toolbox.networkFirst, {
  networkTimeoutSeconds: 5
});
