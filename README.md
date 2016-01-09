snipmake
========

Simple comment-based HTML build system that lets you reuse code snippets with simple variables and conditional inclusion. Great for building static websites with less hassle.

You can include special keywords embedded in HTML comments to:

- Select and use snippets of HTML across files
- Define and insert variables
- Include or omit sections of HTML based on variable values
- Watch for changes to source directory to auto-compile as you save

Use
---

Use a source HTML directory to build compiled HTML files
in an output directory.

```
node snipmake.js -i source_dir -o output_dir
```

- Source files must be `.html` or `.htm` or `.txt`
- Any changes you make manually to the output directory for source files will be overwritten

Syntax
------

All commands are single-line HTML comments. This manes you can add them while still retaining normal HTML editing and viewing for quite a while before having to use the build process.

### Set a variable to `true`

```html
<!-- define x -->
```

### Set a variable to a string value

```html
<!-- define author Bill Watson -->
```
	
### Using variable values

```html
Contact <a href="mailto:--email--">--name--<.a>
```

### Include a section only if a variable is set

```html
<!-- ifdef x -->
This will be on your page
<!-- endif -->
```

### Include a section only if a variable is not set

```html
<!-- ifndef x -->
This will not be on your page
<!-- endif -->
```

### Several conditionals

```html
<!-- ifdef a -->
Hello, A!
<!-- endif -->
<!-- ifdef b -->
Hello, B!
<!-- endif -->
<!-- ifdef c -->
Hello, C!
<!-- endif -->
```

### Can be simplified to
		
```html
<!-- ifdef a -->
Hello, A!
<!-- ifdef b -->
Hello, B!
<!-- ifdef c -->
Hello, C!
<!-- endif -->
```
	
### Define a snippet which may **also** be used elsewhere

```html
<!-- begin copyright -->
Copyright &copy; 2016 No one anywhere
<!-- end copyright -->
```
	
### Use that snippet somewhere else

```html
<!-- insert copyright -->
```

### Putting it all together
	
Page 1.

```html
<!-- begin contact -->
--name--
<a href="tel:+01--phone--">--phone--</a>
<a href="--email-->"--email--</a>
<!-- end contact -->
```

Page 2.

```html
<!-- define name Bob Smith -->
<!-- define phone 2125551234 -->
<!-- define email bob!bobobobo.com -->

<!-- insert contact -->
```

### Simplify further with some "global" variables:


Define in a file like `_global.html`:

```html
<!-- begin globals -->
	<!-- define name Bob Smith -->
	<!-- define email bob@bobobobo.com -->
	<!-- define phone 2125551234 -->
<!-- end globals -->
```

Use in other files:

```html
	<!-- insert globals -->
	<!-- insert contact -->
```

Rules
-----

Snippets are global for all pages, variables are local to each page.

- variables set with `define` are only used on that page
- you may make snippets with `begin` and `end` on any page
- you may `insert` any defined snippet anywhere on any page

When in doubt, don't re-define things. In case of duplicates, the lat definition wins. So:

- if you `define` a variable more than once, the last definition will always be used
- if you `begin` and `end` a snippet with the same name more than once, the last definition
	in order of files read will be used (READ: this may be seemingly random)

Undefined things don't get compiled.

- any snippets referenced that aren't defined become empty space in the compiled files
- any variables that aren't defined become nothing in compiled files

Names must be alphanumeric characters for snippets and variables:

- Good: name, address, work_phone, home-phone, email2
- Bad: $name, super!, last name, #tagged

Names for `snippets` and `variables` are Case Sensitive:

- pick a standard and stick with it
- when in doubt, keep them to all lower case

Workflow Advice
---------------

1. Start by making a typical page from your site as you would by hand
2. Then decide snippets which can be shared elsewhere and denote them with `begin` and `end`
3. Build additional pages, always looking for common snippets which can be `insert`ed
4. Look for things which you might want to change easily later and `define` them as variables
5. Look for common variables and put them in a snippet which is shared across pages

License
-------

Copyright (C) 2016 Dave Balmer, Jr. All Rights Reserved.
MIT OSS License
