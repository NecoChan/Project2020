const express = require('express');
const bodyParser = require('body-parser');
const models = require('./models');
const neo4j = require('neo4j-driver');
const config = require('./config.json');


class Application {
    constructor() {
        // Создаем наше Express-приложение.
        this.expressApp = express();
        // Создаем ChatRoomManager, экспортированный из models.js
        this.manager = new models.ChatRoomManager();
        this.attachRoutes();

        if (config.isDbEnabled) {
            console.log("neo4j: " + neo4j);
            console.log("process.env.GRAPHENEDB_BOLT_URL=" + process.env.GRAPHENEDB_BOLT_URL);
            var graphenedbURL = process.env.GRAPHENEDB_BOLT_URL;
            var graphenedbUser = process.env.GRAPHENEDB_BOLT_USER;
            var graphenedbPass = process.env.GRAPHENEDB_BOLT_PASSWORD;

            this.driver = neo4j.driver(graphenedbURL, neo4j.auth.basic(graphenedbUser, graphenedbPass));
        }
    }

    attachRoutes() {
        let app = this.expressApp;
        // Создадим middleware для обработки JSON-тел запросов, т. е. функцию,
        // которая будет вызываться перед нашими обработчиками и обрабатывать
        // JSON в теле запроса, чтобы наш обработчик получил готовый объект.
        let jsonParser = bodyParser.json();

        app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        app.get('/nodes', this.getNodes.bind(this));
        app.get('/nodes-test', this.getNodesTest.bind(this));
    }

    getNodes(req, res) {
        let response = {
            nodes: [
                {
                    id: 1,
                    name: "name",
                    val: "val",
                },
                {
                    id: 2,
                    name: "name",
                    val: "val",
                }
            ],
            links: [
                {
                    source: 1,
                    target: 2
                }
            ]
        };

        res.json(response)
    }

    getNodesTest(req, res) {

        if (config.isDbEnabled) {

            let session = this.driver.session();

            let response = null;

            session
                .run("CREATE (n {hello: 'World'}) RETURN n.name")
                .then(function (result) {
                    result.records.forEach(function (record) {
                        console.log(record)
                    });
                    response = result.records;
                    res.json(response)
                })
                .catch(function (error) {
                    console.log(error);
                }).then(() => session.close());
        } else {
            res.json({
                data: "Test"
            })
        }
    }
}


// Экспортируем наш класс наружу
module.exports = Application;
