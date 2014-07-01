Task description
================

MTProto protocol requires some bigint calculations for auth key generation: https://core.telegram.org/mtproto/auth_key.

> `resPQ#05162463 nonce:int128 server_nonce:int128 pq:string server_public_key_fingerprints:Vector long = ResPQ`
> Here, string pq is a representation of a natural number (in binary big endian format). This number is the product of two different odd prime numbers. Normally, pq is less than or equal to 2^63-1. The value of server_nonce is selected randomly by the server; following this step, it is known to all.

As Webogram is Javascript-based app, we need to solve prime-factorization problem here. There are some existing Javascript libraries for bigint computations. Let's take a look at them.


Libraries
=========


## [jsbn by Tom Wu](http://www-cs-students.stanford.edu/~tjw/jsbn/)

Probably, the most popular javascript bigint implementation. Is very easy in usage, as it has the same interface as Java [BigInteger](http://docs.oracle.com/javase/7/docs/api/java/math/BigInteger.html).

### [math.Long by Google](http://docs.closure-library.googlecode.com/git/class_goog_math_Long.html)

Supports just 64-bit calculations, but that's almost always enough for our needs (see "Task description").

### [Big Integer Library by Leemon Baird](http://www.leemon.com/crypto/BigInt.html)

This library was included, because I've found the article http://www.joseprio.com/blog/2013/04/27/biginteger-libraries-for-js/, which says that the library allows to reuse existing arrays when operating with numbers, instead of creating new ones. This feature was considered as important for our task, as there is a big loop with a lot of computations in each iteration. Less used memory => better performance.

The library was pretty tricky to use, because of its functions naming. Also, almost every function has its copy (with `_` (underscore) in the end), which does the same as original one, but doesn't create a new bigint var instance. That's what I needed for speed improvement.


Running tests
=============

The tests are available online via GH-pages: http://zhukov.github.io/prime-factorization-benchmark/.

Each test was repeated from 5 to 10 times and the average time was calculated.

You can try to run tests on your platform, just press the corresponding button. For better results, refresh page after each launch.

Results
=======

Here is the table with results for my hardware. 
The number in corresponding cell is amount in seconds required to compute the primes. Less is better.


Library  / Browser          | Chrome | Firefox | Firefox OS 1.3 | Firefox OS 1.1 | iPhone  | Android
----------------------------|--------|---------|----------------|----------------|---------|--------
jsbn by Tom Wu              | 5.94   | 2.86    | infinity       | infinity       | 22      | 30
closure long                | 1.88   | 1.02    | infinity       | infinity       | 8.9     | 10.9
leemon bigint               | 1.75   | 1.5     | 26.5           | 68             | 5.4     | 7.4
leemon bigint via worker    | 1.85   | 1.6     | ?              | **90**         | 5.6     | 8.1


As it was expected, Leemon Baird library showed best scores on almost all platforms.



Notes
===========


GCD problem
-----------

In my case leemon bigint library had problems with GCD function. The result was incorrect, comparing to jsbn. I didn't get inside the library code, I've just replaced:
```javascript
g = GCD(z, what);
```
with:
```javascript
eGCD_(z, what, g, a, b);
```

Everything worked fine after that.


Random pseudo generator
-----------------------

In order to make every benchmark run equal we should replace `Math.random()` with predefined values:

```javascript
var randoms = [
	  0.6780740048270673,
	  0.5422933690715581,
	  0.30996662518009543,
	  0.9001301566604525,
	  0.9054833319969475,
	  .....
  ],
  randomI = 0;

function nextRandomInt (maxValue) {
  if (randomI >= randoms.length) {
    randomI = 0;
  }
  return Math.floor(randoms[randomI++] * maxValue);
};
```
