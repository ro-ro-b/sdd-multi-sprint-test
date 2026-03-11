import app from './app';

const DEFAULT_PORT = 3000;
const parsedPort = Number(process.env.PORT);
const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : DEFAULT_PORT;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
