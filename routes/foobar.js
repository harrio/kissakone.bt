var schedule = require("schedule");

// GET

exports.runs = function (req, res) {
  var runs = [];
  data.runs.forEach(function (run, i) {
    runs.push({
      id: i,
      title: run.title,
      text: run.text.substr(0, 50) + '...'
    });
  });
  res.json({
    runs: runs
  });
};
 
exports.run = function (req, res) {
  var id = req.params.id;
  if (id >= 0 && id < data.runs.length) {
    res.json({
      run: data.runs[id]
    });
  } else {
    res.json(false);
  }
};

// POST
exports.addRun = function (req, res) {
  data.runs.push(req.body);
  res.json(req.body);
};
 
// PUT
exports.editRun = function (req, res) {
  var id = req.params.id;
  
  if (id >= 0 && id < data.runs.length) {
    data.runs[id] = req.body;
    res.json(true);
  } else {
    res.json(false);
  }
};
 
// DELETE
exports.deleteRun = function (req, res) {
  var id = req.params.id;
  
  if (id >= 0 && id < data.runs.length) {
    data.runs.splice(id, 1);
    res.json(true);
  } else {
    res.json(false);
  }
};