import type { ActionFunction, LoaderFunction, MetaFunction} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { Link, useCatch, useLoaderData, useParams } from "@remix-run/react";
import { getUser, getUserId} from "~/utils/session.server";
import { JokeDisplay } from "~/components/Joke";


export const loader: LoaderFunction = async ({ params, request }) => {
  const userInfo = await getUser(request);
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response("Joke not found", { status: 404});
  }
  const jokester = await db.user.findUnique({
    where: {id: joke.jokesterId}
  })
  return json({ joke, userInfo, jokester });
};
export const action: ActionFunction = async({request, params}) => {
  let form = await request.formData();
  let userId= await getUserId(request);
  if(form.get('_method') === 'delete'){
    const joke = await db.joke.findUnique({
      where: { id: params.jokeId },
    });
    if(!joke) {
      throw new Response("What a joke! Not found", { status: 404})
    }
    if(joke.jokesterId === userId) {
      await db.joke.delete({
        where: { 
          id: params.jokeId,
        },
      })
      return redirect("/jokes/myJokes");
    }
    throw new Response("You are not allowed to delete this joke!", {status: 403});
  }
  //return redirect("/jokes/myJokes");
}
export const meta: MetaFunction = ({data}) => {
  if(!data){
    return {
      title: "Whoops!",
      description: "oh no, something went wrong"
    }
  }
  return {
    title: `Joke about ${data.joke.name} by ${data.jokester?.username}`,
    description: `this is a funny joke by ${data.jokester?.username} about ${data.joke.name}`
  }
};
export default function JokeRoute() {
  let data = useLoaderData();
  let isOwner = data.joke.jokesterId === data.userInfo?.id
  //let actionData = useActionData<typeof action>();
  console.log("data",data);
    return (
     <JokeDisplay joke={data.joke} isOwner={isOwner}/>
    );
  }
  export function CatchBoundary() {
    let caught = useCatch();
    switch(caught.status) {
      case 404:
        return(
          <div className="error-container">
            <p>Joke not found!</p>
            <Link to="/jokes">Back to Jokes</Link>
          </div>
        );
        case 403:
        return(
          <div className="error-container">
            <p>You are not allowed to delete this joke</p>
            <Link to="/jokes/myJokes">Go to My Jokes</Link>
          </div>
        );
        default:
          throw new Error(`Unexpected caught response with status: ${caught.status}`)
    }
  }

  
  export function ErrorBoundary({error}:{error:Error}) {
    const { jokeId } = useParams();
    return (
      <div className="error-container">{`There was an error with loading or handeling joke by the id ${jokeId}. Sorry.`}<br/><em><strong>{error.message}</strong></em></div>
    );
  }