require.config({
  // baseUrl: ".",
  // paths: {
  //     "some": "some/v1.0"
  // }
});

require(['app'], function (myApp) {
    console.log(`App ${myApp} is running`);
    angular.bootstrap(document, [myApp]);
});
