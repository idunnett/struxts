// import Link from "next/link";

import { redirect } from "next/navigation"
import { getServerAuthSession } from "~/server/auth"
import { api } from "~/trpc/server"

// import { CreatePost } from "~/app/_components/create-post";

export default async function Home() {
  const session = await getServerAuthSession()
  if (session?.user) {
    const structure = await api.structure.getOneOfMy()
    if (structure) redirect(`/structures/${structure.id}`)
    else redirect("/structures/new")
  }
  return <div>Hello</div>
}

// async function CrudShowcase() {
//   const session = await getServerAuthSession();
//   if (!session?.user) return null;

//   const latestPost = await api.post.getLatest();

//   return (
//     <div className="w-full max-w-xs">
//       {latestPost ? (
//         <p className="truncate">Your most recent post: {latestPost.name}</p>
//       ) : (
//         <p>You have no posts yet.</p>
//       )}

//       <CreatePost />
//     </div>
//   );
// }
