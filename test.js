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

var improvements = {
  "aqueduct" : {
    effectRequirement : function() {
      // TODO: A finished series of Aqueduct hexes must connect to a hill or mountain hex (with a river or lake) on one end and a settlement on the other end; otherwise, you do not gain its benefit.
    },
    settlementEffect : function() {
      // TODO: allows settlement to build water-dependent buildings.
    },
    loyaltyChange : 1,
    stabilityChange : 1,
    cost : function(hex) {
      switch (hex.kind) {
        case "cavern", "desert", "jungle", "marsh", "mountains": return 4;
        case "hills" : return 3;
        case "forest" : return 2;
        case "plains" : return 1;
      }
      throw "Aqueduct cannot be built in this hex";
    },
    terrainRequirement : "cavern desert jungle marsh mountains hills forest plains",
    canShare : true
  },
  "canal" : {
    terrainRequirement : "desert hills plains",    
    settlementEffect : function() {
      // TODO: Settlements in a hex with a Canal treat the hex as if it had a river.
    },
    cost : function(hex) {
      switch (hex.kind) {
        case "cavern", "desert", "jungle", "marsh", "mountains": return 8;
        case "hills" : return 6;
        case "forest" : return 4;
        case "plains" : return 2;
      }
      throw "Canal cannot be built in this hex";
    },
    canShare : true
  },
  "farm" : {
    terrainRequirement : "desert(canal coastline river) hills plains",
    consumptionChange : -2,
    cost : function(hex) {
      switch (hex.kind) {
        case "desert": return 8;
        case "hills" : return 4;
        case "plains" : return 2;
      }
      throw "Canal cannot be built in this hex";
    }
  },
  "fishery" : {
    terrainRequirement : "coastline water river marsh",
    consumptionChange : -1,
    cost : 4,
    canShare : true
  },
  "fort" : {
    turnsIntoSettlementBuilding : "barracks stables",
    terrainRequirement : "!water",
    stabilityChange : 2,
    defense : 4,
    consumptionChange : 1,
    unrestChange : -1,
    cost : 24,
    canShare : true,
  },
  "highway" : {
    kingdomSizeRequirement : 26,
    terrainRequirement : "road",
    economyChange : 1, // TODO: Economy +1 for every 4 hexes of Highway
    stabilityChange : 1, // TODO: Stability +1 for every 8 hexes of Highway,
    cost : function(hex) { // TODO: doubles if hex has river
      switch (hex.kind) {
        case "cavern", "desert", "jungle", "marsh", "mountains": return 8;
        case "hills" : return 6;
        case "forest" : return 4;
        case "plains" : return 2;
      }
      throw "Canal cannot be built in this hex";
    },
    canShare : true,
  },
  "mine" : {
    terrainRequirement : "cavern desert hills mountains",
    economyChange : 1,
    taxChange : 1,
    cost : 6,
  },
  "quarry" : {
    terrainRequirement : "cavern hills mountains",
    stabilityChange : 1,
    taxChange : 1,
    cost : 6
  },
  "road" : {
    upgradesInto : "highway",
    terrainRequirement : "!water",
    economyChange : 1, // TODO: Economy +1 for every 4 hexes of Highway
    stabilityChange : 1, // TODO: Stability +1 for every 8 hexes of Highway,
    cost : function(hex) { // TODO: doubles if hex has river
      switch (hex.kind) {
        case "cavern", "desert", "jungle", "marsh", "mountains": return 4;
        case "hills" : return 3;
        case "forest" : return 2;
        case "plains" : return 1;
      }
      throw "Canal cannot be built in this hex";
    },
    canShare : true
  },
  "sawmill" : {
    terrainRequirement : "forest jungle",
    stabilityChange : 1,
    taxChange : 1,
    cost : 3
  },
  "watchtower" : {
    terrainRequirement : "!water",
    defense : 2,
    unrestChange : -1,
    turnsIntoSettlementBuilding : "watchtower",
    upgradeInto : "fort",
    cost : 12,
  }
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