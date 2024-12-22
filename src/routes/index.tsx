import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      <h1>Hi 👋</h1>
      <div>
        <p>Qwik with Hono Server</p>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Qwik Hono",
  meta: [
    {
      name: "description",
      content: "Qwik with Hono Server",
    },
  ],
};
