/******************************************************************************
 * paAnimation
 *****************************************************************************/

/**
  * @const
  */
 var paAnimation = {};

 /******************************************************************************
  * paAnimationApi
  *****************************************************************************/
  /** @const {!Object<string, function>} */
  var animationAPI = {
    play: function(){},
    clear: function(){}
  };

 /******************************************************************************
  * paRouterController
  *****************************************************************************/

 /**
  * @param {string} name
  * @return {animationAPI}
  */
paAnimation.paRouterController.prototype.getAnimation = function(name){};

/**
 * @param {string} name
 * @return {Array.<animationAPI>}
 */
paAnimation.paRouterController.prototype.getAnimations = function(name){};


/**
 * @param {function(!angular.$q.Promise)} promise
 * @return {object}
 */
paAnimation.paRouterController.prototype.setCustomAnimation = function(promise){};
