==============
More Itertools
==============

.. image:: https://coveralls.io/repos/github/erikrose/more-itertools/badge.svg?branch=master
  :target: https://coveralls.io/github/erikrose/more-itertools?branch=master

Python's ``itertools`` library is a gem - you can compose elegant solutions
for a variety of problems with the functions it provides. In ``more-itertools``
we collect additional building blocks, recipes, and routines for working with
Python iterables.

Getting started
===============

To get started, install the library with `pip <https://pip.pypa.io/en/stable/>`_:

.. code-block:: shell

    pip install more-itertools

The recipes from the `itertools docs <https://docs.python.org/3/library/itertools.html#itertools-recipes>`_
are included in the top-level package:

.. code-block:: python

    >>> from more_itertools import flatten
    >>> iterable = [(0, 1), (2, 3)]
    >>> list(flatten(iterable))
    [0, 1, 2, 3]

Several new recipes are available as well:

.. code-block:: python

    >>> from more_itertools import chunked
    >>> iterable = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    >>> list(chunked(iterable, 3))
    [[0, 1, 2], [3, 4, 5], [6, 7, 8]]

    >>> from more_itertools import spy
    >>> iterable = (x * x for x in range(1, 6))
    >>> head, iterable = spy(iterable, n=3)
    >>> list(head)
    [1, 4, 9]
    >>> list(iterable)
    [1, 4, 9, 16, 25]



For the full listing of functions, see the `API documentation <https://more-itertools.readthedocs.io/en/latest/api.html>`_.

Development
===========

``more-itertools`` is maintained by `@erikrose <https://github.com/erikrose>`_
and `@bbayles <https://github.com/bbayles>`_, with help from `many others <https://github.com/erikrose/more-itertools/graphs/contributors>`_.
If you have a problem or suggestion, please file a bug or pull request in this
repository. Thanks for contributing!


Version History
===============



3.2.0
-----
* New itertools:
    * lstrip, rstrip, and strip
      (thanks to MSeifert04 and pylang)
    * islice_extended
* Improvements to existing itertools:
    * Some bugs with slicing peekable-wrapped iterables were fixed

3.1.0
-----

* New itertools:
    * numeric_range (Thanks to BebeSparkelSparkel and MSeifert04)
    * count_cycle (Thanks to BebeSparkelSparkel)
    * locate (Thanks to pylang and MSeifert04)
* Improvements to existing itertools:
    * A few itertools are now slightly faster due to some function
      optimizations. (Thanks to MSeifert04)
* The docs have been substantially revised with installation notes,
  categories for library functions, links, and more. (Thanks to pylang)


3.0.0
-----

* Removed itertools:
    * ``context`` has been removed due to a design flaw - see below for
      replacement options. (thanks to NeilGirdhar)
* Improvements to existing itertools:
    * ``side_effect`` now supports ``before`` and ``after`` keyword
      arguments. (Thanks to yardsale8)
* PyPy and PyPy3 are now supported.

The major version change is due to the removal of the ``context`` function.
Replace it with standard ``with`` statement context management:

.. code-block:: python

    # Don't use context() anymore
    file_obj = StringIO()
    consume(print(x, file=f) for f in context(file_obj) for x in u'123')

    # Use a with statement instead
    file_obj = StringIO()
    with file_obj as f:
        consume(print(x, file=f) for x in u'123')

2.6.0
-----

* New itertools:
    * ``adjacent`` and ``groupby_transform`` (Thanks to diazona)
    * ``always_iterable`` (Thanks to jaraco)
    * (Removed in 3.0.0) ``context`` (Thanks to yardsale8)
    * ``divide`` (Thanks to mozbhearsum)
* Improvements to existing itertools:
    * ``ilen`` is now slightly faster. (Thanks to wbolster)
    * ``peekable`` can now prepend items to an iterable. (Thanks to diazona)

2.5.0
-----

* New itertools:
    * ``distribute`` (Thanks to mozbhearsum and coady)
    * ``sort_together`` (Thanks to clintval)
    * ``stagger`` and ``zip_offset`` (Thanks to joshbode)
    * ``padded``
* Improvements to existing itertools:
    * ``peekable`` now handles negative indexes and slices with negative
      components properly.
    * ``intersperse`` is now slightly faster. (Thanks to pylang)
    * ``windowed`` now accepts a ``step`` keyword argument.
      (Thanks to pylang)
* Python 3.6 is now supported.

2.4.1
-----

* Move docs 100% to readthedocs.io.

2.4
-----

* New itertools:
    * ``accumulate``, ``all_equal``, ``first_true``, ``partition``, and
      ``tail`` from the itertools documentation.
    * ``bucket`` (Thanks to Rosuav and cvrebert)
    * ``collapse`` (Thanks to abarnet)
    * ``interleave`` and ``interleave_longest`` (Thanks to abarnet)
    * ``side_effect`` (Thanks to nvie)
    * ``sliced`` (Thanks to j4mie and coady)
    * ``split_before`` and ``split_after`` (Thanks to astronouth7303)
    * ``spy`` (Thanks to themiurgo and mathieulongtin)
* Improvements to existing itertools:
    * ``chunked`` is now simpler and more friendly to garbage collection.
      (Contributed by coady, with thanks to piskvorky)
    * ``collate`` now delegates to ``heapq.merge`` when possible.
      (Thanks to kmike and julianpistorius)
    * ``peekable``-wrapped iterables are now indexable and sliceable.
      Iterating through ``peekable``-wrapped iterables is also faster.
    * ``one`` and ``unique_to_each`` have been simplified.
      (Thanks to coady)


2.3
-----

* Added ``one`` from ``jaraco.util.itertools``. (Thanks, jaraco!)
* Added ``distinct_permutations`` and ``unique_to_each``. (Contributed by
  bbayles)
* Added ``windowed``. (Contributed by bbayles, with thanks to buchanae,
  jaraco, and abarnert)
* Simplified the implementation of ``chunked``. (Thanks, nvie!)
* Python 3.5 is now supported. Python 2.6 is no longer supported.
* Python 3 is now supported directly; there is no 2to3 step.

2.2
-----

* Added ``iterate`` and ``with_iter``. (Thanks, abarnert!)

2.1
-----

* Added (tested!) implementations of the recipes from the itertools
  documentation. (Thanks, Chris Lonnen!)
* Added ``ilen``. (Thanks for the inspiration, Matt Basta!)

2.0
-----

* ``chunked`` now returns lists rather than tuples. After all, they're
  homogeneous. This slightly backward-incompatible change is the reason for
  the major version bump.
* Added ``@consumer``.
* Improved test machinery.

1.1
-----

* Added ``first`` function.
* Added Python 3 support.
* Added a default arg to ``peekable.peek()``.
* Noted how to easily test whether a peekable iterator is exhausted.
* Rewrote documentation.

1.0
-----

* Initial release, with ``collate``, ``peekable``, and ``chunked``. Could
  really use better docs.

