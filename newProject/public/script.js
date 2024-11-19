document.addEventListener('DOMContentLoaded', () => {
    const messagesDiv = document.getElementById('messages');
    const queryForm = document.getElementById('query-form');
    const queryInput = document.getElementById('query-input');

    // Append a message to the chat
    const appendMessage = (text, user = false) => {
        const message = document.createElement('div');
        message.classList.add('message', user ? 'user' : 'bot');
        message.textContent = text;
        messagesDiv.appendChild(message);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    };

    // Handle form submission
    queryForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const userQuery = queryInput.value.trim();
        if (!userQuery) return;

        appendMessage(userQuery, true);
        queryInput.value = '';

        try {
            // Step 1: NLP processing of user query
            const nlpResponse = await fetch('/nlp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userQuery }),
            });

            if (!nlpResponse.ok) {
                throw new Error(`NLP processing failed: ${nlpResponse.statusText}`);
            }

            const nlpData = await nlpResponse.json();
            if (!nlpData.query) {
                throw new Error(nlpData.error || 'Failed to process query.');
            }

            const processedQuery = nlpData.query;
            appendMessage(`Processed Query: ${processedQuery}`);

            // Debugging log for the processed query
            console.log("Processed GraphQL Query:", processedQuery);

            // Step 2: Send the processed query to GraphQL API
            const graphQLResponse = await fetch('/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: processedQuery.trim() }),
            });

            if (!graphQLResponse.ok) {
                throw new Error(`GraphQL query failed: ${graphQLResponse.statusText}`);
            }

            const graphQLData = await graphQLResponse.json();
            if (graphQLData.errors) {
                throw new Error(graphQLData.errors[0].message);
            }

            // Debugging log for the GraphQL response
            console.log("GraphQL Response Data:", graphQLData);

            appendMessage(`Raw GraphQL Response: ${JSON.stringify(graphQLData)}`);

            // Step 3: Translate the GraphQL response to natural language
            const translateResponse = await fetch('/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ response: graphQLData }),
            });

            if (!translateResponse.ok) {
                throw new Error(`Translation failed: ${translateResponse.statusText}`);
            }

            const translateData = await translateResponse.json();
            if (!translateData || !translateData.description) {
                throw new Error(translateData.error || 'Failed to translate response.');
            }

            const naturalLanguageDescription = translateData.description;
            appendMessage(`Natural Language: ${naturalLanguageDescription}`);

        } catch (error) {
            // Log and display errors in the chat
            console.error("Error during process:", error);
            appendMessage(`Error: ${error.message}`);
        }
    });
});
