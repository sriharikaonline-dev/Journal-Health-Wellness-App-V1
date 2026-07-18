import { Compass } from 'lucide-react';
import { routeToHash } from '../lib/router';

export function NotFoundPage() {
  return (
    <div className="section py-24 text-center sm:py-32">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-hotpink-100 text-hotpink-600">
        <Compass className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-4xl font-extrabold text-navy-900 sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-3 text-navy-600">
        That path leads nowhere — but every other door here is open.
      </p>
      <a href={routeToHash({ name: 'home' })} className="btn btn-pink mt-7">
        Take me home
      </a>
    </div>
  );
}
