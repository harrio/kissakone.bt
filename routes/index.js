/*
* GET home page.
*/
function index(req, res) {
    res.render('index', { title: 'Express' });
}
exports.index = index;

function partials(req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
}
exports.partials = partials;

