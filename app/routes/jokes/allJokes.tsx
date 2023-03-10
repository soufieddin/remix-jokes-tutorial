import type { Joke } from "@prisma/client";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import {  useLoaderData } from "@remix-run/react";
import JokesList from "~/components/JokesList";
import { db } from "~/utils/db.server";

export const meta: MetaFunction = () => ({
    title: "Jokes | All Jokes",
  });
type LoaderData = {jokes: Array<Pick<Joke, "id" | "name">>}

export let loader: LoaderFunction = async ({request}) => {
  let jokes = await db.joke.findMany({
    take: 8,
    select: {id: true, name: true},
    orderBy:{createdAt: "desc"}
  });
  let data:LoaderData ={jokes};
  return data;
}

export default function AllJokesRoute() {
    let data = useLoaderData<LoaderData>();
    return(
        <JokesList jokes={data.jokes} text="There are no jokes yet!" btnText="Add own joke"/>
    )
}
export function ErrorBoundary({error}:{error:Error}) {
    return (
      <div className="error-container">{`Something went wrong! Sorry.`}<br/><em><strong>{error.message}</strong></em></div>
    );
  }