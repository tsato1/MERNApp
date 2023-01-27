import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connect from './database/connection.js';
import router from './router/route.js';

const app = express();

/** middleware */
app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by'); 

const port = 8080;

/** http GET request */
app.get('/', (req, res) => {
    res.status(201).json("HOME GET request")
});

/** API routes */
app.use('/api', router);

/** start server only when there is proper connection to the db */
connect()
    .then(() => {
        try {
            app.listen(port, () => {
                console.log(`Server connected to http://localhost:${port}`);
            });
        }
        catch(error) {
            console.log("Cannot connect to the server")
        }
    })
    .catch(error => {
        console.log("Invalid database connection.")
    });