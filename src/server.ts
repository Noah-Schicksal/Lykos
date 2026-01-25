import 'dotenv/config'; //carrega as variáveis de ambiente
import express from 'express';
import { initializeDatabase } from './database/init';
import router from './routes/userRoutes';

const app = express();


const PORT = process.env.PORT;

app.use(express.json());
app.use(router);

// Inicializa o banco antes de subir o servidor
initializeDatabase();

export { app };

app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});
