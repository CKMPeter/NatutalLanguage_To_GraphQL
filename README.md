# NatutalLanguage_To_GraphQL
#####  by Cao Khải Minh

An Small Web Application to Translate From Human Readable Language To GraphQL Query Using Gemini

## Get started:

`npm init`

`npm i express express-graphql graphql`

 `npm i --save-dev nodemon` 

use nodemon for auto reset server when save.

`npm install mysql`

## Lib require:

- google/Generative AI:

`npm install @google/generative-ai`

- mysql2 for graphQL:

`npm install express express-graphql graphql mysql2`

- unique indentifer:

`npm install uuid`

## How to run:

1. Open terminal,`git clone` the repository the wanted destination
2. Go to server.js file and use `ctrl + F` to find the <YOUR_API_KEY> placeholder, place the placeholder with the free GEMINI API key with you can create Via google.
3. Go to the destination folder and use `npm run devStart`
4. Download **[XAMPP](https://sourceforge.net/projects/xampp/files/XAMPP%20Windows/8.2.12/xampp-windows-x64-8.2.12-0-VS16-installer.exe/download)**, Create table in the "Test" default database use the `databaseFile.txt`
5. After created,  go to your browser and go to "http://localhost:5000", for GraphQL defaults user interface use "http://localhost:5000"
