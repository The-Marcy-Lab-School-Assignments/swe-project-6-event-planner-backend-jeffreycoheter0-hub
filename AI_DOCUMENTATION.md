**1. What did you ask the AI to help you with, and why did you choose to use AI for that specific task?**

I asked AI to clarify why we use certain things when writing the SQL, authentication, and methods. I believe this helps me understand the code, as well as giving me a review along the way to completion.

EXAMPLE: what does this line do? 

```JS
const { rows } = await pool.query(query[user_id, title url]); return rows[0];
```

RESPONSE: 

await pool.query(...)
- pool is your PostgreSQL connection (from the pg library)
- .query(...) sends a SQL query to the database
- [user_id, title, url] are parameters safely inserted into the query
- await pauses until the database responds

**2. How did you evaluate whether the AI's output was correct or useful before using it?**

I implemented what I learned from lectures as well as reading over the Marcy docs to make sure I was writing the correct syntax and my understanding was correct.

**3. How did what the AI produced differ from what you ultimately used, and what does that tell you about your own understanding of the problem?**

The AI suggested alternative methods and even recommended new ones within the model to optimize controller performance. Initially, I reused my existing methods in the controllers, but the code failed to function correctly. My methods lacked crucial logic, such as retrieving the password from the model. I had only implemented a user_id lookup, which limited my code's effectiveness. 

**4. What did you learn from using AI in this way?**

This helped me be more open-minded and try to ask myself questions. "How would I change my password? First, the database would look to see if the password linked to the user exists and is correct." This sort of simple thinking may look small, but it will help the logic of the code look seamless and made with purpose. 