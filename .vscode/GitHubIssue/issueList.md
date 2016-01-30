# #15: [Support on-insert parse order](https://github.com/davebalmer/sniplicity/issues/15)

<div class='label' style='background-color:#e74c3c'>bug</div> <div class='label' style='background-color:#27ae60'>help wanted</div> 

**User:** davebalmer  

**Milestone: 0.2.0 Valentine**  **Created:** 2016-01-21T21:32:13Z  **Updated:** 2016-01-21T21:32:51Z

<hr>

Given a snippet like:

```html
<!-- set name Joe -->

<!-- copy sample -->
<p>Hello --name --</p>
<!-- end sample -->
```

Results in `Hello Bob` on the index page, which is fine. But when we paste it in another file:

```html
<!-- set name Bob -->

<!-- paste sample -->
```

Currently results in `Hello Joe` again. It Should result in `Hello Bob` by re-evaluating each snippet at `paste` time to find variables or globals to replace, in this case `name`. This should go hand in hand with #3.


<hr>

# #14: [Add an `<!-- else -->` command](https://github.com/davebalmer/sniplicity/issues/14)

<div class='label' style='background-color:#3498db'>feature</div> <div class='label' style='background-color:#27ae60'>help wanted</div> 

**User:** davebalmer  

**Milestone: 0.2.0 Valentine**  **Created:** 2016-01-21T21:24:33Z  **Updated:** 2016-01-21T21:24:44Z

<hr>

Would make this:

```html
<header>
  <!-- if !home -->
  <a href="/">Home</a>
  <!-- if home -->
  <span>Home</span>
  <!-- if !about -->
  <a href="about.html">About</a>
  <!-- if about -->
  <span>About</span>
  <!-- if !download -->
  <a href="download.html">Download</a>
  <!-- if download -->
  <span>Download</span>
  <!-- endif -->
</header>
```
Look clearer:

```html
<header>
  <!-- if home -->
  <span>Home</span>
  <!-- else -->
  <a href="/">Home</a>
  <!-- if about -->
  <span>About</span>
  <!-- else -->
  <a href="about.html">About</a>
  <!-- if download -->
  <span>Download</span>
  <!-- else -->
  <a href="download.html">Download</a>
  <!-- endif -->
</header>
```

<hr>

# #7: [Pull in markdown files for content](https://github.com/davebalmer/sniplicity/issues/7)

<div class='label' style='background-color:#000000'>epic</div> <div class='label' style='background-color:#27ae60'>help wanted</div> <div class='label' style='background-color:#8e44ad'>question</div> 

**User:** davebalmer  

**Created:** 2016-01-10T06:28:42Z  **Updated:** 2016-01-12T10:08:02Z

<hr>

For a lot of reasons, I'd like to integrate markdown support. From what I can see, we either:

1. sneak some voodoo in the recognizes md filenames and parses
2. make sure modularization effort fits in with typical build system demands and let them handle markdown files
3. add extensions based on filetype to do processing (then we're the build chain)

Some thinking required. Suggestions?

<hr>

# #6: [Error checking for runaway blocks](https://github.com/davebalmer/sniplicity/issues/6)

<div class='label' style='background-color:#3498db'>feature</div> <div class='label' style='background-color:#27ae60'>help wanted</div> 

**User:** davebalmer  

**Milestone: 0.2.0 Valentine**  **Created:** 2016-01-10T06:12:34Z  **Updated:** 2016-01-10T06:16:34Z

<hr>

Error if we hit `EOF` before:

- `<!-- endif -->`
- `<!-- end -->`



<hr>

# #3: [Support nested blocks](https://github.com/davebalmer/sniplicity/issues/3)

<div class='label' style='background-color:#3498db'>feature</div> <div class='label' style='background-color:#27ae60'>help wanted</div> 

**User:** davebalmer  

**Milestone: 0.2.0 Valentine**  **Created:** 2016-01-09T16:20:24Z  **Updated:** 2016-01-10T06:16:34Z

<hr>

Could be very useful or possibly confusing. Need to test this a bit more, but looking to be able to:

```html
<!-- copy header -->
    <!-- copy nav -->
        ...
    <!-- end nav -->
    ...
<!-- end header -->
```

If nesting ends up not being supported for reasons of simplicity, should throw some sort of parsing error if nesting is found. 

<style>.label{display:inline-block;padding:5px 10px;border-radius:5px;color:white}</style>