const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const {v4 : uuidv4} = require('uuid');

//

//

const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    printSchema
} = require('graphql');
const mysql = require('mysql2/promise');

// Create MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test',
});

// Define AuthorType
const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: "This is an author",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(BookType),  // Use GraphQLList to return a list of books
            resolve: async (author) => {
                try {
                    console.log('Fetching author'); // Debugging
                    const [rows] = await pool.query('SELECT * FROM books WHERE authorId = ?', [author.id]);
                    console.log('Books fetched:', rows); // Debugging
                    return rows;  // Return the list of books
                } catch (error) {
                    console.error('Error fetching author:', error.message);
                    throw new Error('Error fetching author');
                }
            }
        }        
    }),
});

// Define BookType
const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book written by an author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLString) },
        author: {
            type: AuthorType,
            resolve: async (book) => {
                try {
                    console.log('Fetching books'); // Debugging
                    const [rows] = await pool.query('SELECT * FROM author WHERE id = ?', [book.authorId]); // Destructure to get the rows
                    console.log('Books fetched:', rows); // Debugging
                    return rows[0];  // Return the rows directly
                } catch (error) {
                    console.error('Error fetching books:', error.message); // Log the error message
                    throw new Error('Error fetching books');
                }
            }
        }
    }),
});

// Define RootQuery
const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'A Book',
            args: {
                name: { type: GraphQLString }
            },
            resolve: async (parent, args) => {
                try {
                    console.log('Fetching a book with ID:', args.name); // Debugging: Log the requested book name
                    const [rows] = await pool.query('SELECT * FROM books WHERE name = ?', [args.name]); // Query for a specific book by name
                    console.log('Books fetched:', rows); // Debugging: Log the fetched result
                    if (rows.length > 0) {
                        return rows[0];  // Return the first book from the result
                    } else {
                        throw new Error('Book not found');  // Handle case where no book is found
                    }
                } catch (error) {
                    console.error('Error fetching book:', error.message); // Log the error message
                    throw new Error('Error fetching book');
                }
            }
        } ,
        books: {
            type: new GraphQLList(BookType),
            description: 'List of All Books',
            resolve: async () => {
                try {
                    console.log('Fetching all books'); // Debugging
                    const [rows] = await pool.query('SELECT * FROM books'); // Destructure to get the rows
                    console.log('Books fetched:', rows); // Debugging
                    return rows;  // Return the rows directly
                } catch (error) {
                    console.error('Error fetching books:', error.message); // Log the error message
                    throw new Error('Error fetching books');
                }
            }
        },
        author: {
            type: AuthorType,
            description: 'An Author',
            args: {
                name: { type: GraphQLString }
            },
            resolve: async (parent, args) => {
                try {
                    console.log('Fetching author');
                    const [rows] = await pool.query('SELECT * FROM author WHERE name = ?', [args.name]);
                    if (rows.length === 0) {
                        throw new Error('Author not found'); // Or return null explicitly if needed
                    }
                    console.log('Author fetched:', rows);
                    return rows[0];  // Return the first row if an author is found
                } catch (error) {
                    console.error('Error fetching author:', error.message);
                    throw new Error('Error fetching author');
                }
            }
            
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of All Authors',
            resolve: async () => {
                try {
                    console.log('Fetching all authors'); // Debugging
                    const [rows] = await pool.query('SELECT * FROM author'); // Destructure to get the rows
                    console.log('Author fetched:', rows); // Debugging
                    return rows;  // Return the rows directly
                } catch (error) {
                    console.error('Error fetching authors:', error.message); // Log the error message
                    throw new Error('Error fetching authors');
                }
            }
        }
    })
});

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType, // Defines the return type
            description: 'Add a new book',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: async (parent, args) => {
                try {
                    console.log('Adding a book'); // Debugging


                    // Perform the insertion
                    const insertQuery = `
                        INSERT INTO Books (id, name, authorId)
                        VALUES (?, ?, ?)
                    `;
                    const newId = uuidv4();
                    const [insertResult] = await pool.query(insertQuery, [newId, args.name, args.authorId]);

                    console.log('Book added:', insertResult); // Debugging
                    return { id: newId, name: args.name, authorId: args.authorId }; // Return the added book
                } catch (error) {
                    console.error('Error adding book:', error.message); // Log the error message
                    throw new Error('Error adding book');
                }
            }
        },
        addAuthor: {
            type: AuthorType, // Defines the return type
            description: 'Add a author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: async (parent, args) => {
                try {
                    console.log('Adding a Author'); // Debugging


                    // Perform the insertion
                    const insertQuery = `
                        INSERT INTO Author (id, name)
                        VALUES (?, ?)
                    `;
                    const newId = uuidv4();
                    const [insertResult] = await pool.query(insertQuery, [newId, args.name]);

                    console.log('Author added:', insertResult); // Debugging
                    return { id: newId, name: args.name }; // Return the added authpr
                } catch (error) {
                    console.error('Error adding author:', error.message); // Log the error message
                    throw new Error('Error adding author');
                }
            }
        }
    })
});


// Create GraphQL schema
const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});

const schemaDL = printSchema(schema);
// Make sure to include these imports:
// import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("AIzaSyBzfhoYNfrYvb6xIO7TORqFkWHiZixuK18");
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
// natural language processor
async function nlpProcess(userInput) {
    const prompt = `
    Given the following GraphQL schema: ${schemaDL}
    Convert ${userInput} from natural language into a valid GraphQL query.
    Make sure that conditions such as "name: 'Brent Weeks'" are placed directly within the fields and not wrapped in a 'where' clause or any other condition wrapper.
    Also, if the object type in the query is plural (e.g., "authors"), make sure it is converted to the singular form (e.g., "author") when querying a single entity.
    Also, make sure there is no changes to the name use in the input.
    Respond with only the GraphQL query, no explanations, no comments, and no markdown.
    `;



    let attempts = 3; // Number of retry attempts
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); // Delay function

    for (let i = 0; i < attempts; i++) {
        try {
            const result = await model.generateContent(prompt);
            console.log(result.response.text());
            return result.response.text();
        } catch (error) {
            if (error.message.includes('503')) {
                console.warn(`Attempt ${i + 1} failed: ${error.message}`);
                if (i < attempts - 1) {
                    await delay(2000); // Wait 2 seconds before retrying
                }
            } else {
                throw new Error('NLP processing failed: ' + error.message);
            }
        }
    }

    throw new Error('NLP processing failed after multiple attempts: Service is unavailable.');
}

async function graphqlResponseToNaturalLanguage(graphqlResponse) {
    // Extract the GraphQL response and format it for the generative model
    const formattedResponse = JSON.stringify(graphqlResponse, null, 2); // Pretty-print for clarity
    console.log(formattedResponse);

    const prompt = `
    Translate the following GraphQL response into a concise human-readable description:
    ${formattedResponse}
`;

    console.log('Formatted GraphQL Response:', JSON.stringify(graphqlResponse, null, 2));
    console.log('Prompt Sent:', prompt);

    try {
        // Generate the natural language explanation based on the response
        try {
            const result = await model.generateContent(prompt);
            if (!result.response || !result.response.text) {
                throw new Error('Invalid response from the generative model.');
            }
            return result.response.text();
        } catch (error) {
            console.error('Error generating content:', error.message);
            throw new Error('Failed to process GraphQL response to natural language.');
        }        
        console.log(naturalLanguageDescription);
        return naturalLanguageDescription; // Return the generated explanation
    } catch (error) {
        throw new Error('Error generating natural language description: ' + error.message);
    }
}

// Create Express server
const app = express();

app.use(express.json());
// Serve the GraphQL API
app.use(
    '/graphql',
    graphqlHTTP({
        schema: schema,
        graphiql: true, // Enable GraphiQL interface
    })
);
app.post('/nlp', async (req, res) => {
    const { userQuery } = req.body;

    if (!userQuery) {
        return res.status(400).json({ error: 'User query is required.' });
    }

    try {
        const processedQuery = await nlpProcess(userQuery);
        res.json({ query: processedQuery });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/translate', async (req, res) => {
    console.log('POST /translate called');
    const { response: graphqlResponse } = req.body;

    if (!graphqlResponse) {
        console.error('Invalid query format' + graphqlResponse);
        return res.status(400).json({ success: false, error: 'Invalid query format. Expected a JSON object.' });
    }

    try {
        console.log('Incoming GraphQL Response:', JSON.stringify(graphqlResponse));
        // Simulate translation function (replace with actual function)
        const description = await graphqlResponseToNaturalLanguage(graphqlResponse);
        
        console.log('Generated Description:', description);
        res.json({ success: true, description });
    } catch (error) {
        console.error('Translation Error:', error.stack);

        if (error.message.includes('Bad Request')) {
            res.status(400).json({
                success: false,
                error: 'Translation failed due to a bad request. Ensure the query is properly formatted.',
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'An internal server error occurred while processing the translation.',
            });
        }
    }
});


// Serve the HTML UI
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(5000, () => console.log('Server running on http://localhost:5000'));
