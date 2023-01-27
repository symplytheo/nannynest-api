import express, { Express, Response, Request } from 'express';

const app: Express = express();

const PORT: number = 5000;

app.get('/', (req: Request, res: Response) => {
  res.send({ message: 'Welcome to Nannynest API!' });
});

app.listen(PORT, () => {
  console.log(`[SERVER]: Listening at localhost:${PORT}`);
});
