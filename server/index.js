const Application = require('./app');
// JSON-файлы тоже можно подгружать через require!
const config = require('./config.json');

require('dotenv').config({path: __dirname + '/.env'})

let app = new Application();

app.expressApp.listen(process.env.PORT, config.host, function() {
    console.log(`App listening at port ${process.env.PORT}`);
});
