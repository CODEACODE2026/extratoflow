import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`ExtratoFlow API running on port ${env.port}`);
});
