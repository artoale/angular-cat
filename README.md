# CAT - CSS Animation Timeline

[![Travis CI Build Status](https://travis-ci.org/artoale/angular-cat.svg)](https://travis-ci.org/artoale/angular-cat) [![codecov.io](https://codecov.io/github/artoale/angular-cat/coverage.svg?branch=master)](https://codecov.io/github/artoale/angular-cat?branch=master)

Set of AngularJS directives to simplify development and composition of animations on static websites.

## Why

Most modern "static" websites, have loads of complicated animations, often built out of smaller bits. You need to sequence CSS transition, CSS animations and custom javascript stuff, manage scroll-based trigger, make those repeatable.

You don't wont to stick all this complexity in a controller which not only shouldn't be there just because of animations, you'll also end up having code duplication and find yourself in a code maintenance hell.

## The solution

A set of

- Declarative
- Reusable
- Composable
- Nestable

AngularJS directives!

## Installation

You can do the usual, with npm

```
npm install angular-cat
```

or, with bower

```
bower install angular-cat
```

Both regular and minified files can be found in the `dist/` folder.

## Use with angular-spy

tl;dr - If you need to run animations on scroll, have a look at [angular-spy](https://github.com/flea89/angular-spy) which works very well with angular-cat.

Originally, angular-cat shipped with directives to handle scroll-based triggers. We realized though, that coordinating CSS animation and handling scroll-spies are two, quite different things, which can be very useful both by themselves or used together. We decided then to split the two, keep responsibility separated, footprint smaller and allow for more flexibility.

## At a glance

```html
<button ng-click="sequence = true">Run the animation!</button>
<div cat-timeline
   cat-active="sequence"
   cat-undo="true">

    <div cat-class="animation-1">I'll be red</div>
    <div cat-delay="500"></div>
    <div cat-class="animation-2">I'll be wider</div>
</div>

<style>
  .animation-1 {
      color: red;
      transition: color 1s linear;
  }

  .animation-1--start {
      color: blue;
  }

  .animation-2 {
      width: 500px;
      transition: width 1s linear;
  }

  .animation-2--start {
      width: 300px;
  }
</style>
```

As you can see, the basic usage is declarative, expressive and CSS friendly.

## Resources

For more information and resources head to our [guide](https://artoale.gitbooks.io/angular-cat/content/index.html) or have a look at the [examples](https://github.com/artoale/angular-cat/tree/master/example).
