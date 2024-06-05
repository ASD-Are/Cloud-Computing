# Description: 
This project focused on developing a Time Server as a HTTP JSON API using Node.js on Ubuntu. It begins with Node.js installation, followed by studying time server concepts, JSON, and HTTP JSON API servers. Implementation involves creating utility functions, defining endpoints, and testing the code. The project aims to provide practical experience in building a time-oriented web server with Node.js.

# Design:
- Objective:
- Provide current date and time as JSON.
- EndPoint:
  - `"http://localhost:8000/api/currenttime".`
  - Response_Format: 
              - `{"year": 2021, "month": 09, "date": 24, "hour": 16, "minute": 09}`
 # Implement:
 - Step_1:
      ```sh
      Install Node.js on Ubuntu
      $ sudo apt install nodejs
      $ node -v
      $ sudo apt install npm
      $ npm -v 
      ```
- Step_2: 
  - Why Time Server:
     - Why_Study: 
       Ensures accurate time data crucial for scheduling and communication.
     - Key_Concepts:
       - Protocol_Integration: 
         Explore NTP or custom solutions for synchronization.
       - Timezone_Handling: 
         Account for timezone differences for consistent representation.
       - Precision_and_Accuracy: 
         Consider requirements for timestamps and reporting.
       - Approach:
            - Review_Implementations: 
                Analyze existing Time Servers in similar projects.
            - Experiment: 
                Test different protocols for suitability.
            - Prototype_Integration: 
                Develop and integrate Time Server functionality.
        - Outcomes:
            - Deep_Understanding: 
                Grasp Time Server architecture and functionality.
            - Practical_Skills: 
                Hands-on experience in integration and management.
            - Project_Alignment: 
                Ensure alignment with project goals and requirements.
         
- Step_3: 
  Study JSON:
  - Description: 
    JSON, or JavaScript Object Notation, is a widely used format for storing and exchanging data. Its simplicity, based on key/value pairs, lists, and scalars, aligns well with the data structures of dynamic programming languages, making it easy to work with. Unlike XML, JSON does not require a schema, enabling straightforward data interchange and processing.
- Step_4: 
  Study HTTP JSON API Server:
  - Description: 
     Create a file called timeServer.js, and write the content of the js file.
    1. Imports Required Modules:
            - http: 
                Used to create the HTTP server.
            - url: 
                Used to parse the URL and query parameters.
    2. Defines Utility Functions:
            - zeroFill(i): 
                Adds a leading zero to numbers less than 10.
            - now(): 
                Returns the current date and time as an object with year, month, date, hour, and minute.
    3. Creates an HTTP Server:
            - /api/currenttime: 
                Responds with the current date and time in JSON format.
            - /api/parsetime: 
                Parses the provided ISO-format time and responds with hour, minute, and second.
            - /api/unixtime: 
                Converts the provided ISO-format time to UNIX epoch time and responds with it.
            - Other Endpoints: 
                Responds with a plain text representation of the current date and time or an error message.
    4. Starts the Server:
            - Listens on a port provided as a command-line argument.
- Step_5: 
Modify HTTP JSON API Server to support this request from the client side:
    ```shell
    $ vi timeServer.js
    ```
```js
const http = require('http');
const url = require('url');
// Function to add leading zero to numbers less than 10
function zeroFill(i) {
return (i < 10 ? '0' : '') + i;
}
// Function to format the current date and time
function now() {
var d = new Date();
return {
year: d.getFullYear(),
month: zeroFill(d.getMonth() + 1),
date: zeroFill(d.getDate()),
hour: zeroFill(d.getHours()),
minute: zeroFill(d.getMinutes())
};
}
// Function to parse time into hour, minute, and second
function parsetime(time) {
return {
hour: time.getHours(),
minute: time.getMinutes(),
second: time.getSeconds()
};
}
// Function to get UNIX epoch time
function unixtime(time) {
return { unixtime: time.getTime() };
}
// Create an instance of the HTTP server to handle HTTP requests
let server = http.createServer((req, res) => {
const parsedUrl = url.parse(req.url, true);
const time = new Date(parsedUrl.query.iso);
let result;
if (req.url === '/api/currenttime') {
result = now();
} else if (/^\/api\/parsetime/.test(req.url)) {
result = parsetime(time);
} else if (/^\/api\/unixtime/.test(req.url)) {
result = unixtime(time);
} else {
res.writeHead(200, { 'Content-Type': 'text/plain' });
const nowObj = now();
result = `${nowObj.year}-${nowObj.month}-${nowObj.date}
${nowObj.hour}:${nowObj.minute}`;
//return;
}
if (result) {
res.writeHead(200, { 'Content-Type': 'application/json' });
res.end(JSON.stringify(result) + '\n');
} else {
res.writeHead(404);
res.end();
}
});
// Start the server listening on the port provided on the command line
server.listen(Number(process.argv[2]), () => {
console.log('Node server running on http://localhost:' + process.argv[2] + 
'\n');
});
```
 
# Requirement: 
- Set up Ubuntu in virtual machine either in Stand alone VM or Cloud instance such as GCP:
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/2f67e6d3-9d10-4c0b-9c32-022bc1dd228c)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/cd9a2207-ca9d-48b9-996a-35032290b5b7)
- After preparing the Ubuntu Operating, we should install node.js and npm:
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/806cd1d3-fef6-4025-9fda-50b279d73cd0)
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/3b374540-973c-447d-9976-61bb60052561)

# Execution(Testing):
Test the code by running the server and verifying the results using a curl command. To accomplish this, open two terminal sessions via SSH on the Google VM instance: use one to run the Node.js server and the other to fetch the website content.
- Direction to run the code: 
    ```ssh (1)
    $ node timeServer.js 8000
   ```
    ```ssh(2)
     $ curl http://localhost:8000/api/currenttime
    ```
![image](https://github.com/ASD-Are/Cloud-Computing/assets/93379106/507173a5-137b-43a3-b97e-d4fa88b34a73)

# Future Enhancement:
- Error_Handling:
          Implement robust error handling to manage invalid requests or server errors effectively, including returning                 appropriate HTTP status codes and error messages.
- Logging: 
          Add logging functionality to record server events, such as incoming requests and server startup/shutdown                     events, aiding in troubleshooting and performance monitoring.
- Security: 
          Enhance security measures by implementing HTTPS support, input validation to prevent common attacks like SQL             injection or XSS, and incorporating authentication/authorization mechanisms if required.

# Detail_Design_Presentation: 
Summary of the project providing a practical introduction to building a basic HTTP server in Node.js for serving time-related data. 
- [Google_Slide](https://docs.google.com/presentation/d/1b0ut8mXSFFFxNoyJVyTjP5RGjOcH3MT4ESJTr4nT23w/edit?usp=sharing)

# Appendix:
- [Git_Hub](https://github.com/ASD-Are/Cloud-Computing/tree/main/JavaScript/Time_Server_Nodejs)
