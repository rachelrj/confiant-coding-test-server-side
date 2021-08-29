# Confiant Coding Test

This project should be ran locally alongside [the frontend](https://github.com/rachelrj/confiant-coding-test).
This Node.js api uses Express and Typescript and Sequelize as the ORM for SQLite3

To run the application :

```
npm install

npm run build

npm run start
```

Linting can be ran with:

``
npm run prebuild
``

## Directions

1) Implement a single page React application and small server side application to process API requests from the client side 
2) The end user should be able to click on one of 3 tabs: “JavaScript”, “CSS” or “HTML” 
3) On click, the user should be able to see a search input and submit button to perform a code search 
4) When submitting, the application should send an asynchronous request to the server side to search code on GitHub using this API:

``
curl \ 
-H "Accept: application/vnd.github.v3+json" \ 
https://api.github.com/search/code?q=[search]+in:file+language:[language]+repo:microsoft/vscode 
``

The endpoint is documented [here](https://docs.github.com/en/free-pro-team@latest/rest/reference/search#search-code)

The server side application should cache results from GitHub to prevent the client from hitting the endpoint’s rate limit. The searches should not be cached using SQLite3. 
A history of searches should be stored in an SQLite3 table called “searches” containing an ID, the client IP, the search and the search date and time

5) Render the results in a table. The results should include the “name”, “path” and a link to “html_url”. 
6) The final project should include a Readme explaining how to setup and run the application 
7) Please share the project as a private GitHub repository with gabfl-confiant or email it to gab@confiant.com

## Notes

This application is currently set to run on port 8080

## Todos

* Determine more thoughtful CORS rules.
* Add sanitization and validation of client inputs.
* Use a better caching solution.
* Add tests.
* Handle errors from github api.
* Split index.js into route layer, business layer, and data layer.
* Handle db connection and query errors.

