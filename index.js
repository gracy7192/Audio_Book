import fs from "fs";
import http from "http";

const server = http.createServer();

server.listen(8000, () => {
    console.log("Server is listening on port 8000");
});

// GET Request
server.on("request", (req, res) => {
    if (req.method === "GET") {
        if (req.url === "/") {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.end(fs.readFileSync("frontend/index.html", "utf-8"));
        }

        if (req.url === "/signup") {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.end(fs.readFileSync("frontend/signup.html", "utf-8"));
        }

        if (req.url === "/login") {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.end(fs.readFileSync("frontend/login.html", "utf-8"));
        }
    }

    if (req.method === "POST") {
        if (req.url === "/user/register") {
            let users = [];

            const dbData = fs.readFileSync("db.json", "utf-8");

            if (dbData) {
                users = JSON.parse(dbData);
            }

            let data = "";

            req.on("data", (userData) => {
                data += userData;
            });

            console.log(data);

            req.on("end", () => {
                const newUser = JSON.parse(data);

                const userExists = users.find(
                    (user) => user.email === newUser.email
                );

                if (userExists) {
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    res.end(
                        JSON.stringify({
                            message: "User already exists",
                        })
                    );
                } else {
                    const id = Date.now();

                    const userToAdd = { id: id, ...newUser };

                    users.push(userToAdd);

                    fs.writeFileSync("db.json", JSON.stringify(users), "utf-8");

                    res.statusCode = 201;
                    res.setHeader("Content-Type", "application/json");
                    res.end(
                        JSON.stringify({
                            message: "User registered successfully",
                            user: newUser,
                        })
                    );
                }
            });
        }

        if (req.url === "/user/login") {
            const users = JSON.parse(fs.readFileSync("db.json", "utf-8"));

            let data = "";

            req.on("data", (userData) => {
                data += userData;
            });

            req.on("end", () => {
                const user = JSON.parse(data);

                const userExists = users.find(
                    (u) =>
                        u.email === user.email && u.password === user.password
                );

                if (userExists) {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.end(
                        JSON.stringify({
                            message: "User logged in successfully",
                            user: user,
                        })
                    );
                } else {
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    res.end(
                        JSON.stringify({
                            message: "Invalid credentials",
                        })
                    );
                }
            });
        }
    }
});
