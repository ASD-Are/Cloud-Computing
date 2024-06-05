# Description: 
    - Step-by-step guide for setting up a HTTP JSON API server using Node.js on Ubuntu, including installation, study of time server, JSON, HTTP JSON API server, modification for client-side request, testing, and enhancement ideas.
# Design:
    - Objective: |
        Provide current date and time as JSON.
      EndPoint: |
        "http://localhost:8000/api/currenttime".
      Response_Format: |
        {"year": 2021, "month": 09, "date": 24, "hour": 16, "minute": 09}.
  Implement:
    - Step_1: |
        Install Node.js on Ubuntu:
        $ sudo apt install nodejs
        $ node -v
        $ sudo apt install npm
        $ npm -v
      Step_2: |
        Study Time Server:
        - Why_Study: |
            Ensures accurate time data crucial for scheduling and communication.
          Key_Concepts:
            - Protocol_Integration: |
                Explore NTP or custom solutions for synchronization.
            - Timezone_Handling: |
                Account for timezone differences for consistent representation.
            - Precision_and_Accuracy: |
                Consider requirements for timestamps and reporting.
          Approach:
            - Review_Implementations: |
                Analyze existing Time Servers in similar projects.
            - Experiment: |
                Test different protocols for suitability.
            - Prototype_Integration: |
                Develop and integrate Time Server functionality.
          Outcomes:
            - Deep_Understanding: |
                Grasp Time Server architecture and functionality.
            - Practical_Skills: |
                Hands-on experience in integration and management.
            - Project_Alignment: |
                Ensure alignment with project goals and requirements.
          Next_Steps:
            - Custom_Implementation: |
                Develop tailored Time Server.
            - Advanced_Techniques: |
                Explore advanced synchronization methods.
            - Real-World_Application: |
                Address project-specific challenges.
      Step_3: |
        Study JSON:
        - Description: |
            JSON, or JavaScript Object Notation, is a widely used format for storing and exchanging data. Its simplicity, based on key/value pairs, lists, and scalars, aligns well with the data structures of dynamic programming languages, making it easy to work with. Unlike XML, JSON does not require a schema, enabling straightforward data interchange and processing.
      Step_4: |
        Study HTTP JSON API Server:
        - Description: |
            Create a file called timeServer.js, and write the content of the js file.
          1. Imports Required Modules:
            - http: |
                Used to create the HTTP server.
            - url: |
                Used to parse the URL and query parameters.
          2. Defines Utility Functions:
            - zeroFill(i): |
                Adds a leading zero to numbers less than 10.
            - now(): |
                Returns the current date and time as an object with year, month, date, hour, and minute.
          3. Creates an HTTP Server:
            - /api/currenttime: |
                Responds with the current date and time in JSON format.
            - /api/parsetime: |
                Parses the provided ISO-format time and responds with hour, minute, and second.
            - /api/unixtime: |
                Converts the provided ISO-format time to UNIX epoch time and responds with it.
            - Other Endpoints: |
                Responds with a plain text representation of the current date and time or an error message.
          4. Starts the Server:
            - Listens on a port provided as a command-line argument.
      Step_5: |
        Modify HTTP JSON API Server to support this request from the client side:
        - Description: |
            $ vi timeServer.js
            $ node timeServer.js 8000
            $ curl http://localhost:8000/api/currenttime
  Requirement: |
    Test the code by running the server and checking the results via curl command.
  Execute:
    Testing:
      - Results: |
          - Error_Handling: |
              Implement robust error handling to manage invalid requests or server errors effectively, including returning appropriate HTTP status codes and error messages.
          - Logging: |
              Add logging functionality to record server events, such as incoming requests and server startup/shutdown events, aiding in troubleshooting and performance monitoring.
          - Security: |
              Enhance security measures by implementing HTTPS support, input validation to prevent common attacks like SQL injection or XSS, and incorporating authentication/authorization mechanisms if required.
  Detail_Design_Presentation: |
    Summary of the project providing a practical introduction to building a basic HTTP server in Node.js for serving time-related data. It includes implementing enhancements such as error handling, logging, security measures, and caching.
  Appendix:
    - Git_Hub: |
        https://github.com/ASD-Are/MapReduce
    - Google_Slide: |
        Thank You
