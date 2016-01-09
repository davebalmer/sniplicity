// configure variable start/end here for now
var varstart = "\\-\\-";
var varend = "\\-\\-";

var fs = require("fs");
var path = require("path");
var cli = require("commander");
var colors = require("colors");

console.log("\nsniplicity".green.bold + ".js".blue);
console.log("http://github.com/davebalmer/sniplicity\n".gray.underline);

cli
	.version('0.1.0')
	.option('-i, --in [dir]', 'Source directory')
	.option('-o, --out [dir]', 'Output directory for compiled files')
	.option('-w, --watch', 'Keep watching the input directory')
	.option('-v, --verbose', 'Extra console messages')
	.parse(process.argv);

var filelist = [];

var source = fixdir(cli.in) || "./";
var output = fixdir(cli.out) || "./out/";

var watch = cli.watch || false;
var verbose_cli = cli.verbose || false;

function fixdir(d) {
	if (d && typeof d === "string" && d.substring(d.length - 1) !== "/")
		d += "/";

	return d;
}

// glob
var allfiles = fs.readdirSync(source);
var files = [];
var snippets = {};

function verbose() {
	if (verbose_cli)
		console.log.apply(this, arguments);
}

function build() {
	verbose("Loading " + "sniplicity".green + " files...");
	
	getfilelist();

	for (var i = 0; i < files.length; i++) {
		var f = source + files[i];
		var fn = path.basename(f);

		verbose("  " + fn);
		
		var data = fs.readFileSync(f, 'utf8') || "";	
		var list = data.split("\n");
		
		filelist.push({
			file: f,
			filename: fn,
			data: list,
			saved: false,
			loaded: true,
			def: {}
		});
	}

	snippets = {};

	verbose("Finding all " + "snippets".green + "...");

	// get snippets
	for (var i = 0; i < filelist.length; i++) {
		var d = filelist[i].data;
		var blockname = ""
		var block = [];
		var cutting = false;
		
		for (var j = 0; j < d.length; j++) {
			var p = parse(d[j]);

			if (p !== null) {
				if (p[0] == "copy" || p[0] == "cut") {
					cutting = (p[0] == "cut");
						
					blockname = p[1];
					block = [];
				}
				else if (p[0] == "end") {
					if (blockname)
						snippets[blockname] = block;

					block = [];
					blockname = "";
					cutting = false;
				}
				else {
					if (blockname && !cutting)
						block.push(d[j]);				
				}
			}
			else {
				if (blockname && !cutting)
					block.push(d[j]);
			}
		}
	}

	verbose("Adding " + "snippet".green + "goodness...");

	// insert snippets
	for (var i = 0; i < filelist.length; i++) {
		var d = filelist[i].data;
		var newfile = [];

		for (var j = 0; j < d.length; j++) {
			var p = parse(d[j]);

			if (p !== null) {
				if (p[0] == "paste") {
					if (typeof snippets[p[1]] !== "undefined") {
						var x = snippets[p[1]];

						for (var l = 0; l < x.length; l++)
							newfile.push(x[l]);
					}
					else {
						console.log("Unmatched snippet name: " + p[1] + "found in " + filelist[i].filename + ":" + (j + 1));
					}
				}
				else {
					newfile.push(d[j]);
				}
			}
			else {
				newfile.push(d[j]);
			}
		}

		filelist[i].data = newfile;
	}

	verbose("Writing files...");

	// strip out ifdef blocks and other comments
	for (var i = 0; i < filelist.length; i++) {
		var d = filelist[i].data;
		var write = true;
		var newfile = [];
		
		for (var j = 0; j < d.length; j++) {
			var p = parse(d[j]);
			if (p !== null) {
				if (p[0] == "set" || "global") {
					// take care of variables here
					var v = "";
					if (p.length > 2) {
						for (var z = 2; z < p.length; z++) {
							if (z != 2)
								v += " ";
							
							v += p[z];
						}
					}
					if (p[0] == "set")
						filelist[i].def[p[1]] = v || true;
					else
						defglob[[p[1]] = v || true;
				}
				else if (p[0] == "if") {
					if (p[1].substring(0, 1) == "!") {
						console.log(p[1]);
						p[1] = p[1].substring(1, p[1].length);
						console.log(p[1]);

						if (filelist[i].def[p[1]] === "undefined" || !filelist[i].def[p[1]])
							write = true;
						else
							write = false;
					}
					else {
						if (filelist[i].def[p[1]] !== "undefined" && filelist[i].def[p[1]])
							write = true;
						else
							write = false;
					}
				}
				else if (p[0] == "endif") {
					write = true;
				}
			}
			else {
				if (write)
					newfile.push(d[j]);
			}
		}
		
		// replace variables
		var fulltext = replacements(newfile.join("\n"), filelist[i].def);
		
		fs.writeFileSync(output + filelist[i].filename, fulltext, 'utf8');
		verbose("  " + output + filelist[i].filename, 'utf8');
	}

	console.log("Made files: ".green.bold + source.underline + " -> ".blue + output.underline);
}

if (watch)
	console.log("sniplicity".green.bold + ".js".blue + " is watching files in " + source);

build();

if (watch) {
	fs.watch(source, function (event, filename) {
		build();
	});
}

function getfilelist() {
	allfiles = fs.readdirSync(source);
	files = [];

	for (var i = 0; i < allfiles.length; i++) {
		var x = allfiles[i].match(/(html|htm|txt)$/);
		if (x && x.length)
			files.push(allfiles[i]);
	}
}

function parse(s) {
	var m = s.match(/\<\!\-\-\s+(.*)\s+\-\-\>/);

	if (m && m.length)
		return m[1].split(/\s+/);
		
	return null;
}

function replacements(str, data) {
	var s = str;
	var defreg = new RegExp(varstart + "\\w+" + varend, "g");

	for (var i in data) {
		var reg = new RegExp(varstart + i + varend, "g");
		
		if (typeof data[i] === "string")
			s = s.replace(reg, data[i]);
		else
			s = s.replace(reg, "");
	}

	// clean up any undefined variables
	s = s.replace(defreg, "");

	return s;
};

