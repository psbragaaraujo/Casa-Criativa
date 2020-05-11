const express = require("express");
const server = express();

const db = require("./db");

// configurar arquivos estáticos (css, scripts, imagens)
server.use(express.static("public"));

// habilitar uso do request.body
server.use(express.urlencoded({ extended: true }));

const nunjucks = require("nunjucks");
nunjucks.configure("views", {
    express: server,
    noCache: true,
});

server.get("/", function(request, response) {

    db.all(`SELECT * FROM ideas`, function(err, rows) {
        if (err) {
            console.log(err);
            return response.send("Erro no banco de dados!");
        }

       const reversedIdeas = [...rows].reverse();

        let lastIdeas = [];
        for (let idea of reversedIdeas) {
            if (lastIdeas.length < 2) {
                lastIdeas.push(idea);
            }
        }

        return response.render("index.html", { ideas: lastIdeas });
    });   
});

server.get("/ideias", function(request, response) {

    db.all(`SELECT * FROM ideas`, function(err, rows) {
        if (err) {
            console.log(err);
            return response.send("Erro no banco de dados!");
        }

        const reversedIdeas = [...rows].reverse();

        return response.render("ideias.html", { ideas: reversedIdeas});

    });
});

server.post("/", function(request, response) {
    
    const query = `
        INSERT INTO ideas(
            image,
            title,
            category,
            description,
            link
        ) VALUES (?,?,?,?,?);
    `

    const values = [
        request.body.image,
        request.body.title,
        request.body.category,
        request.body.description,
        request.body.link,
    ]

   db.run(query, values, function(err) {
        if (err) {
            console.log(err);
            return response.send("Erro no banco de dados!");
        }

        return response.redirect("/ideias");
   });
});

server.listen(3000);