var kingdom = new Kingdom();
kingdom.buildImprovement(0, 0, new Farm());
kingdom.buildImprovement(4, 4, new Farm());
kingdom.buildImprovement(4, 7, new Farm());
kingdom.print();
kingdom.removeImprovement(0, 0, new Farm());
kingdom.print();
kingdom.razeImprovement(4, 7, new Farm());
kingdom.print();
kingdom.unrazeImprovement(4, 7, new Farm());
kingdom.print();

function printMap(map) {
  for (var x = 0; x < map.length; x++) {
    var textmap = "";
    for (var y = 0; y < map[x].length; y++) {
      textmap += "[" + map[x][y].print() + "]";
    }
    console.log(textmap);
  }
  console.log("");
}

function create2DArray(xlen, ylen, initFunc) {
  var arr = new Array(xlen);
  for (var x = 0; x < xlen; x++) {
    arr[x] = new Array(ylen);
    for (var y = 0; y < ylen; y++) {
      arr[x][y] = initFunc();
    }
  }
  return arr;
}

function Hex() {
  var self = this;
  self.improvements = [];
  self.print = function() {
    return self.improvements.length > 0 ? self.improvements[0].print() : " ";
  };
}

function Farm() {
  var self = this;
  self.name = "Farm";
  self.icon = "F";
  self.razedIcon = "R";
  self.razed = false;
  self.print = function() {
    return self.razed ? self.razedIcon : self.icon;
  };
  self.applyBonus = function(kingdom) {
    kingdom.stability += 1;
  };
  self.removeBonus = function(kingdom) {
    kingdom.stability -= 1;
  };
}

function Kingdom() {
  var self = this;
  self.map = create2DArray(10, 10, function() {
    return new Hex(); 
  });

  self.economy = 0;
  self.loyalty = 0;
  self.stability = 0;

  self.buildImprovement = function(x, y, improvement) {
    var hex = self.map[x][y];
    hex.improvements.push(improvement);
    improvement.applyBonus(self);
  };

  self.removeImprovement = function(x, y, improvement) {
    var hex = self.map[x][y];
    for (var i = 0; i < hex.improvements.length; i++) {
      if (hex.improvements[i].name == improvement.name) {
        hex.improvements.splice(i, 1);
        break;
      }
    }
    improvement.removeBonus(self);
  };

  self.razeImprovement = function(x, y, improvement) {
    var hex = self.map[x][y];
    for (var i = 0; i < hex.improvements.length; i++) {
      if (hex.improvements[i].name == improvement.name) {
        hex.improvements[i].razed = true;
        break;
      }
    }
    improvement.removeBonus(self);
  }

  self.unrazeImprovement = function(x, y, improvement) {
    var hex = self.map[x][y];
    for (var i = 0; i < hex.improvements.length; i++) {
      if (hex.improvements[i].name == improvement.name && hex.improvements[i].razed) {
        hex.improvements[i].razed = false;
        break;
      }
    }
    improvement.applyBonus(self);
  }

  self.print = function() {
    var map = self.map;    
    for (var x = 0; x < map.length; x++) {
      var textmap = "";
      for (var y = 0; y < map[x].length; y++) {
        textmap += "[" + map[x][y].print() + "]";
      }
      console.log(textmap);
    }
    console.log("Economy " + self.economy + " Loyalty " + self.loyalty + " Stability " + self.stability);
    console.log("");
  };
}