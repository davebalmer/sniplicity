// configure variable start/end here for now
var varstart = "\\-\\-";
var varend = "\\-\\-";

var fs = require("fs");
var path = require("path");
var cli = require("commander");
var colors = require("colors");

cool("            _      ", " _  _       _             ");
cool("           (_)     ", "| |(_)     (_)  _         ");
cool("  ___ ____  _ ____ ", "| | _  ____ _ _| |_ _   _ ");
cool(" /___)  _ \\| |  _ \\", "| || |/ ___) (_   _) | | |");
cool("|___ | | | | | |_| ", "| || ( (___| | | |_| |_| |");
cool("(___/|_| |_|_|  __/", " \\_)_|\\____)_|  \\__)\\__  |");
cool("             |_|   ", "                   (____/ ");
function cool(l, r) {
	console.log(l.green + r.cyan)
}

console.log("  " + "http://github.com/davebalmer/sniplicity".gray.underline);

cli
	.version('0.1.9')
	.description('Build simple static websites using:'.white.bold + '\n\n  - snippets with ' + '<!-- copy x -->'.green + ' and ' + '<!-- paste x -->'.green + '\n  - variables using ' + '<!-- set y -->'.green + ' and ' + '<!-- global z -->'.green + '\n  - include files with ' + '<!-- include filename.html -->'.green + '\n\n  See README.md to get started.'.yellow.bold)
	.usage('-i source_folder -o destination_folder -w')
	.option('-i, --in <path>', 'source directory')
	.option('-o, --out <path>', 'output directory for compiled files')
	.option('-w, --watch', 'keep watching the input directory')
	.option('-v, --verbose', 'extra console messages')
	.parse(process.argv);

var filelist = [];

if (!cli.out) {
	
	cli.help();
}
	
var source = fixdir(cli.in) || "./";
var output = fixdir(cli.out);

var watch = cli.watch || false;
var verbose_cli = cli.verbose || false;

exports.build = function(i, o, w) {
	source = fixdir(i) || "./";
	output = fixdir(o) || "./out/";
	watch = w || false;
	
	start();
}

function fixdir(d) {
	if (d && typeof d === "string" && d.substring(d.length - 1) !== "/")
		d += "/";

	return d;
}

// glob
var allfiles = [];
var files = [];
var snippets = {};
var defglob = {};

var watchtimeout = 0;

function verbose() {
	if (verbose_cli)
		console.log.apply(this, arguments);
}

function start() {
	if (watch)
		console.log("snip".green.bold + "licity".cyan.bold + " is watching files in " + source.cyan.underline + "\n");

	build();

	if (watch) {
		fs.watch(source, function (event, filename) {
			if (!watchtimeout) {
				watchtimeout = setTimeout(function() { watchtimeout = 0 }, 200);
				build();
			}
		});
	}
}

start();

function build() {
	verbose("Loading " + "sniplicity".green + " files...");
	
	getfilelist();

	for (var i = 0; i < files.length; i++) {
		var f = source + files[i];
		var fn = "";
				
		var data = "";
		try {
			fn = path.basename(f);
			verbose("  " + fn);
			data = fs.readFileSync(f, 'utf8') || "";	
		}
		catch (e) {
			warning("Cannot read file " + f.cyan.underline);
			continue;
		}
		
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
	defglob = {};

	verbose("Finding all " + "snippets".green + "...");

	// get snippets
	for (var i = 0; i < filelist.length; i++) {
		var d = filelist[i].data;
		var blockname = ""
		var block = [];
		
		for (var j = 0; j < d.length; j++) {
			var p = parse(d[j]);

			if (p !== null) {
				if (p[0] == "include") {
					// omg include a file...!
					var fd = getfileasarray(p[1]);
					if (fd == null) {
						warning("Unable to " + "include ".cyan + p[1].cyan.underline, filelist[i].filename, j);
					}
					else {
						d.splice.apply(d, [j, 1].concat(fd));
					}
				}
				if (p[0] == "copy" || p[0] == "cut") {
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
				else if (p[0] == "global") {
					defglob[p[1]] = parsevalue(p) || true;
				}
				else {
					if (blockname)
						block.push(d[j]);				
				}
			}
			else {
				if (blockname)
					block.push(d[j]);
			}
		}
	}

	verbose("Adding " + "snippet".green + " goodness...");
	
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
						warning("Unable to " + "insert ".green + p[1].cyan.underline + " because snippet doesn't exist", filelist[i].filename, j + 1);
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
		var cutting = false;
		
		for (var j = 0; j < d.length; j++) {
			var p = parse(d[j]);
			if (p !== null) {
				if (p[0] == "set") {
					filelist[i].def[p[1]] = parsevalue(p) || true;
				}
				else if (p[0] == "if") {
					if (p[1].substring(0, 1) == "!") {
						p[1] = p[1].substring(1, p[1].length);
						write = isfalse(filelist[i].def, p[1]);
					}
					else {
						write = istrue(filelist[i].def, p[1]);
					}
				}
				else if (p[0] == "endif") {
					write = true;
				}
				else if (p[0] == "cut") {
					write = false;
					cutting = true;
				}
				else if (cutting && p[0] == "end") {
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
		
		try {
			verbose("  " + output + filelist[i].filename, 'utf8');
			fs.writeFileSync(output + filelist[i].filename, fulltext, 'utf8');
		}
		catch (e) {
			error("Cannot write file " + (output + filelist[i].filename).cyan.underline);
		}
	}

	console.log("Compiled".green.bold + " from " + source.cyan.underline + " to " + output.cyan.underline);
	if (!watch)
		console.log("Success!".green.bold);
}

function isfalse(o, k) {
	if (typeof o[k] === "undefined")
		o = defglob;

	if (typeof o[k] === "undefined" || !o[k])
		return true;
	
	return false;
}

function istrue(o, k) {
	if (typeof o[k] === "undefined")
		o = defglob;
		
	if (typeof o[k] !== "undefined" && o[k])
		return true;

	return false;
}

function getvalue(o, k) {
	if (typeof o[k] === "undefined")
		o = defglob;
		
	if (typeof o[k] !== "undefined")
		return o[k];
		
	return 	"";
}

function parsevalue(p) {
	var v = "";
	if (p.length > 2) {
		for (var z = 2; z < p.length; z++) {
			if (z != 2)
				v += " ";
			
			v += p[z];
		}
	}

	return v;
}

function getfilelist() {
	try {
		allfiles = fs.readdirSync(source);
	}
	catch (e) {
		error("Cannot open source directory " + source.cyan.underline);
	}

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
	var all = {};

	for (var i in defglob)
		all[i] = defglob[i];

	for (var i in data)
		all[i] = data[i];

	for (var i in all) {
		var reg = new RegExp(varstart + i + varend, "g");
		
		var rep = "";
		if (typeof all[i] !== "undefined")
			rep = all[i];

		s = s.replace(reg, rep);
	}

	// clean up any undefined variables
	s = s.replace(defreg, "");

	return s;
};

function getfileasarray(f) {
	var data = "";
	
	try {
		data = fs.readFileSync(f, 'utf8') || "";
	}
	catch(e) {
		try {
			f = source + f;
			data = fs.readFileSync(f, 'utf8') || "";
		}
		catch(e) {
			return null;
		}
	}

	verbose("include ".green + f.cyan.underline);
	
	return data.split("\n") || [];
}		

function warning(msg, f, l) {
	console.log("Warning: ".yellow.bold + msg + getfilepos(f, l));
}

function error(msg, f, l) {
	console.log("\nError: ".red.bold + msg + getfilepos(f, l) + "\n");
	cli.help();
}

function getfilepos(f, l) {
	if (f) {
		if (l)
			f += ":" + l;

		return " in " + f;
	}
	
	return "";
}
