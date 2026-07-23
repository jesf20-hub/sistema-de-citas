import { createYoga } from "graphql-yoga";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs } from "@/lib/graphql/schema";
import { resolvers } from "@/lib/graphql/resolvers";

const schema = makeExecutableSchema({ typeDefs, resolvers });

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  graphiql: process.env.NODE_ENV !== "production",
  maskedErrors: process.env.NODE_ENV === "production",
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? process.env.ALLOWED_ORIGIN ?? "same-origin"
      : "*",
    credentials: true,
  },
});

export function GET(request: Request) {
  return yoga.fetch(request);
}

export function POST(request: Request) {
  return yoga.fetch(request);
}

export function OPTIONS(request: Request) {
  return yoga.fetch(request);
}
