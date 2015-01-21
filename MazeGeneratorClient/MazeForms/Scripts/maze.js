Node.prototype.add = function(tag, cnt, txt) {
            for (var i = 0; i < cnt; i++)
                this.appendChild(ce(tag, txt));
        }
Node.prototype.ins = function(tag) {
    this.insertBefore(ce(tag), this.firstChild)
}
Node.prototype.kid = function(i) { return this.childNodes[i] }
Node.prototype.cls = function(t) { this.className += ' ' + t }

NodeList.prototype.map = function(g) {
    for (var i = 0; i < this.length; i++) g(this[i]);
}

var move = {
    
    "left": function () {
  
        var y = document.getElementsByClassName('cur1');
        if (y[0].classList.contains('w')) {
            var x = y[0].previousSibling;
            y[0].classList.remove('cur1');
            x.classList.add('cur1');
        }
        
        return true;
        

    },

    "up": function () {
        var y = document.getElementsByClassName('cur1');
        if (y[0].classList.contains('n')) {

            y[0].parentNode.previousSibling.cells[y[0].cellIndex].classList.add('cur1');
            y[1].classList.remove('cur1');
        }
        return true;
    },

    "down": function () {
        var y = document.getElementsByClassName('cur1');
        if (y[0].classList.contains('s')) {
            y[0].parentNode.nextSibling.cells[y[0].cellIndex].classList.add('cur1');
            y[0].classList.remove('cur1');

        }        return true;
    },

    "right": function () {
        var y = document.getElementsByClassName('cur1');
        if (y[0].classList.contains('e')) {
            var x = y[0].nextSibling;
            y[0].classList.remove('cur1');
            x.classList.add('cur1');
        }
        return true;
    }


};


function next(elem) {
    do {
        elem = elem.nextSibling;
    } while (elem && elem.nodeType !== 1);
    return elem;
}

function ce(tag, txt) {
    var x = document.createElement(tag);
    if (txt !== undefined) x.innerHTML = txt;
    return x
}

function gid(e) { return document.getElementById(e) }
function irand(x) { return Math.floor(Math.random() * x) }

function make_maze() {
    var w = parseInt(gid('rows').value || 8, 10);
    var h = parseInt(gid('cols').value || 8, 10);
    var tbl = gid('maze');
    tbl.innerHTML = '';
    tbl.add('tr', h);
    tbl.childNodes.map(function(x) {
        x.add('th', 1);
        x.add('td', w, '*');
        x.add('th', 1)});
    tbl.ins('tr');
    tbl.add('tr', 1);
    tbl.firstChild.add('th', w + 2);
    tbl.lastChild.add('th', w + 2);
    for (var i = 1; i <= h; i++) {
        for (var j = 1; j <= w; j++) {
            tbl.kid(i).kid(j).neighbors = [
                tbl.kid(i + 1).kid(j),
                tbl.kid(i).kid(j + 1),
                tbl.kid(i).kid(j - 1),
                tbl.kid(i - 1).kid(j)
            ];
        }
    }
    walk(tbl.kid(irand(h) + 1).kid(irand(w) + 1));
    tbl.rows[h].cells[w].textContent = "END";
    tbl.rows[h].cells[w].className += ' finish';
    tbl.rows[1].cells[1].className += ' cur1';
    
    gid('solve').style.display = 'inline';
    document.onkeydown = function (ev) { keyMove(ev); };
}

function shuffle(x) {
    for (var i = 3; i > 0; i--) {
        j = irand(i + 1);
        if (j == i) continue;
        var t = x[j]; x[j] = x[i]; x[i] = t;
    }
    return x;
}

var dirs = ['s', 'e', 'w', 'n'];

function walk(c) {
    c.innerHTML = '&nbsp;';
    var idx = shuffle([0, 1, 2, 3]);
    for (var j = 0; j < 4; j++) {
        var i = idx[j];
        var x = c.neighbors[i];
        if (x.textContent != '*') continue;
        c.cls(dirs[i]), x.cls(dirs[3 - i]);
        walk(x);
    }
}

function solve(c, t) {
    if (c === undefined) {
        c = gid('maze').kid(1).kid(1);
        c.cls('v');
    }
    if (t === undefined)
        t = gid('maze')	.lastChild.previousSibling
                .lastChild.previousSibling;

    if (c === t) return 1;
    c.vis = 1;
    for (var i = 0; i < 4; i++) {
        var x = c.neighbors[i];
        if (x.tagName.toLowerCase() == 'th') continue;
        if (x.vis || !c.className.match(dirs[i]) || !solve(x, t))
            continue;

        x.cls('v');
        return 1;
    }
    c.vis = null;
    return 0;
}




function keyMove(ev)
{
    var y = document.getElementsByClassName('cur1');
    

    switch(ev.keyCode) {
        case 37: /* left */
            move.left();
            return false;
        case 38: /* up */
            move.up();
            return false;
        case 39: /* right */
            move.right();
            return false;
        case 40: /* down */
            move.down();
            return false;
        default:
         //   log("interaction", "Key press: %d", ev.keyCode);
            return true;
    }

    /*
    if (y[0].classList.contains('n')){
        alert("n");
    }
    if (y[0].classList.contains('w')) {
        alert("w");
    }
    if (y[0].classList.contains('s')) {
        alert("s");
    }
    if (y[0].classList.contains('e')) {
        alert("e");
    }
    */


    
}
