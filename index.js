import fs from "fs";
import path from "path";
import http from "http";

const server = http.createServer();
let sessions = {}; // Object to track active sessions

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
        
        else if (req.url === "/signup") {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.end(fs.readFileSync("frontend/signup.html", "utf-8"));
        } 
        
        else if (req.url === "/login") {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.end(fs.readFileSync("frontend/login.html", "utf-8"));
        } 
        
        else if (req.url === "/main") {
            // Check if the user has a valid session
            const sessionId = req.headers.cookie?.split('=')[1];
            if (sessions[sessionId]) {
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html");
                res.end(fs.readFileSync("frontend/main.html", "utf-8"));
            } else {
                res.statusCode = 302;
                res.setHeader("Location", "/login");
                res.end();
            }
        } 
        
        else if (req.url.startsWith("/Images/")) {
            const imgPath = path.join("frontend", req.url);
            const ext = path.extname(imgPath);
            const mimeTypes = {
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".png": "image/png",
                ".gif": "image/gif",
                ".webp": "image/webp",
            };

            res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
            res.end(fs.readFileSync(imgPath));
        } 
        
        else {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end(
                JSON.stringify({
                    message: "Page Not Found",
                })
            );
        }
    }

    // POST Request
    if (req.method === "POST") {
        if (req.url === "/user/register") {
            let users = [];

            const dbData = fs.readFileSync("db.json", "utf-8");

            if (dbData) {
                users = JSON.parse(dbData);
            }

            let data = "";
            req.on("data", (chunk) => {
                data += chunk;
            });


            req.on("end", () => {
                const newUser = JSON.parse(data);

                const userExists = users.find((user) => user.email === newUser.email);

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
            req.on("data", (chunk) => {
                data += chunk;
            });

            req.on("end", () => {
                const user = JSON.parse(data);

                const userExists = users.find(
                    (u) => u.email === user.email && u.password === user.password
                );

                if (userExists) {
                    const sessionId = Date.now().toString(); // Generate a simple session ID
                    sessions[sessionId] = userExists.email; // Store user session

                    res.statusCode = 200;
                    res.setHeader("Set-Cookie", `session=${sessionId}; HttpOnly`);

                    res.setHeader("Content-Type", "application/json");
                    res.end(
                        JSON.stringify({
                            message: "User logged in successfully",
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