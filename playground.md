# snipmake

Playing with a new syntax, so far I like it.

## Making snippets

Think of snippets as an automagic editor clipboard. Just use `cut`, `copy` and `paste` to
define and use snippets.

You can declare them anywhere in your project and they are available from any file (including the one they were defined).

```html
<!-- copy nav -->
<p>
	Nav: A, B, C<br>
	(will show up twice because we copied it)
</p>
<!-- end -->

<!-- cut footer -->
<p>
	Copyright &copy; 2016 A, B, C<br>
	(only shows up once because we cut it)
</p>
<!-- end -->
```

Both `cut` and `copy` make snippets. The
difference is `copy` will copy the snippet while, you guessed it, 
`cut` will cut it out of the current file. When in doubt, use `copy`.

To use any snippet, just `paste` it by name in any file in your project.

```html
<!-- paste footer -->
<!-- paste nav -->
```

## Page variables

These are more like constants, and you use `set` to define them.
Their values are available only inside the file where you `set` them.

```html
<!-- set test -->
<!-- set message Hello World! -->
```

## Global default variables

You can set global default values for variables with `default`.
If you use `set` with the same variable name in a given file, the default value
will be overwritten inside that file (and return to its default value for other files).

```html
<!-- default development -->
<!-- default title My Website -->
```

You can also use these defaults as a form of global variable which you can use anywhere in your project.

## Conditional builds

You can test a variable to decide if you want to include or exclude
a section. These will work inside snippets as well.

```html
<!-- if test -->
test is truthy!<br>
<!-- endif -->

<!-- if !test -->
test is falsy!<br>
<!-- endif -->
```

## Insert other content files

Right now, **snipmake** copies the file contents verbatum. Later there may
be filters (eg. markdown, jade).

```html
<!-- paste from metatags.html -->
```

